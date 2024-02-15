export class SpotifyExpiredTokenError extends Error {
  constructor () {
    super('Spotify access token expired')
  }
}
export class SpotifyPlaylistNotFoundError extends Error {
  constructor () {
    super('Spotify playlist not found')
  }
}

export class SpotifyUnexpectedError extends Error {
  status: number
  body: any
  constructor (status: number, body?: any) {
    super(`Spotify request failed with status ${status}`)
    this.body = body
    this.status = status
  }
}
