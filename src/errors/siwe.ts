import { BaseError } from './base.js'

export type SiweInvalidMessageFieldErrorType = SiweInvalidMessageFieldError & {
  name: 'SiweInvalidMessageFieldError'
}
export class SiweInvalidMessageFieldError extends BaseError {
  constructor(parameters: {
    docsPath?: string | undefined
    field: string
    metaMessages?: string[] | undefined
  }) {
    const { docsPath, field, metaMessages } = parameters
    super(`Invalid Sign-In with Ethereum message field "${field}".`, {
      docsPath,
      metaMessages,
      name: 'SiweInvalidMessageFieldError',
    })
  }
}
