import Spotify from "../../src/services/Spotify";
import {resetAllWhenMocks, when} from 'jest-when'
import User from "../../src/model/User";
import {jest} from "@jest/globals";
import ArtistService from "../../src/services/ArtistService";
import Artist from "../../src/model/Artist";
import AuthService from "../../src/services/AuthService";

jest.mock("../../src/services/AuthService")

const USER1 = new User('user1', {}, 'SOURCE_USER')
const USER2 = new User('user2', {}, "TARGET_USER")
const ARTISTS_PATH = '/me/following?type=artist'

const authServiceMock = new AuthService("")

const spotify = new Spotify(authServiceMock);
const spotifyGetSpy = jest.spyOn(spotify, 'get')
const spotifyPutSpy = jest.spyOn(spotify, 'put')
const artistService = new ArtistService(spotify)


describe("Artist service", () => {

    beforeEach(() => {
        jest.resetAllMocks()
        resetAllWhenMocks()
    })

    it('should load artists using params', async () => {

        //given
        const after = 'abc123'
        const params = {limit: 20}
        const response = {
            data: {
                artists: {
                    items: [...Array(20).keys()].map(i => ({
                        id: `artist${i}`,
                        name: `Artist ${i}`,
                        type: 'artist'

                    })),
                    limit: 20,
                    next: 'ignored',
                    total: 100
                }
            }
        }

        when(spotifyGetSpy)
            .calledWith(ARTISTS_PATH, USER1, {limit: 20, after: after})
            .mockResolvedValue(response)

        //when
        const page = await artistService.loadArtists(USER1, params, after)

        //then
        expect(spotifyGetSpy).toBeCalledWith(ARTISTS_PATH, USER1, {limit: 20, after: after})
        expect(page.items.length).toBe(20)
        expect(page.total).toBe(100)
        expect(page.items[0]).toEqual(new Artist('artist0', 'Artist 0'))
    })


    it('transfer 150 items split for 3 pages', async () => {

        //given
        const getResponseProvider = (count: number, from: number, after: string, hasNext = true) => ({
            data: {
                artists: {
                    items: Array.from(Array(count).keys()).map(i => ({
                        id: `artist${i + from}`,
                        name: `Artist ${i + from}`,
                        type: 'artist'
                    })),
                    limit: 50,
                    next: hasNext ? `https://api.spotify.com/v1/me/following?type=artist&after=${after}&limit=50` : null,
                    total: 150
                }
            },
        })

        const putDataProvider = (count, from) => {
            return {ids: ([...Array(count).keys()].map(i => `artist${i + from}`))}
        }

        when(spotifyGetSpy)
            .calledWith(ARTISTS_PATH, USER1, expect.objectContaining({
                limit: 50
            }))
            .mockResolvedValue(getResponseProvider(50, 0, 'artist50'))
            .calledWith(expect.stringContaining(`${ARTISTS_PATH}&after=artist50`), USER1, expect.objectContaining({
                limit: 50
            }))
            .mockResolvedValue(getResponseProvider(50, 50, 'artist100'))
            .calledWith(expect.stringContaining(`${ARTISTS_PATH}&after=artist100`), USER1, expect.objectContaining({
                limit: 50
            }))
            .mockResolvedValue(getResponseProvider(50, 100, '', false))

        when(spotifyPutSpy)
            .calledWith(ARTISTS_PATH, USER2, expect.objectContaining(putDataProvider(50, 0))).mockResolvedValue("ok")
            .calledWith(ARTISTS_PATH, USER2, expect.objectContaining(putDataProvider(50, 50))).mockResolvedValue("ok")
            .calledWith(ARTISTS_PATH, USER2, expect.objectContaining(putDataProvider(50, 100))).mockResolvedValue("ok")

        //when
        await artistService.transferAll(USER1, USER2);

        expect(spotifyPutSpy).toBeCalledWith(ARTISTS_PATH, USER2, expect.objectContaining(putDataProvider(50, 0)))
        expect(spotifyPutSpy).toBeCalledWith(ARTISTS_PATH, USER2, expect.objectContaining(putDataProvider(50, 50)))
        expect(spotifyPutSpy).toBeCalledWith(ARTISTS_PATH, USER2, expect.objectContaining(putDataProvider(50, 100)))
        expect(spotifyPutSpy).toBeCalledTimes(3)

    })
})

