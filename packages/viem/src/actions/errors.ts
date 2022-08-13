import { BaseError } from '../utils'

export class InvalidProviderError extends BaseError {
  name = 'InvalidProviderError'
  constructor({
    givenProvider,
    expectedProvider,
  }: {
    givenProvider: string
    expectedProvider: string
  }) {
    super({
      details: 'Invalid provider given.',
      humanMessage: [
        `Invalid provider of type "${givenProvider}" provided`,
        `Expected: "${expectedProvider}"`,
      ].join('\n'),
    })
  }
}
