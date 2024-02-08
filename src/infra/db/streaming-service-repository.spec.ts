import { makeCreateStreamingService } from '../../../tests/mocks/models/streaming-service'
import { seedMongodbCollection } from '../../../tests/seed/mongodb-collection'
import { purgeCollection } from '../../../tests/utils/mongodb'
import { mongodb } from "../helpers/mongodb-helper"
import { StreamingServiceRepository } from "./streaming-service-repository"

const makeSut = () => {
  return {
    sut: new StreamingServiceRepository(),
  }
}

describe('Streaming Service Repository', () => {

  beforeAll(async () => {
    await mongodb.connect((global as any).__MONGO_URI__)
  })

  afterAll(async () => {
    await mongodb.disconnect()
  })

  afterEach(async () => {
    await purgeCollection(StreamingServiceRepository.name)
  })

  test('return streaming services successfully', async () => {
    const { sut } = makeSut()

    const streamingServices = [
      makeCreateStreamingService(),
      makeCreateStreamingService(),
      makeCreateStreamingService()
    ]

    await seedMongodbCollection(sut.constructor.name, streamingServices)

    const actual = await sut.getAll();

    // TODO: understand why the hell _id keeps being injected here
    const expected = streamingServices.map(({ _id, ...item }: any) => ({ ...item, id: expect.any(String) }))

    expect(actual).toStrictEqual(expected)
  })
})
