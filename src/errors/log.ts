import { BaseError } from './base.js'

export class FilterTypeNotSupportedError extends BaseError {
  override name = 'FilterTypeNotSupportedError'
  constructor(type: string) {
    super(`Filter type "${type}" is not supported.`)
  }
}
