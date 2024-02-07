import { type HttpResponse } from '../protocols/http'

interface BadRequestParams { message?: string, errors?: any[] }
interface SuccessParams { message?: string, payload?: any[] }

export const badRequest = ({ message, errors }: BadRequestParams): HttpResponse => ({
  status: 400,
  body: { message: message ?? 'Bad request', errors: errors ?? [] }
})

export const ok = ({ message, payload }: SuccessParams): HttpResponse => ({
  status: 200,
  body: { message: message ?? 'Ok', payload: payload ?? {} }
})

export const serverError = (): HttpResponse => ({
  status: 500,
  body: { message: 'Internal server error' }
})

export const forbidden = (message?: string): HttpResponse => ({
  status: 403,
  body: { message: message ?? 'forbidden' }
})

export const unauthorized = (message?: string): HttpResponse => ({
  status: 401,
  body: { message: message ?? 'unauthorized' }
})
