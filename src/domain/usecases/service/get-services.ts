import { type ServiceModel } from '../../models/service'

export namespace GetServicesProtocol {
  export type Result = ServiceModel[]
}

export interface GetServicesProtocol {
  getAllServices (): Promise<GetServicesProtocol.Result>
}
