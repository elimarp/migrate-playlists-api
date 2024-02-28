import { type HttpRequestData, type HttpRequestHeaders, type HttpResponse } from './http'

export interface Controller {
  // TODO: maybe rename to rawData or rawRequest
  handle (data: HttpRequestData, headers: HttpRequestHeaders): Promise<HttpResponse>
}
