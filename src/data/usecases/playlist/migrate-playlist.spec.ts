import { faker } from '@faker-js/faker'
import { type MigratePlaylistProtocol } from '../../../domain/usecases/playlist/migrate-playlist'
import { MigratePlaylist } from './migrate-playlist'
import { type GetPlaylistServiceProtocol } from '../../protocols/http/streaming-service/playlist/get-playlist'
import { type PlaylistModel } from '../../../domain/models/playlist'
import { type CreatePlaylistServiceProtocol } from '../../protocols/http/streaming-service/playlist/create-playlist'
import { type PostMessageIntoExchangeProtocol } from '../../protocols/mq/post-message-into-exchange'
import { makePlaylist } from '../../../../tests/mocks/models/playlist'
import { makeStreamingServiceAccessToken } from '../../../../tests/mocks/models/streaming-service'

class ValidStreamingServiceServiceStub implements GetPlaylistServiceProtocol, CreatePlaylistServiceProtocol {
  async createPlaylist (params: CreatePlaylistServiceProtocol.Params): Promise<CreatePlaylistServiceProtocol.Result> {
    throw new Error('Method not implemented.')
  }

  async getPlaylist (params: GetPlaylistServiceProtocol.Params): Promise<PlaylistModel> {
    return makePlaylist()
  }
}

class AnotherStreamingServiceServiceStub implements CreatePlaylistServiceProtocol, GetPlaylistServiceProtocol {
  async getPlaylist (params: GetPlaylistServiceProtocol.Params): Promise<PlaylistModel> {
    throw new Error('Method not implemented.')
  }

  async createPlaylist (params: CreatePlaylistServiceProtocol.Params): Promise<CreatePlaylistServiceProtocol.Result> {
    return { id: faker.string.uuid(), url: faker.internet.url() }
  }
}

class RabbitMqHelperStub implements PostMessageIntoExchangeProtocol {
  async postMessage (params: PostMessageIntoExchangeProtocol.Params): Promise<void> {}
}

const makeSut = () => {
  const services = {
    'valid-streaming-service': new ValidStreamingServiceServiceStub(),
    'another-streaming-service': new AnotherStreamingServiceServiceStub()
  }
  const rabbitMqHelperStub = new RabbitMqHelperStub()

  return {
    sut: new MigratePlaylist(
      services,
      services,
      rabbitMqHelperStub
    ),
    services,
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
    const { sut, services } = makeSut()

    const spied = jest.spyOn(services['valid-streaming-service'], 'getPlaylist')

    const params = makeParams()

    await sut.migrate(params)

    expect(spied).toHaveBeenCalledWith({
      playlistId: params.from.playlistId,
      accessToken: params.from.accessToken
    })
  })

  it('ensures createPlaylistService is called correctly', async () => {
    const { sut, services } = makeSut()

    const playlist = makePlaylist()
    jest.spyOn(services['valid-streaming-service'], 'getPlaylist').mockResolvedValueOnce(playlist)

    const spied = jest.spyOn(services['another-streaming-service'], 'createPlaylist')

    const params = makeParams()

    await sut.migrate(params)

    expect(spied).toHaveBeenCalledWith({
      name: playlist.name,
      description: playlist.description,
      accessToken: params.to.accessToken
    })
  })

  it('ensures postMessageIntoExchange is called correctly', async () => {
    const {
      sut,
      rabbitMqHelperStub,
      services
    } = makeSut()

    const fromPlaylist = makePlaylist()
    jest.spyOn(services['valid-streaming-service'], 'getPlaylist').mockResolvedValueOnce(fromPlaylist)

    const toPlaylist = {
      id: faker.string.uuid(),
      url: faker.internet.url()
    }
    jest.spyOn(services['another-streaming-service'], 'createPlaylist').mockResolvedValueOnce(toPlaylist)

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
    const { sut, services } = makeSut()

    const createdPlaylist = {
      id: faker.string.uuid(),
      url: faker.internet.url()
    }
    jest.spyOn(services['another-streaming-service'], 'createPlaylist').mockResolvedValueOnce(createdPlaylist)

    const actual = await sut.migrate(makeParams())

    expect(actual).toStrictEqual({
      playlistUrl: createdPlaylist.url
    })
  })
})
