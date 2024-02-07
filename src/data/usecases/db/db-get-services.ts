import { type GetServicesProtocol } from '../../../domain/usecases/service/get-services'
import { type GetServicesRepository } from '../../protocols/db/get-services-repository'

export class GetServices implements GetServicesProtocol {
  constructor (
    private readonly getServicesRepository: GetServicesRepository
  ) {}

  async getAllServices (): Promise<GetServicesProtocol.Result> {
    const services = await this.getServicesRepository.getAll()
    return services
  }
}
