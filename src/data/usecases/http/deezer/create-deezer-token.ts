import { type CreateStreamingServiceTokenProtocol } from '../../../../domain/usecases/token/create-streaming-service-token'
import { constants } from '../../../../utils/constants'
import { type AddSessionServiceRepository } from '../../../protocols/db/session/add-session-service-repository'
import { type CreateDeezerAccessTokenServiceProtocol } from '../../../protocols/http/deezer/create-deezer-access-token-service'

export class CreateDeezerToken implements CreateStreamingServiceTokenProtocol {
  constructor (
    private readonly createDeezerAccessTokenService: CreateDeezerAccessTokenServiceProtocol,
    private readonly addSessionServiceRepository: AddSessionServiceRepository
  ) {}

  async createToken (params: CreateStreamingServiceTokenProtocol.Params): Promise<CreateStreamingServiceTokenProtocol.Result> {
    const deezerToken = await this.createDeezerAccessTokenService.createAccessToken({
      clientId: constants.external.deezer.CLIENT_ID,
      clientSecret: constants.external.deezer.CLIENT_SECRET,
      code: params.code
    })

    await this.addSessionServiceRepository.addService(params.sessionId, {
      accessToken: deezerToken.accessToken,
      expiresIn: deezerToken.expiresIn,
      keyword: 'deezer'
    })

    return {
      accessToken: deezerToken.accessToken,
      expiresIn: deezerToken.expiresIn
    }
  }
}
