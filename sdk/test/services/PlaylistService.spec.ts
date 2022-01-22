import {describe, expect, it, jest} from "@jest/globals";
import Spotify from "../../src/services/Spotify";
import User from "../../src/model/User";
import PlaylistService from "../../src/services/PlaylistService";
import {when, resetAllWhenMocks} from 'jest-when'
import {
    generatePlaylistItems,
    generatePlaylistResponse,
    generateUserPlaylistsResponse
} from "../../src/services/userPlaylists";
import {PlaylistResponse} from "../TestTypes";
import AuthService from "../../src/services/AuthService";

jest.mock("../../src/services/AuthService")
const authServiceMock = new AuthService("")

describe('Playlist Service', () => {
    const spotify = new Spotify(authServiceMock);
    const spotifyGetSpy = jest.spyOn(spotify, 'get')
    const spotifyPutSpy = jest.spyOn(spotify, 'put')
    const spotifyPostSpy = jest.spyOn(spotify, 'post')

    const USER1 = new User('user1', {}, "SOURCE_USER")
    const USER2 = new User('user2', {}, "TARGET_USER")
    const PLAYLISTS_GET_PATH = '/me/playlists'

    const playlistService = new PlaylistService(spotify)

    beforeEach(() => {
        jest.resetAllMocks()
        resetAllWhenMocks()
    })

    it('should get a page of playlists', async () => {
        //given
        const paginationParams = {limit: 50, offset: 10};
        const playlistsResponse: PlaylistResponse[] = Array.of(generatePlaylistResponse('playlist1', false, true, 'spotify'))


        when(spotifyGetSpy)
            .calledWith(PLAYLISTS_GET_PATH, USER1, paginationParams)
            .mockResolvedValueOnce(generateUserPlaylistsResponse(playlistsResponse, paginationParams, 100, USER1.id, false))

        //when
        const playlists = await playlistService.loadPlaylists(USER1, paginationParams)

        //then
        expect(spotify.get).toBeCalledWith(PLAYLISTS_GET_PATH, USER1, paginationParams)
        expect(playlists.items.length).toBe(1)
        expect(playlists.total).toBe(100)
    })

    it('should transfer all playlists', async () => {
        //given
        const playlistsResponse1 = generateUserPlaylistsResponse(generatePlaylistItems('global', 50, false, false, 'spotify'), {
            limit: 50
        }, 110, USER1.id, true)
        const playlistsResponse2 = generateUserPlaylistsResponse(generatePlaylistItems('owned', 10, false, false, USER1.id), {
            limit: 50,
            offset: 50
        }, 110, USER1.id, false)

        const followData = {
            public: false
        };

        //get 1st page
        when(spotifyGetSpy)
            .calledWith(PLAYLISTS_GET_PATH, USER1, {limit: 50})
            .mockResolvedValueOnce(playlistsResponse1)
            .calledWith(playlistsResponse1.data.next, USER1, {limit: 50})
            .mockResolvedValueOnce(playlistsResponse2);

        //follow public playlists
        when(spotifyPutSpy)
            .calledWith(expect.any(String), USER2, followData)
            .mockResolvedValue({});

        const trackUrls = playlistsResponse1.data.items.map(playlist => expect.stringContaining(playlist.tracks.href))

        //get tracks to copy
        const tracksResponse = {
            data: {
                items: [
                    {
                        "track": {
                            "id": "5CSKbHjpqborGnlzagyaDo",
                            "name": "Love Again"
                        }
                    },
                    {
                        "track": {
                            "id": "0mV43B6pJWRjcM5TmzNe6d",
                            "name": "EveryTime I Cry"
                        }
                    }
                ]
            }
        };

        when(spotifyGetSpy)
            .calledWith(
                expect.stringContaining('tracks'), //FIXME consider better matching
                // expect.arrayContaining(trackUrls),
                USER1,
                expect.objectContaining({limit: 50, fields: 'next,items(track(id))'})
            )
            .mockResolvedValue(tracksResponse);

        //create playlist
        when(spotifyPostSpy)
            .calledWith(`/users/${USER2.id}/playlists`, USER2, expect.objectContaining({
                name: expect.any(String),
                public: false
            }))
            .mockResolvedValue({data: {id: 'newTestPlaylist'}});

        //copy tracks
        when(spotifyPutSpy)
            .calledWith(
                expect.stringContaining('tracks'), //FIXME consider better matching
                USER2,
                {uris: tracksResponse.data.items.map(item => item.track.id)}
            )
            .mockResolvedValue({});


        //when
        const {succeeded, failed} = await playlistService.transferAll(USER1, USER2);

        //then
        expect(succeeded.length).toBe(60)
        expect(failed.length).toBe(0)
        expect(spotifyPostSpy).toHaveBeenCalledTimes(10) // playlists creations
        expect(spotifyPutSpy).toHaveBeenCalledTimes(50 + 10) //follow PUTs + tracks PUTs
        expect(spotifyPutSpy).toHaveBeenCalledWith(expect.any(String), USER2, followData)
        // expect(spotifyPutSpy).toHaveBeenCalledWith(tracksLoadUrlMatcher, USER2, followData)
    })

    it('should copy playlist with more than 50 tracks', async () => {
        //given
        const playlistId = 'playlistWith60Tracks'
        const expectedName = `Playlist ${playlistId}`

        const playlistsResponse = generateUserPlaylistsResponse([generatePlaylistResponse('playlistWith60Tracks', false, false, USER1.id)],
            {limit: 50}, 1, USER1.id, false)

        //get tracks to copy
        const tracksResponse = (count, nextOffset = null) => {
            return {
                data: {
                    items: [...Array.from(Array(count).keys())].map(num => {
                        return {
                            "track": {
                                "id": num,
                                "name": "Love Again"
                            }
                        }
                    }),
                    "next": !nextOffset ? null : `https://api.spotify.com/v1/playlists${playlistId}/tracks?offset=${nextOffset}&limit=50`,
                }
            }
        };

        const trackResponse1 = tracksResponse(50, 50)
        const trackResponse2 = tracksResponse(10)

        when(spotifyGetSpy)
            .calledWith(PLAYLISTS_GET_PATH, USER1, {limit: 50})
            .mockResolvedValueOnce(playlistsResponse);

        //get 1st page of tracks
        when(spotifyGetSpy)
            .calledWith(
                expect.stringContaining(`/playlists/${playlistId}/tracks`),
                USER1,
                expect.objectContaining({limit: 50, fields: 'next,items(track(id))'})
            )
            .mockResolvedValue(trackResponse1);

        //get 2nd page of tracks
        when(spotifyGetSpy)
            .calledWith(
                expect.stringContaining(`/playlists${playlistId}/tracks?offset=50&limit=50`),
                USER1,
                expect.objectContaining({limit: 50, fields: 'next,items(track(id))'})
            )
            .mockResolvedValue(trackResponse2);

        //create playlist
        when(spotifyPostSpy)
            .calledWith(`/users/${USER2.id}/playlists`, USER2, expect.objectContaining({
                name: expectedName,
                public: false
            }))
            .mockResolvedValue({data: {id: 'newPlaylistId'}});

        //copy tracks
        when(spotifyPutSpy)
            .calledWith(
                `/users/${USER2.id}/playlists/${playlistId}/tracks`,
                USER2,
                {uris: trackResponse1.data.items.concat(trackResponse2.data.items).map(item => item.track.id)}
            )
            .mockResolvedValue({});

        //when
        const {succeeded, failed} = await playlistService.transferAll(USER1, USER2);

        //then
        expect(succeeded.length).toBe(1)
        expect(failed.length).toBe(0)
        expect(spotifyPostSpy).toHaveBeenCalledTimes(1) // playlists creations
        expect(spotifyPutSpy).toHaveBeenCalledWith(
            `/users/${USER2.id}/playlists/newPlaylistId/tracks`,
            USER2,
            {uris: trackResponse1.data.items.concat(trackResponse2.data.items).map(item => item.track.id)}
        )
    })

    //body in add tracks to playlist request has 100 ids limits
    it('should copy playlist with more than 100 tracks', () => {

    })

    it('should follow playlist', () => {
    })

})
