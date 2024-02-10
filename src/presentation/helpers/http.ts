import { type HttpResponse } from '../protocols/http'

interface BadRequestResponseParams {
  message?: string
  errors?: {
    path: string
    message: string
    // TODO: param
  }[]
}
interface SuccessResponseParams { message?: string, payload?: any }
interface SuccessListResponseParams {
  message?: string
  payload: any[]
  total: number
  limit: number
  offset: number
}

export const badRequest = ({ message, errors }: BadRequestResponseParams): HttpResponse => ({
  status: 400,
  body: { message: message ?? 'Bad request', errors: errors ?? [] }
})

export const unprocessableEntity = ({ message }: { message?: string }): HttpResponse => ({
  status: 422,
  body: { message: message ?? 'Unprocessable entity' }
})

export const ok = ({ message, payload, ...rest }: SuccessResponseParams | SuccessListResponseParams): HttpResponse => ({
  status: 200,
  body: { message: message ?? 'Ok', payload: payload ?? {}, ...rest }
})

export const serverError = (): HttpResponse => ({
  status: 500,
  body: { message: 'Internal server error' }
})

export const forbidden = ({ message }: { message?: string } = {}): HttpResponse => ({
  status: 403,
  body: { message: message ?? 'forbidden' }
})

export const unauthorized = ({ message }: { message?: string } = {}): HttpResponse => ({
  status: 401,
  body: { message: message ?? 'unauthorized' }
})
