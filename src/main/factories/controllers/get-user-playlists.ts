import { GetSpotifyUserPlaylists } from '../../../data/usecases/http/playlist/spotify/get-spotify-user-playlists'
import { AccessTokenValidator } from '../../../data/usecases/security/access-token-validator'
import { SessionRepository } from '../../../infra/db/session-repository'
import { HttpHelper } from '../../../infra/helpers/http-helper'
import { JwtHelper } from '../../../infra/helpers/jwt-helper'
import { SpotifyService } from '../../../infra/http/spotify/spotify-service'
import { GetUserPlaylistsController } from '../../../presentation/controllers/playlist/get-user-playlists'
import { RequestValidator } from '../../../presentation/helpers/request-validator'
import { getUserPlaylistsValidation } from '../../../presentation/helpers/request-validators/playlist/get-user-playlists'
import { constants } from '../../../utils/constants'

const usecases = {
  spotify: new GetSpotifyUserPlaylists(
    new SpotifyService(new HttpHelper(constants.http.spotify.BASE_URL))
  )
}

export const makeGetUserPlaylistsController = () => {
  return new GetUserPlaylistsController(
    new AccessTokenValidator(new JwtHelper(), new SessionRepository()),
    new RequestValidator(getUserPlaylistsValidation),
    usecases
  )
}
