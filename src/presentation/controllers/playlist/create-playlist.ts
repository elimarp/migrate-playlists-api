import { type MigratePlaylistProtocol } from '../../../domain/usecases/playlist/migrate-playlist'
import { type AccessTokenValidatorProtocol } from '../../../domain/usecases/security/access-token-validator'
import { AccessTokenExpiredError } from '../../../infra/helpers/exceptions'
import { RequestValidationError } from '../../helpers/exceptions/request-validation'
import { badRequest, created, forbidden, serverError, unauthorized, unprocessableEntity } from '../../helpers/http'
import { type Controller } from '../../protocols/controller'
import { type HttpRequestData, type HttpRequestHeaders, type HttpResponse } from '../../protocols/http'
import { type RequestValidatorProtocol } from '../../protocols/request-validator'
import { type CreatePlaylistRequest } from '../../protocols/requests/create-playlist'

export class CreatePlaylistController implements Controller {
  constructor (
    private readonly requestValidator: RequestValidatorProtocol<CreatePlaylistRequest>,
    private readonly tokenValidator: AccessTokenValidatorProtocol,
    private readonly migratePlaylist: MigratePlaylistProtocol
  ) {}

  async handle (data: HttpRequestData, headers: HttpRequestHeaders): Promise<HttpResponse> {
    try {
      if (!headers.authorization) return forbidden()
      const session = await this.tokenValidator.validate(headers.authorization)
      const request = await this.requestValidator.validate(data)

      const fromService = session.services.find(service => service.keyword === request.body.from)
      const toService = session.services.find(service => service.keyword === request.body.to)

      if (!fromService) return unprocessableEntity({ message: 'you are not authenticated to the service you are migrating from' })
      if (!toService) return unprocessableEntity({ message: 'you are not authenticated to the service you are migrating to' })

      const { playlistUrl } = await this.migratePlaylist.migrate({
        from: {
          service: fromService.keyword,
          accessToken: fromService.accessToken,
          playlistId: request.body.playlistId
        },
        to: {
          service: toService.keyword,
          accessToken: toService.accessToken
        }
      })

      return created({
        message: 'yay you! playlist created and all your songs are being added to it. It may take a while, but you can already enjoy your playlist here: {playlistUrl}',
        payload: {
          playlistUrl
        }
      })
    } catch (error) {
      if (error instanceof RequestValidationError) return badRequest({ errors: error.errors })
      if (error instanceof AccessTokenExpiredError) return unauthorized()
      return serverError()
    }
  }
}
