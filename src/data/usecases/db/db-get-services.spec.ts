import { ServiceModel } from '../../../domain/models/service'
import { type GetServices } from '../../../domain/usecases/service/get-services'
import { GetServicesRepository } from '../../protocols/db/get-services-repository'
import { DbGetServices } from './db-get-services'

const servicesMock: ServiceModel[] = [
  { id: 'service01', imageUrl: 'service01-image-url', name: 'Service 01' },
  { id: 'service02', imageUrl: 'service02-image-url', name: 'Service 02' },
]

class GetServicesRepositoryStub implements GetServicesRepository {
  async getAll(): Promise<GetServicesRepository.Result> {
    return servicesMock
  }
  
}

interface Sut {
  sut: GetServices
  getServicesRepositoryStub: GetServicesRepository
}

const makeSut = (): Sut => {
  const getServicesRepositoryStub = new GetServicesRepositoryStub()

  return {
    sut: new DbGetServices(getServicesRepositoryStub),
    getServicesRepositoryStub
  }
}

describe('Get Services Use Case', () => {
  test('make sure getServicesRepository is called correctly', async () => {
    const { sut, getServicesRepositoryStub } = makeSut()

    jest.spyOn(getServicesRepositoryStub, 'getAll')

    await sut.getAllServices()

    expect(getServicesRepositoryStub.getAll).toHaveBeenCalledWith()
  })

  test('return services successfully', async () => {
    const { sut } = makeSut()

    const actual = await sut.getAllServices()

    expect(actual).toEqual(servicesMock)
  })
})
