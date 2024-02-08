import { makeCreateStreamingService } from '../../../tests/mocks/models/streaming-service'
import { seedMongodbCollection } from '../../../tests/seed/mongodb-collection'
import { purgeCollection } from '../../../tests/utils/mongodb'
import { mongodb } from "../helpers/mongodb-helper"
import { StreamingServiceRepository } from "./streaming-service-repository"

const creatingStreamingServices = [
  makeCreateStreamingService(),
  makeCreateStreamingService(),
  makeCreateStreamingService()
]

interface Sut {
  sut: StreamingServiceRepository
}

const makeSut = (): Sut => {
  return {
    sut: new StreamingServiceRepository(),
  }
}

describe('Service Repository', () => {

  beforeAll(async () => {
    await mongodb.connect((global as any).__MONGO_URI__)
  })

  afterAll(async () => {
    await mongodb.disconnect()
  })

  afterEach(async () => {
    await purgeCollection(StreamingServiceRepository.name)
  })

  test('return services successfully', async () => {
    const { sut } = makeSut()

    await seedMongodbCollection(sut.constructor.name, creatingStreamingServices)

    const actual = await sut.getAll();

    const services = creatingStreamingServices.map(item => ({ ...item, id: expect.any(String) }))

    // TODO: understand why the hell _id keeps being injected
    const expected = services.map(({ _id, ...rest }) => rest)

    expect(actual).toStrictEqual(expected)
  })
})
