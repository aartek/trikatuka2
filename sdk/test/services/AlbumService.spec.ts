import AlbumService from '../../src/services/AlbumService'
import Spotify from "../../src/services/Spotify";
import {when} from 'jest-when'
import User from "../../src/model/User";

const USER1 = new User('user1')
const USER2 = new User('user2')

describe("Album service", () => {
    it('transfer 150 items split for 3 pages', async () => {

        //given
        const spotify = new Spotify();
        const spotifyGetSpy = jest.spyOn(spotify, 'get')
        const spotifyPutSpy = jest.spyOn(spotify, 'put')
        const albumService = new AlbumService(spotify)


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
            .calledWith('/me/albums', USER1, expect.objectContaining({
                limit: 50
            }))
            .mockResolvedValue(getResponseProvider(50, 0))
            .calledWith(expect.stringContaining('/me/albums?offset=50'), USER1, expect.objectContaining({
                limit: 50
            }))
            .mockResolvedValue(getResponseProvider(50, 50))
            .calledWith(expect.stringContaining('/me/albums?offset=100'), USER1, expect.objectContaining({
                limit: 50
            }))
            .mockResolvedValue(getResponseProvider(50, 100, false))

        when(spotifyPutSpy)
            .calledWith('/me/albums', USER2, expect.objectContaining(putDataProvider(50, 0))).mockResolvedValue("ok")
            .calledWith('/me/albums', USER2, expect.objectContaining(putDataProvider(50, 50))).mockResolvedValue("ok")
            .calledWith('/me/albums', USER2, expect.objectContaining(putDataProvider(50, 100))).mockResolvedValue("ok")

        //when
        await albumService.transferAll(USER1, USER2);

        expect(spotifyPutSpy).toBeCalledWith('/me/albums', USER2, expect.objectContaining(putDataProvider(50, 0)))
        expect(spotifyPutSpy).toBeCalledWith('/me/albums', USER2, expect.objectContaining(putDataProvider(50, 50)))
        expect(spotifyPutSpy).toBeCalledWith('/me/albums', USER2, expect.objectContaining(putDataProvider(50, 100)))
        expect(spotifyPutSpy).toBeCalledTimes(3)

    })
})

