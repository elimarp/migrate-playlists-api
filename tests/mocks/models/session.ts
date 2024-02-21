import { faker } from '@faker-js/faker'
import { type SessionServiceModel, type CreateSessionModel, type SessionModel } from '../../../src/domain/models/session'
import { makeStreamingServiceKeyword } from './streaming-service'
import { makeMongodbIdString } from './utils'

export const makeSessionStreamingService = (): SessionServiceModel => ({
  accessToken: faker.string.alphanumeric({ length: 24 }),
  expiresIn: 3600,
  keyword: makeStreamingServiceKeyword()
})

export const makeCreateSession = (serviceAmount?: number): CreateSessionModel => {
  const services = []
  const rounds = serviceAmount ?? faker.number.int({ min: 1, max: 5 })

  for (let i = 0; i < rounds; i++) {
    services.push(makeSessionStreamingService())
  }

  return { services }
}

export const makeSession = (): SessionModel => ({
  id: makeMongodbIdString(),
  ...makeCreateSession()
})
