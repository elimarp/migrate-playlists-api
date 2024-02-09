import { type HttpRequest } from './http'

export interface RequestValidatorProtocol<T = Record<string, unknown>> {
  validate(params: HttpRequest): Promise<T>
}
