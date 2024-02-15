import { faker } from '@faker-js/faker'

export const makePlaylist = () => ({
  id: faker.string.uuid(),
  description: faker.lorem.sentence(),
  images: [
    { height: 480, width: 640, url: faker.image.url() }
  ],
  isPublic: true,
  name: faker.word.noun(),
  tracks: [
    {
      id: faker.string.uuid(),
      name: faker.music.songName(),
      addedAt: faker.date.past({ years: 5 }),
      album: {
        id: faker.string.uuid(),
        name: faker.word.verb()
      },
      artists: [
        { id: faker.string.uuid(), name: faker.person.fullName() }
      ]
    }
  ]
})
