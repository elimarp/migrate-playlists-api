import { type ServiceModel } from '../../models/service'

export namespace GetServices {
  export type Result = ServiceModel[]
}

export interface GetServices {
  getAllServices (): Promise<GetServices.Result>
}
