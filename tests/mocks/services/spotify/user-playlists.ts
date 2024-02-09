import { faker } from '@faker-js/faker'

type MakeSpotifyUserPlaylistsParams = { limit?: number, offset?: number }
export const makeSpotifyUserPlaylists = ({ limit: limitInput, offset: offsetInput }: MakeSpotifyUserPlaylistsParams) => {
  const total = faker.number.int({ min: 0, max: 180 })
  const limit = limitInput ?? 20
  const offset = offsetInput ?? 0

  const payload = []

  for (let i = 0; i < total && i < limit; i++) {
    payload.push({
      id: faker.string.uuid(),
      name: faker.lorem.sentence(),
      description: faker.lorem.sentence(),
      isPublic: true,
      images: [],
      totalTracks: faker.number.int({ min: 0, max: 1000 })
    })
  }

  return {
    total,
    limit,
    offset,
    payload
  }
}
