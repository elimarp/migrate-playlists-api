type RequestValidationErrorItem = { path: string, message: string }
type RequestValidationErrorInput = Partial<RequestValidationErrorItem>

export class RequestValidationError extends Error {
  errors: RequestValidationErrorItem[]

  constructor (
    errors: RequestValidationErrorInput[]
  ) {
    super('request validation error')
    this.errors = errors.map(error => ({ path: error.path ?? '', message: error.message ?? '' }))
    // TODO: use only the last part of the path at message
    // (or maybe there's a smarter way to do that. take another look to what's inside yup error)
    // maybe even return param: string
  }
}
