import { MigratePlaylist } from '../../../data/usecases/playlist/migrate-playlist'
import { AccessTokenValidator } from '../../../data/usecases/security/access-token-validator'
import { SessionRepository } from '../../../infra/db/session-repository'
import { HttpHelper } from '../../../infra/helpers/http-helper'
import { JwtHelper } from '../../../infra/helpers/jwt-helper'
import { rabbitmq } from '../../../infra/helpers/rabbitmq-helper'
import { DeezerService } from '../../../infra/http/deezer/deezer-service'
import { SpotifyService } from '../../../infra/http/spotify/spotify-service'
import { CreatePlaylistController } from '../../../presentation/controllers/playlist/create-playlist'
import { RequestValidator } from '../../../presentation/helpers/request-validator'
import { createPlaylistValidation } from '../../../presentation/validators/playlist/create-playlist'
import { constants } from '../../../utils/constants'

const services = {
  spotify: new SpotifyService(new HttpHelper(constants.external.spotify.BASE_URL)),
  deezer: new DeezerService(new HttpHelper(constants.external.deezer.BASE_URL))
}

export const makeCreatePlaylistController = () =>
  new CreatePlaylistController(
    new RequestValidator(createPlaylistValidation),
    new AccessTokenValidator(new JwtHelper(), new SessionRepository()),
    new MigratePlaylist(
      services,
      services,
      rabbitmq
    )
  )
