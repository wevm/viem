import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'

import type * as Client from '../../core/Client.js'
import { read } from '../../core/actions/contract/read.js'
import { watchEvent } from '../../core/actions/contract/watchEvent.js'
import * as Abis from '../Abis.js'
import * as Addresses from '../Addresses.js'
import type { ReadParameters } from '../internal/types.js'
import { defineCall } from '../internal/utils.js'

/**
 * Gets the nonce for an account and nonce key.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const value = await Actions.nonce.getNonce(client, {
 *   account: '0x…',
 *   nonceKey: 1n,
 * })
 * ```
 */
export async function getNonce(
  client: Client.Client,
  options: getNonce.Options,
): Promise<getNonce.ReturnType> {
  const { account, nonceKey, ...rest } = options
  return (await read(client, {
    ...rest,
    ...getNonce.call({ account, nonceKey }),
  } as never)) as getNonce.ReturnType
}

export namespace getNonce {
  export type Args = {
    /** Account address. */
    account: Address.Address
    /** Nonce key (must be > 0, key 0 is reserved for protocol nonces). */
    nonceKey: bigint
  }

  export type Options = ReadParameters & Args

  export type ReturnType = bigint

  export type ErrorType = read.ErrorType | Errors.GlobalErrorType

  /**
   * Defines a call to the `getNonce` function. Can be passed to any action
   * that accepts a contract call.
   */
  export function call(args: Args) {
    const { account, nonceKey } = args
    return defineCall({
      abi: Abis.nonce,
      address: Addresses.nonceManager,
      args: [account, nonceKey],
      functionName: 'getNonce',
    } as never)
  }
}

/**
 * Watches for incremented nonces, returning a watcher handle.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const watcher = Actions.nonce.watchIncremented(client)
 * watcher.onLogs((logs) => console.log(logs))
 * // later: watcher.off()
 * ```
 */
export function watchIncremented(
  client: Client.Client,
  options: watchIncremented.Options = {},
): watchIncremented.ReturnType {
  return watchEvent(client, {
    ...options,
    abi: Abis.nonce,
    address: Addresses.nonceManager,
    eventName: 'NonceIncremented',
    strict: true,
  } as never) as watchIncremented.ReturnType
}

export declare namespace watchIncremented {
  type Options = Omit<
    watchEvent.Options,
    'abi' | 'address' | 'eventName' | 'strict'
  >

  type ReturnType = watchEvent.Watcher<
    typeof Abis.nonce,
    'NonceIncremented',
    true
  >

  type ErrorType = watchEvent.ErrorType | Errors.GlobalErrorType
}
