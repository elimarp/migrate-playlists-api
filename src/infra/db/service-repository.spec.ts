import { seedMongodbServiceCollection } from '../../../tests/seed/service'
import { mongodbClient } from "../helpers/mongodb-helper"
import { ServiceRepository } from "./service-repository"

const services = [
  { keyword: 'spotify', name: 'Spotify', image_url: 'spotify-image-url' },
  { keyword: 'deezer', name: 'Deezer', image_url: 'deezer-image-url' },
]

interface Sut {
  sut: ServiceRepository
}

const makeSut = (): Sut => {
  return {
    sut: new ServiceRepository(),
  }
}

describe('Service Repository', () => {

  beforeAll(async () => {
    await mongodbClient.connect((global as any).__MONGO_URI__)
  })

  afterAll(async () => {
    await mongodbClient.disconnect()
  })

  test('return services successfully', async () => {
    const { sut } = makeSut()

    await seedMongodbServiceCollection(services)

    const actual = await sut.getAll()

    expect(actual).toStrictEqual([
      {
        id: expect.any(String),
        keyword: 'spotify',
        name: 'Spotify',
        image_url: 'spotify-image-url'
      },
      {
        id: expect.any(String),
        keyword: 'deezer',
        name: 'Deezer',
        image_url: 'deezer-image-url'
      },
    ])
  })
})