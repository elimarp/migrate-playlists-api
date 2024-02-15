import { type PlaylistModel } from '../../models/playlist'

export interface GetPlaylistProtocol {
  getPlaylist(params: GetPlaylistProtocol.Params): Promise<GetPlaylistProtocol.Result>
}

export namespace GetPlaylistProtocol {
  export type Params = {
    playlistId: string
    streamingServiceAccessToken: string
  }
  export type Result = PlaylistModel

}
