import { ObjectId, type Collection } from 'mongodb'
import { type SessionServiceModel, type MongodbSessionModel, type SessionModel } from '../../domain/models/session'
import { mongodb } from '../helpers/mongodb-helper'
import { type GetSessionRepository } from '../../data/protocols/db/session/get-session-repository'
import { type AddSessionServiceRepository } from '../../data/protocols/db/session/add-session-service-repository'

export class SessionRepository implements GetSessionRepository, AddSessionServiceRepository {
  collection: Collection<MongodbSessionModel>

  constructor () {
    this.collection = mongodb.getCollection(this.constructor.name)
  }

  async addService (sessionId: string, service: SessionServiceModel): Promise<SessionModel> {
    const session = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(sessionId) },
      { $addToSet: { services: service } },
      { returnDocument: 'after' }
    )

    if (!session) throw new Error('Session not found')

    const { _id, ...rest } = session

    return {
      id: _id.toString(),
      ...rest
    }
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
