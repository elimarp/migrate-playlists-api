import { type GetStreamingServicesProtocol } from '../../../domain/usecases/streaming-service/get-streaming-services'
import { ok, serverError } from '../../helpers/http'
import { type Controller } from '../../protocols/controller'
import { type HttpRequestData, type HttpRequestHeaders, type HttpResponse } from '../../protocols/http'

export class GetStreamingServicesController implements Controller {
  constructor (private readonly getServices: GetStreamingServicesProtocol) {}

  async handle (_data: HttpRequestData, _headers: HttpRequestHeaders): Promise<HttpResponse> {
    try {
      const services = await this.getServices.getAllStreamingServices()

      return ok({ payload: services })
    } catch (error) {
      return serverError()
    }
  }
}
