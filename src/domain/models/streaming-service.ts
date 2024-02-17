import { type ObjectId } from 'mongodb'

export type StreamingService = 'spotify' // NOTE: feed

export type StreamingServiceModel = {
  id: string
  keyword: string
  name: string
  imageUrl: string
  oauthUrl: string // TODO: include redirect_url; include state (random string 16); include scopes
  // TODO: read more about STATE (how to validate?)
}

export type CreateStreamingServiceModel = {
  keyword: string
  name: string
  imageUrl: string
}

// TODO: move mongodb models to somewhere else
export type MongodbStreamingServiceModel = Omit<StreamingServiceModel, 'id'> & {
  _id: ObjectId
}
