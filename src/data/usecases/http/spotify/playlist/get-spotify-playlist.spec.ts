import { makePlaylist } from '../../../../../../tests/mocks/models/playlist'
import { PlaylistNotFoundError } from '../../../../../domain/usecases/playlist/exceptions'
import { type GetSpotifyPlaylistServiceProtocol } from '../../../../protocols/http/spotify/get-playlist'
import { GetSpotifyPlaylist } from './get-spotify-playlist'

class GetSpotifyPlaylistServiceStub implements GetSpotifyPlaylistServiceProtocol {
  public readonly implementations = {
    notFound: async () => { throw new PlaylistNotFoundError() }
  }

  async getPlaylist (params: GetSpotifyPlaylistServiceProtocol.Params): Promise<GetSpotifyPlaylistServiceProtocol.Result> {
    return makePlaylist()
  }
}

const makeSut = () => {
  const getSpotifyPlaylistServiceStub = new GetSpotifyPlaylistServiceStub()
  return {
    sut: new GetSpotifyPlaylist(getSpotifyPlaylistServiceStub),
    getSpotifyPlaylistServiceStub
  }
}

describe('Get Spotify Playlist Usecase', () => {
  it('calls GetSpotifyPlaylistService correctly', async () => {
    const { sut, getSpotifyPlaylistServiceStub } = makeSut()

    const spied = jest.spyOn(getSpotifyPlaylistServiceStub, 'getPlaylist')

    await sut.getPlaylist({
      playlistId: 'specific-playlist-id',
      streamingServiceAccessToken: 'specific-access-token'
    })

    expect(spied).toHaveBeenCalledWith({
      playlistId: 'specific-playlist-id',
      accessToken: 'specific-access-token'
    })
  })

  it('throws NotFoundError if GetSpotifyPlaylistService throws PlaylistNotFoundError', async () => {
    const { sut, getSpotifyPlaylistServiceStub } = makeSut()

    jest.spyOn(getSpotifyPlaylistServiceStub, 'getPlaylist').mockImplementationOnce(
      getSpotifyPlaylistServiceStub.implementations.notFound
    )

    const params = {
      playlistId: 'any-playlist-id',
      streamingServiceAccessToken: 'any-access-token'
    }

    expect(sut.getPlaylist(params)).rejects.toEqual(new PlaylistNotFoundError())
  })

  it('returns playlist successfully', async () => {
    const { sut } = makeSut()

    const params = {
      playlistId: 'any-playlist-id',
      streamingServiceAccessToken: 'any-access-token'
    }

    const actual = await sut.getPlaylist(params)

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
})
