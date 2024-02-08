import { makeStreamingService } from '../../../../tests/mocks/models/streaming-service'
import { GetStreamingServicesProtocol } from '../../../domain/usecases/streaming-service/get-streaming-services'
import { GetStreamingServicesRepository } from '../../protocols/db/streaming-services/get-streaming-services'
import { GetStreamingServices } from './get-streaming-services'

const streamingServices = [
  makeStreamingService(),
  makeStreamingService(),
  makeStreamingService(),
]

class GetStreamingServicesRepositoryStub implements GetStreamingServicesRepository {
  async getAll(): Promise<GetStreamingServicesRepository.Result> {
    return streamingServices
  }
  
}

interface Sut {
  sut: GetStreamingServicesProtocol
  getStreamingServicesRepositoryStub: GetStreamingServicesRepository
}

const makeSut = (): Sut => {
  const getStreamingServicesRepositoryStub = new GetStreamingServicesRepositoryStub()

  return {
    sut: new GetStreamingServices(getStreamingServicesRepositoryStub),
    getStreamingServicesRepositoryStub
  }
}

describe('Get Services Use Case', () => {
  test('make sure getServicesRepository is called correctly', async () => {
    const { sut, getStreamingServicesRepositoryStub } = makeSut()

    jest.spyOn(getStreamingServicesRepositoryStub, 'getAll')

    await sut.getAllStreamingServices()

    expect(getStreamingServicesRepositoryStub.getAll).toHaveBeenCalledWith()
  })

  test('return services successfully', async () => {
    const { sut } = makeSut()

    const actual = await sut.getAllStreamingServices()

    expect(actual).toEqual(streamingServices)
  })
})
