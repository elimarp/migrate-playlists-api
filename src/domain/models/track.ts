export type Track = {
  id: string
  name: string
  album: {
    id: string
    name: string
  }
  artists: {
    id: string
    name: string
  }[]
}
