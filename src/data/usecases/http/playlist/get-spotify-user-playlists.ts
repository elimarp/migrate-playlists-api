import { type GetSpotifyUserPlaylistsService } from '../../../protocols/http/spotify/get-user-playlists'

interface GetSpotifyUserPlaylists {
  getUserPlaylists(params: GetSpotifyUserPlaylistsParams): Promise<GetSpotifyUserPlaylistsResult>
}

interface GetSpotifyUserPlaylistsParams {
  userId: string
  spotifyAccessToken: string
  limit?: number
  offset?: number
}

interface GetSpotifyUserPlaylistsResult {
  total: number
  offset: number
  limit: number
  payload: {
    id: string
    name: string
    description: string
    isPublic: boolean
    images: {
      height: number
      url: string
      width: number
    }[]
    totalTracks: number
  }[]
}

export class GetSpotifyUserPlaylistsUsecase implements GetSpotifyUserPlaylists {
  constructor (
    private readonly getSpotifyUserPlaylistsService: GetSpotifyUserPlaylistsService
  ) {}

  async getUserPlaylists ({ spotifyAccessToken, ...params }: GetSpotifyUserPlaylistsParams): Promise<GetSpotifyUserPlaylistsResult> {
    const result = await this.getSpotifyUserPlaylistsService.getPlaylistsByUserId({ ...params, accessToken: spotifyAccessToken })
    return result
  }
}
