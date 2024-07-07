import { type Track } from './track'

type PlaylistTrack = Track & {
  addedAt: Date
}

export type PlaylistModel = {
  id: string
  name: string
  description: string
  isPublic: boolean
  images: {
    height: number
    url: string
    width: number
  }[]
  tracks: PlaylistTrack[]
}
