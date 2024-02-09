type RequestValidationErrorItem = { path: string, message: string }
type RequestValidationErrorInput = Partial<RequestValidationErrorItem>

export class RequestValidationError extends Error {
  errors: RequestValidationErrorItem[]

  constructor (
    errors: RequestValidationErrorInput[]
  ) {
    super('request validation error')
    this.errors = errors.map(error => ({ path: error.path ?? '', message: error.message ?? '' }))
  }
}
