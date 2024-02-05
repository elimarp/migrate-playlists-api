import { Axios, type Method } from 'axios'

type Request = {
  method: Method
  url: string
}

type Response<T> = {
  status: number
  body: T
}

export class HttpHelper {
  private readonly axios: Axios

  constructor (baseUrl?: string) {
    this.axios = baseUrl ? new Axios({ baseURL: baseUrl }) : new Axios()
  }

  async request<ResponseBody> (params: Request): Promise<Response<ResponseBody>> {
    const response = await this.axios.request<ResponseBody>({
      method: params.method,
      url: params.url
    })

    return {
      status: response.status,
      body: response.data
    }
  }
}
