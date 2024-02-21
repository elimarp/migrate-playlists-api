import { type SessionModel, type SessionServiceModel } from '../../../../domain/models/session'

export interface AddSessionServiceRepository {
  addService(sessionId: string, service: SessionServiceModel): Promise<SessionModel>
}
