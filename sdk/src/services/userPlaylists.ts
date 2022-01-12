import {Params} from "../model/Types";
import {PlaylistResponse} from "../../test/TestTypes";


/**
 * Returns list with mocked playlist items
 * @param idPrefix
 * @param count
 * @param isCollaborative
 * @param isPublic
 * @param ownerId
 */
export function generatePlaylistItems(idPrefix: string, count: number, isCollaborative: boolean, isPublic: boolean, ownerId: string): PlaylistResponse[] {
    return [...Array.from(Array(count).keys())]
        .map(number => generatePlaylistResponse(`${idPrefix}${number}`, isCollaborative, isPublic, ownerId))
}

/**
 * Return mocked single item of playlists items
 * @param id
 * @param isCollaborative
 * @param isPublic
 * @param ownerId
 */
export function generatePlaylistResponse(id: string, isCollaborative: boolean, isPublic: boolean, ownerId: string): PlaylistResponse {
    return {
        "collaborative": isCollaborative,
        "description": "test playlist",
        "external_urls": {
            "spotify": `https://open.spotify.com/playlist/${id}`
        },
        "href": `https://api.spotify.com/v1/playlists/${id}`,
        "id": id,
        "images": [],
        "name": `Playlist ${id}`,
        "owner": {
            "display_name": `Owner of playlist ${id}`,
            "external_urls": {
                "spotify": "https://open.spotify.com/user/spotify"
            },
            "href": "https://api.spotify.com/v1/users/spotify",
            "id": ownerId,
            "type": "user",
            "uri": "IGNORED"
        },
        "primary_color": null,
        "public": isPublic,
        "snapshot_id": "123",
        "tracks": {
            "href": `https://api.spotify.com/v1/playlists/${id}/tracks`,
            "total": 100
        },
        "type": "playlist",
        "uri": `spotify:playlist:${id}`
    }
}

/**
 * Returns response with list of user's playlist (mock for `/me/playlists`)
 * @param items
 * @param params
 * @param total
 * @param hasNext
 */
export function generateUserPlaylistsResponse(items: PlaylistResponse[], params: Params, total: number, userId: string, hasNext: boolean = true): any {
    return {
        data: {
            "href": `https://api.spotify.com/v1/users/${userId}/playlists?offset=${params.offset || 0}&limit=${params.limit}`,
            "items": items,
            "limit": params.limit,
            "next": hasNext ? `https://api.spotify.com/v1/users/${userId}/playlists?offset=${(params.offset || 0) + params.limit}&limit=${params.limit}` : undefined,
            "offset": params.offset || 0,
            "previous": 'IGNORED',
            "total": total
        }
    }
}
