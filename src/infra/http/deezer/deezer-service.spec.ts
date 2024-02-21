import { faker } from '@faker-js/faker'
import { type CreateDeezerAccessTokenServiceProtocol } from '../../../data/protocols/http/deezer/create-deezer-access-token-service'
import { constants } from '../../../utils/constants'
import { HttpHelper, type HttpHelperRequest, type HttpHelperResponse } from '../../helpers/http-helper'
import { DeezerService } from './deezer-service'
import { DeezerUnexpectedError } from './protocols/exceptions'
import * as createAccessToken from '../../../../tests/mocks/http-requests/deezer/create-access-token.json'

class HttpHelperStub extends HttpHelper {
  async request (params: HttpHelperRequest): Promise<HttpHelperResponse<any>> {
    return {
      status: 200,
      body: createAccessToken
    }
  }
}

const makeSut = () => {
  const httpHelperStub = new HttpHelperStub(constants.external.deezer.BASE_URL)
  return {
    sut: new DeezerService(httpHelperStub),
    httpHelperStub
  }
}

describe('Deezer Service', () => {
  describe('Create Deezer Access Token Service', () => {
    const makeParams = (): CreateDeezerAccessTokenServiceProtocol.Params => ({
      clientId: constants.external.deezer.CLIENT_ID,
      clientSecret: constants.external.deezer.CLIENT_SECRET,
      code: faker.string.alpha({ length: 16 })
    })

    it('ensures httpHelper is called correctly', async () => {
      const { sut, httpHelperStub } = makeSut()

      const spied = jest.spyOn(httpHelperStub, 'request')

      const params = makeParams()

      await sut.createAccessToken(params)

      expect(spied).toHaveBeenCalledWith({
        method: 'GET',
        url: `/oauth/access_token.php?app_id=${params.clientId}&secret=${params.clientSecret}&code=${params.code}&output=json`
      })
    })

    it('throws if response status is not 200', async () => {
      const { sut, httpHelperStub } = makeSut()

      const failStatus = [400, 403, 422, 409, 500]
      const expectedStatus = failStatus[faker.number.int({ min: 0, max: failStatus.length - 1 })]
      jest.spyOn(httpHelperStub, 'request').mockImplementationOnce(
        async () => ({ status: expectedStatus, body: {} })
      )

      expect(sut.createAccessToken(makeParams())).rejects.toEqual(new DeezerUnexpectedError(expectedStatus))
    })

    it('returns data successfully', async () => {
      const { sut } = makeSut()

      const actual = await sut.createAccessToken(makeParams())

      expect(actual).toStrictEqual({
        accessToken: createAccessToken.access_token,
        expiresIn: createAccessToken.expires
      })
    })

    // it('', async () => {})
  })
})
