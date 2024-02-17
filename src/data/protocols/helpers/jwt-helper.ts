import { type SignOptions, type VerifyOptions } from 'jsonwebtoken'

export interface JwtEncryptHelperProtocol {
  encrypt (data: Record<string, any>, options?: JwtEncryptHelperProtocol.Options): Promise<string>
}

export namespace JwtEncryptHelperProtocol {
  export type Options = SignOptions
}

export interface JwtDecryptHelperProtocol {
  decrypt (jwt: string, options?: JwtDecryptHelperProtocol.Options): Promise<JwtDecryptHelperProtocol.Result>

}
export namespace JwtDecryptHelperProtocol {
  export type Options = VerifyOptions
  export type Result = {
    sub: string
    id: string
    iat: number
  }
}
