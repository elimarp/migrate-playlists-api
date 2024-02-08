import { type StreamingServiceModel } from '../../../../domain/models/streaming-service'

export interface GetStreamingServicesRepository {
  getAll(): Promise<GetStreamingServicesRepository.Result>
}
export namespace GetStreamingServicesRepository {
  export type Result = StreamingServiceModel[]
}
