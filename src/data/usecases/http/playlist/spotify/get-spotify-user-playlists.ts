import { type GetUserPlaylistsProtocol } from '../../../../../domain/usecases/streaming-service/get-user-playlists'
import { type GetSpotifyUserPlaylistsServiceProtocol } from '../../../../protocols/http/spotify/get-user-playlists'

export class GetSpotifyUserPlaylists implements GetUserPlaylistsProtocol {
  constructor (
    private readonly getSpotifyUserPlaylistsService: GetSpotifyUserPlaylistsServiceProtocol
  ) {}

  async getUserPlaylists ({ serviceAccessToken: accessToken, ...params }: GetUserPlaylistsProtocol.Params): Promise<GetUserPlaylistsProtocol.Result> {
    const result = await this.getSpotifyUserPlaylistsService.getPlaylistsByUserId({ ...params, accessToken })
    return result
  }
}
