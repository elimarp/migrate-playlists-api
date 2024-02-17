/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { faker } from '@faker-js/faker'
import { makeAccessToken } from '../../../../tests/mocks/http-requests/app'
import { makePlaylist } from '../../../../tests/mocks/models/playlist'
import { AccessTokenValidatorStub } from '../../../../tests/unit/presentation/controllers/utils/access-token-validator'
import { PlaylistNotFoundError } from '../../../domain/usecases/playlist/exceptions'
import { type GetPlaylistProtocol } from '../../../domain/usecases/playlist/get-playlist'
import { badRequest, forbidden, notFound, ok, serverError, unauthorized, unprocessableEntity } from '../../helpers/http'
import { RequestValidator } from '../../helpers/request-validator'
import { type HttpRequestData, type HttpRequestHeaders } from '../../protocols/http'
import { getPlaylistValidation } from '../../validators/playlist/get-playlist'
import { GetPlaylistController } from './get-playlist'

type Replacing = {
  service?: any
  playlistId?: any
  authorization?: any
}
const makeRequest = (replacing?: Replacing): [HttpRequestData, HttpRequestHeaders] => {
  const replacingKeys = Object.keys(replacing ?? {})
  const shouldReplace = (key: string) => replacingKeys.some(item => item === key)

  const service = shouldReplace('service') ? replacing?.service : 'valid-streaming-service'
  const playlistId = shouldReplace('playlistId') ? replacing?.playlistId : faker.string.uuid()
  const authorization = shouldReplace('authorization') ? replacing?.authorization : makeAccessToken()

  const data = {
    params: { service, playlistId },
    body: {}
  }
  const headers = { authorization }
  return [data, headers]
}

class GetPlaylistStub implements GetPlaylistProtocol {
  async getPlaylist (params: GetPlaylistProtocol.Params): Promise<GetPlaylistProtocol.Result> {
    return makePlaylist()
  }
}

const makeSut = (usecases?: Record<string, GetPlaylistProtocol>) => {
  const defaultUsecases = {
    'valid-streaming-service': new GetPlaylistStub()
  }
  const validateTokenStub = new AccessTokenValidatorStub()
  return {
    sut: new GetPlaylistController(
      new RequestValidator(getPlaylistValidation),
      validateTokenStub,
      usecases ?? defaultUsecases
    ),
    validateTokenStub,
    usecases: usecases ?? defaultUsecases
  }
}

describe('Get Playlist Controller', () => {
  it('returns 400 if no params.service', async () => {
    const { sut } = makeSut()

    const [data, headers] = makeRequest()

    delete data.params?.service

    const actual = await sut.handle(data, headers)

    expect(actual).toStrictEqual(badRequest({
      errors: [
        {
          path: 'params.service',
          message: 'params.service is a required field'
        }
      ]
    }))
  })

  it('returns 400 if no path.playlistId', async () => {
    const { sut } = makeSut()

    const [data, headers] = makeRequest()
    delete data.params?.playlistId

    const actual = await sut.handle(data, headers)

    expect(actual).toStrictEqual(badRequest({
      errors: [
        {
          path: 'params.playlistId',
          message: 'params.playlistId is a required field'
        }
      ]
    }))
  })

  it('returns 401 if accessToken expired', async () => {
    const { sut, validateTokenStub } = makeSut()

    jest.spyOn(validateTokenStub, 'validate').mockImplementationOnce(validateTokenStub.implementations.expiredToken)

    const actual = await sut.handle(...makeRequest())

    expect(actual).toStrictEqual(unauthorized())
  })

  it('returns 403 if no accessToken', async () => {
    const { sut } = makeSut()
    const [data, headers] = makeRequest({ authorization: undefined })

    const actual = await sut.handle(data, headers)

    expect(actual).toStrictEqual(forbidden())
  })

  it('returns 403 if user is not authenticated to the service requested', async () => {
    const { sut } = makeSut({
      'existent-but-unauthenticated-service': new GetPlaylistStub()
    })
    const [data, headers] = makeRequest({ service: 'existent-but-unauthenticated-service' })
    const actual = await sut.handle(
      data,
      headers
    )

    expect(actual).toStrictEqual(forbidden({
      message: 'you are not authenticated to this streaming service'
    }))
  })

  it('returns 422 if cannot find service usecase', async () => {
    const { sut, validateTokenStub } = makeSut()
    const [data, headers] = makeRequest({ service: 'another-streaming-service' })

    jest.spyOn(validateTokenStub, 'validate').mockImplementationOnce(
      validateTokenStub.implementations.anotherStreamingService
    )

    const actual = await sut.handle(data, headers)
    expect(actual).toStrictEqual(unprocessableEntity({
      message: 'feature not available for this streaming service'
    }))
  })

  it('ensures usecase is called correctly', async () => {
    const usecases = {
      'specific-streaming-service': new GetPlaylistStub()
    }

    const { sut, validateTokenStub } = makeSut(usecases)

    jest.spyOn(validateTokenStub, 'validate').mockImplementationOnce(validateTokenStub.implementations.specificServiceValues)

    const spied = jest.spyOn(usecases['specific-streaming-service'], 'getPlaylist')

    const [data, headers] = makeRequest({ service: 'specific-streaming-service' })
    await sut.handle(data, headers)

    expect(spied).toHaveBeenCalledWith({
      playlistId: data.params?.playlistId,
      streamingServiceAccessToken: 'specific-access-token'
    })
  })

  it('ensures validateToken is called correctly', async () => {
    const { sut, validateTokenStub } = makeSut()

    const spied = jest.spyOn(validateTokenStub, 'validate')

    const [data, headers] = makeRequest()
    await sut.handle(data, headers)

    expect(spied).toHaveBeenCalledWith(headers.authorization)
  })

  it('returns 500 if usecase throws uncaught error', async () => {
    const { sut, usecases } = makeSut()

    jest.spyOn(usecases['valid-streaming-service'], 'getPlaylist').mockImplementationOnce(
      async () => { throw new Error('unexpected error') }
    )

    const actual = await sut.handle(...makeRequest())

    expect(actual).toStrictEqual(serverError())
  })

  it('returns 404 if cannot find playlist', async () => {
    const { sut, usecases } = makeSut()

    jest.spyOn(usecases['valid-streaming-service'], 'getPlaylist').mockImplementationOnce(
      async () => { throw new PlaylistNotFoundError() }
    )

    const [data, headers] = makeRequest({ playlistId: 'nonexistent-playlist-id' })
    const actual = await sut.handle(data, headers)

    expect(actual).toStrictEqual(notFound({ message: 'Playlist not found' }))
  })

  it('returns 200', async () => {
    const { sut } = makeSut()

    const actual = await sut.handle(...makeRequest())

    expect(actual).toStrictEqual(ok({
      message: 'Here is your playlist',
      payload: expect.anything()
    }))
    expect(actual.body.payload).toStrictEqual({
      id: expect.any(String),
      name: expect.any(String),
      description: expect.any(String),
      isPublic: expect.any(Boolean),
      images: expect.arrayContaining([
        {
          height: expect.any(Number),
          url: expect.any(String),
          width: expect.any(Number)
        }
      ]),
      tracks: expect.arrayContaining([{
        id: expect.any(String),
        name: expect.any(String),
        addedAt: expect.any(Date),
        album: {
          id: expect.any(String),
          name: expect.any(String)
        },
        artists: expect.arrayContaining([{
          id: expect.any(String),
          name: expect.any(String)
        }])
      }])
    })
  })
})
