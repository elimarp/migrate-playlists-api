import { faker } from '@faker-js/faker'
import { type SearchTracksServiceProtocol } from '../../protocols/http/streaming-service/search'
import { AddTracksToPlaylist } from './add-tracks'
import { type AddTracksToPlaylistServiceProtocol } from '../../protocols/http/streaming-service/playlist/add-tracks'
import { type AddTracksToPlaylistProtocol } from '../../../domain/usecases/playlist/add-tracks'
import { makeStreamingServiceAccessToken } from '../../../../tests/mocks/models/streaming-service'

class ValidStreamingServiceServiceStub implements SearchTracksServiceProtocol, AddTracksToPlaylistServiceProtocol {
  async addTracks (params: AddTracksToPlaylistServiceProtocol.Params): Promise<void> { }

  async search (params: SearchTracksServiceProtocol.Params): Promise<SearchTracksServiceProtocol.Result> {
    return [
      {
        id: faker.string.uuid(),
        name: 'any song name',
        album: {
          id: faker.string.uuid(),
          name: faker.color.human()
        },
        artists: [{
          id: faker.string.uuid(),
          name: faker.person.fullName()
        }]
      },
      {
        id: faker.string.uuid(),
        name: 'other song name',
        album: {
          id: faker.string.uuid(),
          name: faker.color.human()
        },
        artists: [{
          id: faker.string.uuid(),
          name: faker.person.fullName()
        }]
      }
    ]
  }
}

const services = {
  'valid-streaming-service': new ValidStreamingServiceServiceStub()
}

const makeSut = () => {
  return {
    sut: new AddTracksToPlaylist(services, services),
    services
  }
}

const makeParams = (): AddTracksToPlaylistProtocol.Params => ({
  accessToken: makeStreamingServiceAccessToken(),
  playlistId: faker.string.uuid(),
  tracks: [
    { name: 'song-name', artists: ['artist1', 'artist2'] },
    { name: 'second-song-name', artists: ['artist3'] }
  ],
  service: 'valid-streaming-service'
})

describe('Add Tracks to Playlist Usecase', () => {
  it('ensures searchTracksService is called correctly multiple times', async () => {
    const { sut, services } = makeSut()

    const spied = jest.spyOn(services['valid-streaming-service'], 'search')

    const params = makeParams()
    await sut.addTracks(params)

    expect(spied).toHaveBeenCalledTimes(params.tracks.length)

    params.tracks.forEach((track, index) => {
      expect(spied).toHaveBeenNthCalledWith(index + 1, {
        accessToken: params.accessToken,
        name: track.name,
        artists: track.artists,
        // albumName?: string | undefined;
        config: { limit: 1 }
      })
    })
  })

  it('ensures addTracksToPlaylistService is called correctly', async () => {
    const { sut, services } = makeSut()

    const firstTrackId = faker.string.uuid()
    const secondTrackId = faker.string.uuid()

    const spied = jest.spyOn(services['valid-streaming-service'], 'addTracks')

    jest.spyOn(services['valid-streaming-service'], 'search')
      .mockImplementationOnce(async () => ([
        {
          id: firstTrackId,
          name: 'any song name',
          album: {
            id: faker.string.uuid(),
            name: faker.color.human()
          },
          artists: [{
            id: faker.string.uuid(),
            name: faker.person.fullName()
          }]
        }
      ])).mockImplementationOnce(async () => ([
        {
          id: secondTrackId,
          name: 'any song name',
          album: {
            id: faker.string.uuid(),
            name: faker.color.human()
          },
          artists: [{
            id: faker.string.uuid(),
            name: faker.person.fullName()
          }]
        }
      ]))

    const params = makeParams()
    await sut.addTracks(params)

    expect(spied).toHaveBeenCalledTimes(1)
    expect(spied).toHaveBeenCalledWith({
      playlistId: params.playlistId,
      accessToken: params.accessToken,
      tracksIds: [firstTrackId, secondTrackId]
    })
  })

  // it('', async () => { })
})
