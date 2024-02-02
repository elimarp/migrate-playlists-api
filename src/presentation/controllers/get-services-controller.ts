import { type GetServices } from '../../domain/usecases/service/get-services'
import { ok, serverError } from '../helpers/http'
import { type HttpRequest, type HttpResponse } from '../protocols/http'

export class GetServicesController {
  constructor (private readonly getServices: GetServices) {}

  handle (request: HttpRequest): HttpResponse {
    try {
      const services = this.getServices.getAllServices()
      return ok({ payload: services })
    } catch (error) {
      return serverError()
    }
  }
}
