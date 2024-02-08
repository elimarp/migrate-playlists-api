import { badRequest, forbidden, ok, serverError, unauthorized } from '../../helpers/http'
import { type Controller } from '../../protocols/controller'
import { type HttpRequest, type HttpResponse } from '../../protocols/http'

import { type ValidateTokenProtocol } from '../../../domain/usecases/security/validate-token'
import { type GetUserPlaylistsProtocol } from '../../../domain/usecases/streaming-service/get-user-playlists'
import { AccessTokenExpiredError } from '../../../infra/helpers/exceptions'

export class GetUserPlaylistsController implements Controller {
  constructor (
    private readonly usecases: Record<string, GetUserPlaylistsProtocol>,
    private readonly validateToken: ValidateTokenProtocol
  ) {}

  async handle (request: HttpRequest<any>): Promise<HttpResponse> {
    try {
      if (!request.headers.authorization) return forbidden()
      const session = await this.validateToken.validate(request.headers.authorization)

      if (!request.path) return badRequest({})
      const { userId, serviceKeyword } = request.path

      if (!userId) return badRequest({ message: 'missing userId' })
      if (!serviceKeyword) return badRequest({ message: 'missing service' })

      if (!this.usecases[serviceKeyword]) return badRequest({ message: 'feature not available for this service' })
      const sessionService = session.services.find(service => service.keyword === serviceKeyword)

      if (!sessionService) return forbidden('you are not authenticated to this service')

      const { limit, offset, payload, total } = await this.usecases[serviceKeyword].getUserPlaylists({
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
      if (error instanceof AccessTokenExpiredError) return unauthorized('accessToken expired')
      return serverError()
    }
  }
}
