import type { Narrow } from 'abitype'
import type { Address, Errors, Hex } from 'ox'
import { Execute } from 'ox/erc7821'

import type * as Chain from '../../Chain.js'
import type * as Client from '../../Client.js'
import { BaseError } from '../../Errors.js'
import type { Call, Calls } from '../internal/calls.js'
import { send } from '../transaction/send.js'
import { getExecuteError, normalizeCalls } from './internal.js'
import { supportsExecutionMode } from './supportsExecutionMode.js'

/**
 * Executes call(s) using the `execute` function on an
 * [ERC-7821-compatible contract](https://eips.ethereum.org/EIPS/eip-7821).
 *
 * @example
 * ```ts
 * import { Account, Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const account = Account.fromPrivateKey('0x…')
 *
 * const client = Client.create({
 *   account,
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const hash = await Actions.erc7821.execute(client, {
 *   address: account.address,
 *   calls: [
 *     { data: '0xdeadbeef', to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8' },
 *     { to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', value: 69420n },
 *   ],
 * })
 * ```
 */
export async function execute<
  const calls extends readonly unknown[],
  chain extends Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: execute.Options<calls, chain>,
): Promise<execute.ReturnType> {
  const { address, calls, opData, ...rest } = options as execute.Options

  // When delegating via an authorization list, the delegate contract holds
  // the code: check mode support against it instead of the (not yet
  // delegated) account.
  const target = rest.authorizationList?.[0]?.address ?? address
  const mode = opData ? 'opData' : 'default'

  const supported = await supportsExecutionMode(client, {
    address: target,
    mode,
  })
  if (!supported) throw new ExecuteUnsupportedError()

  const account = rest.account ?? client.account
  const sender = account
    ? typeof account === 'string'
      ? account
      : account.address
    : undefined

  try {
    return await send(client, {
      ...rest,
      data: Execute.encodeData(normalizeCalls(calls as readonly Call[]), {
        opData,
      }),
      to: address,
    } as send.Options<chain>)
  } catch (error) {
    throw getExecuteError(error as Error, {
      calls: calls as readonly Call[],
      sender,
    })
  }
}

export declare namespace execute {
  type Options<
    calls extends readonly unknown[] = readonly unknown[],
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
  > = Omit<send.Options<chain>, 'data' | 'to' | 'value'> & {
    /** Address of the contract that executes the calls. */
    address: Address.Address
    /** Calls to execute. */
    calls: Calls<Narrow<calls>>
    /** Additional data to include for execution. */
    opData?: Hex.Hex | undefined
  }

  type ReturnType = send.ReturnType

  type ErrorType =
    | ExecuteUnsupportedError
    | getExecuteError.ErrorType
    | send.ErrorType
    | supportsExecutionMode.ErrorType
    | Errors.GlobalErrorType
}

/** Thrown when the target contract does not support ERC-7821 execution. */
export class ExecuteUnsupportedError extends BaseError {
  override readonly name = 'Actions.erc7821.ExecuteUnsupportedError'

  constructor() {
    super('ERC-7821 execution is not supported.')
  }
}
