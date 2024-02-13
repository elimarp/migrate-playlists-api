export class PlaylistNotFoundError extends Error {
  constructor () {
    super('Playlist not found')
  }
}
