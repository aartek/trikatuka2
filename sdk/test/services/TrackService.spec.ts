import {jest} from "@jest/globals";
import {resetAllWhenMocks, when} from "jest-when";
import User from "../../src/model/User";
import Spotify from "../../src/services/Spotify";
import TrackService from "../../src/services/TrackService";

const USER1 = new User('user1')
const USER2 = new User('user2')
const TRACKS_PATH = '/me/tracks'
const spotify = new Spotify();
const spotifyGetSpy = jest.spyOn(spotify, 'get')
const spotifyPutSpy = jest.spyOn(spotify, 'put')
const trackService = new TrackService(spotify, 0)

describe("Track service", () => {

    beforeEach(() => {
        jest.resetAllMocks()
        resetAllWhenMocks()
    })

    it('should load tracks using params', async () => {
        //given
        const params = {offset: 10, limit: 20}
        const response = {
            data: {
                items: [...Array(20).keys()].map(i => (
                    {
                        "added_at": "2018-04-30T07:58:02Z",
                        "track": {
                            "album": {
                                "album_type": "single",
                                "artists": [{
                                    "external_urls": {
                                        "spotify": "https://open.spotify.com/artist/xxxx"
                                    },
                                    "href": "https://api.spotify.com/v1/artists/xxxx",
                                    "id": `artist${i}`,
                                    "name": `Artist ${i}`,
                                    "type": "artist",
                                    "uri": "spotify:artist:2137"
                                }],
                                "available_markets": [],
                                "external_urls": {
                                    "spotify": "https://open.spotify.com/album/xxxx"
                                },
                                "href": "https://api.spotify.com/v1/albums/xxxx",
                                "id": "6Q8uLEsBvhdeD96eOOJkN0",
                                "images": [],
                                "name": "Notion - EP",
                                "release_date": "2016-12-19",
                                "release_date_precision": "day",
                                "total_tracks": 6,
                                "type": "album",
                                "uri": "spotify:album:6Q8uLEsBvhdeD96eOOJkN0"
                            },
                            "artists": [{
                                "external_urls": {
                                    "spotify": "https://open.spotify.com/artist/6zVFRTB0Y1whWyH7ZNmywf"
                                },
                                "href": "https://api.spotify.com/v1/artists/6zVFRTB0Y1whWyH7ZNmywf",
                                "id": `artist${i}`,
                                "name": `Artist ${i}`,
                                "type": "artist",
                                "uri": "spotify:artist:2137"
                            }],
                            "available_markets": [],
                            "disc_number": 1,
                            "duration_ms": 315598,
                            "explicit": false,
                            "external_ids": {
                                "isrc": "AUBEC1601210"
                            },
                            "external_urls": {
                                "spotify": "https://open.spotify.com/track/4QEaE0Yj9oCvCzehPlZ1On"
                            },
                            "href": "https://api.spotify.com/v1/tracks/4QEaE0Yj9oCvCzehPlZ1On",
                            "id": `track${i}`,
                            "is_local": false,
                            "name": `Track ${i}`,
                            "popularity": 0,
                            "preview_url": null,
                            "track_number": i,
                            "type": "track",
                            "uri": `spotify:track:track${i}`
                        }
                    }

                )),
                total: 100
            }

        }

        when(spotifyGetSpy)
            .calledWith(TRACKS_PATH, USER1, params)
            .mockResolvedValue(response)

        //when
        const page = await trackService.loadTracks(USER1, params)

        //then
        expect(spotifyGetSpy).toBeCalledWith(TRACKS_PATH, USER1, params)
        expect(page.items.length).toBe(20)
        expect(page.total).toBe(100)
    })


    it('transfer 150 items split for 3 pages', async () => {

        //given
        const getResponseProvider = (count, from, hasNext = true) => ({
            data: {
                items: [...Array(count).keys()].map(i => (
                    {
                        "added_at": "2018-04-30T07:58:02Z",
                        "track": {
                            "album": {
                                "album_type": "single",
                                "artists": [{
                                    "external_urls": {
                                        "spotify": "https://open.spotify.com/artist/xxxx"
                                    },
                                    "href": "https://api.spotify.com/v1/artists/xxxx",
                                    "id": `artist${i + from}`,
                                    "name": `Artist ${i + from}`,
                                    "type": "artist",
                                    "uri": "spotify:artist:2137"
                                }],
                                "available_markets": [],
                                "external_urls": {
                                    "spotify": "https://open.spotify.com/album/xxxx"
                                },
                                "href": "https://api.spotify.com/v1/albums/xxxx",
                                "id": "6Q8uLEsBvhdeD96eOOJkN0",
                                "images": [],
                                "name": "Notion - EP",
                                "release_date": "2016-12-19",
                                "release_date_precision": "day",
                                "total_tracks": 6,
                                "type": "album",
                                "uri": "spotify:album:6Q8uLEsBvhdeD96eOOJkN0"
                            },
                            "artists": [{
                                "external_urls": {
                                    "spotify": "https://open.spotify.com/artist/6zVFRTB0Y1whWyH7ZNmywf"
                                },
                                "href": "https://api.spotify.com/v1/artists/6zVFRTB0Y1whWyH7ZNmywf",
                                "id": `artist${i + from}`,
                                "name": `Artist ${i + from}`,
                                "type": "artist",
                                "uri": "spotify:artist:2137"
                            }],
                            "available_markets": [],
                            "disc_number": 1,
                            "duration_ms": 315598,
                            "explicit": false,
                            "external_ids": {
                                "isrc": "AUBEC1601210"
                            },
                            "external_urls": {
                                "spotify": "https://open.spotify.com/track/4QEaE0Yj9oCvCzehPlZ1On"
                            },
                            "href": "https://api.spotify.com/v1/tracks/4QEaE0Yj9oCvCzehPlZ1On",
                            "id": `track${i + from}`,
                            "is_local": false,
                            "name": `Track ${i + from}`,
                            "popularity": 0,
                            "preview_url": null,
                            "track_number": i + from,
                            "type": "track",
                            "uri": `spotify:track:track${i + from}`
                        }
                    }

                )),
                next: hasNext ? `https://api.spotify.com/v1/me/tracks?offset=${from + count}&limit=50` : null
            }
        })


        when(spotifyGetSpy)
            .calledWith(TRACKS_PATH, USER1, expect.objectContaining({
                limit: 50
            }))
            .mockResolvedValue(getResponseProvider(50, 0))
            .calledWith(expect.stringContaining(`${TRACKS_PATH}?offset=50`), USER1, expect.objectContaining({
                limit: 50
            }))
            .mockResolvedValue(getResponseProvider(50, 50))
            .calledWith(expect.stringContaining(`${TRACKS_PATH}?offset=100`), USER1, expect.objectContaining({
                limit: 50
            }))
            .mockResolvedValue(getResponseProvider(50, 100, false))


        for (let i = 0; i < 150; i++) {
            when(spotifyPutSpy)
                .calledWith(TRACKS_PATH, USER2, expect.objectContaining(
                    {ids: [`track${i}`]}
                )).mockResolvedValueOnce("ok")
        }

        //when
        await trackService.transferAll(USER1, USER2);

        //then
        for (let i = 0; i < 150; i++) {
            expect(spotifyPutSpy).toBeCalledWith(TRACKS_PATH, USER2, expect.objectContaining({ids: [`track${i}`]}))
        }
    })
})
