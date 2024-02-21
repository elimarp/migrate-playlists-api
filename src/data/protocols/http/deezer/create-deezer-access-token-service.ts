export interface CreateDeezerAccessTokenServiceProtocol {
  createAccessToken(params: CreateDeezerAccessTokenServiceProtocol.Params): Promise<CreateDeezerAccessTokenServiceProtocol.Result>
}
export namespace CreateDeezerAccessTokenServiceProtocol {
  export type Params = { code: string, clientId: string, clientSecret: string }
  export type Result = { accessToken: string, expiresIn: number }
}
