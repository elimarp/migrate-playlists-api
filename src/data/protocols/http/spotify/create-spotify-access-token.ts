export interface CreateSpotifyAccessTokenServiceProtocol {
  createAccessToken(params: CreateSpotifyAccessTokenServiceProtocol.Params): Promise<CreateSpotifyAccessTokenServiceProtocol.Result>
}

export namespace CreateSpotifyAccessTokenServiceProtocol {
  export type Params = {
    code: string
    redirectUri: string
    clientId: string
    clientSecret: string
  }
  export type Result = {
    accessToken: string
    refreshToken: string
    expiresIn: number
  }
}
