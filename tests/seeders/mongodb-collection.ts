import { mongodb } from '../../src/infra/helpers/mongodb-helper'

export const seedMongodbCollection = async (collectionName: string, documents: Record<string, any>[]) => {
  const collection = mongodb.getCollection(collectionName)

  await collection.insertMany([...documents])
}
