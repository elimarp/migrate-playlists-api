import { faker } from '@faker-js/faker'
import { makeStreamingServiceAccessToken } from '../../../../../tests/mocks/models/streaming-service'
import { type AddSessionServiceRepository } from '../../../protocols/db/session/add-session-service-repository'
import { type CreateDeezerAccessTokenServiceProtocol } from '../../../protocols/http/deezer/create-deezer-access-token-service'
import { CreateDeezerToken } from './create-deezer-token'
import { type CreateStreamingServiceTokenProtocol } from '../../../../domain/usecases/token/create-streaming-service-token'
import { constants } from '../../../../utils/constants'
import { makeMongodbIdString } from '../../../../../tests/mocks/models/utils'
import { type SessionServiceModel, type SessionModel } from '../../../../domain/models/session'
import { makeSessionStreamingService } from '../../../../../tests/mocks/models/session'

class DeezerServiceStub implements CreateDeezerAccessTokenServiceProtocol {
  implementations = {
    specificAccessToken: async () => ({ accessToken: 'specific-deezer-access-token', expiresIn: 3600 })
  }

  async createAccessToken (params: CreateDeezerAccessTokenServiceProtocol.Params): Promise<CreateDeezerAccessTokenServiceProtocol.Result> {
    return {
      accessToken: makeStreamingServiceAccessToken(),
      expiresIn: 3600
    }
  }
}

class SessionRepositoryStub implements AddSessionServiceRepository {
  async addService (sessionId: string, service: SessionServiceModel): Promise<SessionModel> {
    return {
      id: sessionId,
      services: [
        makeSessionStreamingService(),
        service
      ]
    }
  }
}

const makeSut = () => {
  const deezerServiceStub = new DeezerServiceStub()
  const sessionRepositoryStub = new SessionRepositoryStub()
  return {
    sut: new CreateDeezerToken(deezerServiceStub, sessionRepositoryStub),
    deezerServiceStub,
    sessionRepositoryStub
  }
}

const makeParams = (): CreateStreamingServiceTokenProtocol.Params => ({
  code: faker.string.alpha({ length: 16 }),
  sessionId: makeMongodbIdString()
})

describe('Create Deezer Token Usecase', () => {
  it('ensures createDeezerTokenService is called correctly', async () => {
    const { sut, deezerServiceStub } = makeSut()

    const spied = jest.spyOn(deezerServiceStub, 'createAccessToken')

    const params = makeParams()

    await sut.createToken(params)

    expect(spied).toHaveBeenCalledWith({
      code: params.code,
      clientId: constants.external.deezer.CLIENT_ID,
      clientSecret: constants.external.deezer.CLIENT_SECRET
    })
  })

  it('ensures addSessionStreamingServiceRepository is called correctly', async () => {
    const { sut, sessionRepositoryStub, deezerServiceStub } = makeSut()

    jest.spyOn(deezerServiceStub, 'createAccessToken').mockImplementationOnce(deezerServiceStub.implementations.specificAccessToken)

    const spied = jest.spyOn(sessionRepositoryStub, 'addService')

    const params = makeParams()

    await sut.createToken(params)

    expect(spied).toHaveBeenCalledWith(params.sessionId, {
      keyword: 'deezer',
      accessToken: 'specific-deezer-access-token',
      expiresIn: 3600
    })
  })

  it('returns successfully', async () => {
    const { sut, deezerServiceStub } = makeSut()

    jest.spyOn(deezerServiceStub, 'createAccessToken').mockImplementationOnce(deezerServiceStub.implementations.specificAccessToken)

    const actual = await sut.createToken(makeParams())

    expect(actual).toStrictEqual({
      accessToken: 'specific-deezer-access-token',
      expiresIn: 3600
    })
  })
})
