import { type GetPlaylistProtocol } from '../../../../../domain/usecases/playlist/get-playlist'
import { type GetSpotifyPlaylistServiceProtocol } from '../../../../protocols/http/spotify/get-playlist'

export class GetSpotifyPlaylist implements GetPlaylistProtocol {
  constructor (
    private readonly getSpotifyPlaylistService: GetSpotifyPlaylistServiceProtocol
  ) {}

  async getPlaylist (params: GetPlaylistProtocol.Params): Promise<GetPlaylistProtocol.Result> {
    const playlist = await this.getSpotifyPlaylistService.getPlaylist({
      accessToken: params.streamingServiceAccessToken,
      playlistId: params.playlistId
    })
    return playlist
  }
}
