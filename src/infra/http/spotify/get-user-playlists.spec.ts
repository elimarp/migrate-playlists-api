import { HttpHelper } from "../http-helper"
import { SpotifyService } from "./spotify-service"
import * as getSpotifyUserPlaylists from '../../../../tests/mocks/http/spotify/get-user-playlists.json'

interface Sut {
  sut: SpotifyService
  httpHelper: HttpHelper
}

const SPOTIFY_BASE_URL = 'https://api.spotify.com'

const makeSut = (): Sut => {
  const httpHelper = new HttpHelper(SPOTIFY_BASE_URL)
  return {
    sut: new SpotifyService(httpHelper),
    httpHelper
  }
}

describe('Get Spotify User Playlists Service', () => {
  test('throw if userId is not provided', async () => {
    const { sut } = makeSut()

    const actual = sut.getPlaylistsByUserId({ accessToken: 'valid-token ', userId: '' })
    expect(actual).rejects.toEqual(new Error('missing userId'))
  })

  test('throw if accessToken is not provided', async () => {
    const { sut } = makeSut()

    const actual = sut.getPlaylistsByUserId({
      userId: 'me',
      accessToken: ''
    })
    expect(actual).rejects.toEqual(new Error('missing accessToken'))
  })

  test('throw if limit is 0', async () => {
    const { sut } = makeSut()
    const actual = sut.getPlaylistsByUserId({
      limit: 0,
      userId: 'me',
      accessToken: 'valid-token'
    })
    expect(actual).rejects.toEqual(new Error('minimum limit is 1'))
  })

  test('throw if limit is less than 0', async () => {
    const { sut } = makeSut()
    const actual = sut.getPlaylistsByUserId({
      limit: -1,
      userId: 'me',
      accessToken: 'valid-token'
    })
    expect(actual).rejects.toEqual(new Error('minimum limit is 1'))
  })

  test('throw if limit is greater than 50', async () => {
    const { sut } = makeSut()
    const actual = sut.getPlaylistsByUserId({
      limit: 51,
      userId: 'me',
      accessToken: 'valid-token'
    })
    expect(actual).rejects.toEqual(new Error('maximum limit is 50'))
  })

  test('throw if offset is less than 0', async () => {
    const { sut } = makeSut()
    const actual = sut.getPlaylistsByUserId({
      offset: -1,
      userId: 'me',
      accessToken: 'valid-token'
    })
    expect(actual).rejects.toEqual(new Error('minimum offset is 0'))
  })

  test('throw if offset is greater than 100,000', async () => {
    const { sut } = makeSut()
    const actual = sut.getPlaylistsByUserId({
      offset: 100_001,
      userId: 'me',
      accessToken: 'valid-token'
    })
    expect(actual).rejects.toEqual(new Error('maximum offset is 100,000'))
  })

  test('return playlists successfully', async () => {
    const { sut, httpHelper } = makeSut()

    jest.spyOn(httpHelper, 'request').mockResolvedValueOnce({
      body: getSpotifyUserPlaylists,
      status: 200
    })

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
})