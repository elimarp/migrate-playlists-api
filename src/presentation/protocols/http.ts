export interface HttpRequestData {
  body?: Record<string, unknown>
  params?: Record<string, string>
}

export interface HttpRequestHeaders {
  authorization?: string
}

export interface HttpResponse {
  status: number
  body?: any
}
