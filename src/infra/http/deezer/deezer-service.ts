import { type CreateDeezerAccessTokenServiceProtocol } from '../../../data/protocols/http/deezer/create-deezer-access-token-service'
import { type CreatePlaylistServiceProtocol } from '../../../data/protocols/http/streaming-service/playlist/create-playlist'
import { type HttpHelper } from '../../helpers/http-helper'
import { DeezerUnexpectedError } from './protocols/exceptions'
import { type CreateDeezerAccessTokenResponseBody } from './protocols/response-body/create-access-token'
import { type CreateDeezerPlaylistResponseBody } from './protocols/response-body/create-playlist'

export class DeezerService implements CreateDeezerAccessTokenServiceProtocol, CreatePlaylistServiceProtocol {
  constructor (
    private readonly httpHelper: HttpHelper
  ) {}

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
}
