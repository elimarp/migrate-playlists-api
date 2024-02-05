export type GetSpotifyUserPlaylistsParams = {
  userId: string
  accessToken: string
  limit?: number
  offset?: number
}

export type GetSpotifyUserPlaylistsResult = {
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
export interface GetSpotifyUserPlaylists {
  getPlaylistsByUserId(params: GetSpotifyUserPlaylistsParams): Promise<GetSpotifyUserPlaylistsResult>
}
