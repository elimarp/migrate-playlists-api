import { faker } from '@faker-js/faker'
import { type MigratePlaylistProtocol } from '../../../domain/usecases/playlist/migrate-playlist'
import { MigratePlaylist } from './migrate-playlist'
import { type GetSpotifyPlaylistServiceProtocol } from '../../protocols/http/spotify/get-playlist'
import { type PlaylistModel } from '../../../domain/models/playlist'
import { type CreatePlaylistServiceProtocol } from '../../protocols/http/streaming-service/playlist/create-playlist'
import { type PostMessageIntoExchangeProtocol } from '../../protocols/mq/post-message-into-exchange'
import { makePlaylist } from '../../../../tests/mocks/models/playlist'
import { makeStreamingServiceAccessToken } from '../../../../tests/mocks/models/streaming-service'

class ValidStreamingServiceServiceStub implements GetSpotifyPlaylistServiceProtocol {
  async getPlaylist (params: GetSpotifyPlaylistServiceProtocol.Params): Promise<PlaylistModel> {
    return makePlaylist()
  }
}

class AnotherStreamingServiceServiceStub implements CreatePlaylistServiceProtocol {
  async createPlaylist (params: CreatePlaylistServiceProtocol.Params): Promise<CreatePlaylistServiceProtocol.Result> {
    return { id: faker.string.uuid(), url: faker.internet.url() }
  }
}

class RabbitMqHelperStub implements PostMessageIntoExchangeProtocol {
  async postMessage (params: PostMessageIntoExchangeProtocol.Params): Promise<void> {}
}

const makeSut = () => {
  const validStreamingServiceServiceStub = new ValidStreamingServiceServiceStub()
  const anotherStreamingServiceServiceStub = new AnotherStreamingServiceServiceStub()
  const rabbitMqHelperStub = new RabbitMqHelperStub()

  return {
    sut: new MigratePlaylist(
      validStreamingServiceServiceStub,
      anotherStreamingServiceServiceStub,
      rabbitMqHelperStub
    ),
    validStreamingServiceServiceStub,
    anotherStreamingServiceServiceStub,
    rabbitMqHelperStub
  }
}

const makeParams = (): MigratePlaylistProtocol.Params => ({
  from: {
    service: 'valid-streaming-service',
    accessToken: makeStreamingServiceAccessToken(),
    playlistId: faker.string.uuid()
  },
  to: {
    service: 'another-streaming-service',
    accessToken: makeStreamingServiceAccessToken()
  }
})

describe('Migrate Playlist Usecase', () => {
  it('ensures getPlaylistService is called correctly', async () => {
    const { sut, validStreamingServiceServiceStub } = makeSut()

    const spied = jest.spyOn(validStreamingServiceServiceStub, 'getPlaylist')

    const params = makeParams()

    await sut.migrate(params)

    expect(spied).toHaveBeenCalledWith({
      playlistId: params.from.playlistId,
      accessToken: params.from.accessToken
    })
  })

  it('ensures createPlaylistService is called correctly', async () => {
    const { sut, validStreamingServiceServiceStub, anotherStreamingServiceServiceStub } = makeSut()

    const playlist = makePlaylist()
    jest.spyOn(validStreamingServiceServiceStub, 'getPlaylist').mockResolvedValueOnce(playlist)

    const spied = jest.spyOn(anotherStreamingServiceServiceStub, 'createPlaylist')

    const params = makeParams()

    await sut.migrate(params)

    expect(spied).toHaveBeenCalledWith({
      name: playlist.name,
      description: playlist.description
    })
  })

  it('ensures postMessageIntoExchange is called correctly', async () => {
    const {
      sut,
      rabbitMqHelperStub,
      validStreamingServiceServiceStub,
      anotherStreamingServiceServiceStub
    } = makeSut()

    const fromPlaylist = makePlaylist()
    jest.spyOn(validStreamingServiceServiceStub, 'getPlaylist').mockResolvedValueOnce(fromPlaylist)

    const toPlaylist = {
      id: faker.string.uuid(),
      url: faker.internet.url()
    }
    jest.spyOn(anotherStreamingServiceServiceStub, 'createPlaylist').mockResolvedValueOnce(toPlaylist)

    const spied = jest.spyOn(rabbitMqHelperStub, 'postMessage')

    const params = makeParams()

    await sut.migrate(params)

    const message = {
      from: {
        service: params.from.service,
        accessToken: params.from.accessToken,
        tracks: fromPlaylist.tracks.map(
          (track) => ({
            name: track.name,
            artists: track.artists.map(({ name }) => name)
          })
        )
      },
      to: {
        service: params.to.service,
        accessToken: params.to.accessToken,
        playlistId: toPlaylist.id
      }
    }

    expect(spied).toHaveBeenCalledWith({
      exchange: 'playlist',
      routingKey: 'playlist.cmd.add-tracks',
      message
    })
  })

  it('returns result successfully', async () => {
    const { sut, anotherStreamingServiceServiceStub } = makeSut()

    const createdPlaylist = {
      id: faker.string.uuid(),
      url: faker.internet.url()
    }
    jest.spyOn(anotherStreamingServiceServiceStub, 'createPlaylist').mockResolvedValueOnce(createdPlaylist)

    const actual = await sut.migrate(makeParams())

    expect(actual).toStrictEqual({
      playlistUrl: createdPlaylist.url
    })
  })
})
