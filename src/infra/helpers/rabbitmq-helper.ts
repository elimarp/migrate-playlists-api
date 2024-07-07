import { type PostMessageIntoExchangeProtocol } from '../../data/protocols/mq/post-message-into-exchange'

class RabbitmqHelper implements PostMessageIntoExchangeProtocol {
  // TODO: getInstance

  // TODO: connect

  async postMessage (params: PostMessageIntoExchangeProtocol.Params): Promise<void> {
    throw new Error('Method not implemented.')
  }
}

export const rabbitmq = new RabbitmqHelper()
