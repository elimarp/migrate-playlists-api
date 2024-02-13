export interface GetPlaylistProtocol {
  getPlaylist(params: GetPlaylistProtocol.Params): Promise<GetPlaylistProtocol.Result>
}

export namespace GetPlaylistProtocol {
  export type Params = {
    playlistId: string
    streamingServiceAccessToken: string
  }
  export type Result = {
    id: string
    name: string
    description: string
    isPublic: boolean
    images: {
      height: number
      url: string
      width: number
    }[]
    tracks: {
      id: string
      name: string
      addedAt: Date
      album: {
        id: string
        name: string
      }
      artists: {
        id: string
        name: string
      }[]
    }[]
  }
}
