export interface PostMessageIntoExchangeProtocol {
  postMessage(params: PostMessageIntoExchangeProtocol.Params): Promise<void>
}
export namespace PostMessageIntoExchangeProtocol {
  export type Params = {
    exchange: string
    message: Record<string, any>
    routingKey: string
    headers?: Record<string, any>
  }
}
