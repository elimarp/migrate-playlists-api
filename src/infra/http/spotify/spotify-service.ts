import * as qs from 'node:querystring'
import { type CreateSpotifyAccessTokenServiceProtocol } from '../../../data/protocols/http/spotify/create-spotify-access-token'
import { type GetPlaylistServiceProtocol } from '../../../data/protocols/http/streaming-service/playlist/get-playlist'
import { type GetSpotifyUserPlaylistsServiceProtocol } from '../../../data/protocols/http/spotify/get-user-playlists'
import { MaximumValueError, MinimumValueError, MissingParamError } from '../../../utils/exceptions'
import { type HttpHelper } from '../../helpers/http-helper'
import { SpotifyExpiredTokenError, SpotifyPlaylistNotFoundError, SpotifyUnexpectedError } from './protocols/exceptions'
import { type CreateSpotifyAccessTokenResponseBody } from './protocols/response-body/create-token'
import { type GetSpotifyPlaylistResponseBody } from './protocols/response-body/get-playlist'
import { type GetSpotifyUserPlaylistsResponseBody } from './protocols/response-body/get-user-playlists'
import { type CreatePlaylistServiceProtocol } from '../../../data/protocols/http/streaming-service/playlist/create-playlist'
export class SpotifyService implements GetSpotifyUserPlaylistsServiceProtocol, GetPlaylistServiceProtocol, CreateSpotifyAccessTokenServiceProtocol, CreatePlaylistServiceProtocol {
  constructor (private readonly httpHelper: HttpHelper) { }

  // TODO: spotify.createPlaylist
  async createPlaylist (params: CreatePlaylistServiceProtocol.Params): Promise<CreatePlaylistServiceProtocol.Result> {
    throw new Error('Method not implemented.')
  }

  async createAccessToken (params: CreateSpotifyAccessTokenServiceProtocol.Params): Promise<CreateSpotifyAccessTokenServiceProtocol.Result> {
    const response = await this.httpHelper.request<CreateSpotifyAccessTokenResponseBody>({
      method: 'POST',
      url: '/token',
      auth: {
        username: params.clientId,
        password: params.clientSecret
      },
      body: qs.stringify({
        code: params.code,
        redirect_uri: params.redirectUri,
        grant_type: 'authorization_code'
      }),
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })

    if (response.status !== 200) throw new SpotifyUnexpectedError(response.status)

    const { access_token: accessToken, expires_in: expiresIn, refresh_token: refreshToken } = response.body

    return {
      accessToken,
      expiresIn,
      refreshToken
    }
  }

  async getPlaylist (params: GetPlaylistServiceProtocol.Params): Promise<GetPlaylistServiceProtocol.Result> {
    const response = await this.httpHelper.request<GetSpotifyPlaylistResponseBody>({
      method: 'GET',
      url: `/playlists/${params.playlistId}`,
      headers: { Authorization: `Bearer ${params.accessToken}` }
    })

    if (response.status === 401) throw new SpotifyExpiredTokenError()
    if (response.status === 404) throw new SpotifyPlaylistNotFoundError()
    if (response.status !== 200) throw new SpotifyUnexpectedError(response.status)

    const { id, name, description, public: isPublic, images, tracks } = response.body

    return {
      id,
      name,
      description,
      isPublic,
      images,
      tracks: tracks.items.map(({ track: { id, name, album, artists }, added_at: addedAt }) => ({
        id,
        name,
        album: { id: album.id, name: album.name },
        artists: artists.map(({ id, name }) => ({ id, name })),
        addedAt: new Date(addedAt)
      }))
    }
  }

  async getPlaylistsByUserId (params: GetSpotifyUserPlaylistsServiceProtocol.Params): Promise<GetSpotifyUserPlaylistsServiceProtocol.Result> {
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

    // TODO: validate status first (401, 404)

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
