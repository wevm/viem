import type { Address } from 'abitype'
import type { Account } from '../../accounts/types.js'
import type { ReadContractReturnType } from '../../actions/public/readContract.js'
import { readContract } from '../../actions/public/readContract.js'
import type { WatchContractEventParameters } from '../../actions/public/watchContractEvent.js'
import { watchContractEvent } from '../../actions/public/watchContractEvent.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Chain } from '../../types/chain.js'
import type { ExtractAbiItem, GetEventArgs } from '../../types/contract.js'
import type { Log as viem_Log } from '../../types/log.js'
import type { UnionOmit } from '../../types/utils.js'
import * as Abis from '../Abis.js'
import * as Addresses from '../Addresses.js'
import type { ReadParameters } from '../internal/types.js'
import { defineCall } from '../internal/utils.js'

/**
 * Gets the nonce for an account and nonce key.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'tempo.ts/chains'
 * import { Actions } from 'tempo.ts/viem'
 *
 * const client = createClient({
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
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
  return readContract(client, {
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
   * import { tempo } from 'tempo.ts/chains'
   * import { Actions } from 'tempo.ts/viem'
   *
   * const client = createClient({
   *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
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
}

/**
 * @deprecated This function has been deprecated post-AllegroModerato. It will be removed in a future version.
 */
export async function getNonceKeyCount<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: getNonceKeyCount.Parameters,
): Promise<getNonceKeyCount.ReturnValue> {
  const { account, ...rest } = parameters
  return readContract(client, {
    ...rest,
    ...getNonceKeyCount.call({ account }),
  })
}

export namespace getNonceKeyCount {
  export type Parameters = ReadParameters & Args

  export type Args = {
    /** Account address. */
    account: Address
  }

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.nonce,
    'getActiveNonceKeyCount',
    never
  >

  /**
   * Defines a call to the `getNonceKeyCount` function.
   *
   * Can be passed as a parameter to:
   * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate the gas cost of the call
   * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
   * - [`multicall`](https://viem.sh/docs/contract/multicall): execute multiple calls in parallel
   *
   * @example
   * ```ts
   * import { createClient, http } from 'viem'
   * import { tempo } from 'tempo.ts/chains'
   * import { Actions } from 'tempo.ts/viem'
   *
   * const client = createClient({
   *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
   *   transport: http(),
   * })
   *
   * const result = await client.multicall({
   *   contracts: [
   *     Actions.nonce.getNonceKeyCount.call({ account: '0x...' }),
   *     Actions.nonce.getNonceKeyCount.call({ account: '0x...' }),
   *   ],
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { account } = args
    return defineCall({
      address: Addresses.nonceManager,
      abi: Abis.nonce,
      args: [account],
      functionName: 'getActiveNonceKeyCount',
    })
  }
}

/**
 * @deprecated This function has been deprecated post-AllegroModerato. It will be removed in a future version.
 */
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

/**
 * Watches for active key count changed events.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'tempo.ts/chains'
 * import { Actions } from 'tempo.ts/viem'
 *
 * const client = createClient({
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const unwatch = Actions.nonce.watchActiveKeyCountChanged(client, {
 *   onActiveKeyCountChanged: (args, log) => {
 *     console.log('Active key count changed:', args)
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns A function to unsubscribe from the event.
 */
export function watchActiveKeyCountChanged<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: watchActiveKeyCountChanged.Parameters,
) {
  const { onActiveKeyCountChanged, ...rest } = parameters
  return watchContractEvent(client, {
    ...rest,
    address: Addresses.nonceManager,
    abi: Abis.nonce,
    eventName: 'ActiveKeyCountChanged',
    onLogs: (logs) => {
      for (const log of logs) onActiveKeyCountChanged(log.args, log)
    },
    strict: true,
  })
}

export declare namespace watchActiveKeyCountChanged {
  export type Args = GetEventArgs<
    typeof Abis.nonce,
    'ActiveKeyCountChanged',
    { IndexedOnly: false; Required: true }
  >

  export type Log = viem_Log<
    bigint,
    number,
    false,
    ExtractAbiItem<typeof Abis.nonce, 'ActiveKeyCountChanged'>,
    true
  >

  export type Parameters = UnionOmit<
    WatchContractEventParameters<
      typeof Abis.nonce,
      'ActiveKeyCountChanged',
      true
    >,
    'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'
  > & {
    /** Callback to invoke when the active key count changes. */
    onActiveKeyCountChanged: (args: Args, log: Log) => void
  }
}
