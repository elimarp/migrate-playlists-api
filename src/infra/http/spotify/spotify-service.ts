import { type GetSpotifyUserPlaylistsService, type GetSpotifyUserPlaylistsServiceParams, type GetSpotifyUserPlaylistsServiceResult } from '../../../data/protocols/http/spotify/get-user-playlists'
import { MaximumValueError, MinimumValueError, MissingParamError } from '../../../utils/exceptions'
import { type HttpHelper } from '../../helpers/http-helper'
import { type GetSpotifyUserPlaylistsResponseBody } from './utils/protocols/get-user-playlists'

export class SpotifyService implements GetSpotifyUserPlaylistsService {
  constructor (private readonly httpHelper: HttpHelper) { }

  async getPlaylistsByUserId (params: GetSpotifyUserPlaylistsServiceParams): Promise<GetSpotifyUserPlaylistsServiceResult> {
    const { accessToken, userId, limit, offset } = params
    // TODO: remove all of it once I implement yup at the controller
    if (!accessToken) throw new MissingParamError('accessToken')
    if (!userId) throw new MissingParamError('userId')
    if (limit === 0) throw new MinimumValueError('limit', 1)
    if (limit && limit < 1) throw new MinimumValueError('limit', 1)
    if (limit && limit > 50) throw new MaximumValueError('limit', 50)
    if (offset && offset < 0) throw new MinimumValueError('offset', 0)
    if (offset && offset > 100_000) throw new MaximumValueError('offset', 100_000)

    const response = await this.httpHelper.request<GetSpotifyUserPlaylistsResponseBody>({
      method: 'GET',
      url: `/users/${userId}/playlists?limit=${limit ?? 20}&offset=${offset ?? 0}`,
      headers: { Authorization: `Bearer ${accessToken}` }
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
