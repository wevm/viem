import { BaseError } from './base.js'

export type AccountNotFoundErrorType = AccountNotFoundError & {
  name: 'AccountNotFoundError'
}
export class AccountNotFoundError extends BaseError {
  override name = 'AccountNotFoundError'
  constructor({ docsPath }: { docsPath?: string | undefined } = {}) {
    super(
      [
        'Could not find an Account to execute with this Action.',
        'Please provide an Account with the `account` argument on the Action, or by supplying an `account` to the Client.',
      ].join('\n'),
      {
        docsPath,
        docsSlug: 'account',
      },
    )
  }
}

// TODO(aa): still need?
export type AccountTypeNotSupportedErrorType = AccountTypeNotSupportedError & {
  name: 'AccountTypeNotSupportedError'
}
export class AccountTypeNotSupportedError extends BaseError {
  override name = 'AccountTypeNotSupportedError'
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
    })
  }
}
