import { type ObjectSchema, object, string } from 'yup'
import { type CreateStreamingServiceTokenRequest } from '../../protocols/requests/create-streaming-service-token'

export const createStreamingServiceTokenValidation: ObjectSchema<CreateStreamingServiceTokenRequest> = object({
  params: object({
    // TODO: feed
    service: string().trim().lowercase().oneOf(['spotify']).required()
  }),
  body: object({
    code: string().trim().required()
  })
})
