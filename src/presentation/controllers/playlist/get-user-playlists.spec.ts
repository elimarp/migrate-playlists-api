import { faker } from "@faker-js/faker"
import { makeSpotifyUserPlaylists } from "../../../../tests/mocks/service/spotify/user-playlists"
import { SessionModel } from "../../../domain/models/session"
import { ValidateTokenProtocol } from "../../../domain/usecases/security/validate-token"
import { GetUserPlaylistsProtocol } from "../../../domain/usecases/streaming-service/get-user-playlists"
import { AccessTokenExpiredError } from "../../../infra/helpers/exceptions"
import { badRequest, forbidden, ok, serverError, unauthorized } from "../../helpers/http"
import { HttpRequest } from "../../protocols/http"
import { GetUserPlaylistsController } from "./get-user-playlists"

interface Sut {
  sut: GetUserPlaylistsController,
  usecases: Record<string, GetUserPlaylistsProtocol>,
  validateTokenStub: ValidateTokenProtocol
}

class GetUserPlaylistsStub implements GetUserPlaylistsProtocol {
  async getUserPlaylists(params: GetUserPlaylistsProtocol.Params): Promise<GetUserPlaylistsProtocol.Result> {
    return makeSpotifyUserPlaylists({})
  }
}

// TODO: gather these fakers together
class ValidateTokenStub implements ValidateTokenProtocol {
  async validate(accessToken: string): Promise<SessionModel> {
    return {
      id: faker.string.hexadecimal({ length: 12 }),
      services: [
        {
          accessToken: faker.string.alpha({ length: 16 }),
          keyword: 'valid-service'
        }
      ]
    }
  }

}

const makeSut = (usecases?: Record<string, GetUserPlaylistsProtocol>): Sut => {
  const defaultUsecases = {
    'valid-service': new GetUserPlaylistsStub()
  }
  const validateTokenStub = new ValidateTokenStub()

  return {
    sut: new GetUserPlaylistsController(usecases ?? defaultUsecases, validateTokenStub),
    validateTokenStub,
    usecases: usecases ?? defaultUsecases
  }
}

const makeRequest = (): HttpRequest =>({
  path: {
    serviceKeyword: 'valid-service',
    userId: faker.string.alpha({ length: 20 })
  },
  headers: {
    authorization: 'Bearer token'
  }
})

describe('Get User Playlists Controller', () => {
  test('return 400 if no userId', async () => {
    const { sut } = makeSut()

    const request = makeRequest()
    delete request.path?.userId

    const actual = await sut.handle(request)


    // TODO: implement yup. refactor tests
    expect(actual).toStrictEqual(badRequest({ message: 'missing userId' }))
  })

  test('return 400 if no service keyword', async () => {
    const { sut } = makeSut()

    const request = makeRequest()
    delete request.path?.serviceKeyword

    const actual = await sut.handle(request)

    expect(actual).toStrictEqual(badRequest({ message: 'missing service' }))
  })

  test('return 400 if can not find service usecase', async () => {
    const { sut } = makeSut()

    const { path, ...requestRest } = makeRequest()
    const actual = await sut.handle({ ...requestRest, path: { ...path, serviceKeyword: 'nonexistent-service' } })

    expect(actual).toStrictEqual(badRequest({ message: 'feature not available for this service' }))
  })

  test('return 403 if no accessToken', async () => {
    const { sut } = makeSut()

    const request = makeRequest()
    delete request.headers.authorization

    const actual = await sut.handle(request)

    expect(actual).toStrictEqual(forbidden())
  })

  test('return 401 if accessToken expired', async () => {
    const { sut, validateTokenStub } = makeSut()

    const request = makeRequest()
    request.headers.authorization = 'Bearer expired_token'
    jest.spyOn(validateTokenStub, 'validate').mockImplementationOnce(async () => { throw new AccessTokenExpiredError() })

    const actual = await sut.handle(request)

    expect(actual).toStrictEqual(unauthorized('accessToken expired'))
  })

  test('return 403 if user is not authenticated to the service requested', async () => {
    const { sut } = makeSut({
      'existent-but-unauthenticated-service': new GetUserPlaylistsStub()
    })

    const { path, ...requestRest } = makeRequest()

    const actual = await sut.handle({ ...requestRest, path: { ...path, serviceKeyword: 'existent-but-unauthenticated-service' } })

    expect(actual).toStrictEqual(forbidden('you are not authenticated to this service'))
  })

  test('make sure usecase is called correctly', async () => {
    const { sut, usecases, validateTokenStub } = makeSut()

    jest.spyOn(validateTokenStub, 'validate').mockResolvedValueOnce({
      id: 'any-id',
      services: [{
        keyword: 'valid-service',
        accessToken: 'specific-access-token'
      }]
    })
    const spied = jest.spyOn(usecases['valid-service'], 'getUserPlaylists')

    const request = makeRequest()
    await sut.handle(request)

    const expectedParams = {
      userId: request.path?.userId,
      serviceAccessToken: 'specific-access-token',
    }

    expect(spied).toHaveBeenCalledWith(expectedParams)
  })

  test('make sure validateToken is called correctly', async () => {
    const { sut, validateTokenStub } = makeSut()

    const spied = jest.spyOn(validateTokenStub, 'validate')

    const request = makeRequest()
    await sut.handle(request)

    expect(spied).toHaveBeenCalledWith(request.headers.authorization)
  })

  test('return 500 if usecase throws uncaught error', async () => {
    const { sut, usecases } = makeSut()

    jest.spyOn(usecases['valid-service'], 'getUserPlaylists').mockImplementationOnce(async () => {throw new Error('unexpected error')})

    const actual = await sut.handle(makeRequest())

    expect(actual).toStrictEqual(serverError())
  })

  test('return 200 with \'me\' as userId', async () => {
    const { sut } = makeSut()

    const { path, ...requestRest } = makeRequest()
    const actual = await sut.handle({ ...requestRest, path: { ...path, userId: 'me' }})

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

  test('return 200 with an existing userId', async () => {
    const { sut } = makeSut()

    const actual = await sut.handle(makeRequest())

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
