import { type HttpRequest, type HttpResponse } from '../protocols/http'

export interface Controller {
  handle (request: HttpRequest): Promise<HttpResponse>
}
