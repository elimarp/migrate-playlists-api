import { type StreamingService } from '../../../domain/models/streaming-service'

export interface CreateTokenRequest {
  query: {
    service: StreamingService
    code: string
  }
}
