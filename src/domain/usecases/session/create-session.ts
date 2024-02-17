import { type StreamingService } from '../../models/streaming-service'

export interface CreateSessionProtocol {
  create(params: CreateSessionProtocol.Params): Promise<CreateSessionProtocol.Result>
}
export namespace CreateSessionProtocol {
  export type Params = {
    code: string
    serviceKeyword: StreamingService
  }
  export type Result = {
    accessToken: string
    expiresIn: number
  }
}
