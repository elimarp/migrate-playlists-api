export class DeezerUnexpectedError extends Error {
  status: number
  body: any
  constructor (status: number, body?: any) {
    super(`Deezer request failed with status ${status}`)
    this.body = body
    this.status = status
  }
}
