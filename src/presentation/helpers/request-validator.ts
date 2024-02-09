import { type AnyObjectSchema, ValidationError } from 'yup'
import { type RequestValidatorProtocol } from '../protocols/request-validator'
import { RequestValidationError } from './exceptions/request-validation'

export class RequestValidator implements RequestValidatorProtocol {
  constructor (
    private readonly validationSchema: AnyObjectSchema
  ) {}

  async validate (req: any): Promise<any> {
    try {
      // TODO: receive snake_case
      // make result camelCase
      // make errors snake_case again (maybe not here? idk)
      const result = await this.validationSchema.validate(req, {
        abortEarly: false
      })

      return result
    } catch (error) {
      if (!(error instanceof ValidationError)) throw error
      throw new RequestValidationError(error.inner)
    }
  }
}
