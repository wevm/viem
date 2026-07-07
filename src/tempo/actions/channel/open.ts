import * as AbiEvent from 'ox/AbiEvent'
import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
import * as Hex from 'ox/Hex'
import * as TokenId from 'ox/tempo/TokenId'
import type * as Log from 'ox/Log'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import type { simulate as simulateContract } from '../../../core/actions/contract/simulate.js'
import { write } from '../../../core/actions/contract/write.js'
import type { writeSync } from '../../../core/actions/contract/writeSync.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'
import type { WriteParameters } from '../../internal/types.js'
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
 * Opens and funds a TIP-20 channel reserve channel.
 */
export async function open<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: open.Options,
): Promise<open.ReturnType> {
  return open.inner(write, client, options)
}

export namespace open {
  export type Args = {
    /** Optional signer for vouchers. Zero means `payer` signs. */
    authorizedSigner?: Address.Address | undefined
    /** Amount of TIP-20 token to deposit. */
    deposit: bigint
    /** Optional relayer allowed to submit `settle` for the payee. */
    operator?: Address.Address | undefined
    /** Account that receives settled voucher payments. */
    payee: Address.Address
    /** User-supplied salt to distinguish otherwise identical channels. */
    salt?: Hex.Hex | undefined
    /** TIP-20 token address or ID held by the channel. */
    token: TokenId.TokenIdOrAddress
  }
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
    options: open.Options,
  ): Promise<dispatchWrite.ReturnType<action>> {
    return dispatchWrite(action, client, {
      ...options,
      ...open.call(client, options),
    })
  }

  /** Defines a call to the `open` function. */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [client, args] = resolveCallParameters(parameters)
    const {
      authorizedSigner = '0x0000000000000000000000000000000000000000',
      deposit,
      operator = '0x0000000000000000000000000000000000000000',
      payee,
      salt = Hex.random(32),
      token,
    } = args
    return defineCall({
      abi: Abis.tip20ChannelReserve,
      address: Addresses.tip20ChannelReserve,
      args: [
        payee,
        operator,
        resolveToken(client, { token }).address,
        deposit,
        salt,
        authorizedSigner,
      ],
      functionName: 'open',
    })
  }

  /** Estimates the gas required. */
  export async function estimateGas<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: open.Options,
  ): Promise<bigint> {
    return estimateWrite(client, {
      ...pickWriteParameters(options),
      ...open.call(client, options),
    })
  }

  /** Simulates the call. */
  export async function simulate<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: open.Options,
  ): Promise<
    simulateContract.ReturnType<typeof Abis.tip20ChannelReserve, 'open'>
  > {
    return simulateWrite(client, {
      ...pickWriteParameters(options),
      ...open.call(client, options),
    })
  }

  /** Extracts the `ChannelOpened` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip20ChannelReserve, logs, {
      eventName: 'ChannelOpened',
      strict: true,
    })
    if (!log) throw new Error('`ChannelOpened` event not found.')
    return log
  }
}
