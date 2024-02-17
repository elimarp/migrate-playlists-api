import { type HttpRequestData } from './http'

export interface RequestValidatorProtocol<T = Record<string, unknown>> {
  validate(data: HttpRequestData): Promise<T>
}
