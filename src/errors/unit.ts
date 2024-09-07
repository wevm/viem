import { BaseError } from './base.js'

export type ScientificNotationUnsupportedErrorType =
  ScientificNotationUnsupportedError & {
    name: 'ScientificNotationUnsupportedError'
  }
export class ScientificNotationUnsupportedError extends BaseError {
  constructor({ value }: { value: string }) {
    super(
      `Scientific notation is not supported for unit parsing (value: \`${value}\`). Please provide a decimal number.`,
      { name: 'ScientificNotationUnsupportedError' },
    )
  }
}
