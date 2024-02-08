import { type ObjectId } from 'mongodb'

export type StreamingServiceModel = {
  id: string
  keyword: string
  name: string
  imageUrl: string
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
