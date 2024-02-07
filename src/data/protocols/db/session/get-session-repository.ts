import { type SessionModel } from '../../../../domain/models/session'

export interface GetSessionRepository {
  getSession(sessionId: string): Promise<SessionModel | null>
}
