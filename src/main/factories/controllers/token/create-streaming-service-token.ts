import { CreateDeezerToken } from '../../../../data/usecases/http/deezer/create-deezer-token'
import { AccessTokenValidator } from '../../../../data/usecases/security/access-token-validator'
import { SessionRepository } from '../../../../infra/db/session-repository'
import { HttpHelper } from '../../../../infra/helpers/http-helper'
import { JwtHelper } from '../../../../infra/helpers/jwt-helper'
import { DeezerService } from '../../../../infra/http/deezer/deezer-service'
import { CreateStreamingServiceTokenController } from '../../../../presentation/controllers/token/create-streaming-service-token'
import { RequestValidator } from '../../../../presentation/helpers/request-validator'
import { createStreamingServiceTokenValidation } from '../../../../presentation/validators/playlist/create-streaming-service-token'
import { constants } from '../../../../utils/constants'

const sessionRepository = new SessionRepository()

const usecases = {
  deezer: new CreateDeezerToken(
    new DeezerService(new HttpHelper(constants.external.deezer.BASE_URL)),
    sessionRepository
  )
}

export const makeCreateStreamingServiceTokenController = () => new CreateStreamingServiceTokenController(
  usecases,
  new RequestValidator(createStreamingServiceTokenValidation),
  new AccessTokenValidator(new JwtHelper(), sessionRepository)
)
