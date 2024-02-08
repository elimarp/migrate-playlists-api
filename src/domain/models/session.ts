import { type ObjectId } from 'mongodb'

type SessionServiceModel = {
  keyword: string
  accessToken: string
  // TODO: refreshToken?: string
}

export type SessionModel = {
  id: string
  // TODO: userId: ?
  services: SessionServiceModel[]
}

export type CreateSessionModel = {
  // TODO: userId: ?
  services: SessionServiceModel[]
}

export type MongodbSessionModel = Omit<SessionModel, 'id'> & {
  _id: ObjectId
}
