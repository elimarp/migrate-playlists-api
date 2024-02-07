type SessionServiceModel = {
  keyword: string
  accessToken: string
  // TODO: refreshToken?: string
}

export type SessionModel = {
  id: string
  // TODO: userId: ???
  services: SessionServiceModel[]
}
