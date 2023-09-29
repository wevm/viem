import { BaseError } from './base.js'

export type FilterTypeNotSupportedErrorType = FilterTypeNotSupportedError & {
  name: 'FilterTypeNotSupportedError'
}
export class FilterTypeNotSupportedError extends BaseError {
  override name = 'FilterTypeNotSupportedError'
  constructor(type: string) {
    super(`Filter type "${type}" is not supported.`)
  }
}
