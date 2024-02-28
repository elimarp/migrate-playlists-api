export class AccessTokenExpiredError extends Error {
  constructor () {
    super('Access token expired')
  }
}
