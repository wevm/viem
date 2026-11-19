import * as Address from 'ox/Address'
import * as Hex from 'ox/Hex'
import { AccountConfig, Channel as ox_Channel, TokenId } from 'ox/tempo'
import type { Account } from '../../accounts/types.js'
import { parseAccount } from '../../accounts/utils/parseAccount.js'
import type { ReadContractReturnType } from '../../actions/public/readContract.js'
import { readContract } from '../../actions/public/readContract.js'
import type { WriteContractReturnType } from '../../actions/wallet/writeContract.js'
import { writeContract } from '../../actions/wallet/writeContract.js'
import { writeContractSync } from '../../actions/wallet/writeContractSync.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { zeroAddress } from '../../constants/address.js'
import { zeroHash } from '../../constants/bytes.js'
import type { BaseErrorType } from '../../errors/base.js'
import type { Chain } from '../../types/chain.js'
import type { GetEventArgs } from '../../types/contract.js'
import type { Log } from '../../types/log.js'
import type { Compute } from '../../types/utils.js'
import { parseEventLogs } from '../../utils/abi/parseEventLogs.js'
import { isAddressEqual } from '../../utils/address/isAddressEqual.js'
import * as Abis from '../Abis.js'
import {
  type ConfigurableAccount,
  signVoucher as signVoucher_,
} from '../Account.js'
import * as Addresses from '../Addresses.js'
import type * as Errors from '../errors.js'
import { TempoExecutionError } from '../errors.js'
import {
  type Context,
  formatTime,
  type Resolvers,
  withExecutionError,
} from '../internal/errors.js'
import type {
  GetAccountParameter,
  ReadParameters,
  WriteParameters,
} from '../internal/types.js'
import { defineCall } from '../internal/utils.js'
import type { TransactionReceipt } from '../Transaction.js'
import { getConfigCommitment } from './accounts.js'

/**
 * Closes a TIP-20 channel reserve channel from the payee or operator side.
 *
 * @example
 * ```ts
 * import { Actions } from 'viem/tempo'
 *
 * const hash = await Actions.channel.close(client, {
 *   captureAmount: 100n,
 *   cumulativeAmount: 100n,
 *   channel,
 *   signature: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function close<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: close.Parameters<chain, account>,
): Promise<close.ReturnValue> {
  return close.inner(writeContract, client, parameters)
}

export namespace close {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** Amount to capture for the payee during close. */
    captureAmount: bigint
    /** Total voucher amount signed for the channel. */
    cumulativeAmount: bigint
    /** TIP-20 channel. */
    channel: ox_Channel.from.Value
    /** Voucher signature. */
    signature: Hex.Hex
  }

  export type ReturnValue = WriteContractReturnType

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType

  /** @internal */
  export async function inner<
    action extends typeof writeContract | typeof writeContractSync,
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    action: action,
    client: Client<Transport, chain, account>,
    parameters: Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const { captureAmount, cumulativeAmount, channel, signature, ...rest } =
      parameters
    return (await withExecutionError(action)(client, {
      ...rest,
      ...close.call({
        captureAmount,
        cumulativeAmount,
        channel,
        signature,
      }),
    } as never)) as never
  }

  /**
   * Defines a call to the `close` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { captureAmount, cumulativeAmount, channel, signature } = args
    return defineCall({
      address: ox_Channel.address,
      abi: Abis.tip20ChannelReserve,
      functionName: 'close',
      args: [
        ox_Channel.from(channel),
        cumulativeAmount,
        captureAmount,
        signature,
      ],
    })
  }

  /**
   * Extracts the `ChannelClosed` event from logs.
   *
   * @param logs - The logs.
   * @returns The `ChannelClosed` event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.tip20ChannelReserve,
      logs,
      eventName: 'ChannelClosed',
      strict: true,
    })
    if (!log) throw new Error('`ChannelClosed` event not found.')
    return log
  }
}

/**
 * Closes a TIP-20 channel reserve channel and waits for the transaction receipt.
 *
 * @example
 * ```ts
 * import { Actions } from 'viem/tempo'
 *
 * const result = await Actions.channel.closeSync(client, {
 *   captureAmount: 100n,
 *   cumulativeAmount: 100n,
 *   channel,
 *   signature: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function closeSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: closeSync.Parameters<chain, account>,
): Promise<closeSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await close.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  if ((receipt as TransactionReceipt).status === 'pending')
    return { receipt } as never
  const { args } = close.extractEvent(receipt.logs)
  return { ...args, receipt } as never
}

export namespace closeSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = close.Parameters<chain, account>

  export type Args = close.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.tip20ChannelReserve,
      'ChannelClosed',
      { IndexedOnly: false; Required: true }
    > & {
      /** Transaction receipt. */
      receipt: TransactionReceipt
    }
  >

  export type ErrorType = close.ErrorType
}

/**
 * Resolves the default salt for {@link open}.
 *
 * A configurable voucher signer with a nonzero commitment needs that commitment.
 * An access key signs as its parent account, which can be configurable, so its
 * parent's commitment is read too. An unregistered configurable account (zero
 * commitment) that is also the sender registers its local config in the same
 * transaction (TIP-1107), before the channel reserve runs, so the reserve then
 * sees that config's commitment.
 */
async function getDefaultSalt(
  client: Client<Transport, Chain | undefined, Account | undefined>,
  parameters: {
    sender: Account | undefined
    signer: Account | undefined
  },
): Promise<Hex.Hex> {
  const { sender, signer } = parameters
  if (signer?.source !== 'configurable' && signer?.source !== 'accessKey')
    return Hex.random(32)
  const commitment = await getConfigCommitment(client, {
    account: signer.address,
  })
  if (commitment !== zeroHash) return commitment
  if (signer.source !== 'configurable') return Hex.random(32)
  const { config } = signer as ConfigurableAccount
  if (config && sender && isAddressEqual(sender.address, signer.address))
    return AccountConfig.getCommitment(config)
  return Hex.random(32)
}

/**
 * Gets the salt to open a TIP-20 channel reserve channel with for a voucher
 * signer.
 *
 * From T15 (TIP-1166), a channel whose voucher signer is a configurable account
 * (TIP-1107) with a nonzero configuration commitment must use that commitment as
 * its salt. This returns the signer's commitment when it is nonzero, else a
 * random 32-byte salt. Pass the result as `salt` to {@link open} or {@link open.call}.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const salt = await Actions.channel.getOpenSalt(client, {
 *   signer: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The signer's nonzero configuration commitment, else a random 32-byte salt.
 */
export async function getOpenSalt<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: getOpenSalt.Parameters,
): Promise<getOpenSalt.ReturnValue> {
  const { signer, ...rest } = parameters
  const commitment = await getConfigCommitment(client, {
    ...rest,
    account: parseAccount(signer).address,
  })
  if (commitment !== zeroHash) return commitment
  return Hex.random(32)
}

export namespace getOpenSalt {
  export type Parameters = Omit<ReadParameters, 'account'> & {
    /** Voucher signer: `authorizedSigner` if set, else the payer. */
    signer: Account | Address.Address
  }

  export type ReturnValue = Hex.Hex

  export type ErrorType = getConfigCommitment.ErrorType
}

/**
 * Gets TIP-20 channel reserve state for a channel ID or channel.
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
 * const state = await Actions.channel.getStates(client, {
 *   channel: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns Channel state for a single channel, or channel states for multiple channels.
 */
export async function getStates<
  chain extends Chain | undefined,
  const channel extends getStates.Channel | readonly getStates.Channel[],
>(
  client: Client<Transport, chain>,
  parameters: getStates.Parameters<channel>,
): Promise<getStates.ReturnValue<channel>> {
  const chainId = client.chain?.id
  const { channel, ...rest } = parameters

  return withExecutionError(readContract)(client, {
    ...rest,
    ...getStates.call({ channel, chainId } as never),
  } as never) as never
}

export namespace getStates {
  export type Parameters<
    channel extends Channel | readonly Channel[] = Channel | readonly Channel[],
  > = ReadParameters & {
    /** Channel ID, channel, or list of IDs and channels. */
    channel: channel
  }

  export type Args<
    channel extends Channel | readonly Channel[] = Channel | readonly Channel[],
  > = {
    /**
     * Chain ID used to compute IDs for channel inputs.
     *
     * Required for channel inputs when using `getStates.call` directly.
     */
    chainId?: number | undefined
    /** Channel ID, channel, or list of IDs and channels. */
    channel: channel
  }

  export type Channel = Hex.Hex | ox_Channel.from.Value

  export type State = ReadContractReturnType<
    typeof Abis.tip20ChannelReserve,
    'getChannelState',
    readonly [Hex.Hex]
  >

  export type ReturnValue<channel extends Channel | readonly Channel[]> =
    channel extends readonly Channel[] ? readonly State[] : State

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType

  /**
   * Defines a call to the `getChannelState` or `getChannelStatesBatch` function.
   *
   * Can be passed as a parameter to:
   * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate the gas cost of the call
   * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
   * - [`sendCalls`](https://viem.sh/docs/actions/wallet/sendCalls): send multiple calls
   *
   * @example
   * ```ts
   * import { createClient, http, walletActions } from 'viem'
   * import { tempo } from 'viem/chains'
   * import { Actions } from 'viem/tempo'
   *
   * const client = createClient({
   *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' }),
   *   transport: http(),
   * }).extend(walletActions)
   *
   * const calls = [Actions.channel.getStates.call({ channel: '0x...' })]
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call<const channel extends Channel | readonly Channel[]>(
    args: Args<channel>,
  ) {
    const { channel, chainId } = args
    if (Array.isArray(channel)) {
      const channelIds = (channel as readonly Channel[]).map((channel) => {
        if (typeof channel === 'string') return channel
        if (chainId === undefined)
          throw new Error('`chainId` is required for channel inputs.')
        return ox_Channel.computeId(channel, { chainId }) as Hex.Hex
      })

      return defineCall({
        address: ox_Channel.address,
        abi: Abis.tip20ChannelReserve,
        args: [channelIds],
        functionName: 'getChannelStatesBatch',
      })
    }

    const channel_ = channel as Channel
    if (typeof channel_ === 'string')
      return defineCall({
        address: ox_Channel.address,
        abi: Abis.tip20ChannelReserve,
        args: [channel_],
        functionName: 'getChannelState',
      })

    if (chainId === undefined)
      throw new Error('`chainId` is required for channel inputs.')

    return defineCall({
      address: ox_Channel.address,
      abi: Abis.tip20ChannelReserve,
      args: [ox_Channel.computeId(channel_, { chainId }) as Hex.Hex],
      functionName: 'getChannelState',
    })
  }
}

/**
 * Opens and funds a TIP-20 channel reserve channel.
 *
 * When `salt` is omitted and the voucher signer (`authorizedSigner`, else the
 * account) is a configurable account (TIP-1107), or an access key of one, with
 * a nonzero configuration commitment, the salt defaults to that commitment, as
 * the channel reserve requires from T15 (TIP-1166). Otherwise it defaults to a
 * random salt. Pass `salt` from {@link getOpenSalt} when the signer is a
 * configurable account known only by address.
 *
 * An unregistered configurable account that sends the open and signs its own
 * vouchers registers (TIP-1107) in the same transaction, before the channel
 * reserve runs, so the salt then defaults to the commitment of its local
 * version-zero config instead.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 * import { privateKeyToAccount } from 'viem/accounts'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const hash = await Actions.channel.open(client, {
 *   deposit: 100n,
 *   payee: '0x...',
 *   token: 1n,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function open<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: open.Parameters<chain, account>,
): Promise<open.ReturnValue> {
  return open.inner(writeContract, client, parameters)
}

export namespace open {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> &
    Omit<Args, 'authorizedSigner' | 'salt'> & {
      /**
       * Optional signer for vouchers. Zero means `payer` signs. Pass a
       * configurable account to default `salt` to its configuration commitment.
       * @default zeroAddress
       */
      authorizedSigner?: Account | Address.Address | undefined
      /**
       * User-supplied salt to distinguish otherwise identical channels.
       * @default The voucher signer's nonzero configuration commitment when the signer is a configurable account or an access key of one (or, for an unregistered configurable account that sends the open as its own signer, the commitment of its local config, registered in the same transaction), else `Hex.random(32)`.
       */
      salt?: Hex.Hex | undefined
    }

  export type Args = {
    /** Optional signer for vouchers. Zero means `payer` signs. @default zeroAddress */
    authorizedSigner?: Address.Address | undefined
    /** Amount of TIP-20 token to deposit. */
    deposit: bigint
    /** Optional relayer allowed to submit `settle` for the payee. @default zeroAddress */
    operator?: Address.Address | undefined
    /** Account that receives settled voucher payments. */
    payee: Address.Address
    /** User-supplied salt to distinguish otherwise identical channels. @default Hex.random(32) */
    salt?: Hex.Hex | undefined
    /** TIP-20 token address or ID held by the channel. */
    token: TokenId.TokenIdOrAddress<Address.Address>
  }

  export type ReturnValue = WriteContractReturnType

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType

  /** @internal */
  export async function inner<
    action extends typeof writeContract | typeof writeContractSync,
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    action: action,
    client: Client<Transport, chain, account>,
    parameters: Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const {
      authorizedSigner: authorizedSigner_,
      deposit,
      operator,
      payee,
      salt: salt_,
      token,
      ...rest
    } = parameters
    const authorizedSigner =
      authorizedSigner_ &&
      !isAddressEqual(parseAccount(authorizedSigner_).address, zeroAddress)
        ? parseAccount(authorizedSigner_)
        : undefined
    const signer =
      authorizedSigner ??
      (rest.account ? parseAccount(rest.account) : client.account)
    const sender = rest.account ? parseAccount(rest.account) : client.account
    const salt = salt_ ?? (await getDefaultSalt(client, { sender, signer }))
    return (await withExecutionError(action)(client, {
      ...rest,
      ...open.call({
        authorizedSigner: authorizedSigner?.address,
        deposit,
        operator,
        payee,
        salt,
        token,
      }),
    } as never)) as never
  }

  /**
   * Defines a call to the `open` function.
   *
   * Makes no RPC request, so `salt` defaults to a random value. When the voucher
   * signer is a configurable account with a nonzero configuration commitment,
   * the channel reserve requires that commitment as the salt (TIP-1166): pass
   * `salt` from {@link getOpenSalt}.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const {
      authorizedSigner = zeroAddress,
      deposit,
      operator = zeroAddress,
      payee,
      salt = Hex.random(32),
      token,
    } = args
    return defineCall({
      address: ox_Channel.address,
      abi: Abis.tip20ChannelReserve,
      functionName: 'open',
      args: [
        Address.from(payee),
        Address.from(operator),
        TokenId.toAddress(token),
        deposit,
        salt,
        Address.from(authorizedSigner),
      ],
    })
  }

  /**
   * Extracts the `ChannelOpened` event from logs.
   *
   * @param logs - The logs.
   * @returns The `ChannelOpened` event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.tip20ChannelReserve,
      logs,
      eventName: 'ChannelOpened',
      strict: true,
    })
    if (!log) throw new Error('`ChannelOpened` event not found.')
    return log
  }
}

/**
 * Opens and funds a TIP-20 channel reserve channel and waits for the
 * transaction receipt.
 *
 * `salt` defaults as in {@link open}: to the voucher signer's nonzero
 * configuration commitment (TIP-1166) when the signer is a configurable
 * account or an access key of one, else to a random salt.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 * import { privateKeyToAccount } from 'viem/accounts'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const result = await Actions.channel.openSync(client, {
 *   deposit: 100n,
 *   payee: '0x...',
 *   token: 1n,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function openSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: openSync.Parameters<chain, account>,
): Promise<openSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await open.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  if ((receipt as TransactionReceipt).status === 'pending')
    return { receipt } as never
  const { args } = open.extractEvent(receipt.logs)
  return { ...args, receipt } as never
}

export namespace openSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = open.Parameters<chain, account>

  export type Args = open.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.tip20ChannelReserve,
      'ChannelOpened',
      { IndexedOnly: false; Required: true }
    > & {
      /** Transaction receipt. */
      receipt: TransactionReceipt
    }
  >

  export type ErrorType = open.ErrorType
}

/**
 * Starts the payer close timer for a TIP-20 channel reserve channel.
 *
 * @example
 * ```ts
 * import { Actions } from 'viem/tempo'
 *
 * const hash = await Actions.channel.requestClose(client, {
 *   channel,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function requestClose<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: requestClose.Parameters<chain, account>,
): Promise<requestClose.ReturnValue> {
  return requestClose.inner(writeContract, client, parameters)
}

export namespace requestClose {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** TIP-20 channel. */
    channel: ox_Channel.from.Value
  }

  export type ReturnValue = WriteContractReturnType

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType

  /** @internal */
  export async function inner<
    action extends typeof writeContract | typeof writeContractSync,
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    action: action,
    client: Client<Transport, chain, account>,
    parameters: Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const { channel, ...rest } = parameters
    return (await withExecutionError(action)(client, {
      ...rest,
      ...requestClose.call({ channel }),
    } as never)) as never
  }

  /**
   * Defines a call to the `requestClose` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { channel } = args
    return defineCall({
      address: ox_Channel.address,
      abi: Abis.tip20ChannelReserve,
      functionName: 'requestClose',
      args: [ox_Channel.from(channel)],
    })
  }

  /**
   * Extracts the `CloseRequested` event from logs.
   *
   * @param logs - The logs.
   * @returns The `CloseRequested` event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.tip20ChannelReserve,
      logs,
      eventName: 'CloseRequested',
      strict: true,
    })
    if (!log) throw new Error('`CloseRequested` event not found.')
    return log
  }
}

/**
 * Starts the payer close timer and waits for the transaction receipt.
 *
 * @example
 * ```ts
 * import { Actions } from 'viem/tempo'
 *
 * const result = await Actions.channel.requestCloseSync(client, {
 *   channel,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function requestCloseSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: requestCloseSync.Parameters<chain, account>,
): Promise<requestCloseSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await requestClose.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  if ((receipt as TransactionReceipt).status === 'pending')
    return { receipt } as never
  const { args } = requestClose.extractEvent(receipt.logs)
  return { ...args, receipt } as never
}

export namespace requestCloseSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = requestClose.Parameters<chain, account>

  export type Args = requestClose.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.tip20ChannelReserve,
      'CloseRequested',
      { IndexedOnly: false; Required: true }
    > & {
      /** Transaction receipt. */
      receipt: TransactionReceipt
    }
  >

  export type ErrorType = requestClose.ErrorType
}

/**
 * Settles a TIP-20 channel reserve voucher.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const hash = await Actions.channel.settle(client, {
 *   cumulativeAmount: 100n,
 *   channel,
 *   signature: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function settle<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: settle.Parameters<chain, account>,
): Promise<settle.ReturnValue> {
  return settle.inner(writeContract, client, parameters)
}

export namespace settle {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** Total voucher amount signed for the channel. */
    cumulativeAmount: bigint
    /** TIP-20 channel. */
    channel: ox_Channel.from.Value
    /** Voucher signature. */
    signature: Hex.Hex
  }

  export type ReturnValue = WriteContractReturnType

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType

  /** @internal */
  export async function inner<
    action extends typeof writeContract | typeof writeContractSync,
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    action: action,
    client: Client<Transport, chain, account>,
    parameters: Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const { cumulativeAmount, channel, signature, ...rest } = parameters
    return (await withExecutionError(action)(client, {
      ...rest,
      ...settle.call({ cumulativeAmount, channel, signature }),
    } as never)) as never
  }

  /**
   * Defines a call to the `settle` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { cumulativeAmount, channel, signature } = args
    return defineCall({
      address: ox_Channel.address,
      abi: Abis.tip20ChannelReserve,
      functionName: 'settle',
      args: [ox_Channel.from(channel), cumulativeAmount, signature],
    })
  }

  /**
   * Extracts the `Settled` event from logs.
   *
   * @param logs - The logs.
   * @returns The `Settled` event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.tip20ChannelReserve,
      logs,
      eventName: 'Settled',
      strict: true,
    })
    if (!log) throw new Error('`Settled` event not found.')
    return log
  }
}

/**
 * Settles a TIP-20 channel reserve voucher and waits for the transaction receipt.
 *
 * @example
 * ```ts
 * import { Actions } from 'viem/tempo'
 *
 * const result = await Actions.channel.settleSync(client, {
 *   cumulativeAmount: 100n,
 *   channel,
 *   signature: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function settleSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: settleSync.Parameters<chain, account>,
): Promise<settleSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await settle.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  if ((receipt as TransactionReceipt).status === 'pending')
    return { receipt } as never
  const { args } = settle.extractEvent(receipt.logs)
  return { ...args, receipt } as never
}

export namespace settleSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = settle.Parameters<chain, account>

  export type Args = settle.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.tip20ChannelReserve,
      'Settled',
      { IndexedOnly: false; Required: true }
    > & {
      /** Transaction receipt. */
      receipt: TransactionReceipt
    }
  >

  export type ErrorType = settle.ErrorType
}

/**
 * Signs a TIP-20 channel reserve voucher.
 *
 * @example
 * ```ts
 * import { parseUnits } from 'viem'
 * import { Actions } from 'viem/tempo'
 *
 * const signature = await Actions.channel.signVoucher(client, {
 *   channel,
 *   cumulativeAmount: parseUnits('40', 6),
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The voucher signature.
 */
export async function signVoucher<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: signVoucher.Parameters<account>,
): Promise<signVoucher.ReturnValue> {
  const {
    account: account_ = client.account,
    chainId = client.chain?.id,
    channel,
    cumulativeAmount,
  } = parameters
  if (!account_) throw new Error('account is required.')
  if (chainId === undefined) throw new Error('chainId is required.')

  const parsed = parseAccount(account_)
  if (!('sign' in parsed) || !parsed.sign)
    throw new Error('account.sign is required.')

  return signVoucher_(parsed as never, {
    chainId,
    channel,
    cumulativeAmount,
  })
}

export namespace signVoucher {
  export type Parameters<
    account extends Account | undefined = Account | undefined,
  > = GetAccountParameter<account> & Args

  export type Args = {
    /** Channel ID or channel. */
    channel: getStates.Channel
    /** The chain ID. @default client.chain.id */
    chainId?: number | bigint | undefined
    /** Total voucher amount signed for the channel. */
    cumulativeAmount: bigint
  }

  export type ReturnValue = Hex.Hex

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Adds deposit to a TIP-20 channel reserve channel.
 *
 * @example
 * ```ts
 * import { Actions } from 'viem/tempo'
 *
 * const hash = await Actions.channel.topUp(client, {
 *   additionalDeposit: 100n,
 *   channel,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function topUp<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: topUp.Parameters<chain, account>,
): Promise<topUp.ReturnValue> {
  return topUp.inner(writeContract, client, parameters)
}

export namespace topUp {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** Additional deposit to lock in the channel. */
    additionalDeposit: bigint
    /** TIP-20 channel. */
    channel: ox_Channel.from.Value
  }

  export type ReturnValue = WriteContractReturnType

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType

  /** @internal */
  export async function inner<
    action extends typeof writeContract | typeof writeContractSync,
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    action: action,
    client: Client<Transport, chain, account>,
    parameters: Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const { additionalDeposit, channel, ...rest } = parameters
    return (await withExecutionError(action)(client, {
      ...rest,
      ...topUp.call({ additionalDeposit, channel }),
    } as never)) as never
  }

  /**
   * Defines a call to the `topUp` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { additionalDeposit, channel } = args
    return defineCall({
      address: ox_Channel.address,
      abi: Abis.tip20ChannelReserve,
      functionName: 'topUp',
      args: [ox_Channel.from(channel), additionalDeposit],
    })
  }

  /**
   * Extracts the `TopUp` event from logs.
   *
   * @param logs - The logs.
   * @returns The `TopUp` event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.tip20ChannelReserve,
      logs,
      eventName: 'TopUp',
      strict: true,
    })
    if (!log) throw new Error('`TopUp` event not found.')
    return log
  }
}

/**
 * Adds deposit to a TIP-20 channel reserve channel and waits for the
 * transaction receipt.
 *
 * @example
 * ```ts
 * import { Actions } from 'viem/tempo'
 *
 * const result = await Actions.channel.topUpSync(client, {
 *   additionalDeposit: 100n,
 *   channel,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function topUpSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: topUpSync.Parameters<chain, account>,
): Promise<topUpSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await topUp.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  if ((receipt as TransactionReceipt).status === 'pending')
    return { receipt } as never
  const { args } = topUp.extractEvent(receipt.logs)
  return { ...args, receipt } as never
}

export namespace topUpSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = topUp.Parameters<chain, account>

  export type Args = topUp.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.tip20ChannelReserve,
      'TopUp',
      { IndexedOnly: false; Required: true }
    > & {
      /** Transaction receipt. */
      receipt: TransactionReceipt
    }
  >

  export type ErrorType = topUp.ErrorType
}

/**
 * Verifies a TIP-20 channel reserve voucher signature.
 *
 * Returns whether `signature` is a valid voucher for `cumulativeAmount` from the
 * channel's voucher signer (`authorizedSigner` if set, else the payer). It does
 * not check `cumulativeAmount` against the channel's deposit or settled amount.
 * Throws `ChannelNotFoundError` when the channel does not exist.
 *
 * @example
 * ```ts
 * import { createClient, http, parseUnits } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const valid = await Actions.channel.verifyVoucher(client, {
 *   channel,
 *   cumulativeAmount: parseUnits('40', 6),
 *   signature: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns Whether the voucher signature is valid.
 */
export async function verifyVoucher<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: verifyVoucher.Parameters,
): Promise<verifyVoucher.ReturnValue> {
  const { channel, cumulativeAmount, signature, ...rest } = parameters
  return withExecutionError(readContract)(client, {
    ...rest,
    ...verifyVoucher.call({ channel, cumulativeAmount, signature }),
  } as never) as never
}

export namespace verifyVoucher {
  export type Parameters = ReadParameters & Args

  export type Args = {
    /** TIP-20 channel. */
    channel: ox_Channel.from.Value
    /** Total voucher amount signed for the channel. */
    cumulativeAmount: bigint
    /** Voucher signature. */
    signature: Hex.Hex
  }

  export type ReturnValue = boolean

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType

  /**
   * Defines a call to the `verifyVoucher` function.
   *
   * Can be passed as a parameter to:
   * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate the gas cost of the call
   * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
   * - [`sendCalls`](https://viem.sh/docs/actions/wallet/sendCalls): send multiple calls
   *
   * @example
   * ```ts
   * import { parseUnits } from 'viem'
   * import { Actions } from 'viem/tempo'
   *
   * const call = Actions.channel.verifyVoucher.call({
   *   channel,
   *   cumulativeAmount: parseUnits('40', 6),
   *   signature: '0x...',
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { channel, cumulativeAmount, signature } = args
    return defineCall({
      address: ox_Channel.address,
      abi: Abis.tip20ChannelReserve,
      functionName: 'verifyVoucher',
      args: [ox_Channel.from(channel), cumulativeAmount, signature],
    })
  }
}

/**
 * Withdraws payer funds after the close grace period elapses.
 *
 * @example
 * ```ts
 * import { Actions } from 'viem/tempo'
 *
 * const hash = await Actions.channel.withdraw(client, {
 *   channel,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function withdraw<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: withdraw.Parameters<chain, account>,
): Promise<withdraw.ReturnValue> {
  return withdraw.inner(writeContract, client, parameters)
}

export namespace withdraw {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** TIP-20 channel. */
    channel: ox_Channel.from.Value
  }

  export type ReturnValue = WriteContractReturnType

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType

  /** @internal */
  export async function inner<
    action extends typeof writeContract | typeof writeContractSync,
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    action: action,
    client: Client<Transport, chain, account>,
    parameters: Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const { channel, ...rest } = parameters
    return (await withExecutionError(action)(client, {
      ...rest,
      ...withdraw.call({ channel }),
    } as never)) as never
  }

  /**
   * Defines a call to the `withdraw` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { channel } = args
    return defineCall({
      address: ox_Channel.address,
      abi: Abis.tip20ChannelReserve,
      functionName: 'withdraw',
      args: [ox_Channel.from(channel)],
    })
  }

  /**
   * Extracts the `ChannelClosed` event from logs.
   *
   * @param logs - The logs.
   * @returns The `ChannelClosed` event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.tip20ChannelReserve,
      logs,
      eventName: 'ChannelClosed',
      strict: true,
    })
    if (!log) throw new Error('`ChannelClosed` event not found.')
    return log
  }
}

/**
 * Withdraws payer funds after the close grace period elapses and waits for the
 * transaction receipt.
 *
 * @example
 * ```ts
 * import { Actions } from 'viem/tempo'
 *
 * const result = await Actions.channel.withdrawSync(client, {
 *   channel,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function withdrawSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: withdrawSync.Parameters<chain, account>,
): Promise<withdrawSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await withdraw.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  if ((receipt as TransactionReceipt).status === 'pending')
    return { receipt } as never
  const { args } = withdraw.extractEvent(receipt.logs)
  return { ...args, receipt } as never
}

export namespace withdrawSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = withdraw.Parameters<chain, account>

  export type Args = withdraw.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.tip20ChannelReserve,
      'ChannelClosed',
      { IndexedOnly: false; Required: true }
    > & {
      /** Transaction receipt. */
      receipt: TransactionReceipt
    }
  >

  export type ErrorType = withdraw.ErrorType
}

// Errors

/** Errors this module throws for decoded Tempo errors. Narrow with `error.name`. */
export type ExecutionErrorType =
  | ChannelAmountExceedsDepositErrorType
  | ChannelAmountNotIncreasingErrorType
  | ChannelCloseNotReadyErrorType
  | ChannelNotFoundErrorType
  | ChannelSaltNotSignerCommitmentErrorType
  | ChannelSignerConfigChangedErrorType

/** `ChannelNotFoundError` with a literal `name`, for narrowing. */
export type ChannelNotFoundErrorType = ChannelNotFoundError & {
  name: 'ChannelNotFoundError'
}

/** Thrown when a payment channel does not exist. */
export class ChannelNotFoundError extends TempoExecutionError<
  Errors.TempoExecutionError.Decoded<'ChannelNotFound'>
> {
  /** Channel descriptor, when known. */
  descriptor: Record<string, unknown> | undefined

  constructor(
    parameters: Errors.TempoExecutionError.Parameters & {
      descriptor?: Record<string, unknown> | undefined
    },
  ) {
    const { descriptor } = parameters
    super(parameters, {
      details: {
        payer: descriptor?.payer,
        payee: descriptor?.payee,
        token: descriptor?.token,
      },
      name: 'ChannelNotFoundError',
    })
    this.descriptor = descriptor
  }
}

/** `ChannelCloseNotReadyError` with a literal `name`, for narrowing. */
export type ChannelCloseNotReadyErrorType = ChannelCloseNotReadyError & {
  name: 'ChannelCloseNotReadyError'
}

/** Thrown when withdrawing from a channel before its close grace period ends. */
export class ChannelCloseNotReadyError extends TempoExecutionError<
  Errors.TempoExecutionError.Decoded<'CloseNotReady'>
> {
  /** When the close was requested (Unix seconds), or `0` when it was not. */
  closeRequestedAt: number | undefined
  /** When the channel can be withdrawn from (Unix seconds), when known. */
  readyAt: bigint | undefined

  constructor(
    parameters: Errors.TempoExecutionError.Parameters & {
      closeRequestedAt?: number | undefined
      readyAt?: bigint | undefined
    },
  ) {
    const { closeRequestedAt, readyAt } = parameters
    super(parameters, {
      details: {
        'close requested at': formatTime(closeRequestedAt),
        'ready at': formatTime(readyAt),
      },
      name: 'ChannelCloseNotReadyError',
      shortMessage:
        closeRequestedAt === 0
          ? 'Channel close has not been requested.'
          : readyAt
            ? `Channel is not ready to close until ${formatTime(readyAt)}.`
            : undefined,
    })
    this.closeRequestedAt = closeRequestedAt
    this.readyAt = readyAt
  }
}

/** `ChannelAmountExceedsDepositError` with a literal `name`, for narrowing. */
export type ChannelAmountExceedsDepositErrorType =
  ChannelAmountExceedsDepositError & {
    name: 'ChannelAmountExceedsDepositError'
  }

/** Thrown when a voucher amount exceeds the channel deposit. */
export class ChannelAmountExceedsDepositError extends TempoExecutionError<
  Errors.TempoExecutionError.Decoded<'AmountExceedsDeposit'>
> {
  /** Cumulative voucher amount. */
  amount: bigint | undefined
  /** Channel deposit, when known. */
  deposit: bigint | undefined

  constructor(
    parameters: Errors.TempoExecutionError.Parameters & {
      amount?: bigint | undefined
      deposit?: bigint | undefined
    },
  ) {
    const { amount, deposit } = parameters
    super(parameters, {
      details: { amount, deposit },
      name: 'ChannelAmountExceedsDepositError',
    })
    this.amount = amount
    this.deposit = deposit
  }
}

/** `ChannelAmountNotIncreasingError` with a literal `name`, for narrowing. */
export type ChannelAmountNotIncreasingErrorType =
  ChannelAmountNotIncreasingError & {
    name: 'ChannelAmountNotIncreasingError'
  }

/** Thrown when a voucher amount is not above the amount already settled. */
export class ChannelAmountNotIncreasingError extends TempoExecutionError<
  Errors.TempoExecutionError.Decoded<'AmountNotIncreasing'>
> {
  /** Cumulative voucher amount. */
  amount: bigint | undefined
  /** Amount already settled, when known. */
  settled: bigint | undefined

  constructor(
    parameters: Errors.TempoExecutionError.Parameters & {
      amount?: bigint | undefined
      settled?: bigint | undefined
    },
  ) {
    const { amount, settled } = parameters
    super(parameters, {
      details: { amount, settled },
      name: 'ChannelAmountNotIncreasingError',
    })
    this.amount = amount
    this.settled = settled
  }
}

/** `ChannelSaltNotSignerCommitmentError` with a literal `name`, for narrowing. */
export type ChannelSaltNotSignerCommitmentErrorType =
  ChannelSaltNotSignerCommitmentError & {
    name: 'ChannelSaltNotSignerCommitmentError'
  }

/**
 * Thrown when a channel opens with a salt other than the voucher signer's
 * configuration commitment (TIP-1166). Omit `salt`, or pass it from
 * {@link getOpenSalt}.
 */
export class ChannelSaltNotSignerCommitmentError extends TempoExecutionError<
  Errors.TempoExecutionError.Decoded<'SaltNotSignerCommitment'>
> {
  /** Configuration commitment the salt must equal, when known. */
  commitment: Hex.Hex | undefined
  /** Voucher signer, when known. */
  signer: Address.Address | undefined

  constructor(parameters: Errors.TempoExecutionError.Parameters) {
    const [signer, commitment] = (parameters.error.args ?? []) as readonly [
      Address.Address?,
      Hex.Hex?,
    ]
    super(parameters, {
      details: { commitment, signer },
      name: 'ChannelSaltNotSignerCommitmentError',
    })
    this.commitment = commitment
    this.signer = signer
  }
}

/** `ChannelSignerConfigChangedError` with a literal `name`, for narrowing. */
export type ChannelSignerConfigChangedErrorType =
  ChannelSignerConfigChangedError & {
    name: 'ChannelSignerConfigChangedError'
  }

/**
 * Thrown when a channel is topped up after its voucher signer's configuration
 * changed since the channel opened (TIP-1166). Close the channel and open a new
 * one to add funds.
 */
export class ChannelSignerConfigChangedError extends TempoExecutionError<
  Errors.TempoExecutionError.Decoded<'SignerConfigChanged'>
> {
  /** Voucher signer, when known. */
  signer: Address.Address | undefined

  constructor(parameters: Errors.TempoExecutionError.Parameters) {
    const [signer] = (parameters.error.args ?? []) as readonly [
      Address.Address?,
    ]
    super(parameters, {
      details: { signer },
      name: 'ChannelSignerConfigChangedError',
    })
    this.signer = signer
  }
}

const reserve = {
  address: Addresses.tip20ChannelReserve,
  abi: Abis.tip20ChannelReserve,
} as const

/** Reads the channel state of the failed call, when it targets the channel reserve. */
async function readChannel(context: Context) {
  const { call } = context
  if (!call || !isAddressEqual(call.address, Addresses.tip20ChannelReserve))
    return undefined
  const descriptor = call.arg<ox_Channel.Resolved>('descriptor')
  if (!descriptor) return { call, descriptor }
  const [channel, gracePeriod] = await context.read([
    {
      ...reserve,
      functionName: 'getChannel',
      args: [descriptor as never],
    },
    { ...reserve, functionName: 'CLOSE_GRACE_PERIOD' },
  ])
  return {
    call,
    descriptor,
    gracePeriod: gracePeriod?.result,
    state: channel?.result?.state,
  }
}

/** @internal */
export const errorResolvers: Resolvers = {
  'AmountExceedsDeposit()': async (context) => {
    const channel = await readChannel(context)
    if (!channel) return undefined
    return new ChannelAmountExceedsDepositError({
      ...context.base,
      amount: channel.call.arg<bigint>('cumulativeAmount'),
      deposit: channel.state?.deposit,
    })
  },
  'AmountNotIncreasing()': async (context) => {
    const channel = await readChannel(context)
    if (!channel) return undefined
    return new ChannelAmountNotIncreasingError({
      ...context.base,
      amount: channel.call.arg<bigint>('cumulativeAmount'),
      settled: channel.state?.settled,
    })
  },
  'ChannelNotFound()': (context) => {
    const { call } = context
    if (!call || !isAddressEqual(call.address, Addresses.tip20ChannelReserve))
      return undefined
    return new ChannelNotFoundError({
      ...context.base,
      descriptor: call.arg<Record<string, unknown>>('descriptor'),
    })
  },
  'CloseNotReady()': async (context) => {
    const channel = await readChannel(context)
    if (!channel) return undefined
    const closeRequestedAt = channel.state?.closeRequestedAt
    return new ChannelCloseNotReadyError({
      ...context.base,
      closeRequestedAt,
      readyAt:
        closeRequestedAt && channel.gracePeriod !== undefined
          ? BigInt(closeRequestedAt) + channel.gracePeriod
          : undefined,
    })
  },
  'SaltNotSignerCommitment(address,bytes32)': (context) => {
    const { call } = context
    if (!call || !isAddressEqual(call.address, Addresses.tip20ChannelReserve))
      return undefined
    return new ChannelSaltNotSignerCommitmentError(context.base)
  },
  'SignerConfigChanged(address)': (context) => {
    const { call } = context
    if (!call || !isAddressEqual(call.address, Addresses.tip20ChannelReserve))
      return undefined
    return new ChannelSignerConfigChangedError(context.base)
  },
}
