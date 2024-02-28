export interface CreatePlaylistServiceProtocol {
  createPlaylist(params: CreatePlaylistServiceProtocol.Params): Promise<CreatePlaylistServiceProtocol.Result>
}

export namespace CreatePlaylistServiceProtocol {
  export type Params = {
    name: string
    description: string
  }
  export type Result = {
    id: string
    url: string
  }
}
