import { type SessionModel, type CreateSessionModel } from '../../../../domain/models/session'

export interface CreateSessionRepository {
  create(params: CreateSessionRepository.Params): Promise<CreateSessionRepository.Result>
}

export namespace CreateSessionRepository {
  export type Params = CreateSessionModel
  export type Result = SessionModel
}
