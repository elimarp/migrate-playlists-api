export interface GetSpotifyUserPlaylistsResponseBody {
  href: string
  items: Item[]
  limit: number
  next: string
  offset: number
  previous: any
  total: number
}

interface Item {
  collaborative: boolean
  description: string
  external_urls: ExternalUrls
  href: string
  id: string
  images: Image[]
  name: string
  owner: Owner
  primary_color: any
  public: boolean
  snapshot_id: string
  tracks: Tracks
  type: string
  uri: string
}

interface ExternalUrls {
  spotify: string
}

interface Image {
  height: number
  url: string
  width: number
}

interface Owner {
  display_name: string
  external_urls: ExternalUrls2
  href: string
  id: string
  type: string
  uri: string
}

interface ExternalUrls2 {
  spotify: string
}

interface Tracks {
  href: string
  total: number
}
