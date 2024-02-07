import { type GetUserPlaylistsProtocol, type GetUserPlaylistsParams, type GetUserPlaylistsResult } from '../../../../domain/usecases/service/get-user-playlists'
import { type GetSpotifyUserPlaylistsService } from '../../../protocols/http/spotify/get-user-playlists'

export class GetSpotifyUserPlaylistsUsecase implements GetUserPlaylistsProtocol {
  constructor (
    private readonly getSpotifyUserPlaylistsService: GetSpotifyUserPlaylistsService
  ) {}

  async getUserPlaylists ({ serviceAccessToken: accessToken, ...params }: GetUserPlaylistsParams): Promise<GetUserPlaylistsResult> {
    const result = await this.getSpotifyUserPlaylistsService.getPlaylistsByUserId({ ...params, accessToken })
    return result
  }
}
