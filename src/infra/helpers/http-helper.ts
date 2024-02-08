import { Axios, type RawAxiosRequestHeaders, type Method } from 'axios'

export type HttpHelperRequest = {
  method: Method
  url: string
  headers?: RawAxiosRequestHeaders
}

export type HttpHelperResponse<T> = {
  status: number
  body: T
}

export class HttpHelper {
  private readonly axios: Axios

  constructor (baseUrl?: string) {
    this.axios = baseUrl ? new Axios({ baseURL: baseUrl }) : new Axios()
  }

  async request<ResponseBody> (params: HttpHelperRequest): Promise<HttpHelperResponse<ResponseBody>> {
    const response = await this.axios.request<ResponseBody>({
      method: params.method,
      url: params.url,
      headers: params.headers
    })

    // TODO: prevent axios from throwing when status' not in 200s range

    return {
      status: response.status,
      body: response.data
    }
  }
}
