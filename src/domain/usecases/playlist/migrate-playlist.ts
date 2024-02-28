export interface MigratePlaylistProtocol {
  migrate(params: MigratePlaylistProtocol.Params): Promise<MigratePlaylistProtocol.Result>
}

export namespace MigratePlaylistProtocol {
  export type Params = {
    from: string // TODO: StreamingService
    to: string // TODO: StreamingService
    playlistId: string
  }
  export type Result = {
    playlistUrl: string
  }
}
