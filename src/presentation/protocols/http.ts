export interface HttpRequest<T = any> {
  body?: T
  path?: Record<string, string>
  headers: Record<string, string>
}

export interface HttpResponse {
  status: number
  body?: any
}
