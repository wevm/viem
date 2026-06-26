import { BaseError } from '../errors/base.js'

export type TokenNotFoundErrorType = TokenNotFoundError & {
  name: 'TokenNotFoundError'
}
export class TokenNotFoundError extends BaseError {
  constructor({ chainId }: { chainId: number }) {
    super(`Token is not deployed on chain ${chainId}.`, {
      metaMessages: [
        'The token does not have an address registered for this chain.',
        'Pass an explicit `address` if the token exists on this chain.',
      ],
      name: 'TokenNotFoundError',
    })
  }
}
