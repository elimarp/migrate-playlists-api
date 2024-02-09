// TODO: maybe inject more than just the body?
export interface HttpRequest {
  body?: Record<string, unknown>
  params?: Record<string, string>
  headers: Record<string, string>
}

export interface HttpResponse {
  status: number
  body?: any
}
