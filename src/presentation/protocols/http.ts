export interface HttpRequest<T = any> {
  body?: T
}

export interface HttpResponse {
  status: number
  body?: any
}
