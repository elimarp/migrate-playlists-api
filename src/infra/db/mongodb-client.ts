import { type Collection, MongoClient } from 'mongodb'

const missingClientError = new Error('you must start the connection first')

class MongodbClient {
  client?: MongoClient

  async connect (url: string): Promise<void> {
    this.client = await MongoClient.connect(url)
  }

  async disconnect (): Promise<void> {
    if (!this.client) throw missingClientError
    await this.client.close()
  }

  getCollection (collectionName: string): Collection {
    if (!this.client) throw missingClientError
    return this.client.db().collection(collectionName)
  }
}

export const mongodbClient = new MongodbClient()
