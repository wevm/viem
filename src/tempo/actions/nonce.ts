import type { Address } from 'abitype'
import type { Account } from '../../accounts/types.js'
import type { ReadContractReturnType } from '../../actions/public/readContract.js'
import { readContract } from '../../actions/public/readContract.js'
import type { WatchContractEventParameters } from '../../actions/public/watchContractEvent.js'
import { watchContractEvent } from '../../actions/public/watchContractEvent.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { BaseErrorType } from '../../errors/base.js'
import type { Chain } from '../../types/chain.js'
import type { ExtractAbiItem, GetEventArgs } from '../../types/contract.js'
import type { Log as viem_Log } from '../../types/log.js'
import type { UnionOmit } from '../../types/utils.js'
import * as Abis from '../Abis.js'
import * as Addresses from '../Addresses.js'
import type * as Errors from '../errors.js'
import { TempoExecutionError } from '../errors.js'
import {
  formatTime,
  type Resolvers,
  withExecutionError,
} from '../internal/errors.js'
import type { ReadParameters } from '../internal/types.js'
import { defineCall } from '../internal/utils.js'

/**
 * Gets the nonce for an account and nonce key.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const nonce = await Actions.nonce.getNonce(client, {
 *   account: '0x...',
 *   nonceKey: 1n,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The nonce value.
 */
export async function getNonce<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: getNonce.Parameters,
): Promise<getNonce.ReturnValue> {
  const { account, nonceKey, ...rest } = parameters
  return withExecutionError(readContract)(client, {
    ...rest,
    ...getNonce.call({ account, nonceKey }),
  })
}

export namespace getNonce {
  export type Parameters = ReadParameters & Args

  export type Args = {
    /** Account address. */
    account: Address
    /** Nonce key (must be > 0, key 0 is reserved for protocol nonces). */
    nonceKey: bigint
  }

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.nonce,
    'getNonce',
    never
  >

  /**
   * Defines a call to the `getNonce` function.
   *
   * Can be passed as a parameter to:
   * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate the gas cost of the call
   * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
   * - [`multicall`](https://viem.sh/docs/contract/multicall): execute multiple calls in parallel
   *
   * @example
   * ```ts
   * import { createClient, http } from 'viem'
   * import { tempo } from 'viem/chains'
   * import { Actions } from 'viem/tempo'
   *
   * const client = createClient({
   *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' }),
   *   transport: http(),
   * })
   *
   * const result = await client.multicall({
   *   contracts: [
   *     Actions.nonce.getNonce.call({ account: '0x...', nonceKey: 1n }),
   *     Actions.nonce.getNonce.call({ account: '0x...', nonceKey: 2n }),
   *   ],
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { account, nonceKey } = args
    return defineCall({
      address: Addresses.nonceManager,
      abi: Abis.nonce,
      args: [account, nonceKey],
      functionName: 'getNonce',
    })
  }

  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType
}

export function watchNonceIncremented<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: watchNonceIncremented.Parameters,
) {
  const { onNonceIncremented, ...rest } = parameters
  return watchContractEvent(client, {
    ...rest,
    address: Addresses.nonceManager,
    abi: Abis.nonce,
    eventName: 'NonceIncremented',
    onLogs: (logs) => {
      for (const log of logs) onNonceIncremented(log.args, log)
    },
    strict: true,
  })
}

export declare namespace watchNonceIncremented {
  export type Args = GetEventArgs<
    typeof Abis.nonce,
    'NonceIncremented',
    { IndexedOnly: false; Required: true }
  >

  export type Log = viem_Log<
    bigint,
    number,
    false,
    ExtractAbiItem<typeof Abis.nonce, 'NonceIncremented'>,
    true
  >

  export type Parameters = UnionOmit<
    WatchContractEventParameters<typeof Abis.nonce, 'NonceIncremented', true>,
    'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'
  > & {
    /** Callback to invoke when a nonce is incremented. */
    onNonceIncremented: (args: Args, log: Log) => void
  }
}

// Errors

/** Errors this module throws for decoded Tempo errors. Narrow with `error.name`. */
export type ExecutionErrorType =
  | NonceInvalidExpiryErrorType
  | NonceReplayErrorType

/** `NonceReplayError` with a literal `name`, for narrowing. */
export type NonceReplayErrorType = NonceReplayError & {
  name: 'NonceReplayError'
}

/** Thrown when an expiring nonce transaction was already submitted. */
export class NonceReplayError extends TempoExecutionError<
  Errors.TempoExecutionError.Decoded<'ExpiringNonceReplay'>
> {
  /** Transaction expiry (Unix seconds), when known. */
  validBefore: number | bigint | undefined

  constructor(
    parameters: Errors.TempoExecutionError.Parameters & {
      validBefore?: number | bigint | undefined
    },
  ) {
    super(parameters, {
      details: { 'valid before': formatTime(parameters.validBefore) },
      name: 'NonceReplayError',
    })
    this.validBefore = parameters.validBefore
  }
}

/** `NonceInvalidExpiryError` with a literal `name`, for narrowing. */
export type NonceInvalidExpiryErrorType = NonceInvalidExpiryError & {
  name: 'NonceInvalidExpiryError'
}

/** Thrown when an expiring nonce transaction's `validBefore` is in the past or too far ahead. */
export class NonceInvalidExpiryError extends TempoExecutionError<
  Errors.TempoExecutionError.Decoded<'InvalidExpiringNonceExpiry'>
> {
  /** Current time (Unix seconds) when the error was handled. */
  now: number
  /** Transaction expiry (Unix seconds), when known. */
  validBefore: number | bigint | undefined

  constructor(
    parameters: Errors.TempoExecutionError.Parameters & {
      validBefore?: number | bigint | undefined
    },
  ) {
    const now = Math.floor(Date.now() / 1000)
    super(parameters, {
      details: {
        'valid before': formatTime(parameters.validBefore),
        now: formatTime(now),
      },
      name: 'NonceInvalidExpiryError',
    })
    this.now = now
    this.validBefore = parameters.validBefore
  }
}

/** @internal */
export const errorResolvers: Resolvers = {
  'ExpiringNonceReplay()': ({ base, parameters }) =>
    new NonceReplayError({ ...base, validBefore: parameters.validBefore }),
  'InvalidExpiringNonceExpiry()': ({ base, parameters }) =>
    new NonceInvalidExpiryError({
      ...base,
      validBefore: parameters.validBefore,
    }),
}
