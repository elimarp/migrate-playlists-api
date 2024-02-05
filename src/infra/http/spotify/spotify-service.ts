import { type GetSpotifyUserPlaylistsParams, type GetSpotifyUserPlaylists, type GetSpotifyUserPlaylistsResult } from '../../../data/protocols/http/spotify/get-user-playlists'
import { type HttpHelper } from '../http-helper'
import { type GetSpotifyUserPlaylistsResponseBody } from './types/get-user-playlists'

export class SpotifyService implements GetSpotifyUserPlaylists {
  constructor (private readonly httpHelper: HttpHelper) { }

  async getPlaylistsByUserId (params: GetSpotifyUserPlaylistsParams): Promise<GetSpotifyUserPlaylistsResult> {
    const { accessToken, userId, limit, offset } = params
    if (!accessToken) throw new Error('missing accessToken')
    if (!userId) throw new Error('missing userId')
    if (limit === 0) throw new Error('minimum limit is 1')
    if (limit && limit < 1) throw new Error('minimum limit is 1')
    if (limit && limit > 50) throw new Error('maximum limit is 50')
    if (offset && offset < 0) throw new Error('minimum offset is 0')
    if (offset && offset > 100_000) throw new Error('maximum offset is 100,000')

    const response = await this.httpHelper.request<GetSpotifyUserPlaylistsResponseBody>({
      method: 'GET',
      url: `/users/${userId}/playlists`
    })

    const payload = response.body.items.map(
      ({ id, name, description, images, public: isPublic, tracks: { total: totalTracks } }) =>
        ({
          id,
          name,
          description,
          images,
          isPublic,
          totalTracks
        }))

    return {
      limit: response.body.limit,
      offset: response.body.offset,
      total: response.body.total,
      payload
    }
  }
}
