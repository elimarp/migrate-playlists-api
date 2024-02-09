import { type HttpRequestData, type HttpRequestHeaders, type HttpResponse } from './http'

export interface Controller {
  handle (data: HttpRequestData, headers: HttpRequestHeaders): Promise<HttpResponse>
}
