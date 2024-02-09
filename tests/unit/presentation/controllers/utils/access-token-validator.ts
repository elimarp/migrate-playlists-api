import { faker } from '@faker-js/faker'
import { type SessionModel } from '../../../../../src/domain/models/session'
import { type AccessTokenValidatorProtocol } from '../../../../../src/domain/usecases/security/access-token-validator'
import { makeMongodbIdString } from '../../../../mocks/models/utils'
import { AccessTokenExpiredError } from '../../../../../src/infra/helpers/exceptions'

export class AccessTokenValidatorStub implements AccessTokenValidatorProtocol {
  implementations = {
    expiredToken: async () => { throw new AccessTokenExpiredError() }
  }

  async validate (accessToken: string): Promise<SessionModel> {
    return {
      id: makeMongodbIdString(),
      services: [
        {
          accessToken: faker.string.alpha({ length: 16 }),
          keyword: 'valid-service'
        }
      ]
    }
  }
}
