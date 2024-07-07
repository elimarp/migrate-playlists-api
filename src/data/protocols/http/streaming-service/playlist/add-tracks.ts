export interface AddTracksToPlaylistServiceProtocol {
  addTracks(params: AddTracksToPlaylistServiceProtocol.Params): Promise<void>
}

export namespace AddTracksToPlaylistServiceProtocol {
  export type Params = {
    playlistId: string
    tracksIds: string[]
    accessToken: string
  }
}
