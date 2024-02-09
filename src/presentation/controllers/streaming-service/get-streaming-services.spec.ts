import { makeStreamingService } from '../../../../tests/mocks/models/streaming-service'
import { type GetStreamingServicesProtocol } from '../../../domain/usecases/streaming-service/get-streaming-services'
import { GetStreamingServicesController } from './get-streaming-services'

class GetStreamingServicesStub implements GetStreamingServicesProtocol {
  async getAllStreamingServices(): Promise<GetStreamingServicesProtocol.Result> {
    return [
      makeStreamingService(),
      makeStreamingService(),
      makeStreamingService(),
    ]
  }
}

interface Sut {
  sut: GetStreamingServicesController
  getStreamingServicesStub: GetStreamingServicesProtocol
}

const makeSut = (): Sut => {
  const getStreamingServicesStub = new GetStreamingServicesStub()

  return {
    sut: new GetStreamingServicesController(getStreamingServicesStub),
    getStreamingServicesStub
  }
}

describe('Get Services Controller', () => {
  test('make sure GetServices is called correctly', async () => {
    const { sut, getStreamingServicesStub } = makeSut()

    jest.spyOn(getStreamingServicesStub, 'getAllStreamingServices')

    await sut.handle({}, {})

    expect(getStreamingServicesStub.getAllStreamingServices).toHaveBeenCalledWith()
  })

  test('return 500 if GetServices throws', async () => {
    const { sut, getStreamingServicesStub } = makeSut()

    jest.spyOn(getStreamingServicesStub, 'getAllStreamingServices').mockImplementationOnce(() => { throw new Error('unexpected error') })

    const expected = await sut.handle({}, {})

    expect(expected.status).toBe(500)
    expect(expected.body).toEqual({ message: 'Internal server error' })
  })

  test('return 200 if succeed', async () => {
    const { sut } = makeSut()

    const actual = await sut.handle({}, {})

    expect(actual.status).toBe(200)
    expect(actual.body).toEqual({
      message: 'Ok',
      payload: expect.anything()
    })
    expect(actual.body.payload[0]).toStrictEqual({
      id: expect.any(String),
      imageUrl: expect.any(String),
      name: expect.any(String),
      keyword: expect.any(String)
    })
  })
})
