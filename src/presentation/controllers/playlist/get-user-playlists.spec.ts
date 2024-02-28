import { faker } from '@faker-js/faker'
import { makeAccessToken } from '../../../../tests/mocks/http-requests/app'
import { makeSpotifyUserPlaylists } from '../../../../tests/mocks/services/spotify/user-playlists'
import { AccessTokenValidatorStub } from '../../../../tests/unit/presentation/controllers/utils/access-token-validator'
import { type GetUserPlaylistsProtocol } from '../../../domain/usecases/playlist/get-user-playlists'
import { badRequest, forbidden, ok, serverError, unauthorized, unprocessableEntity } from '../../helpers/http'
import { RequestValidator } from '../../helpers/request-validator'
import { type HttpRequestData, type HttpRequestHeaders } from '../../protocols/http'
import { GetUserPlaylistsController } from './get-user-playlists'
import { getUserPlaylistsValidation } from '../../validators/playlist/get-user-playlists'

class GetUserPlaylistsStub implements GetUserPlaylistsProtocol {
  async getUserPlaylists (params: GetUserPlaylistsProtocol.Params): Promise<GetUserPlaylistsProtocol.Result> {
    return makeSpotifyUserPlaylists({})
  }
}

const makeSut = (usecases?: Record<string, GetUserPlaylistsProtocol>) => {
  const defaultUsecases = {
    'valid-streaming-service': new GetUserPlaylistsStub()
  }
  const validateTokenStub = new AccessTokenValidatorStub()
  const requestValidator = new RequestValidator(getUserPlaylistsValidation)

  return {
    sut: new GetUserPlaylistsController(validateTokenStub, requestValidator, usecases ?? defaultUsecases),
    validateTokenStub,
    usecases: usecases ?? defaultUsecases
  }
}

const makeRequest = (): [HttpRequestData, HttpRequestHeaders] => [{
  params: {
    service: 'valid-streaming-service',
    userId: faker.string.alpha({ length: 20 })
  }
}, {
  authorization: makeAccessToken()
}]

describe('Get User Playlists Controller', () => {
  test('return 400 if no userId', async () => {
    const { sut } = makeSut()

    const [data, headers] = makeRequest()
    delete data.params?.userId

    const actual = await sut.handle(data, headers)

    expect(actual).toStrictEqual(badRequest({
      message: 'Bad request',
      errors: [
        {
          path: 'params.userId',
          message: 'params.userId is a required field'
        }
      ]
    }))
  })

  test('return 400 if no service', async () => {
    const { sut } = makeSut()

    const [data, headers] = makeRequest()
    delete data.params?.service

    const actual = await sut.handle(data, headers)

    expect(actual).toStrictEqual(badRequest({
      message: 'Bad request',
      errors: [
        {
          path: 'params.service',
          message: 'params.service is a required field'
        }
      ]
    }))
  })

  test('return 422 if cannot find service usecase', async () => {
    const { sut } = makeSut()

    const [{ params, ...dataRest }, headers] = makeRequest()
    const actual = await sut.handle(
      {
        ...dataRest,
        params: { ...params, service: 'nonexistent-service' }
      },
      headers
    )

    expect(actual).toStrictEqual(unprocessableEntity({ message: 'feature not available for this streaming service' }))
  })

  test('return 403 if no accessToken', async () => {
    const { sut } = makeSut()

    const [data, headers] = makeRequest()
    delete headers.authorization

    const actual = await sut.handle(data, headers)

    expect(actual).toStrictEqual(forbidden())
  })

  test('return 401 if accessToken expired', async () => {
    const { sut, validateTokenStub } = makeSut()

    const [data, headers] = makeRequest()
    headers.authorization = 'Bearer expired_token'
    jest.spyOn(validateTokenStub, 'validate').mockImplementationOnce(validateTokenStub.implementations.expiredToken)

    const actual = await sut.handle(data, headers)

    expect(actual).toStrictEqual(unauthorized())
  })

  test('return 403 if user is not authenticated to the service requested', async () => {
    const { sut } = makeSut({
      'existent-but-unauthenticated-service': new GetUserPlaylistsStub()
    })

    const [{ params, ...dataRest }, headers] = makeRequest()

    const actual = await sut.handle(
      {
        ...dataRest,
        params: { ...params, service: 'existent-but-unauthenticated-service' }
      },
      headers
    )

    expect(actual).toStrictEqual(forbidden({ message: 'you are not authenticated to this streaming service' }))
  })

  test('ensure usecase is called correctly', async () => {
    const { sut, usecases, validateTokenStub } = makeSut()

    jest.spyOn(validateTokenStub, 'validate').mockResolvedValueOnce({
      id: 'any-id',
      services: [{
        keyword: 'valid-streaming-service',
        accessToken: 'specific-access-token',
        expiresIn: 3600
      }]
    })
    const spied = jest.spyOn(usecases['valid-streaming-service'], 'getUserPlaylists')

    const [data, headers] = makeRequest()
    await sut.handle(data, headers)

    const expectedParams = {
      userId: data.params?.userId,
      serviceAccessToken: 'specific-access-token'
    }

    expect(spied).toHaveBeenCalledWith(expectedParams)
  })

  test('ensure validateToken is called correctly', async () => {
    const { sut, validateTokenStub } = makeSut()

    const spied = jest.spyOn(validateTokenStub, 'validate')

    const [data, headers] = makeRequest()
    await sut.handle(data, headers)

    expect(spied).toHaveBeenCalledWith(headers.authorization)
  })

  test('return 500 if usecase throws uncaught error', async () => {
    const { sut, usecases } = makeSut()

    jest.spyOn(usecases['valid-streaming-service'], 'getUserPlaylists').mockImplementationOnce(async () => { throw new Error('unexpected error') })

    const actual = await sut.handle(...makeRequest())

    expect(actual).toStrictEqual(serverError())
  })

  test('return 200 with \'me\' as userId', async () => {
    const { sut } = makeSut()

    const [{ params, ...dataRest }, headers] = makeRequest()
    const actual = await sut.handle({ ...dataRest, params: { ...params, userId: 'me' } }, headers)

    expect(actual).toStrictEqual(ok({
      message: 'Here are your playlists',
      payload: expect.anything(),
      total: expect.any(Number),
      limit: expect.any(Number),
      offset: expect.any(Number)
    }))
    expect(actual.body?.payload?.[0]).toStrictEqual({
      id: expect.any(String),
      name: expect.any(String),
      description: expect.any(String),
      isPublic: expect.any(Boolean),
      totalTracks: expect.any(Number),
      images: expect.anything()
    })
  })
  // TODO: test spotify 404?
  // TODO: test spotify 401

  test('return 200 with an existing userId', async () => {
    const { sut } = makeSut()

    const actual = await sut.handle(...makeRequest())

    expect(actual).toStrictEqual(ok({
      message: 'Here are your playlists',
      payload: expect.anything(),
      total: expect.any(Number),
      limit: expect.any(Number),
      offset: expect.any(Number)
    }))
    expect(actual.body?.payload?.[0]).toStrictEqual({
      id: expect.any(String),
      name: expect.any(String),
      description: expect.any(String),
      isPublic: expect.any(Boolean),
      totalTracks: expect.any(Number),
      images: expect.anything()
    })
  })
})
