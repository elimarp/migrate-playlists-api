export class MissingParamError extends Error {
  constructor (param: string) {
    super(`Missing '${param}'`)
  }
}

export class MinimumValueError extends Error {
  constructor (param: string, min: number) {
    super(`Minimum '${param}' is ${min}`)
  }
}

export class MaximumValueError extends Error {
  constructor (param: string, max: number) {
    super(`Maximum '${param}' is ${max}`)
  }
}
