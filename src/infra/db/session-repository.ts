import { ObjectId, type Collection } from 'mongodb'
import { type MongodbSessionModel, type SessionModel } from '../../domain/models/session'
import { mongodb } from '../helpers/mongodb-helper'
import { type GetSessionRepository } from '../../data/protocols/db/session/get-session-repository'

export class SessionRepository implements GetSessionRepository {
  collection: Collection<MongodbSessionModel>

  constructor () {
    this.collection = mongodb.getCollection(this.constructor.name)
  }

  async getSession (sessionId: string): Promise<SessionModel | null> {
    const session = await this.collection.findOne({
      _id: new ObjectId(sessionId)
    })

    if (!session) return null

    const { _id, ...rest } = session

    return {
      id: _id.toString(),
      ...rest
    }
  }
}
