import { type CreateDeezerAccessTokenServiceProtocol } from '../../../data/protocols/http/deezer/create-deezer-access-token-service'
import { type HttpHelper } from '../../helpers/http-helper'
import { DeezerUnexpectedError } from './protocols/exceptions'
import { type CreateDeezerAccessTokenResponseBody } from './protocols/response-body/create-access-token'

export class DeezerService implements CreateDeezerAccessTokenServiceProtocol {
  constructor (
    private readonly httpHelper: HttpHelper
  ) {}

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
