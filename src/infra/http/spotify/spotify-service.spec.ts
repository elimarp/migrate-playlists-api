import { faker } from '@faker-js/faker'
import * as getSpotifyPlaylist from '../../../../tests/mocks/http-requests/spotify/get-playlist.json'
import * as getSpotifyUserPlaylists from '../../../../tests/mocks/http-requests/spotify/get-user-playlists.json'
import * as createSpotifyAccessToken from '../../../../tests/mocks/http-requests/spotify/create-token.json'
import { makeStreamingServiceAccessToken } from '../../../../tests/mocks/models/streaming-service'
import { constants } from '../../../utils/constants'
import { MaximumValueError, MinimumValueError, MissingParamError } from '../../../utils/exceptions'
import { HttpHelper, type HttpHelperRequest, type HttpHelperResponse } from '../../helpers/http-helper'
import { SpotifyExpiredTokenError, SpotifyPlaylistNotFoundError, SpotifyUnexpectedError } from './protocols/exceptions'
import { SpotifyService } from './spotify-service'
import * as qs from 'node:querystring'
import { makeRandomFailStatus } from '../../../../tests/mocks/services/http'
class HttpHelperStub extends HttpHelper {
  async request (params: HttpHelperRequest): Promise<HttpHelperResponse<any>> {
    const getSpotifyUserPlaylistsEndpointRegex = /\/users\/.*\/playlists/
    const getSpotifyPlaylistEndpointRegex = /\/playlists\/.*/
    // const createSpotifyTokenEndpointRegex = /\/token/

    if (params.method === 'GET' && params.url.match(getSpotifyUserPlaylistsEndpointRegex)) {
      return {
        body: getSpotifyUserPlaylists,
        status: 200
      }
    }
    if (params.method === 'GET' && params.url.match(getSpotifyPlaylistEndpointRegex)) {
      return {
        body: getSpotifyPlaylist,
        status: 200
      }
    }
    return {
      body: createSpotifyAccessToken,
      status: 200
    }
  }
}

const makeSut = () => {
  const httpHelperStub = new HttpHelperStub(constants.external.spotify.BASE_URL)
  return {
    sut: new SpotifyService(httpHelperStub),
    httpHelperStub
  }
}

describe('Get Spotify User Playlists Service', () => {
  test('throw if userId is not provided', async () => {
    const { sut } = makeSut()

    const actual = sut.getPlaylistsByUserId({ accessToken: 'valid-token', userId: '' })
    expect(actual).rejects.toEqual(new MissingParamError('userId'))
  })

  test('throw if accessToken is not provided', async () => {
    const { sut } = makeSut()

    const actual = sut.getPlaylistsByUserId({
      userId: 'me',
      accessToken: ''
    })
    expect(actual).rejects.toEqual(new MissingParamError('accessToken'))
  })

  test('throw if limit is 0', async () => {
    const { sut } = makeSut()
    const actual = sut.getPlaylistsByUserId({
      limit: 0,
      userId: 'me',
      accessToken: 'valid-token'
    })
    expect(actual).rejects.toEqual(new MinimumValueError('limit', 1))
  })

  test('throw if limit is less than 0', async () => {
    const { sut } = makeSut()
    const actual = sut.getPlaylistsByUserId({
      limit: -1,
      userId: 'me',
      accessToken: 'valid-token'
    })
    expect(actual).rejects.toEqual(new MinimumValueError('limit', 1))
  })

  test('throw if limit is greater than 50', async () => {
    const { sut } = makeSut()
    const actual = sut.getPlaylistsByUserId({
      limit: 51,
      userId: 'me',
      accessToken: 'valid-token'
    })
    expect(actual).rejects.toEqual(new MaximumValueError('limit', 50))
  })

  test('throw if offset is less than 0', async () => {
    const { sut } = makeSut()
    const actual = sut.getPlaylistsByUserId({
      offset: -1,
      userId: 'me',
      accessToken: 'valid-token'
    })
    expect(actual).rejects.toEqual(new MinimumValueError('offset', 0))
  })

  test('throw if offset is greater than 100,000', async () => {
    const { sut } = makeSut()
    const actual = sut.getPlaylistsByUserId({
      offset: 100_001,
      userId: 'me',
      accessToken: 'valid-token'
    })
    expect(actual).rejects.toEqual(new MaximumValueError('offset', 100_000))
  })

  test('make sure httpClient.request is called correctly', async () => {
    const { sut, httpHelperStub } = makeSut()
    const httpHelperSpy = jest.spyOn(httpHelperStub, 'request')

    const params = {
      userId: 'me',
      accessToken: 'valid-token'
    }

    await sut.getPlaylistsByUserId(params)

    const limit = 20
    const offset = 0
    expect(httpHelperSpy).toHaveBeenCalledWith({
      headers: { Authorization: `Bearer ${params.accessToken}` },
      method: 'GET',
      url: `/users/${params.userId}/playlists?limit=${limit}&offset=${offset}`

    })
  })

  test('return playlists successfully', async () => {
    const { sut } = makeSut()

    const actual = await sut.getPlaylistsByUserId({
      userId: 'me',
      accessToken: 'valid-token'
    })

    expect(actual).toEqual(
      {
        total: expect.any(Number),
        offset: 0,
        limit: 20,
        payload: expect.anything()
      }
    )
    expect(actual.payload[0]).toEqual({
      id: expect.any(String),
      name: expect.any(String),
      description: expect.any(String),
      images: expect.anything(),
      totalTracks: expect.any(Number),
      isPublic: expect.any(Boolean)
    })
  })

  // TODO: test throw new spotify token expired
})

describe('Get Spotify Playlist Service', () => {
  const makeParams = () => ({
    accessToken: makeStreamingServiceAccessToken(),
    playlistId: faker.string.uuid()
  })

  it('ensures httpClient is called correctly', async () => {
    const { sut, httpHelperStub } = makeSut()

    const spied = jest.spyOn(httpHelperStub, 'request')

    const params = makeParams()

    await sut.getPlaylist(params)

    expect(spied).toHaveBeenCalledWith({
      method: 'GET',
      url: `/playlists/${params.playlistId}`,
      headers: { Authorization: `Bearer ${params.accessToken}` }
    })
  })

  it('throws SpotifyExpiredTokenError when response status is 401', async () => {
    const { sut, httpHelperStub } = makeSut()

    jest.spyOn(httpHelperStub, 'request').mockImplementationOnce(async () => ({
      status: 401,
      body: {}
    }))

    const params = { accessToken: 'invalid-access-token', playlistId: 'any-id' }

    expect(sut.getPlaylist(params)).rejects.toEqual(new SpotifyExpiredTokenError())
  })

  it('throws SpotifyPlaylistNotFoundError when response status is 404', async () => {
    const { sut, httpHelperStub } = makeSut()

    jest.spyOn(httpHelperStub, 'request').mockImplementationOnce(async () => ({
      status: 404,
      body: {}
    }))

    const params = makeParams()

    expect(sut.getPlaylist(params)).rejects.toEqual(new SpotifyPlaylistNotFoundError())
  })

  it('throws SpotifyUnexpectedError when status is not 200', async () => {
    const { sut, httpHelperStub } = makeSut()

    const expectedStatus = makeRandomFailStatus()

    jest.spyOn(httpHelperStub, 'request').mockImplementationOnce(async () => ({
      status: expectedStatus,
      body: {}
    }))

    const params = makeParams()

    expect(sut.getPlaylist(params)).rejects.toEqual(new SpotifyUnexpectedError(expectedStatus))
  })

  it('returns playlist successfully', async () => {
    const { sut } = makeSut()

    const actual = await sut.getPlaylist(makeParams())

    expect(actual).toStrictEqual({
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

  // it('', async () => {})
})

describe('Create Spotify Access Token Service', () => {
  const makeParams = () => ({
    clientId: 'CLIENT_ID',
    clientSecret: 'CLIENT_SECRET',
    code: 'any-code',
    redirectUri: 'redirect-uri'
  })

  it('ensures httpClient is called correctly', async () => {
    const { sut, httpHelperStub } = makeSut()

    const spied = jest.spyOn(httpHelperStub, 'request')

    const params = makeParams()

    await sut.createAccessToken(params)

    expect(spied).toHaveBeenCalledWith({
      method: 'POST',
      url: '/token',
      body: qs.stringify({
        code: params.code,
        redirect_uri: params.redirectUri,
        grant_type: 'authorization_code'
      }),
      auth: {
        username: params.clientId,
        password: params.clientSecret
      },
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })
  })

  it('throws if Spotify response status is not 200', async () => {
    const { sut, httpHelperStub } = makeSut()

    const expectedStatus = makeRandomFailStatus()

    jest.spyOn(httpHelperStub, 'request').mockImplementationOnce(async () => ({
      status: expectedStatus,
      body: {}
    }))

    const params = {
      clientId: 'CLIENT_ID',
      clientSecret: 'CLIENT_SECRET',
      code: 'invalid-code',
      redirectUri: 'redirect-uri'
    }

    expect(sut.createAccessToken(params)).rejects.toEqual(new SpotifyUnexpectedError(expectedStatus))
  })

  it('returns data successfully', async () => {
    const { sut } = makeSut()

    const actual = await sut.createAccessToken(makeParams())

    expect(actual).toStrictEqual({
      accessToken: createSpotifyAccessToken.access_token,
      refreshToken: createSpotifyAccessToken.refresh_token,
      expiresIn: createSpotifyAccessToken.expires_in
    })
  })
})
