import { type PlaylistModel } from '../../../../domain/models/playlist'

export namespace GetSpotifyPlaylistServiceProtocol {
  export type Params = {
    playlistId: string
    accessToken: string
  }
  export type Result = PlaylistModel
}
export interface GetSpotifyPlaylistServiceProtocol {
  getPlaylist(params: GetSpotifyPlaylistServiceProtocol.Params): Promise<GetSpotifyPlaylistServiceProtocol.Result>
}
