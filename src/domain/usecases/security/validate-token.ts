import { type SessionModel } from '../../models/session'

export interface ValidateTokenProtocol {
  validate(accessToken: string): Promise<SessionModel>
}
