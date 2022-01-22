import AlbumService from '../../src/services/AlbumService'
import Spotify from "../../src/services/Spotify";
import {resetAllWhenMocks, when} from 'jest-when'
import User from "../../src/model/User";
import {jest} from "@jest/globals";

const USER1 = new User('user1')
const USER2 = new User('user2')
const ALBUMS_PATH = '/me/albums'
const spotify = new Spotify();
const spotifyGetSpy = jest.spyOn(spotify, 'get')
const spotifyPutSpy = jest.spyOn(spotify, 'put')
const albumService = new AlbumService(spotify)


describe("Album service", () => {

    beforeEach(() => {
        jest.resetAllMocks()
        resetAllWhenMocks()
    })

    it('should load albums using params', async () => {

        //given
        const params = {offset: 10, limit: 20}
        const response = {
            data: {
                items: [...Array(20).keys()].map(i => ({
                    album: {
                        id: `album${i}`,
                        name: `Album ${i}`,
                        artists: [{name: 'Hey'}, {name: 'Scooter'}],
                        tracks: {
                            total: 666
                        }
                    }
                })),
                total: 100
            }

        }

        when(spotifyGetSpy)
            .calledWith(ALBUMS_PATH, USER1, params)
            .mockResolvedValue(response)

        //when
        const page = await albumService.loadAlbums(USER1, params)

        //then
        expect(spotifyGetSpy).toBeCalledWith(ALBUMS_PATH, USER1, params)
        expect(page.items.length).toBe(20)
        expect(page.total).toBe(100)
    })


    it('transfer 150 items split for 3 pages', async () => {

        //given

        const getResponseProvider = (count, from, hasNext = true) => ({
            data: {
                items: [...Array(count).keys()].map(i => ({
                    album: {
                        id: `album${i + from}`,
                        name: `Album ${i + from}`,
                        artists: [{name: 'Hey'}, {name: 'Scooter'}],
                        tracks: {
                            total: 666
                        }
                    }
                })),
                next: hasNext ? `https://api.spotify.com/v1/me/albums?offset=${from + count}&limit=50` : null
            }
        })

        const putDataProvider = (count, from) => {
            return {ids: ([...Array(count).keys()].map(i => `album${i + from}`))}
        }

        when(spotifyGetSpy)
            .calledWith(ALBUMS_PATH, USER1, expect.objectContaining({
                limit: 50
            }))
            .mockResolvedValue(getResponseProvider(50, 0))
            .calledWith(expect.stringContaining(`${ALBUMS_PATH}?offset=50`), USER1, expect.objectContaining({
                limit: 50
            }))
            .mockResolvedValue(getResponseProvider(50, 50))
            .calledWith(expect.stringContaining(`${ALBUMS_PATH}?offset=100`), USER1, expect.objectContaining({
                limit: 50
            }))
            .mockResolvedValue(getResponseProvider(50, 100, false))

        when(spotifyPutSpy)
            .calledWith(ALBUMS_PATH, USER2, expect.objectContaining(putDataProvider(50, 0))).mockResolvedValue("ok")
            .calledWith(ALBUMS_PATH, USER2, expect.objectContaining(putDataProvider(50, 50))).mockResolvedValue("ok")
            .calledWith(ALBUMS_PATH, USER2, expect.objectContaining(putDataProvider(50, 100))).mockResolvedValue("ok")

        //when
        await albumService.transferAll(USER1, USER2);

        expect(spotifyPutSpy).toBeCalledWith(ALBUMS_PATH, USER2, expect.objectContaining(putDataProvider(50, 0)))
        expect(spotifyPutSpy).toBeCalledWith(ALBUMS_PATH, USER2, expect.objectContaining(putDataProvider(50, 50)))
        expect(spotifyPutSpy).toBeCalledWith(ALBUMS_PATH, USER2, expect.objectContaining(putDataProvider(50, 100)))
        expect(spotifyPutSpy).toBeCalledTimes(3)

    })
})

