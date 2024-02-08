import { MongoClient, type Document, type Collection } from 'mongodb'

const missingClientError = new Error('you must start the connection first')

class MongodbHelper {
  client?: MongoClient

  async connect (url: string): Promise<void> {
    this.client = await MongoClient.connect(url)
  }

  async disconnect (): Promise<void> {
    if (!this.client) throw missingClientError
    await this.client.close()
  }

  getCollection<T extends Document> (collectionName: string): Collection<T> {
    if (!this.client) throw missingClientError
    return this.client.db().collection<T>(collectionName)
  }
}

export const mongodb = new MongodbHelper()
