import { type SessionModel } from '../../../domain/models/session'
import { type JwtHelper } from '../../../infra/helpers/jwt-helper'
import { type GetSessionRepository } from '../../protocols/db/session/get-session-repository'

export interface ValidateToken {
  validate(accessToken: string): Promise<SessionModel>
}

export class ValidateToken implements ValidateToken {
  constructor (
    private readonly jwtHelper: JwtHelper,
    private readonly getSessionRepository: GetSessionRepository
  ) {}

  async validate (accessToken: string): Promise<SessionModel> {
    if (typeof accessToken !== 'string') throw new Error('invalid accessToken')

    const [bearer, token] = accessToken.split(' ')
    if (bearer !== 'Bearer') throw new Error('accessToken is not Bearer type')

    const data = await this.jwtHelper.decrypt(token)

    const session = await this.getSessionRepository.getSession(data.id)
    if (!session) throw new Error('session not found')

    return session
  }
}
