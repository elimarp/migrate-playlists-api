export interface CreateStreamingServiceTokenProtocol {
  createToken(params: CreateStreamingServiceTokenProtocol.Params): Promise<CreateStreamingServiceTokenProtocol.Result>
}
export namespace CreateStreamingServiceTokenProtocol {
  export type Params = { code: string, sessionId: string }
  export type Result = { accessToken: string, expiresIn: number }
}
