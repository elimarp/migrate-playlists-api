import { type AddTracksToPlaylistProtocol } from '../../../domain/usecases/playlist/add-tracks'
import { type AddTracksToPlaylistServiceProtocol } from '../../protocols/http/streaming-service/playlist/add-tracks'
import { type SearchTracksServiceProtocol } from '../../protocols/http/streaming-service/search'

export class AddTracksToPlaylist implements AddTracksToPlaylistProtocol {
  constructor (
    private readonly searchTracksServices: Record<string, SearchTracksServiceProtocol>,
    private readonly addTracksToPlaylistServices: Record<string, AddTracksToPlaylistServiceProtocol>
  ) { }

  async addTracks (params: AddTracksToPlaylistProtocol.Params): Promise<void> {
    const promises = []

    for (const track of params.tracks) {
      promises.push(
        this.searchTracksServices['valid-streaming-service'].search({
          accessToken: params.accessToken,
          name: track.name,
          artists: track.artists,
          config: { limit: 1 }
        })
      )
    }

    const searchResults = await Promise.all(promises)

    await this.addTracksToPlaylistServices['valid-streaming-service'].addTracks({
      accessToken: params.accessToken,
      playlistId: params.playlistId,
      tracksIds: searchResults.flat(1).map(item => item.id)
    })
  }
}
