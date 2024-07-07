import { type MigratePlaylistProtocol } from '../../../domain/usecases/playlist/migrate-playlist'
import { type GetPlaylistServiceProtocol } from '../../protocols/http/streaming-service/playlist/get-playlist'
import { type CreatePlaylistServiceProtocol } from '../../protocols/http/streaming-service/playlist/create-playlist'
import { type PostMessageIntoExchangeProtocol } from '../../protocols/mq/post-message-into-exchange'

export class MigratePlaylist implements MigratePlaylistProtocol {
  constructor (
    private readonly getPlaylistServices: Record<string, GetPlaylistServiceProtocol>, // TODO: make a generic interface? interface implements interface?
    private readonly createPlaylistServices: Record<string, CreatePlaylistServiceProtocol>,
    private readonly postMessageIntoExchange: PostMessageIntoExchangeProtocol
  ) {}

  async migrate (params: MigratePlaylistProtocol.Params): Promise<MigratePlaylistProtocol.Result> {
    const fromPlaylist = await this.getPlaylistServices[params.from.service].getPlaylist({
      accessToken: params.from.accessToken,
      playlistId: params.from.playlistId
    })

    const toPlaylist = await this.createPlaylistServices[params.to.service].createPlaylist({
      name: fromPlaylist.name,
      description: fromPlaylist.description,
      accessToken: params.to.accessToken
    })

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

    await this.postMessageIntoExchange.postMessage({
      exchange: 'playlist',
      routingKey: 'playlist.cmd.add-tracks',
      message
    })

    return { playlistUrl: toPlaylist.url }
  }
}
