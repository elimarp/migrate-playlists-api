import { type GetServices } from '../../domain/usecases/service/get-services'
import { ok, serverError } from '../helpers/http'
import { type HttpRequest, type HttpResponse } from '../protocols/http'

export class GetServicesController {
  constructor (private readonly getServices: GetServices) {}

  async handle (request: HttpRequest): Promise<HttpResponse> {
    try {
      const services = await this.getServices.getAllServices()
      return ok({ payload: services })
    } catch (error) {
      return serverError()
    }
  }
}
