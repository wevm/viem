import { BaseError } from './base.js'

export type AccountNotFoundErrorType = AccountNotFoundError & {
  name: 'AccountNotFoundError'
}
export class AccountNotFoundError extends BaseError {
  constructor({ docsPath }: { docsPath?: string | undefined } = {}) {
    super(
      [
        'Could not find an Account to execute with this Action.',
        'Please provide an Account with the `account` argument on the Action, or by supplying an `account` to the Client.',
      ].join('\n'),
      {
        docsPath,
        docsSlug: 'account',
        name: 'AccountNotFoundError',
      },
    )
  }
}

export type AccountTypeNotSupportedErrorType = AccountTypeNotSupportedError & {
  name: 'AccountTypeNotSupportedError'
}
export class AccountTypeNotSupportedError extends BaseError {
  constructor({
    docsPath,
    metaMessages,
    type,
  }: {
    docsPath?: string | undefined
    metaMessages?: string[] | undefined
    type: string
  }) {
    super(`Account type "${type}" is not supported.`, {
      docsPath,
      metaMessages,
      name: 'AccountTypeNotSupportedError',
    })
  }
}
