import { type StreamingService } from '../../../domain/models/streaming-service'

export interface CreateStreamingServiceTokenRequest {
  params: {
    service: StreamingService
  }
  body: {
    code: string
  }
}
