import * as AbiEvent from 'ox/AbiEvent'
import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
import type * as Hex from 'ox/Hex'
import * as Hex_ from 'ox/Hex'
import type * as Log from 'ox/Log'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import type { simulate as simulateContract } from '../../../core/actions/contract/simulate.js'
import { write } from '../../../core/actions/contract/write.js'
import type { writeSync } from '../../../core/actions/contract/writeSync.js'
import {
  type AmountInput,
  toBaseUnits,
} from '../../../core/actions/token/internal.js'
import * as Abis from '../../Abis.js'
import type { TokenParameter, WriteParameters } from '../../internal/types.js'
import {
  type CallParameters,
  defineCall,
  dispatchWrite,
  estimateWrite,
  pickWriteParameters,
  resolveCallParameters,
  resolveToken,
  simulateWrite,
} from '../../internal/utils.js'

/**
 * Mints TIP-20 tokens to an address.
 *
 * @example
 * ```ts
 * import { Account, Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromSecp256k1('0x…'),
 *   transport: http(),
 * })
 *
 * const hash = await Actions.token.mint(client, {
 *   amount: 100n,
 *   to: '0x…',
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function mint<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: mint.Options,
): Promise<mint.ReturnType> {
  return mint.inner(write, client, options)
}

export namespace mint {
  export type Args = {
    /** Amount of tokens to mint, in base units or formatted decimal form. */
    amount: AmountInput
    /** Memo to include in the mint. */
    memo?: Hex.Hex | undefined
    /** Address to mint tokens to. */
    to: Address.Address
  } & TokenParameter
  export type Options = WriteParameters & Args
  export type ReturnType = write.ReturnType
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /** @internal */
  export async function inner<
    action extends typeof write | typeof writeSync,
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    action: action,
    client: Client.Client<chain, account>,
    options: Options,
  ): Promise<dispatchWrite.ReturnType<action>> {
    return dispatchWrite(action, client, {
      ...options,
      ...mint.call(client, options),
    })
  }

  /**
   * Defines a call to the `mint` or `mintWithMemo` function.
   *
   * @param parameters - Client (optional), followed by the call arguments.
   * @returns The call.
   */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [client, args] = resolveCallParameters(parameters)
    const { amount, memo, to, token } = args
    const { address, decimals } = resolveToken(client, { token })
    const value = toBaseUnits(amount, decimals)
    const callArgs = memo
      ? ({
          functionName: 'mintWithMemo',
          args: [to, value, Hex_.padLeft(memo, 32)],
        } as const)
      : ({ functionName: 'mint', args: [to, value] } as const)
    return defineCall({ abi: Abis.tip20, address, ...callArgs })
  }

  /** Estimates the gas required to mint tokens. */
  export async function estimateGas<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(client: Client.Client<chain, account>, options: Options): Promise<bigint> {
    return estimateWrite(client, {
      ...pickWriteParameters(options),
      ...mint.call(client, options),
    })
  }

  /** Simulates minting tokens. */
  export async function simulate<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: Options,
  ): Promise<
    simulateContract.ReturnType<typeof Abis.tip20, 'mint' | 'mintWithMemo'>
  > {
    return simulateWrite(client, {
      ...pickWriteParameters(options),
      ...mint.call(client, options),
    })
  }

  /** Extracts the `Mint` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip20, logs, {
      eventName: 'Mint',
      strict: true,
    })
    if (!log) throw new Error('`Mint` event not found.')
    return log
  }
}
