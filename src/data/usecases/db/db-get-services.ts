import { type GetServices } from '../../../domain/usecases/service/get-services'
import { type GetServicesRepository } from '../../protocols/db/get-services-repository'

export class DbGetServices implements GetServices {
  constructor (
    private readonly getServicesRepository: GetServicesRepository
  ) {}

  async getAllServices (): Promise<GetServices.Result> {
    const services = await this.getServicesRepository.getAll()
    return services
  }
}
