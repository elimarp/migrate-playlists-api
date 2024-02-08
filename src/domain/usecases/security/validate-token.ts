import { type SessionModel } from '../../models/session'

// TODO: rename class and interface to AccessTokenValidator
export interface ValidateTokenProtocol {
  validate(accessToken: string): Promise<SessionModel>
}
