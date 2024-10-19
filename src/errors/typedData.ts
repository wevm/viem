import { BaseError } from './base.js'

export type InvalidStructTypeErrorType = InvalidStructTypeError & {
  name: 'InvalidStructTypeError'
}
export class InvalidStructTypeError extends BaseError {
  constructor({ type }: { type: string }) {
    super(`Struct type "${type}" is invalid.`, {
      metaMessages: ['Struct type must not be a Solidity type.'],
      name: 'InvalidStructTypeError',
    })
  }
}
