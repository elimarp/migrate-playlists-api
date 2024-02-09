import { type SessionModel } from '../../models/session'

export interface AccessTokenValidatorProtocol {
  validate(accessToken: string): Promise<SessionModel>
}
