import { type ObjectSchema, object, string } from 'yup'
import { type CreateTokenRequest } from '../../protocols/requests/create-token'

export const createTokenValidation: ObjectSchema<CreateTokenRequest> = object({
  query: object({
    service: string().required(),
    code: string().required()
  })
})
