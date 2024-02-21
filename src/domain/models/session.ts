import { type ObjectId } from 'mongodb'

export type SessionServiceModel = {
  keyword: string
  accessToken: string
  expiresIn: number
  refreshToken?: string
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
