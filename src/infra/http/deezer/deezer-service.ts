import { type CreateDeezerAccessTokenServiceProtocol } from '../../../data/protocols/http/deezer/create-deezer-access-token-service'
import { type GetPlaylistServiceProtocol } from '../../../data/protocols/http/streaming-service/playlist/get-playlist'
import { type CreatePlaylistServiceProtocol } from '../../../data/protocols/http/streaming-service/playlist/create-playlist'
import { type PlaylistModel } from '../../../domain/models/playlist'
import { type HttpHelper } from '../../helpers/http-helper'
import { DeezerUnexpectedError } from './protocols/exceptions'
import { type CreateDeezerAccessTokenResponseBody } from './protocols/response-body/create-access-token'
import { type CreateDeezerPlaylistResponseBody } from './protocols/response-body/create-playlist'
import { type SearchTracksServiceProtocol } from '../../../data/protocols/http/streaming-service/search'
import { type DeezerSearchResponseBody } from './protocols/response-body/search'

export class DeezerService implements CreateDeezerAccessTokenServiceProtocol, CreatePlaylistServiceProtocol, GetPlaylistServiceProtocol, SearchTracksServiceProtocol {
  constructor (
    private readonly httpHelper: HttpHelper
  ) { }

  // TODO: deezer.getPlaylist
  async getPlaylist (params: GetPlaylistServiceProtocol.Params): Promise<PlaylistModel> {
    throw new Error('Method not implemented.')
  }

  async createPlaylist (params: CreatePlaylistServiceProtocol.Params): Promise<CreatePlaylistServiceProtocol.Result> {
    const response = await this.httpHelper.request<CreateDeezerPlaylistResponseBody>({
      method: 'POST',
      url: `/user/me/playlists?access_token=${params.accessToken}&title=${params.name}`
    })

    // TODO: improve all deezer response validations 'cause deezer stinks
    if (response.status !== 200) throw new DeezerUnexpectedError(response.status)
    if (!response.body.id) throw new DeezerUnexpectedError(response.status, response.body)

    return {
      id: `${response.body.id}`,
      url: `https://www.deezer.com/playlist/${response.body.id}`
    }
  }

  async createAccessToken (params: CreateDeezerAccessTokenServiceProtocol.Params): Promise<CreateDeezerAccessTokenServiceProtocol.Result> {
    const response = await this.httpHelper.request<CreateDeezerAccessTokenResponseBody>({
      method: 'GET',
      url: `/oauth/access_token.php?app_id=${params.clientId}&secret=${params.clientSecret}&code=${params.code}&output=json`
    })

    if (response.status !== 200) throw new DeezerUnexpectedError(response.status)

    return {
      accessToken: response.body.access_token,
      expiresIn: response.body.expires
    }
  }

  async search (params: SearchTracksServiceProtocol.Params): Promise<SearchTracksServiceProtocol.Result> {
    const response = await this.httpHelper.request<DeezerSearchResponseBody>({
      url: '/search',
      method: 'GET',
      query: {
        q: `track:"${params.name}" artist:"${params.artists[0]}"`,
        access_token: params.accessToken
      }
    })

    if (response.status !== 200) throw new DeezerUnexpectedError(response.status, response.body)

    return response.body.data
      .filter(item => item.type === 'track')
      .map(item => ({
        id: String(item.id),
        name: item.title,
        artists: [
          {
            id: String(item.artist.id),
            name: item.artist.name
          }
        ],
        album: {
          id: String(item.album.id),
          name: item.album.title
        }
      }))
  }
}
