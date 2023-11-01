import { BaseError } from './base.js'

export type AccountNotFoundErrorType = AccountNotFoundError & {
  name: 'AccountNotFoundError'
}
export class AccountNotFoundError extends BaseError {
  override name = 'AccountNotFoundError'
  constructor({ docsPath }: { docsPath?: string } = {}) {
    super(
      [
        'Could not find an Account to execute with this Action.',
        'Please provide an Account with the `account` argument on the Action, or by supplying an `account` to the WalletClient.',
      ].join('\n'),
      {
        docsPath,
        docsSlug: 'account',
      },
    )
  }
}
