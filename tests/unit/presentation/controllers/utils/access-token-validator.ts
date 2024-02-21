import { faker } from '@faker-js/faker'
import { type SessionModel } from '../../../../../src/domain/models/session'
import { type AccessTokenValidatorProtocol } from '../../../../../src/domain/usecases/security/access-token-validator'
import { makeMongodbIdString } from '../../../../mocks/models/utils'
import { AccessTokenExpiredError } from '../../../../../src/infra/helpers/exceptions'

// TODO: export somewhere else
export const makeStreamingServiceAccessToken = () => faker.string.alpha({ length: 16 })

export class AccessTokenValidatorStub implements AccessTokenValidatorProtocol {
  private readonly defaultResult: SessionModel = {
    id: makeMongodbIdString(),
    services: [
      {
        accessToken: makeStreamingServiceAccessToken(),
        keyword: 'valid-streaming-service',
        expiresIn: 3600
      }
    ]
  }

  public readonly implementations = {
    expiredToken: async () => { throw new AccessTokenExpiredError() },
    anotherStreamingService: async (): Promise<SessionModel> => {
      const result = { ...this.defaultResult }

      result.services.push({
        accessToken: makeStreamingServiceAccessToken(),
        keyword: 'another-streaming-service',
        expiresIn: 3600
      })

      return result
    },
    specificServiceValues: async (): Promise<SessionModel> => ({
      id: makeMongodbIdString(),
      services: [
        {
          accessToken: 'specific-access-token',
          keyword: 'specific-streaming-service',
          expiresIn: 3600
        }
      ]
    })
  }

  async validate (accessToken: string): Promise<SessionModel> {
    return this.defaultResult
  }
}
