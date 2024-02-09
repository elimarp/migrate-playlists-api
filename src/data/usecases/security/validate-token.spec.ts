import { type VerifyOptions } from 'jsonwebtoken'
import { JwtHelper } from '../../../infra/helpers/jwt-helper'
import { AccessTokenValidator } from './access-token-validator'
import { type GetSessionRepository } from '../../protocols/db/session/get-session-repository'
import { type SessionModel } from '../../../domain/models/session'
import { faker } from '@faker-js/faker'

class JwtHelperStub extends JwtHelper {
  async decrypt (jwt: string, options?: VerifyOptions | undefined): Promise<any> {
    return {
      todo: 'token'
    }
  }
}

class SessionRepositoryStub implements GetSessionRepository {
  async getSession (sessionId: string): Promise<SessionModel | null> {
    return {
      id: faker.string.hexadecimal({ length: 12 }),
      services: [
        {
          accessToken: faker.string.alpha({ length: 16 }),
          keyword: 'service01'
        }
      ]
    }
  }
}

const makeSut = () => {
  const jwtHelperStub = new JwtHelperStub()
  const sessionRepositoryStub = new SessionRepositoryStub()
  return {
    sut: new AccessTokenValidator(jwtHelperStub, sessionRepositoryStub),
    jwtHelperStub,
    sessionRepositoryStub
  }
}

describe('Validate Token Use Case', () => {
  test('throw if accessToken is not a string', async () => {
    const { sut } = makeSut()

    expect(sut.validate(1 as unknown as string)).rejects.toEqual(new Error('invalid accessToken'))
  })

  test('throw if accessToken is not Bearer type', async () => {
    const { sut } = makeSut()

    const accessToken = 'Basic token'

    expect(sut.validate(accessToken)).rejects.toEqual(new Error('accessToken is not Bearer type'))
  })

  test('throw if accessToken expired', async () => {
    const { sut, jwtHelperStub } = makeSut()

    jest.spyOn(jwtHelperStub, 'decrypt').mockImplementationOnce(() => { throw new Error('jwt expired') })

    const accessToken = 'Bearer expired_token'

    expect(sut.validate(accessToken)).rejects.toEqual(new Error('jwt expired'))
  })

  test('throw if can not find token\'s id in the database', async () => {
    const { sut, sessionRepositoryStub } = makeSut()

    jest.spyOn(sessionRepositoryStub, 'getSession').mockImplementationOnce(async () => null)

    const accessToken = 'Bearer valid_token'

    expect(sut.validate(accessToken)).rejects.toEqual(new Error('session not found'))
  })

  test('return session when succeed', async () => {
    const { sut } = makeSut()

    const accessToken = 'Bearer valid_token'
    const actual = await sut.validate(accessToken)

    expect(actual).toStrictEqual({
      id: expect.any(String),
      services: expect.anything()
    })
    expect(actual.services[0]).toStrictEqual({
      accessToken: expect.any(String),
      keyword: expect.any(String)
    })
  })
})
