import { faker } from "@faker-js/faker"
import { createRandomPlaylistList } from "../../../../../tests/utils/create-random-playlist-list"
import { GetSpotifyUserPlaylistsService, GetSpotifyUserPlaylistsServiceParams, GetSpotifyUserPlaylistsServiceResult } from "../../../protocols/http/spotify/get-user-playlists"
import { GetSpotifyUserPlaylistsUsecase } from "./get-spotify-user-playlists"

class SpotifyServiceStub implements GetSpotifyUserPlaylistsService {
  async getPlaylistsByUserId({ limit, offset }: GetSpotifyUserPlaylistsServiceParams): Promise<GetSpotifyUserPlaylistsServiceResult> {
    return createRandomPlaylistList({ limit, offset })
  }
}

interface Sut {
  sut: GetSpotifyUserPlaylistsUsecase
  spotifyServiceStub: GetSpotifyUserPlaylistsService
}

const makeSut = (): Sut => {
  const spotifyServiceStub = new SpotifyServiceStub()
  return {
    sut: new GetSpotifyUserPlaylistsUsecase(spotifyServiceStub),
    spotifyServiceStub
  }
}

const makeParams = () => ({
  spotifyAccessToken: faker.internet.password(),
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

    expect(spy).toHaveBeenCalledWith({
      userId: params.userId,
      accessToken: params.spotifyAccessToken,
      limit: params.limit,
      offset: params.offset
    })
  })

  test('throw when GetSpotifyUserPlaylistService throws', async () => {
    const { sut, spotifyServiceStub } = makeSut()
    
    const exception = new Error('certain error')

    jest.spyOn(spotifyServiceStub, 'getPlaylistsByUserId').mockImplementationOnce(async () => { throw exception })

    expect(sut.getUserPlaylists(makeParams())).rejects.toEqual(exception)
  })

  test('return playlists successfully', async () => {
    const { sut, spotifyServiceStub } = makeSut()

    const serviceResult  = createRandomPlaylistList({})
    jest.spyOn(spotifyServiceStub, 'getPlaylistsByUserId').mockResolvedValueOnce(serviceResult)

    const actual = await sut.getUserPlaylists(makeParams())

    expect(actual).toStrictEqual(serviceResult)
  })

})