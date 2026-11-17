import { AbiEvent, Address, Hex } from 'ox'
import type { Errors } from 'ox'
import { AccountConfig } from 'ox/tempo'

import * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import type { simulate as simulateContract } from '../../../core/actions/contract/simulate.js'
import { write } from '../../../core/actions/contract/write.js'
import type { writeSync } from '../../../core/actions/contract/writeSync.js'
import * as Abis from '../../Abis.js'
import type * as TempoAccount from '../../Account.js'
import * as Addresses from '../../Addresses.js'
import type { WriteParameters } from '../../internal/types.js'
import {
  type CallParameters,
  defineCall,
  dispatchWrite,
  estimateWrite,
  pickWriteParameters,
  resolveCallParameters,
  simulateWrite,
} from '../../internal/utils.js'
import type * as TempoErrors from '../../errors.js'
import { getConfigCommitment } from '../accounts/getConfigCommitment.js'

const zeroAddress = '0x0000000000000000000000000000000000000000'
const zeroHash =
  '0x0000000000000000000000000000000000000000000000000000000000000000'

/**
 * Opens and funds a TIP-20 channel reserve channel.
 *
 * When `salt` is omitted and the voucher signer (`authorizedSigner`, else the
 * account) is a configurable account (TIP-1107), or an access key of one, with
 * a nonzero configuration commitment, the salt defaults to that commitment, as
 * the channel reserve requires from T15 (TIP-1166). Otherwise it defaults to a
 * random salt. Pass `salt` from `channel.getOpenSalt` when the signer is a
 * configurable account known only by address.
 *
 * An unregistered configurable account that sends the open and signs its own
 * vouchers registers (TIP-1107) in the same transaction, before the channel
 * reserve runs, so the salt then defaults to the commitment of its local
 * version-zero config instead.
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
    /** TIP-20 token address held by the channel. */
    token: Address.Address
  }
  export type Options = WriteParameters &
    Omit<Args, 'authorizedSigner' | 'salt'> & {
      /**
       * Optional signer for vouchers. Zero means `payer` signs. Pass a
       * configurable account to default `salt` to its configuration commitment.
       */
      authorizedSigner?: Account.Account | Address.Address | undefined
      /**
       * User-supplied salt to distinguish otherwise identical channels.
       * @default The voucher signer's nonzero configuration commitment when the signer is a configurable account or an access key of one (or, for an unregistered configurable account that sends the open as its own signer, the commitment of its local config, registered in the same transaction), else `Hex.random(32)`.
       */
      salt?: Hex.Hex | undefined
    }
  export type ReturnType = write.ReturnType
  // TODO: exhaustive error type
  export type ErrorType =
    | TempoErrors.ExecutionErrorType
    | Errors.GlobalErrorType

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
    const {
      authorizedSigner: _authorizedSigner,
      deposit: _deposit,
      operator: _operator,
      payee: _payee,
      salt: _salt,
      token: _token,
      ...rest
    } = options
    return dispatchWrite(action, client, {
      ...rest,
      ...open.call(client, await resolveArgs(client, options)),
    })
  }

  /**
   * Defines a call to the `open` function.
   *
   * Makes no RPC request, so `salt` defaults to a random value. When the voucher
   * signer is a configurable account with a nonzero configuration commitment,
   * the channel reserve requires that commitment as the salt (TIP-1166): pass
   * `salt` from `channel.getOpenSalt`.
   */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [, args] = resolveCallParameters(parameters)
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
      args: [payee, operator, token, deposit, salt, authorizedSigner],
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
      ...open.call(client, await resolveArgs(client, options)),
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
      ...open.call(client, await resolveArgs(client, options)),
    })
  }

  /** Extracts the `ChannelOpened` event from logs. */
  export function extractEvent<
    const logs extends readonly AbiEvent.extractLogs.Log[],
  >(logs: logs) {
    const [log] = AbiEvent.extractLogs(Abis.tip20ChannelReserve, logs, {
      eventName: 'ChannelOpened',
      strict: true,
    })
    if (!log) throw new Error('`ChannelOpened` event not found.')
    return log
  }
}

/** Resolves the voucher signer to its address and fills the default salt. */
async function resolveArgs(
  client: Client.Client<Chain.Chain | undefined, Account.Account | undefined>,
  options: open.Options,
): Promise<open.Args> {
  const { deposit, operator, payee, token } = options
  const authorizedSigner =
    options.authorizedSigner &&
    !Address.isEqual(
      Account.from(options.authorizedSigner).address,
      zeroAddress,
    )
      ? Account.from(options.authorizedSigner)
      : undefined
  const sender = options.account
    ? Account.from(options.account)
    : client.account
  const salt =
    options.salt ??
    (await getDefaultSalt(client, {
      sender,
      signer: authorizedSigner ?? sender,
    }))
  return {
    authorizedSigner: authorizedSigner?.address,
    deposit,
    operator,
    payee,
    salt,
    token,
  }
}

/**
 * Resolves the default salt for `channel.open`.
 *
 * A configurable voucher signer with a nonzero commitment needs that commitment.
 * An access key signs as its parent account, which can be configurable, so its
 * parent's commitment is read too. An unregistered configurable account (zero
 * commitment) that is also the sender registers its local config in the same
 * transaction (TIP-1107), before the channel reserve runs, so the reserve then
 * sees that config's commitment.
 */
async function getDefaultSalt(
  client: Client.Client<Chain.Chain | undefined, Account.Account | undefined>,
  options: {
    sender: Account.Account | undefined
    signer: Account.Account | undefined
  },
): Promise<Hex.Hex> {
  const { sender } = options
  const signer = options.signer as
    | (Account.Account & { source?: string | undefined })
    | undefined
  if (signer?.source !== 'configurable' && signer?.source !== 'accessKey')
    return Hex.random(32)
  const commitment = await getConfigCommitment(client, {
    account: signer.address,
  })
  if (commitment !== zeroHash) return commitment
  if (signer.source !== 'configurable') return Hex.random(32)
  const { config } = signer as TempoAccount.ConfigurableAccount
  if (config && sender && Address.isEqual(sender.address, signer.address))
    return AccountConfig.getCommitment(config)
  return Hex.random(32)
}
