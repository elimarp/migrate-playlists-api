import { faker } from "@faker-js/faker"
import { makeSpotifyUserPlaylists } from "../../../../../../tests/mocks/service/spotify/user-playlists"
import { GetSpotifyUserPlaylistsServiceProtocol } from "../../../../protocols/http/spotify/get-user-playlists"
import { GetSpotifyUserPlaylists } from "./get-spotify-user-playlists"

class SpotifyServiceStub implements GetSpotifyUserPlaylistsServiceProtocol {
  async getPlaylistsByUserId({ limit, offset }: GetSpotifyUserPlaylistsServiceProtocol.Params): Promise<GetSpotifyUserPlaylistsServiceProtocol.Result> {
    return makeSpotifyUserPlaylists({ limit, offset })
  }
}

interface Sut {
  sut: GetSpotifyUserPlaylists
  spotifyServiceStub: GetSpotifyUserPlaylistsServiceProtocol
}

const makeSut = (): Sut => {
  const spotifyServiceStub = new SpotifyServiceStub()
  return {
    sut: new GetSpotifyUserPlaylists(spotifyServiceStub),
    spotifyServiceStub
  }
}

const makeParams = () => ({
  serviceAccessToken: faker.internet.password(),
  userId: faker.number.int({ min: 0, max: 1 }) ? faker.string.alpha({ length: 20 }) : 'me',
  limit: faker.number.int({ min: 1, max: 50 }),
  offset: faker.number.int({ min: 0, max: 10 })
})

describe('Get Spotify User Playlists Use Case', () => {
  test('make sure GetSpotifyUserPlaylistService is called correctly', async () => {
    const { sut, spotifyServiceStub } = makeSut()
    const spy = jest.spyOn(spotifyServiceStub, 'getPlaylistsByUserId')

    const params = makeParams()
    await sut.getUserPlaylists(params)

    const { serviceAccessToken: expectedAccessToken, ...expectedParams } = params
    expect(spy).toHaveBeenCalledWith({ accessToken: expectedAccessToken, ...expectedParams })
  })

  test('throw when GetSpotifyUserPlaylistService throws', async () => {
    const { sut, spotifyServiceStub } = makeSut()
    
    const exception = new Error('certain error')

    jest.spyOn(spotifyServiceStub, 'getPlaylistsByUserId').mockImplementationOnce(async () => { throw exception })

    expect(sut.getUserPlaylists(makeParams())).rejects.toEqual(exception)
  })

  test('return playlists successfully', async () => {
    const { sut, spotifyServiceStub } = makeSut()

    const serviceResult  = makeSpotifyUserPlaylists({})
    jest.spyOn(spotifyServiceStub, 'getPlaylistsByUserId').mockResolvedValueOnce(serviceResult)

    const actual = await sut.getUserPlaylists(makeParams())

    expect(actual).toStrictEqual(serviceResult)
  })

})
