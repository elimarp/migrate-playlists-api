import { faker } from '@faker-js/faker'
import * as searchTrackMock from '../../../../tests/mocks/http-requests/deezer/200-search-track.json'
import * as searchTrackEmptyDataMock from '../../../../tests/mocks/http-requests/deezer/200-search-track-no-items-found.json'
import * as createAccessTokenMock from '../../../../tests/mocks/http-requests/deezer/create-access-token.json'
import * as createPlaylistOauthExceptionMock from '../../../../tests/mocks/http-requests/deezer/playlist/200-create-playlist-access-token-expired.json'
import * as createPlaylistMock from '../../../../tests/mocks/http-requests/deezer/playlist/200-create-playlist-success.json'
import { makeStreamingServiceAccessToken } from '../../../../tests/mocks/models/streaming-service'
import { makeRandomFailStatus } from '../../../../tests/mocks/services/http'
import { type CreateDeezerAccessTokenServiceProtocol } from '../../../data/protocols/http/deezer/create-deezer-access-token-service'
import { type CreatePlaylistServiceProtocol } from '../../../data/protocols/http/streaming-service/playlist/create-playlist'
import { type SearchTracksServiceProtocol } from '../../../data/protocols/http/streaming-service/search'
import { constants } from '../../../utils/constants'
import { HttpHelper, type HttpHelperRequest, type HttpHelperResponse } from '../../helpers/http-helper'
import { DeezerService } from './deezer-service'
import { DeezerUnexpectedError } from './protocols/exceptions'

class HttpHelperStub extends HttpHelper {
  async request (params: HttpHelperRequest): Promise<HttpHelperResponse<any>> {
    if (params.method === 'GET' && params.url.startsWith('/oauth/access_token')) {
      return {
        status: 200,
        body: createAccessTokenMock
      }
    }
    if (params.method === 'GET' && params.url.startsWith('/search')) {
      return {
        status: 200,
        body: searchTrackMock
      }
    }
    if (params.method === 'POST' && params.url.startsWith('/user/me/playlists')) {
      return {
        status: 200,
        body: createPlaylistMock
      }
    }
    throw new Error('Method not implemented.')
  }
}

const makeSut = () => {
  const httpHelperStub = new HttpHelperStub(constants.external.deezer.BASE_URL)
  return {
    sut: new DeezerService(httpHelperStub),
    httpHelperStub
  }
}

describe('Deezer Service', () => {
  describe('Create Deezer Access Token Service', () => {
    const makeParams = (): CreateDeezerAccessTokenServiceProtocol.Params => ({
      clientId: constants.external.deezer.CLIENT_ID,
      clientSecret: constants.external.deezer.CLIENT_SECRET,
      code: faker.string.alpha({ length: 16 })
    })

    it('ensures httpHelper is called correctly', async () => {
      const { sut, httpHelperStub } = makeSut()

      const spied = jest.spyOn(httpHelperStub, 'request')

      const params = makeParams()

      await sut.createAccessToken(params)

      expect(spied).toHaveBeenCalledWith({
        method: 'GET',
        url: `/oauth/access_token.php?app_id=${params.clientId}&secret=${params.clientSecret}&code=${params.code}&output=json`
      })
    })

    it('throws if response status is not 200', async () => {
      const { sut, httpHelperStub } = makeSut()

      const expectedStatus = makeRandomFailStatus()
      jest.spyOn(httpHelperStub, 'request').mockImplementationOnce(
        async () => ({ status: expectedStatus, body: {} })
      )

      expect(sut.createAccessToken(makeParams())).rejects.toEqual(new DeezerUnexpectedError(expectedStatus))
    })

    it('returns data successfully', async () => {
      const { sut } = makeSut()

      const actual = await sut.createAccessToken(makeParams())

      expect(actual).toStrictEqual({
        accessToken: createAccessTokenMock.access_token,
        expiresIn: createAccessTokenMock.expires
      })
    })
  })

  describe('Create Deezer Playlist Service', () => {
    const makeParams = (): CreatePlaylistServiceProtocol.Params => ({
      accessToken: makeStreamingServiceAccessToken(),
      name: faker.word.noun()
    })

    it('ensures httpHelper is called correctly', async () => {
      const { sut, httpHelperStub } = makeSut()

      const spied = jest.spyOn(httpHelperStub, 'request')

      const params = makeParams()
      await sut.createPlaylist(params)

      expect(spied).toHaveBeenCalledWith({
        method: 'POST',
        url: `/user/me/playlists?access_token=${params.accessToken}&title=${params.name}`
      })
    })

    it('throws if response.status is not 200', async () => {
      const { sut, httpHelperStub } = makeSut()

      const expectedStatus = makeRandomFailStatus()
      jest.spyOn(httpHelperStub, 'request').mockImplementationOnce(
        async () => ({ status: expectedStatus, body: {} })
      )

      expect(sut.createPlaylist(makeParams())).rejects.toEqual(
        new DeezerUnexpectedError(expectedStatus, expect.any(Object))
      )
    })

    it('throws if no response.body.id', async () => {
      const { sut, httpHelperStub } = makeSut()

      jest.spyOn(httpHelperStub, 'request').mockImplementationOnce(
        async () => ({ status: 200, body: createPlaylistOauthExceptionMock })
      )

      expect(sut.createPlaylist(makeParams())).rejects.toEqual(
        new DeezerUnexpectedError(200, createPlaylistOauthExceptionMock)
      )
    })

    it('returns data successfully', async () => {
      const { sut } = makeSut()

      const actual = await sut.createPlaylist(makeParams())

      expect(actual).toStrictEqual({
        id: `${createPlaylistMock.id}`,
        url: `https://www.deezer.com/playlist/${createPlaylistMock.id}`
      })
    })
  })

  describe('Search Deezer Tracks', () => {
    const makeParams = (): SearchTracksServiceProtocol.Params => {
      const artists: string[] = []
      for (let i = 0; i < faker.number.int({ min: 1, max: 3 }); i++) {
        artists.push(faker.person.fullName())
      }

      return {
        accessToken: makeStreamingServiceAccessToken(),
        name: 'any song name',
        artists,
        config: { limit: 1 }
      }
    }

    it('ensures httpHelper is called correctly', async () => {
      const { sut, httpHelperStub } = makeSut()

      const spied = jest.spyOn(httpHelperStub, 'request')

      const params = makeParams()
      await sut.search(params)

      expect(spied).toHaveBeenCalledTimes(1)
      expect(spied).toHaveBeenCalledWith({
        url: '/search',
        method: 'GET',
        query: {
          q: `track:"${params.name}" artist:"${params.artists[0]}"`,
          access_token: params.accessToken
        }
      })
    })

    it('throws if response.status is not 200', async () => {
      const { sut, httpHelperStub } = makeSut()

      const failingStatus = makeRandomFailStatus()
      jest.spyOn(httpHelperStub, 'request').mockImplementationOnce(
        async () => ({ status: failingStatus, body: {} })
      )

      expect(sut.search(makeParams())).rejects.toEqual(
        new DeezerUnexpectedError(failingStatus, expect.any(Object))
      )
    })

    it('returns empty array when no tracks are found', async () => {
      const { sut, httpHelperStub } = makeSut()

      jest.spyOn(httpHelperStub, 'request').mockImplementationOnce(
        async () => ({ status: 200, body: searchTrackEmptyDataMock })
      )
      const actual = await sut.search(makeParams())

      expect(actual).toStrictEqual([])
    })

    it('returns data successfully when 1-5 track(s) are found', async () => {
      const { sut, httpHelperStub } = makeSut()

      jest.spyOn(httpHelperStub, 'request').mockImplementationOnce(async () => ({ status: 200, body: searchTrackMock }))

      const actual = await sut.search(makeParams())

      expect(actual).toHaveLength(3)
      expect(actual[0]).toEqual({
        id: expect.any(String),
        name: expect.any(String),
        album: {
          id: expect.any(String),
          name: expect.any(String)
        },
        artists: expect.arrayContaining([{
          id: expect.any(String),
          name: expect.any(String)
        }])
      })
    })

    // it('returns only 5 items when more than 5 tracks are found', async () => {
    // })
  })
})
