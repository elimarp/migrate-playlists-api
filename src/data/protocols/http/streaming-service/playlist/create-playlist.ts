export interface CreatePlaylistServiceProtocol {
  createPlaylist(params: CreatePlaylistServiceProtocol.Params): Promise<CreatePlaylistServiceProtocol.Result>
}

export namespace CreatePlaylistServiceProtocol {
  export type Params = {
    accessToken: string
    name: string
    description?: string
    // TODO: isPublic?
  }
  export type Result = {
    id: string
    url: string
  }
}
