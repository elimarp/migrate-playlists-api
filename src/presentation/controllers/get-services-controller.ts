import { type GetServicesProtocol } from '../../domain/usecases/service/get-services'
import { ok, serverError } from '../helpers/http'
import { type HttpRequest, type HttpResponse } from '../protocols/http'
import { type Controller } from './controller'

export class GetServicesController implements Controller {
  constructor (private readonly getServices: GetServicesProtocol) {}

  async handle (_request: HttpRequest): Promise<HttpResponse> {
    try {
      const services = await this.getServices.getAllServices()
      return ok({ payload: services })
    } catch (error) {
      return serverError()
    }
  }
}
