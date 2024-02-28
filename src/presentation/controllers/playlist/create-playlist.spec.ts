import { faker } from '@faker-js/faker'
import { type HttpRequestData, type HttpRequestHeaders } from '../../protocols/http'
import { CreatePlaylistController } from './create-playlist'
import { makeAccessToken } from '../../../../tests/mocks/http-requests/app'
import { badRequest, created, forbidden, serverError, unauthorized, unprocessableEntity } from '../../helpers/http'
import { RequestValidator } from '../../helpers/request-validator'
import { createPlaylistValidation } from '../../validators/playlist/create-playlist'
import { AccessTokenValidatorStub } from '../../../../tests/unit/presentation/controllers/utils/access-token-validator'
import { type MigratePlaylistProtocol } from '../../../domain/usecases/playlist/migrate-playlist'

class MigratePlaylistStub implements MigratePlaylistProtocol {
  async migrate (params: MigratePlaylistProtocol.Params): Promise<MigratePlaylistProtocol.Result> {
    return { playlistUrl: faker.internet.url() }
  }
}

type Replacing = {
  from?: any
  to?: any
  playlistId?: any
  authorization?: any
}
const makeRequest = (replacing?: Replacing): [HttpRequestData, HttpRequestHeaders] => {
  const replacingKeys = Object.keys(replacing ?? {})
  const shouldReplace = (key: string) => replacingKeys.some(item => item === key)

  const from = shouldReplace('from') ? replacing?.from : 'valid-streaming-service'
  const to = shouldReplace('to') ? replacing?.to : 'another-streaming-service'
  const playlistId = shouldReplace('playlistId') ? replacing?.playlistId : faker.string.uuid()
  const authorization = shouldReplace('authorization') ? replacing?.authorization : makeAccessToken()

  const data = {
    body: { from, to, playlistId }
  }
  const headers = { authorization }
  return [data, headers]
}

const makeSut = () => {
  const accessTokenValidatorStub = new AccessTokenValidatorStub('anotherStreamingService')
  const migratePlaylistStub = new MigratePlaylistStub()
  return {
    sut: new CreatePlaylistController(
      new RequestValidator(createPlaylistValidation),
      accessTokenValidatorStub,
      migratePlaylistStub
    ),
    accessTokenValidatorStub,
    migratePlaylistStub
  }
}

describe('Create Playlist Controller', () => {
  it('returns 400 if no body.from', async () => {
    const { sut } = makeSut()

    const [data, headers] = makeRequest({ from: undefined })
    const actual = await sut.handle(data, headers)

    expect(actual).toStrictEqual(badRequest({
      errors: [
        {
          path: 'body.from',
          message: 'body.from is a required field'
        }
      ]
    }))
  })

  it('returns 400 if no body.to', async () => {
    const { sut } = makeSut()

    const [data, headers] = makeRequest({ to: undefined })
    const actual = await sut.handle(data, headers)

    expect(actual).toStrictEqual(badRequest({
      errors: [
        {
          path: 'body.to',
          message: 'body.to is a required field'
        }
      ]
    }))
  })

  it('returns 400 if no body.playlistId', async () => {
    const { sut } = makeSut()

    const [data, headers] = makeRequest({ playlistId: undefined })
    const actual = await sut.handle(data, headers)

    expect(actual).toStrictEqual(badRequest({
      errors: [
        {
          path: 'body.playlistId',
          message: 'body.playlistId is a required field'
        }
      ]
    }))
  })

  // TODO: returns 400 if service is not one of...

  it('returns 403 if no headers.authorization', async () => {
    const { sut } = makeSut()

    const [data, headers] = makeRequest({ authorization: undefined })
    const actual = await sut.handle(data, headers)

    expect(actual).toStrictEqual(forbidden())
  })

  it('returns 401 if token is expired', async () => {
    const { sut, accessTokenValidatorStub } = makeSut()

    jest.spyOn(accessTokenValidatorStub, 'validate').mockImplementationOnce(accessTokenValidatorStub.implementations.expiredToken)

    const [data, headers] = makeRequest({ authorization: 'expired-token' })
    const actual = await sut.handle(data, headers)

    expect(actual).toStrictEqual(unauthorized())
  })

  it('returns 422 if session does not contain "from" service', async () => {
    const { sut } = makeSut()

    const [data, headers] = makeRequest({ from: 'unauthenticated-streaming-service' })

    const actual = await sut.handle(data, headers)

    expect(actual).toStrictEqual(unprocessableEntity({
      message: 'you are not authenticated to the service you are migrating from'
    }))
  })

  it('returns 422 if session does not contain "to" service', async () => {
    const { sut } = makeSut()

    const [data, headers] = makeRequest({ to: 'unauthenticated-streaming-service' })

    const actual = await sut.handle(data, headers)

    expect(actual).toStrictEqual(unprocessableEntity({
      message: 'you are not authenticated to the service you are migrating to'
    }))
  })

  it('ensures usecase is called correctly', async () => {
    const { sut, migratePlaylistStub } = makeSut()

    const spied = jest.spyOn(migratePlaylistStub, 'migrate')

    const [data, headers] = makeRequest()
    await sut.handle(data, headers)

    expect(spied).toHaveBeenCalledWith({
      from: data.body?.from,
      to: data.body?.to,
      playlistId: data.body?.playlistId
    })
  })

  it('returns 500 if usecase throws unexpected error', async () => {
    const { sut, migratePlaylistStub } = makeSut()

    jest.spyOn(migratePlaylistStub, 'migrate').mockImplementationOnce(
      async () => { throw new Error('unexpected') }
    )

    const actual = await sut.handle(...makeRequest())

    expect(actual).toStrictEqual(serverError())
  })

  it('returns 201 successfully', async () => {
    const { sut } = makeSut()
    const actual = await sut.handle(...makeRequest())

    expect(actual).toStrictEqual(created({
      message: 'yay you! playlist created and all your songs are being added to it. It may take a while, but you can already enjoy your playlist here: {playlistUrl}',
      payload: {
        playlistUrl: expect.any(String)
      }
    }))
  })
})
