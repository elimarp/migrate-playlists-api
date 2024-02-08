import { type StreamingServiceModel } from '../../models/streaming-service'

export namespace GetStreamingServicesProtocol {
  export type Result = StreamingServiceModel[]
}

export interface GetStreamingServicesProtocol {
  getAllStreamingServices (): Promise<GetStreamingServicesProtocol.Result>
}
