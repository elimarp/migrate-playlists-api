export interface GetUserPlaylistsProtocol {
  getUserPlaylists (params: GetUserPlaylistsProtocol.Params): Promise<GetUserPlaylistsProtocol.Result>
}
export namespace GetUserPlaylistsProtocol {
  export type Params = {
    userId: string
    serviceAccessToken: string
    limit?: number
    offset?: number
  }

  export type Result = {
    total: number
    offset: number
    limit: number
    // TODO: make it a global model
    payload: {
      id: string
      name: string
      description: string
      isPublic: boolean
      totalTracks: number
      images: {
        height: number
        url: string
        width: number
      }[]
    }[]
  }
}
