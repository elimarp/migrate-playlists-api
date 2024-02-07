export class AccessTokenExpiredError extends Error {
  constructor () {
    super('accessToken expired')
  }
}
