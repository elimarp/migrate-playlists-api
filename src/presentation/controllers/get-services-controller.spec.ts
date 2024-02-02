import { type GetServices } from '../../domain/usecases/service/get-services'
import { GetServicesController } from './get-services-controller'

interface Sut {
  sut: GetServicesController
  getServicesStub: GetServices
}

class GetServicesStub implements GetServices {
  getAllServices (): GetServices.Result {
    return [
      { id: 'service01', name: 'Service 01', imageUrl: 'service-01-image-url' },
      { id: 'service02', name: 'Service 02', imageUrl: 'service-02-image-url' }
    ]
  }
}

const makeSut = (): Sut => {
  const getServicesStub = new GetServicesStub()

  return {
    sut: new GetServicesController(getServicesStub),
    getServicesStub
  }
}

describe('Get Services Controller', () => {
  test('return 500 if GetServices throws', () => {
    const { sut, getServicesStub } = makeSut()

    jest.spyOn(getServicesStub, 'getAllServices').mockImplementationOnce(() => { throw new Error('unexpected error') })

    const expected = sut.handle({})

    expect(expected.status).toBe(500)
    expect(expected.body).toEqual({ message: 'Internal server error' })
  })

  test('make sure GetServices is called correctly', () => {
    const { sut, getServicesStub } = makeSut()

    jest.spyOn(getServicesStub, 'getAllServices')

    sut.handle({})

    expect(getServicesStub.getAllServices).toHaveBeenCalledWith()
  })

  test('return 200 if succeed', () => {
    const { sut } = makeSut()

    const expected = sut.handle({})

    expect(expected.status).toBe(200)
    expect(expected.body).toEqual({
      message: 'Ok',
      payload: [
        { id: 'service01', name: 'Service 01', imageUrl: 'service-01-image-url' },
        { id: 'service02', name: 'Service 02', imageUrl: 'service-02-image-url' }
      ]
    })
  })
})
