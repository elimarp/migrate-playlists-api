import { mongodbClient } from '../../src/infra/helpers/mongodb-helper';

export const seedMongodbServiceCollection = async (services: any[]) => {
  const collection = mongodbClient.getCollection('services')
  const documents = [...services]
  
  await collection.insertMany(documents)
}