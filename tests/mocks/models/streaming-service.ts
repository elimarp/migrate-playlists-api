import { faker } from '@faker-js/faker'
import { type CreateStreamingServiceModel, type StreamingServiceModel } from '../../../src/domain/models/streaming-service'
import { makeMongodbIdString } from './utils'

export const makeStreamingServiceKeyword = () => faker.string.alpha({ casing: 'lower', length: { min: 4, max: 12 } })
export const makeStreamingServiceAccessToken = () => faker.string.alpha({ length: 24 })

export const makeCreateStreamingService = (): CreateStreamingServiceModel => ({
  imageUrl: faker.image.url(),
  name: faker.company.name(),
  keyword: makeStreamingServiceKeyword(),
  oauthUrl: faker.internet.url()
})

export const makeStreamingService = (): StreamingServiceModel => ({
  id: makeMongodbIdString(),
  ...makeCreateStreamingService()
})
