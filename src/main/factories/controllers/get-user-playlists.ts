import { GetSpotifyUserPlaylists } from '../../../data/usecases/http/playlist/spotify/get-spotify-user-playlists'
import { ValidateToken } from '../../../data/usecases/security/validate-token'
import { SessionRepository } from '../../../infra/db/session-repository'
import { HttpHelper } from '../../../infra/helpers/http-helper'
import { JwtHelper } from '../../../infra/helpers/jwt-helper'
import { SpotifyService } from '../../../infra/http/spotify/spotify-service'
import { GetUserPlaylistsController } from '../../../presentation/controllers/playlist/get-user-playlists'

// TODO: .env SPOTIFY_BASE_URL
const SPOTIFY_BASE_URL = ''

const usecases = {
  spotify: new GetSpotifyUserPlaylists(new SpotifyService(new HttpHelper(SPOTIFY_BASE_URL)))
}

export const makeGetUserPlaylistsController = () => {
  return new GetUserPlaylistsController(usecases, new ValidateToken(new JwtHelper(), new SessionRepository()))
}
