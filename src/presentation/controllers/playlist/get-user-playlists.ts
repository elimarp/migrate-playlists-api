import { badRequest, forbidden, ok, serverError, unauthorized, unprocessableEntity } from '../../helpers/http'
import { type Controller } from '../../protocols/controller'
import { type HttpRequestData, type HttpRequestHeaders, type HttpResponse } from '../../protocols/http'

import { type ValidateTokenProtocol } from '../../../domain/usecases/security/validate-token'
import { type GetUserPlaylistsProtocol } from '../../../domain/usecases/streaming-service/get-user-playlists'
import { AccessTokenExpiredError } from '../../../infra/helpers/exceptions'
import { RequestValidationError } from '../../helpers/exceptions/request-validation'
import { type RequestValidatorProtocol } from '../../protocols/request-validator'
import { type GetUserPlaylistsRequest } from '../../protocols/requests/get-user-playlists'

export class GetUserPlaylistsController implements Controller {
  constructor (
    private readonly validateToken: ValidateTokenProtocol,
    private readonly requestValidator: RequestValidatorProtocol<GetUserPlaylistsRequest>,
    private readonly usecases: Record<string, GetUserPlaylistsProtocol>
  ) {}

  async handle (data: HttpRequestData, headers: HttpRequestHeaders): Promise<HttpResponse> {
    try {
      if (!headers.authorization) return forbidden()
      const session = await this.validateToken.validate(headers.authorization)

      const request = await this.requestValidator.validate(data)
      const { userId, service } = request.params

      if (!this.usecases[service]) return unprocessableEntity({ message: 'feature not available for this service' })

      const sessionService = session.services.find(item => item.keyword === service)
      if (!sessionService) return forbidden('you are not authenticated to this service')

      const { limit, offset, payload, total } = await this.usecases[service].getUserPlaylists({
        serviceAccessToken: sessionService.accessToken,
        userId
        // TODO: limit and offset
      })

      return ok({
        message: 'Here are your playlists',
        payload, // TODO: I think usecase should call it playlists rather than payload
        total,
        limit,
        offset
      })
    } catch (error) {
      if (error instanceof RequestValidationError) return badRequest({ errors: error.errors })
      if (error instanceof AccessTokenExpiredError) return unauthorized('accessToken expired')

      return serverError()
    }
  }
}
