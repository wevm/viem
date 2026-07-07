import type { Abi } from 'abitype'
import * as AbiEvent from 'ox/AbiEvent'
import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
import type * as Log from 'ox/Log'

import type * as Account from '../../Account.js'
import type * as Chain from '../../Chain.js'
import type * as Client from '../../Client.js'
import type * as Token from '../../Token.js'
import type * as Transport from '../../Transport.js'
import type { simulate as simulateContract } from '../contract/simulate.js'
import { write } from '../contract/write.js'
import type { writeSync } from '../contract/writeSync.js'
import { erc20Abi } from './internal/abi.js'
import {
  type AmountInput,
  defineCall,
  dispatchWrite,
  estimateWrite,
  pickWriteParameters,
  resolveToken,
  simulateWrite,
  toBaseUnits,
  type TokenParameter,
  type WriteParameters,
} from './internal.js'

/**
 * Approves a spender to transfer ERC-20 tokens on behalf of the caller.
 *
 * @example
 * ```ts
 * import { Account, Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   account: Account.fromPrivateKey('0x…'),
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const hash = await Actions.token.approve(client, {
 *   amount: 100000000n,
 *   spender: '0x…',
 *   token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function approve<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
  tokens extends Token.Tokens | undefined = undefined,
>(
  client: Client.Client<chain, account, Transport.Transport, tokens>,
  options: approve.Options<chain, account, tokens>,
): Promise<approve.ReturnType> {
  return approve.inner(write, client, options)
}

export namespace approve {
  export type Args<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
    tokens extends Token.Tokens | undefined = Token.Tokens | undefined,
  > = {
    /** Amount to approve in base units, or as a formatted helper. */
    amount: AmountInput
    /** Address of the spender. */
    spender: Address.Address
  } & TokenParameter<chain, tokens>
  export type Options<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
    account extends Account.Account | undefined = Account.Account | undefined,
    tokens extends Token.Tokens | undefined = Token.Tokens | undefined,
  > = WriteParameters<chain, account> & Args<chain, tokens>
  export type ReturnType = write.ReturnType
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /** @internal */
  export async function inner<
    action extends typeof write | typeof writeSync,
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
    tokens extends Token.Tokens | undefined = undefined,
  >(
    action: action,
    client: Client.Client<chain, account, Transport.Transport, tokens>,
    options: approve.Options<chain, account, tokens>,
  ): Promise<dispatchWrite.ReturnType<action>> {
    return dispatchWrite(action, client, {
      ...options,
      ...approve.call(client, options),
    })
  }

  /**
   * Defines a call to the `approve` function.
   *
   * Can be passed to any action that accepts a contract call. The token is
   * selected by `token`, which is either a token symbol (resolved from the
   * client's `tokens` array) or a contract `address`; `amount.decimals` is
   * inferred from declared client tokens when omitted.
   *
   * @param client - Client.
   * @param options - Options.
   * @returns The call.
   */
  export function call<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
    tokens extends Token.Tokens | undefined = undefined,
  >(
    client: Client.Client<chain, account, Transport.Transport, tokens>,
    options: approve.Args<chain, tokens>,
  ) {
    return defineCall(getCall(client, options as approve.Args))
  }

  /**
   * Estimates the gas required to approve a spender. `amount.decimals` is
   * inferred from declared client tokens when omitted.
   *
   * @param client - Client.
   * @param options - Options.
   * @returns The gas estimate.
   */
  export async function estimateGas<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
    tokens extends Token.Tokens | undefined = undefined,
  >(
    client: Client.Client<chain, account, Transport.Transport, tokens>,
    options: approve.Options<chain, account, tokens>,
  ): Promise<bigint> {
    return estimateWrite(client, {
      ...pickWriteParameters(options),
      ...approve.call(client, options),
    })
  }

  /**
   * Simulates an approval of a spender. `amount.decimals` is inferred from
   * declared client tokens when omitted.
   *
   * @param client - Client.
   * @param options - Options.
   * @returns The simulation result and write request.
   */
  export async function simulate<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
    tokens extends Token.Tokens | undefined = undefined,
  >(
    client: Client.Client<chain, account, Transport.Transport, tokens>,
    options: approve.Options<chain, account, tokens>,
  ): Promise<simulateContract.ReturnType<typeof erc20Abi, 'approve'>> {
    return simulateWrite(client, {
      ...pickWriteParameters(options),
      ...approve.call(client, options),
    })
  }

  /**
   * Extracts the `Approval` event from logs.
   *
   * @param logs - The logs.
   * @returns The `Approval` event.
   */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(erc20Abi, logs, {
      eventName: 'Approval',
      strict: true,
    })
    if (!log) throw new Error('`Approval` event not found.')
    return log
  }
}

/** Builds the underlying `approve` contract call. @internal */
function getCall(client: Client.Client, options: approve.Args) {
  const { amount, spender, token } = options
  const { address, decimals } = resolveToken(client, { token })
  return {
    abi: erc20Abi as Abi,
    address,
    args: [spender, toBaseUnits(amount, decimals)],
    functionName: 'approve',
  } as const
}
