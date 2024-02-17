import { faker } from '@faker-js/faker'
import { type SignOptions } from 'jsonwebtoken'
import { makeAccessToken } from '../../../../tests/mocks/http-requests/app'
import { makeMongodbIdString } from '../../../../tests/mocks/models/utils'
import { type CreateSessionModel, type SessionModel } from '../../../domain/models/session'
import { type CreateSessionProtocol } from '../../../domain/usecases/session/create-session'
import { constants } from '../../../utils/constants'
import { type CreateSessionRepository } from '../../protocols/db/session/create-session-repository'
import { type JwtEncryptHelperProtocol } from '../../protocols/helpers/jwt-helper'
import { type CreateSpotifyAccessTokenServiceProtocol } from '../../protocols/http/spotify/create-spotify-access-token'
import { CreateSession } from './create-session'

class CreateSpotifyAccessTokenStub implements CreateSpotifyAccessTokenServiceProtocol {
  async createAccessToken (params: CreateSpotifyAccessTokenServiceProtocol.Params): Promise<CreateSpotifyAccessTokenServiceProtocol.Result> {
    return {
      accessToken: makeAccessToken(),
      expiresIn: 3600,
      refreshToken: makeAccessToken()
    }
  }
}

class CreateSessionRepositoryStub implements CreateSessionRepository {
  async create (params: CreateSessionModel): Promise<SessionModel> {
    return {
      id: makeMongodbIdString(),
      services: [
        { keyword: 'spotify', accessToken: makeAccessToken(), expiresIn: 3600, refreshToken: makeAccessToken() }
      ]
    }
  }
}

class JwtHelperStub implements JwtEncryptHelperProtocol {
  async encrypt (data: Record<string, any>, options?: SignOptions | undefined): Promise<string> {
    return makeAccessToken()
  }
}

const makeSut = () => {
  const services = {
    spotify: new CreateSpotifyAccessTokenStub()
  }
  const createSessionRepositoryStub = new CreateSessionRepositoryStub()
  const jwtHelperStub = new JwtHelperStub()
  return {
    sut: new CreateSession(services, createSessionRepositoryStub, jwtHelperStub),
    services,
    createSessionRepositoryStub,
    jwtHelperStub
  }
}

type Replacing = {
  code?: string
  serviceKeyword?: string
}
const makeParams = (replacing?: Replacing): CreateSessionProtocol.Params => {
  const replacingKeys = Object.keys(replacing ?? {})
  const shouldReplace = (key: string) => replacingKeys.some(item => item === key)

  const code = shouldReplace('code') ? replacing?.code : faker.string.alpha({ length: 16 })
  const serviceKeyword = shouldReplace('serviceKeyword') ? replacing?.serviceKeyword : 'spotify'

  const params = { code, serviceKeyword }
  return params as CreateSessionProtocol.Params
}

describe('Create Session Usecase', () => {
  it('throws if cannot find CreateStreamingServiceAccessToken service', async () => {
    const { sut } = makeSut()

    const params = makeParams({ serviceKeyword: 'nonexistent-streaming-service' })
    expect(sut.create(params)).rejects.toStrictEqual(new Error('missing CreateAccessTokenService for this Streaming Service'))
  })

  it('ensures CreateSpotifyAccessToken service is called correctly', async () => {
    const { sut, services } = makeSut()
    const serviceKeyword = 'spotify'
    const params = makeParams({ serviceKeyword })

    const spied = jest.spyOn(services[serviceKeyword], 'createAccessToken')

    await sut.create(params)

    expect(spied).toHaveBeenCalledWith({
      code: params.code,
      redirectUri: `${constants.app.callback.BASE_URL}/${serviceKeyword}`,
      clientId: constants.external.spotify.CLIENT_ID,
      clientSecret: constants.external.spotify.CLIENT_SECRET
    })
  })

  it('ensures CreateSession is called correctly for Spotify', async () => {
    const { sut, createSessionRepositoryStub, services } = makeSut()
    const params = makeParams({ serviceKeyword: 'spotify' })

    const spotifyAccessToken = makeAccessToken()
    const spotifyRefreshToken = makeAccessToken()
    const spotifyExpiresIn = 3600

    jest.spyOn(services.spotify, 'createAccessToken').mockImplementationOnce(async () => ({
      accessToken: spotifyAccessToken,
      expiresIn: spotifyExpiresIn,
      refreshToken: spotifyRefreshToken
    }))

    const spied = jest.spyOn(createSessionRepositoryStub, 'create')

    await sut.create(params)

    expect(spied).toHaveBeenCalledWith({
      services: [
        {
          keyword: params.serviceKeyword,
          accessToken: spotifyAccessToken,
          refreshToken: spotifyRefreshToken,
          expiresIn: spotifyExpiresIn
        }
      ]
    })
  })

  // TODO: deezer

  it('ensures JwtHelper.encrypt is called correctly', async () => {
    const { sut, jwtHelperStub, createSessionRepositoryStub } = makeSut()

    const sessionId = makeMongodbIdString()
    jest.spyOn(createSessionRepositoryStub, 'create').mockImplementationOnce(async () => ({
      id: sessionId,
      services: []
    }))

    const spied = jest.spyOn(jwtHelperStub, 'encrypt')

    await sut.create(makeParams())

    expect(spied).toHaveBeenCalledWith({ id: sessionId }, { expiresIn: 24 * 60 * 60 })
  })

  it('returns Jwt accessToken and expiresIn successfully', async () => {
    const { sut } = makeSut()

    const actual = await sut.create(makeParams())

    expect(actual).toStrictEqual({
      accessToken: expect.any(String),
      expiresIn: 24 * 60 * 60
    })
  })
})
