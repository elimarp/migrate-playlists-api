export interface CreateSessionProtocol {
  create(params: CreateSessionProtocol.Params): Promise<CreateSessionProtocol.Result>
}
export namespace CreateSessionProtocol {
  export type Params = {
    code: string
    serviceKeyword: string
  }
  export type Result = {
    accessToken: string
    expiresIn: number
  }
}
