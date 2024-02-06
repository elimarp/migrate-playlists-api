import { HttpHelper, HttpHelperRequest, HttpHelperResponse } from "../http-helper"
import { SpotifyService } from "./spotify-service"
import * as getSpotifyUserPlaylists from '../../../../tests/mocks/http/spotify/get-user-playlists.json'
import { MaximumValueError, MinimumValueError, MissingParamError } from "../../../utils/exceptions"

interface Sut {
  sut: SpotifyService
  httpHelper: HttpHelper
}

// TODO: .env
const SPOTIFY_BASE_URL = 'https://api.spotify.com'

class HttpHelperStub extends HttpHelper {
  constructor(baseUrl: string) {
    super(baseUrl)
  }

  async request(params: HttpHelperRequest): Promise<HttpHelperResponse<any>> {
    return {
      body: getSpotifyUserPlaylists,
      status: 200
    }
  }

}

const makeSut = (): Sut => {
  const httpHelper = new HttpHelperStub(SPOTIFY_BASE_URL)
  return {
    sut: new SpotifyService(httpHelper),
    httpHelper
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
    const { sut, httpHelper } = makeSut()
    const httpHelperSpy = jest.spyOn(httpHelper, 'request')

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
      url: `/users/${params.userId}/playlists?limit=${limit}&offset=${offset}`,

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
      },
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