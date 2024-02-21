import { type AccessTokenValidatorProtocol } from '../../../domain/usecases/security/access-token-validator'
import { type CreateStreamingServiceTokenProtocol } from '../../../domain/usecases/token/create-streaming-service-token'
import { AccessTokenExpiredError } from '../../../infra/helpers/exceptions'
import { RequestValidationError } from '../../helpers/exceptions/request-validation'
import { badRequest, created, forbidden, serverError, unauthorized, unprocessableEntity } from '../../helpers/http'
import { type Controller } from '../../protocols/controller'
import { type HttpRequestData, type HttpRequestHeaders, type HttpResponse } from '../../protocols/http'
import { type RequestValidatorProtocol } from '../../protocols/request-validator'
import { type CreateStreamingServiceTokenRequest } from '../../protocols/requests/create-streaming-service-token'

export class CreateStreamingServiceTokenController implements Controller {
  constructor (
    private readonly usecases: Record<string, CreateStreamingServiceTokenProtocol>,
    private readonly requestValidator: RequestValidatorProtocol<CreateStreamingServiceTokenRequest>,
    private readonly accessTokenValidator: AccessTokenValidatorProtocol
  ) {}

  async handle (data: HttpRequestData, headers: HttpRequestHeaders): Promise<HttpResponse> {
    try {
      if (!headers.authorization) return forbidden()
      const session = await this.accessTokenValidator.validate(headers.authorization)

      const request = await this.requestValidator.validate(data)

      if (!this.usecases[request.params.service]) {
        return unprocessableEntity({
          message: 'feature not available for this streaming service'
        })
      }
      await this.usecases[request.params.service].createToken({
        code: request.body.code,
        sessionId: session.id
      })

      return created({})
    } catch (error) {
      if (error instanceof RequestValidationError) return badRequest({ errors: error.errors })
      if (error instanceof AccessTokenExpiredError) return unauthorized({ message: 'access token expired' })

      return serverError()
    }
  }
}
