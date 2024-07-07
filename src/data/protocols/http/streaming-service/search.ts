import { type Track } from '../../../../domain/models/track'

export interface SearchTracksServiceProtocol {
  search(params: SearchTracksServiceProtocol.Params): Promise<SearchTracksServiceProtocol.Result>
}

export namespace SearchTracksServiceProtocol {
  export type Params = {
    accessToken: string
    name: string
    artists: string[]
    albumName?: string
    config?: {
      limit: number
    }
  }
  export type Result = Track[]
}
