import AlbumService from './AlbumService'
import Spotify from "./Spotify";
import {when} from 'jest-when'

test('transfer 150 items split for 3 pages', async () => {

    //given
    const spotify = new Spotify();
    const spotifyGetSpy = jest.spyOn(spotify, 'get')
    const spotifyPutSpy = jest.spyOn(spotify, 'put')
    const albumService = new AlbumService(spotify)

    const getResponseProvider = (offset) => ({
        data: {
            items: [...Array(50).keys()].map(i => ({
                album: {
                    offset: offset,
                    id: offset + i
                }
            })),
            total: 150
        }
    })

    const putDataProvider = (offset) => ([...Array(50).keys()].map(i => i + offset))

    when(spotifyGetSpy)
        .calledWith('/me/albums', "user1", expect.objectContaining({
            limit: 50,
            offset: 0
        })).mockResolvedValue(getResponseProvider(0))
        .calledWith('/me/albums', "user1", expect.objectContaining({
            limit: 50,
            offset: 50
        })).mockResolvedValue(getResponseProvider(50))
        .calledWith('/me/albums', "user1", expect.objectContaining({
            limit: 50,
            offset: 100
        })).mockResolvedValue(getResponseProvider(100))
        .calledWith('/me/albums', "user1").mockResolvedValue(getResponseProvider(0))

    when(spotifyPutSpy)
        .calledWith('/me/albums', "user2", expect.arrayContaining(putDataProvider(0))).mockResolvedValue("ok")
        .calledWith('/me/albums', "user2", expect.arrayContaining(putDataProvider(50))).mockResolvedValue("ok")
        .calledWith('/me/albums', "user2", expect.arrayContaining(putDataProvider(100))).mockResolvedValue("ok")

    //when
    await albumService.transferAll("user1", "user2");

    expect(spotifyPutSpy).toBeCalledWith('/me/albums', "user2", expect.arrayContaining(putDataProvider(0)))
    expect(spotifyPutSpy).toBeCalledWith('/me/albums', "user2", expect.arrayContaining(putDataProvider(50)))
    expect(spotifyPutSpy).toBeCalledWith('/me/albums', "user2", expect.arrayContaining(putDataProvider(100)))
    expect(spotifyPutSpy).toBeCalledTimes(3)

})
