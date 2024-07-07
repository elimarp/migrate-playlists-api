import { type PlaylistModel } from '../../../../../domain/models/playlist'

export namespace GetPlaylistServiceProtocol {
  export type Params = {
    playlistId: string
    accessToken: string
  }
  export type Result = PlaylistModel
}
export interface GetPlaylistServiceProtocol {
  getPlaylist(params: GetPlaylistServiceProtocol.Params): Promise<GetPlaylistServiceProtocol.Result>
}
