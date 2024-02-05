import { mongodbClient } from '../../src/infra/db/mongodb-client';

export const seedMongodbServiceCollection = async (services: any[]) => {
  const collection = mongodbClient.getCollection('services')
  const documents = [...services]
  
  await collection.insertMany(documents)
}