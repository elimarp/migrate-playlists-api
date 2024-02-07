export interface GetUserPlaylistsParams {
  userId: string
  serviceAccessToken: string
  limit?: number
  offset?: number
}

export interface GetUserPlaylistsResult {
  total: number
  offset: number
  limit: number
  // TODO: make it a global model
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

export interface GetUserPlaylists {
  getUserPlaylists (params: GetUserPlaylistsParams): Promise<GetUserPlaylistsResult>
}
