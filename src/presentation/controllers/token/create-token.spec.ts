import { faker } from '@faker-js/faker'
import { makeAccessToken } from '../../../../tests/mocks/http-requests/app'
import { type CreateSessionProtocol } from '../../../domain/usecases/session/create-session'
import { badRequest, ok, serverError } from '../../helpers/http'
import { RequestValidator } from '../../helpers/request-validator'
import { type HttpRequestData, type HttpRequestHeaders } from '../../protocols/http'
import { createTokenValidation } from '../../validators/playlist/create-token'
import { CreateTokenController } from './create-token'

class CreateSessionStub implements CreateSessionProtocol {
  async create (params: CreateSessionProtocol.Params): Promise<CreateSessionProtocol.Result> {
    return {
      accessToken: makeAccessToken(),
      expiresIn: 3600
    }
  }
}

const makeSut = () => {
  const createSessionStub = new CreateSessionStub()
  return {
    sut: new CreateTokenController(createSessionStub, new RequestValidator(createTokenValidation)),
    createSessionStub
  }
}

type Replacing = {
  service?: any
  code?: any
}
const makeRequest = (replacing?: Replacing): [HttpRequestData, HttpRequestHeaders] => {
  const replacingKeys = Object.keys(replacing ?? {})
  const shouldReplace = (key: string) => replacingKeys.some(item => item === key)

  const service = shouldReplace('service') ? replacing?.service : 'valid-streaming-service'
  const code = shouldReplace('code') ? replacing?.code : faker.string.alpha({ length: 16 })

  const data = {
    query: { service, code },
    body: {}
  }
  return [data, {}]
}

describe('Create Token Controller', () => {
  it('returns 400 if no code', async () => {
    const { sut } = makeSut()
    const [data, headers] = makeRequest({ code: undefined })

    const actual = await sut.handle(data, headers)

    expect(actual).toStrictEqual(badRequest({
      message: 'Bad request',
      errors: [
        { path: 'query.code', message: 'query.code is a required field' }
      ]
    }))
  })

  it('returns 400 if service', async () => {
    const { sut } = makeSut()
    const [data, headers] = makeRequest({ service: undefined })

    const actual = await sut.handle(data, headers)

    expect(actual).toStrictEqual(badRequest({
      message: 'Bad request',
      errors: [
        { path: 'query.service', message: 'query.service is a required field' }
      ]
    }))
  })

  it('ensures usecase is called correctly', async () => {
    const { sut, createSessionStub } = makeSut()
    const [data, headers] = makeRequest()

    const spied = jest.spyOn(createSessionStub, 'create')

    await sut.handle(data, headers)

    expect(spied).toHaveBeenCalledWith({
      code: data.query?.code,
      serviceKeyword: data.query?.service
    })
  })

  it('returns 500 if usecase throws an unexpected exception', async () => {
    const { sut, createSessionStub } = makeSut()

    jest.spyOn(createSessionStub, 'create').mockImplementationOnce(
      async () => { throw new Error('unexpected') }
    )

    const actual = await sut.handle(...makeRequest())

    expect(actual).toStrictEqual(serverError())
  })

  it('returns 200 if succeed', async () => {
    const { sut } = makeSut()

    const actual = await sut.handle(...makeRequest())

    expect(actual).toStrictEqual(ok({
      message: 'token created',
      payload: {
        accessToken: expect.any(String),
        expiresIn: 3600
      }
    }))
  })

  // it('', async () => {})
})
