import { PlaylistNotFoundError } from '../../../domain/usecases/playlist/exceptions'
import { type GetPlaylistProtocol } from '../../../domain/usecases/playlist/get-playlist'
import { type AccessTokenValidatorProtocol } from '../../../domain/usecases/security/access-token-validator'
import { AccessTokenExpiredError } from '../../../infra/helpers/exceptions'
import { RequestValidationError } from '../../helpers/exceptions/request-validation'
import { badRequest, forbidden, notFound, ok, serverError, unauthorized, unprocessableEntity } from '../../helpers/http'
import { type Controller } from '../../protocols/controller'
import { type HttpRequestData, type HttpRequestHeaders, type HttpResponse } from '../../protocols/http'
import { type RequestValidatorProtocol } from '../../protocols/request-validator'
import { type GetPlaylistRequest } from '../../protocols/requests/get-playlist'

export class GetPlaylistController implements Controller {
  constructor (
    private readonly requestValidator: RequestValidatorProtocol<GetPlaylistRequest>,
    private readonly accessTokenValidator: AccessTokenValidatorProtocol,
    private readonly usecases: Record<string, GetPlaylistProtocol>
  ) {}

  async handle (data: HttpRequestData, headers: HttpRequestHeaders): Promise<HttpResponse> {
    try {
      if (!headers.authorization) return forbidden()
      const session = await this.accessTokenValidator.validate(headers.authorization)
      const request = await this.requestValidator.validate(data)
      const sessionService = session.services.find(item => item.keyword === request.params.service)

      if (!sessionService) return forbidden({ message: 'you are not authenticated to this streaming service' })
      if (!this.usecases[request.params.service]) {
        return unprocessableEntity({ message: 'feature not available for this streaming service' })
      }

      const result = await this.usecases[request.params.service].getPlaylist({
        playlistId: request.params.playlistId,
        streamingServiceAccessToken: sessionService.accessToken
      })

      return ok({ message: 'Here is your playlist', payload: result })
    } catch (error) {
      if (error instanceof AccessTokenExpiredError) return unauthorized()
      // TODO: maybe only one NotFoundError class; then notFound(error.message)
      if (error instanceof PlaylistNotFoundError) return notFound({ message: 'Playlist not found' })
      if (error instanceof RequestValidationError) return badRequest({ errors: error.errors })
      return serverError()
    }
  }
}
