export interface AddTracksToPlaylistProtocol {
  addTracks(params: AddTracksToPlaylistProtocol.Params): Promise<void>
}
export namespace AddTracksToPlaylistProtocol {
  export type Params = {
    service: string
    playlistId: string
    tracks: { name: string, artists: string[] }[]
    accessToken: string
  }
}
