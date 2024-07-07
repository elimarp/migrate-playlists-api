import { Axios, type RawAxiosRequestHeaders, type AxiosBasicCredentials } from 'axios'

export type HttpHelperRequest = {
  method: 'GET' | 'DELETE' | 'OPTIONS' | 'POST' | 'PUT' | 'PATCH'
  url: string
  headers?: RawAxiosRequestHeaders
  body?: Record<string, any> | string
  query?: Record<string, string>
  auth?: AxiosBasicCredentials
}

export type HttpHelperResponse<T> = {
  status: number
  body: T
}

// TODO: interface segregation
export class HttpHelper {
  private readonly axios: Axios

  constructor (baseUrl?: string) {
    this.axios = baseUrl ? new Axios({ baseURL: baseUrl }) : new Axios()
  }

  async request<ResponseBody> (params: HttpHelperRequest): Promise<HttpHelperResponse<ResponseBody>> {
    const response = await this.axios.request<ResponseBody>({
      method: params.method,
      url: params.url,
      headers: params.headers,
      data: params.body,
      auth: params.auth,
      params: params.query
    })

    // TODO: prevent axios from throwing when status' not in 200s range
    // TODO: throw only when timeout

    return {
      status: response.status,
      body: response.data
    }
  }
}
