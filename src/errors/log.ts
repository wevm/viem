import { BaseError } from './base'

export class FilterTypeNotSupportedError extends BaseError {
  name = 'FilterTypeNotSupportedError'
  constructor(type: string) {
    super(`Filter type "${type}" is not supported.`)
  }
}
