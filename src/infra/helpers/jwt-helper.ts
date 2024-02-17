import { sign, verify } from 'jsonwebtoken'
import { type JwtDecryptHelperProtocol, type JwtEncryptHelperProtocol } from '../../data/protocols/helpers/jwt-helper'
import { constants } from '../../utils/constants'
import { AccessTokenExpiredError } from './exceptions'

export class JwtHelper implements JwtEncryptHelperProtocol, JwtDecryptHelperProtocol {
  async encrypt (data: Record<string, any>, options?: JwtEncryptHelperProtocol.Options | undefined): Promise<string> {
    return await new Promise((resolve, reject) => {
      console.log('ENCRYPT PROMISE JUST EXECUTED')

      sign(data, constants.app.jwt.SECRET, options ?? {}, (error, jwt) => {
        if (error) {
          reject(error)
          return
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        resolve(jwt!)
      })
    })
  }

  async decrypt (jwt: string, options?: JwtDecryptHelperProtocol.Options): Promise<JwtDecryptHelperProtocol.Result> {
    // TODO?: will it be executed instantaneously when read?
    return await new Promise((resolve, reject) => {
      console.log('DECRYPT PROMISE JUST EXECUTED')

      verify(jwt, constants.app.jwt.SECRET, options ?? {}, (error, data) => {
        if (error) {
          if (error?.name === 'TokenExpiredError') reject(new AccessTokenExpiredError())
          else reject(error)
          return
        }
        resolve(data as JwtDecryptHelperProtocol.Result)
      })
    })
  }
}
