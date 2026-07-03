import { BaseError } from '../core/Errors.js'

/** Thrown when a fee token is not a valid TIP-20 fee token. */
export class InvalidFeeTokenError extends BaseError<BaseError | Error> {
  override readonly name = 'InvalidFeeTokenError'

  constructor(options: {
    cause?: BaseError | Error | undefined
    token: string
  }) {
    const { cause, token } = options
    super(`Fee token "${token}" is invalid.`, {
      cause,
      docsPath: '/tempo/transactions#pay-fees-with-stablecoins',
      metaMessages: [
        'Fee tokens must be unpaused USD-denominated TIP-20 tokens.',
        'Use `client.fee.validateToken({ token })` before sending transactions or setting fee preferences.',
      ],
    })
  }
}

/** Thrown when a fee token is not a TIP-20 token. */
export class FeeTokenNotTip20Error extends BaseError {
  override readonly name = 'FeeTokenNotTip20Error'

  constructor(options: { token: string }) {
    const { token } = options
    super(`Fee token "${token}" is not a TIP-20 token.`, {
      docsPath: '/tempo/transactions#pay-fees-with-stablecoins',
      metaMessages: [
        'Fee tokens must be TIP-20 token addresses or token IDs.',
        'TIP-20 token addresses use the `0x20c0...` address prefix.',
      ],
    })
  }
}

/** Thrown when a fee token is not USD-denominated. */
export class FeeTokenNotUsdError extends BaseError {
  override readonly name = 'FeeTokenNotUsdError'

  constructor(options: { currency: string; token: string }) {
    const { currency, token } = options
    super(`Fee token "${token}" is denominated in "${currency}", not "USD".`, {
      docsPath: '/tempo/transactions#pay-fees-with-stablecoins',
      metaMessages: [
        'Only USD-denominated TIP-20 tokens can be used as fee tokens.',
      ],
    })
  }
}

/** Thrown when a fee token is paused. */
export class FeeTokenPausedError extends BaseError {
  override readonly name = 'FeeTokenPausedError'

  constructor(options: { token: string }) {
    const { token } = options
    super(`Fee token "${token}" is paused.`, {
      docsPath: '/tempo/transactions#pay-fees-with-stablecoins',
      metaMessages: ['Paused TIP-20 tokens cannot be used as fee tokens.'],
    })
  }
}
