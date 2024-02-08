import { type Collection } from 'mongodb'
import { type GetStreamingServicesRepository } from '../../data/protocols/db/streaming-services/get-streaming-services'
import { type StreamingServiceModel } from '../../domain/models/streaming-service'
import { mongodb } from '../helpers/mongodb-helper'

export class StreamingServiceRepository implements GetStreamingServicesRepository {
  collection: Collection

  constructor () {
    this.collection = mongodb.getCollection(this.constructor.name)
  }

  async getAll (): Promise<GetStreamingServicesRepository.Result> {
    const services = await this.collection.find().toArray()

    const result = services.map(
      ({ _id, ...rest }) =>
        ({ id: String(_id), ...rest })) as unknown as StreamingServiceModel[]

    return result
  }
}
