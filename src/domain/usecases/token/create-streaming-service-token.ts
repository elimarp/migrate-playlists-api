export interface CreateStreamingServiceTokenProtocol {
  createToken(params: CreateStreamingServiceTokenProtocol.Params): Promise<CreateStreamingServiceTokenProtocol.Result>
}
export namespace CreateStreamingServiceTokenProtocol {
  export type Params = { code: string }
  export type Result = { accessToken: string }
}
