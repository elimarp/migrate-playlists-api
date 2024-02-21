import { type CreateSessionProtocol } from '../../../domain/usecases/session/create-session'
import { RequestValidationError } from '../../helpers/exceptions/request-validation'
import { badRequest, ok, serverError } from '../../helpers/http'
import { type Controller } from '../../protocols/controller'
import {
  type HttpRequestData,
  type HttpRequestHeaders,
  type HttpResponse
} from '../../protocols/http'
import { type RequestValidatorProtocol } from '../../protocols/request-validator'
import { type CreateTokenRequest } from '../../protocols/requests/create-token'

export class CreateTokenController implements Controller {
  constructor (
    private readonly createSession: CreateSessionProtocol,
    private readonly requestValidator: RequestValidatorProtocol<CreateTokenRequest>
  ) {}

  // TODO: NEITHER CODE OR SERVICE SHOULD BE A QUERY PARAM
  async handle (data: HttpRequestData, headers: HttpRequestHeaders): Promise<HttpResponse> {
    try {
      const request = await this.requestValidator.validate(data)
      const token = await this.createSession.create({
        code: request.query.code,
        serviceKeyword: request.query.service as 'spotify' // TODO: fix
      })

      return ok({
        message: 'token created',
        payload: {
          accessToken: token.accessToken,
          expiresIn: token.expiresIn
        }
      })
    } catch (error) {
      if (error instanceof RequestValidationError) return badRequest({ errors: error.errors })
      return serverError()
    }
  }
}
