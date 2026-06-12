import { BaseError } from './base.js'

export type InvalidDecimalNumberErrorType = InvalidDecimalNumberError & {
  name: 'InvalidDecimalNumberError'
}
export class InvalidDecimalNumberError extends BaseError {
  constructor({ value }: { value: string }) {
    super(`Number \`${value}\` is not a valid decimal number.`, {
      name: 'InvalidDecimalNumberError',
    })
  }
}
