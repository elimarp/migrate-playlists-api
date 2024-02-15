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
  tracks: {
    id: string
    name: string
    addedAt: Date
    album: {
      id: string
      name: string
    }
    artists: {
      id: string
      name: string
    }[]
  }[]
}
