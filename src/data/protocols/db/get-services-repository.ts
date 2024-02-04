import { type ServiceModel } from '../../../domain/models/service'

export interface GetServicesRepository {
  getAll(): Promise<GetServicesRepository.Result>
}
export namespace GetServicesRepository {
  export type Result = ServiceModel[]
}
