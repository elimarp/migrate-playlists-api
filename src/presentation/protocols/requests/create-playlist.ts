export interface CreatePlaylistRequest {
  body: {
    from: string // TODO: StreamingService
    to: string // TODO: StreamingService
    playlistId: string
  }
}
