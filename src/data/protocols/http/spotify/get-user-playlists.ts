export interface GetSpotifyUserPlaylistsServiceProtocol {
  getPlaylistsByUserId(params: GetSpotifyUserPlaylistsServiceProtocol.Params): Promise<GetSpotifyUserPlaylistsServiceProtocol.Result>
}
export namespace GetSpotifyUserPlaylistsServiceProtocol {
  export type Params = {
    userId: string
    accessToken: string
    limit?: number
    offset?: number
  }
  export type Result = {
    total: number
    offset: number
    limit: number
    // TODO: create model?
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
}
