import { faker } from '@faker-js/faker'
import { makeAccessToken } from '../../../../tests/mocks/http-requests/app'
import { makeStreamingServiceAccessToken } from '../../../../tests/mocks/models/streaming-service'
import { AccessTokenValidatorStub } from '../../../../tests/unit/presentation/controllers/utils/access-token-validator'
import { type CreateStreamingServiceTokenProtocol } from '../../../domain/usecases/token/create-streaming-service-token'
import { badRequest, created, forbidden, serverError, unauthorized, unprocessableEntity } from '../../helpers/http'
import { RequestValidator } from '../../helpers/request-validator'
import { type HttpRequestData, type HttpRequestHeaders } from '../../protocols/http'
import { createStreamingServiceTokenValidation } from '../../validators/playlist/create-streaming-service-token'
import { CreateStreamingServiceTokenController } from './create-streaming-service-token'

class CreateSpotifyTokenStub implements CreateStreamingServiceTokenProtocol {
  async createToken (params: CreateStreamingServiceTokenProtocol.Params): Promise<CreateStreamingServiceTokenProtocol.Result> {
    return {
      accessToken: makeStreamingServiceAccessToken(),
      expiresIn: 3600
    }
  }
}

const makeSut = (replacingUsecases?: Record<string, CreateStreamingServiceTokenProtocol>) => {
  const usecases = replacingUsecases ?? {
    spotify: new CreateSpotifyTokenStub()
  }
  const accessTokenValidatorStub = new AccessTokenValidatorStub()
  return {
    sut: new CreateStreamingServiceTokenController(
      usecases,
      new RequestValidator(createStreamingServiceTokenValidation),
      accessTokenValidatorStub
    ),
    usecases,
    accessTokenValidatorStub
  }
}

type Replacing = {
  service?: any
  code?: any
  authorization?: any
}
const makeRequest = (replacing?: Replacing): [HttpRequestData, HttpRequestHeaders] => {
  const replacingKeys = Object.keys(replacing ?? {})
  const shouldReplace = (key: string) => replacingKeys.some(item => item === key)

  const service = shouldReplace('service') ? replacing?.service : 'spotify'
  const code = shouldReplace('code') ? replacing?.code : faker.string.alpha({ length: 16 })
  const authorization = shouldReplace('authorization') ? replacing?.authorization : makeAccessToken()

  return [
    {
      params: { service },
      body: { code }
    },
    { authorization }
  ]
}

describe('Create Streaming Service Token Controller', () => {
  it('returns 400 if code is missing', async () => {
    const { sut } = makeSut()

    const [data, headers] = makeRequest({ code: undefined })

    const actual = await sut.handle(data, headers)

    expect(actual).toStrictEqual(badRequest({
      errors: [
        { message: 'body.code is a required field', path: 'body.code' }
      ]
    }))
  })

  it('returns 400 if service is missing', async () => {
    const { sut } = makeSut()

    const [data, headers] = makeRequest({ service: undefined })

    const actual = await sut.handle(data, headers)

    expect(actual).toStrictEqual(badRequest({
      errors: [
        {
          message: 'params.service is a required field',
          path: 'params.service'
        }
      ]
    }))
  })

  it('returns 400 if service is not listed', async () => {
    const { sut } = makeSut()

    const [data, headers] = makeRequest({ service: 'deezer' })

    const actual = await sut.handle(data, headers)

    expect(actual).toStrictEqual(badRequest({
      errors: [
        {
          message: 'params.service must be one of the following values: spotify',
          path: 'params.service'
        }
      ]
    }))
  })

  it('returns 403 if authorization is missing', async () => {
    const { sut } = makeSut()

    const [data, headers] = makeRequest({ authorization: undefined })

    const actual = await sut.handle(data, headers)

    expect(actual).toStrictEqual(forbidden())
  })

  it('returns 401 if tokenValidator throws ExpiredTokenError', async () => {
    const { sut, accessTokenValidatorStub } = makeSut()

    jest.spyOn(accessTokenValidatorStub, 'validate').mockImplementationOnce(accessTokenValidatorStub.implementations.expiredToken)

    const actual = await sut.handle(...makeRequest())

    expect(actual).toStrictEqual(unauthorized({ message: 'access token expired' }))
  })

  it('returns 500 if usecase throws unexpected error', async () => {
    const { sut, usecases } = makeSut()

    jest.spyOn(usecases.spotify, 'createToken').mockImplementationOnce(async () => {
      throw new Error('Unexpected')
    })

    const actual = await sut.handle(...makeRequest())

    expect(actual).toStrictEqual(serverError())
  })

  it('returns 422 if streaming service usecase is not implemented', async () => {
    const { sut } = makeSut({})

    const [data, headers] = makeRequest({ service: 'spotify' })

    const actual = await sut.handle(data, headers)

    expect(actual).toStrictEqual(unprocessableEntity({
      message: 'feature not available for this streaming service'
    }))
  })

  it('ensures usecase is called correctly', async () => {
    const { sut, usecases } = makeSut()

    const spied = jest.spyOn(usecases.spotify, 'createToken')

    const [data, headers] = makeRequest()

    const actual = await sut.handle(data, headers)
    console.log({ actual })

    expect(spied).toHaveBeenCalledWith({ code: data.body?.code })
  })

  it('returns 201', async () => {
    const { sut } = makeSut()
    const [data, headers] = makeRequest()

    const actual = await sut.handle(data, headers)

    expect(actual).toStrictEqual(created({}))
  })

  // it('', async () => {})
})
