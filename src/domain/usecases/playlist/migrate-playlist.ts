export interface MigratePlaylistProtocol {
  migrate(params: MigratePlaylistProtocol.Params): Promise<MigratePlaylistProtocol.Result>
}

export namespace MigratePlaylistProtocol {
  export type Params = {
    from: {
      service: string // TODO: StreamingService
      accessToken: string
      playlistId: string
    }
    to: {
      service: string // TODO: StreamingService
      accessToken: string
    }
  }
  export type Result = {
    playlistUrl: string
  }
}
