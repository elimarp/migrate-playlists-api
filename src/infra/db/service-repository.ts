import { type GetServicesRepository } from '../../data/protocols/db/get-services-repository'
import { type ServiceModel } from '../../domain/models/service'
import { mongodbClient } from '../helpers/mongodb-helper'

export class ServiceRepository implements GetServicesRepository {
  async getAll (): Promise<GetServicesRepository.Result> {
    const serviceCollection = mongodbClient.getCollection('services')
    const services = await serviceCollection.find().toArray()

    const result = services.map(
      ({ _id, ...rest }) =>
        ({ id: String(_id), ...rest })) as unknown as ServiceModel[]

    return result
  }
}
