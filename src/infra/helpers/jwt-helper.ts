import { verify, sign, type VerifyOptions, type SignOptions } from 'jsonwebtoken'

// TODO: .env jwt secret
const JWT_SECRET = '75330d17f4494fe6bab5a6a175eab8a5_084329942086'

type JwtPayload = {
  sub: string
  id: string
  iat: number
}

export class JwtHelper {
  async decrypt (jwt: string, options?: VerifyOptions): Promise<JwtPayload> {
    // TODO?: will it be executed instantaneously when read?
    return await new Promise((resolve, reject) => {
      console.log('DECRYPT PROMISE JUST EXECUTED')

      verify(jwt, JWT_SECRET, options ?? {}, (error, data) => {
        if (error) {
          if (error?.name === 'TokenExpiredError') reject(new Error('jwt expired'))
          else reject(error)
          return
        }
        resolve(data as JwtPayload)
      })
    })
  }

  async encrypt (data: Record<string, any>, options?: SignOptions) {
    return await new Promise((resolve, reject) => {
      console.log('ENCRYPT PROMISE JUST EXECUTED')

      sign(data, JWT_SECRET, options ?? {}, (error, jwt) => {
        if (error) {
          reject(error)
          return
        }
        resolve(jwt)
      })
    })
  }
}
