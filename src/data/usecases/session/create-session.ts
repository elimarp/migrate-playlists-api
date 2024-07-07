import { type CreateSessionProtocol } from '../../../domain/usecases/session/create-session'
import { constants } from '../../../utils/constants'
import { type CreateSessionRepository } from '../../protocols/db/session/create-session-repository'
import { type JwtEncryptHelperProtocol } from '../../protocols/helpers/jwt-helper'
import { type CreateSpotifyAccessTokenServiceProtocol } from '../../protocols/http/spotify/create-spotify-access-token'

type CreateStreamingServiceAccessTokenServices = Record<string, CreateSpotifyAccessTokenServiceProtocol>

export class CreateSession implements CreateSessionProtocol {
  constructor (
    private readonly createStreamingServiceAccessTokenServices: CreateStreamingServiceAccessTokenServices,
    private readonly createSessionRepository: CreateSessionRepository,
    private readonly encryptJwt: JwtEncryptHelperProtocol
  ) { }

  async create (params: CreateSessionProtocol.Params): Promise<CreateSessionProtocol.Result> {
    if (!this.createStreamingServiceAccessTokenServices[params.serviceKeyword]) {
      throw new Error('missing CreateAccessTokenService for this Streaming Service')
    }

    const streamingServiceToken =
      await this.createStreamingServiceAccessTokenServices[params.serviceKeyword]
        .createAccessToken({
          code: params.code,
          redirectUri: `${constants.app.callback.BASE_URL}/${params.serviceKeyword}`,
          clientId: constants.external[params.serviceKeyword].CLIENT_ID,
          clientSecret: constants.external[params.serviceKeyword].CLIENT_SECRET
        })

    const session = await this.createSessionRepository.create({
      services: [
        {
          keyword: params.serviceKeyword,
          accessToken: streamingServiceToken.accessToken,
          expiresIn: streamingServiceToken.expiresIn,
          refreshToken: streamingServiceToken.refreshToken
          // TODO: not every streaming service will have a refresh token
        }
      ]
    })

    const expiresIn = 60 * 60 * 24 // 24h

    const jwt = await this.encryptJwt.encrypt({ id: session.id }, {
      expiresIn
    })

    return {
      accessToken: jwt,
      expiresIn
    }
  }
}
