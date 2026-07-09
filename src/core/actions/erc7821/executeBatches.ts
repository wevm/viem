import type { Narrow } from 'abitype'
import type { Address, Errors, Hex } from 'ox'
import { Execute } from 'ox/erc7821'

import type * as Chain from '../../Chain.js'
import type * as Client from '../../Client.js'
import type { Batches, Call } from '../internal/calls.js'
import { send } from '../transaction/send.js'
import { ExecuteUnsupportedError } from './execute.js'
import { getExecuteError, normalizeCalls } from './internal.js'
import { supportsExecutionMode } from './supportsExecutionMode.js'

/**
 * Executes batches of call(s) using "batch of batches" mode on an
 * [ERC-7821-compatible contract](https://eips.ethereum.org/EIPS/eip-7821).
 *
 * @example
 * ```ts
 * import { Account, Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { Value } from 'viem/utils'
 *
 * const account = Account.fromPrivateKey('0x…')
 *
 * const client = Client.create({
 *   account,
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const hash = await Actions.erc7821.executeBatches(client, {
 *   address: account.address,
 *   batches: [
 *     {
 *       calls: [
 *         {
 *           to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *           value: Value.fromEther('1'),
 *         },
 *       ],
 *     },
 *     {
 *       calls: [
 *         { data: '0xdeadbeef', to: '0xcb98643b8786950F0461f3B0edf99D88F274574D' },
 *       ],
 *       opData: '0xcafebabe',
 *     },
 *   ],
 * })
 * ```
 */
export async function executeBatches<
  const batches extends readonly executeBatches.Batch[],
  chain extends Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: executeBatches.Options<batches, chain>,
): Promise<executeBatches.ReturnType> {
  const { address, batches, ...rest } = options as executeBatches.Options

  // When delegating via an authorization list, the delegate contract holds
  // the code: check mode support against it instead of the (not yet
  // delegated) account.
  const target = rest.authorizationList?.[0]?.address ?? address

  const supported = await supportsExecutionMode(client, {
    address: target,
    mode: 'batchOfBatches',
  })
  if (!supported) throw new ExecuteUnsupportedError()

  const account = rest.account ?? client.account
  const sender = account
    ? typeof account === 'string'
      ? account
      : account.address
    : undefined

  const batches_ = (batches as readonly executeBatches.Batch[]).map(
    (batch) => ({
      calls: normalizeCalls(batch.calls as readonly Call[]),
      ...(batch.opData ? { opData: batch.opData } : {}),
    }),
  )

  try {
    return await send(client, {
      ...rest,
      data: Execute.encodeBatchOfBatchesData(batches_),
      to: address,
    } as send.Options<chain>)
  } catch (error) {
    const calls = (batches as readonly executeBatches.Batch[]).flatMap(
      (batch) => batch.calls as readonly Call[],
    )
    throw getExecuteError(error as Error, { calls, sender })
  }
}

export declare namespace executeBatches {
  type Batch = { calls: readonly unknown[]; opData?: Hex.Hex | undefined }

  type Options<
    batches extends readonly Batch[] = readonly Batch[],
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
  > = Omit<send.Options<chain>, 'data' | 'to' | 'value'> & {
    /** Address of the contract that executes the calls. */
    address: Address.Address
    /** Batches to execute. */
    batches: Batches<Narrow<batches>, { opData?: Hex.Hex | undefined }>
  }

  type ReturnType = send.ReturnType

  type ErrorType =
    | ExecuteUnsupportedError
    | getExecuteError.ErrorType
    | send.ErrorType
    | supportsExecutionMode.ErrorType
    | Errors.GlobalErrorType
}
