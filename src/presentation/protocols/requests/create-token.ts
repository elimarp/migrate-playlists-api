// import { type StreamingService } from '../../../domain/models/streaming-service'

export interface CreateTokenRequest {
  query: {
    service: string // TODO: StreamingService
    code: string
  }
}
