export class SpotifyExpiredTokenError extends Error {
  constructor () {
    super('Spotify access token expired')
  }
}
