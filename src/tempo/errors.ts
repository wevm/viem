import type { Address } from 'abitype'
import { BaseError } from '../errors/base.js'

export type GetVaultEngineChangedErrorType = GetVaultEngineChangedError & {
  name: 'GetVaultEngineChangedError'
}

export class GetVaultEngineChangedError extends BaseError {
  constructor({ vault }: { vault: Address }) {
    super(`Engine of vault "${vault}" changed while reading.`, {
      metaMessages: [
        'An engine migration raced the snapshot; state from two different engines cannot be mixed.',
        'Retry the read.',
      ],
      name: 'GetVaultEngineChangedError',
    })
  }
}

export type WaitForDepositStatusTimeoutErrorType =
  WaitForDepositStatusTimeoutError & {
    name: 'WaitForDepositStatusTimeoutError'
  }

export class WaitForDepositStatusTimeoutError extends BaseError {
  constructor({ tempoBlockNumber }: { tempoBlockNumber: bigint }) {
    super(
      `Timed out while waiting for deposits from Tempo block "${tempoBlockNumber}" to be processed.`,
      { name: 'WaitForDepositStatusTimeoutError' },
    )
  }
}

export type InvalidFeeTokenErrorType = InvalidFeeTokenError & {
  name: 'InvalidFeeTokenError'
}
export class InvalidFeeTokenError extends BaseError {
  constructor({
    cause,
    token,
  }: {
    cause?: BaseError | Error | undefined
    token: string
  }) {
    super(`Fee token "${token}" is invalid.`, {
      cause,
      docsPath: '/tempo/transactions',
      docsSlug: 'pay-fees-with-stablecoins',
      metaMessages: [
        'Fee tokens must be unpaused USD-denominated TIP-20 tokens.',
        'Use `client.fee.validateToken({ token })` before sending transactions or setting fee preferences.',
      ],
      name: 'InvalidFeeTokenError',
    })
  }
}

export type FeeTokenNotTip20ErrorType = FeeTokenNotTip20Error & {
  name: 'FeeTokenNotTip20Error'
}
export class FeeTokenNotTip20Error extends BaseError {
  constructor({ token }: { token: string }) {
    super(`Fee token "${token}" is not a TIP-20 token.`, {
      docsPath: '/tempo/transactions',
      docsSlug: 'pay-fees-with-stablecoins',
      metaMessages: [
        'Fee tokens must be TIP-20 token addresses or token IDs.',
        'TIP-20 token addresses use the `0x20c0...` address prefix.',
      ],
      name: 'FeeTokenNotTip20Error',
    })
  }
}

export type FeeTokenNotUsdErrorType = FeeTokenNotUsdError & {
  name: 'FeeTokenNotUsdError'
}
export class FeeTokenNotUsdError extends BaseError {
  constructor({
    currency,
    token,
  }: {
    currency: string
    token: string
  }) {
    super(`Fee token "${token}" is denominated in "${currency}", not "USD".`, {
      docsPath: '/tempo/transactions',
      docsSlug: 'pay-fees-with-stablecoins',
      metaMessages: [
        'Only USD-denominated TIP-20 tokens can be used as fee tokens.',
      ],
      name: 'FeeTokenNotUsdError',
    })
  }
}

export type FeeTokenPausedErrorType = FeeTokenPausedError & {
  name: 'FeeTokenPausedError'
}
export class FeeTokenPausedError extends BaseError {
  constructor({ token }: { token: string }) {
    super(`Fee token "${token}" is paused.`, {
      docsPath: '/tempo/transactions',
      docsSlug: 'pay-fees-with-stablecoins',
      metaMessages: ['Paused TIP-20 tokens cannot be used as fee tokens.'],
      name: 'FeeTokenPausedError',
    })
  }
}
