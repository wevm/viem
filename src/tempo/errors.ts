import type { Address, Hex } from 'ox'

import * as Errors from '../core/Errors.js'

/** Thrown when a vault changes engines during a state read. */
export class GetVaultEngineChangedError extends Errors.BaseError {
  override readonly name = 'Actions.earn.getVault.EngineChangedError'

  constructor(options: { vault: Address.Address }) {
    super(`Engine of vault "${options.vault}" changed while reading.`, {
      metaMessages: [
        'An engine migration raced the snapshot; state from two different engines cannot be mixed.',
        'Retry the read.',
      ],
    })
  }
}

/** Thrown when a private deposit is not found before the timeout. */
export class WaitForPrivateDepositTimeoutError extends Errors.BaseError {
  override readonly name = 'Actions.earn.waitForPrivateDeposit.TimeoutError'

  constructor(options: { actionId: Hex.Hex; gateway: Address.Address }) {
    super(
      `Timed out while waiting for Zone deposit "${options.actionId}" at gateway "${options.gateway}".`,
    )
  }
}

/** Thrown when a private redemption is not found before the timeout. */
export class WaitForPrivateRedeemTimeoutError extends Errors.BaseError {
  override readonly name = 'Actions.earn.waitForPrivateRedeem.TimeoutError'

  constructor(options: { actionId: Hex.Hex; gateway: Address.Address }) {
    super(
      `Timed out while waiting for Zone redemption "${options.actionId}" at gateway "${options.gateway}".`,
    )
  }
}

/** Thrown when a fee token is not a valid TIP-20 fee token. */
export class InvalidFeeTokenError extends Errors.BaseError<
  Errors.BaseError | Error | undefined
> {
  override readonly name = 'InvalidFeeTokenError'

  constructor(options: {
    cause?: Errors.BaseError | Error | undefined
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
export class FeeTokenNotTip20Error extends Errors.BaseError {
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

/** Thrown when a fee token is not denominated in USD. */
export class FeeTokenNotUsdError extends Errors.BaseError {
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
export class FeeTokenPausedError extends Errors.BaseError {
  override readonly name = 'FeeTokenPausedError'

  constructor(options: { token: string }) {
    const { token } = options
    super(`Fee token "${token}" is paused.`, {
      docsPath: '/tempo/transactions#pay-fees-with-stablecoins',
      metaMessages: ['Paused TIP-20 tokens cannot be used as fee tokens.'],
    })
  }
}
