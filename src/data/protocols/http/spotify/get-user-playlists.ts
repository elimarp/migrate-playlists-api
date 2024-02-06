export interface GetSpotifyUserPlaylistsServiceParams {
  userId: string
  accessToken: string
  limit?: number
  offset?: number
}

export interface GetSpotifyUserPlaylistsServiceResult {
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
export interface GetSpotifyUserPlaylistsService {
  getPlaylistsByUserId(params: GetSpotifyUserPlaylistsServiceParams): Promise<GetSpotifyUserPlaylistsServiceResult>
}
