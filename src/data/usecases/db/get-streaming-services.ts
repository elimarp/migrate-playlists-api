import { type GetStreamingServicesProtocol } from '../../../domain/usecases/streaming-service/get-streaming-services'
import { type GetStreamingServicesRepository } from '../../protocols/db/streaming-services/get-streaming-services'

export class GetStreamingServices implements GetStreamingServicesProtocol {
  constructor (
    private readonly getServicesRepository: GetStreamingServicesRepository
  ) {}

  async getAllStreamingServices (): Promise<GetStreamingServicesProtocol.Result> {
    const services = await this.getServicesRepository.getAll()
    return services
  }
}
