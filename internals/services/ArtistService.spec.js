import ArtistService from "./ArtistService";
import Spotify from "./Spotify";
import {when} from 'jest-when'

test('transfer 150 items split for 3 pages', async () => {

    //given
    const spotify = new Spotify();
    const spotifyGetSpy = jest.spyOn(spotify, 'get')
    const spotifyPutSpy = jest.spyOn(spotify, 'put')
    const artistService = new ArtistService(spotify)


    const response = (number, hasNext) => ({
        "artists": {
            "items": [{
                "id": `${number}`
            }],
            "next": hasNext ? `https://api.spotify.com/v1/me/following?type=artist&after=${number}&limit=1` : null,
            "total": 3,
            "limit": 1,
        }
    })


    when(spotifyGetSpy)
        .calledWith('/me/following?type=artist', "user1").mockResolvedValue(response(0, true))
        .calledWith('/me/following?type=artist&after=0&limit=1', "user1").mockResolvedValue(response(1, true))
        .calledWith('/me/following?type=artist&after=1&limit=1', "user1").mockResolvedValue(response(2, false))


    //when
    await artistService.transferAll("user1", "user2");

    // expect(spotifyPutSpy).toBeCalledWith('/me/albums', "user2", expect.arrayContaining(putDataProvider(0)))
    // expect(spotifyPutSpy).toBeCalledWith('/me/albums', "user2", expect.arrayContaining(putDataProvider(50)))
    // expect(spotifyPutSpy).toBeCalledWith('/me/albums', "user2", expect.arrayContaining(putDataProvider(100)))
    expect(spotifyGetSpy).toBeCalledTimes(3)

})
