import type { Address } from 'abitype'
import * as Hex from 'ox/Hex'
import { TokenId, ZoneId, ZoneRpcAuthentication } from 'ox/tempo'
import type { Account } from '../../accounts/types.js'
import { parseAccount } from '../../accounts/utils/parseAccount.js'
import { readContract } from '../../actions/public/readContract.js'
import {
  type SendTransactionReturnType,
  sendTransaction,
} from '../../actions/wallet/sendTransaction.js'
import { sendTransactionSync } from '../../actions/wallet/sendTransactionSync.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { zeroHash } from '../../constants/bytes.js'
import type { BaseErrorType } from '../../errors/base.js'
import type { Chain } from '../../types/chain.js'
import type { Compute } from '../../types/utils.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import * as Abis from '../Abis.js'
import * as Addresses from '../Addresses.js'
import type {
  GetAccountParameter,
  ReadParameters,
  WriteParameters,
} from '../internal/types.js'
import { defineCall } from '../internal/utils.js'
import * as Storage from '../Storage.js'
import type { TransactionReceipt } from '../Transaction.js'
import * as ZoneAbis from '../zones/Abis.js'
import { getPortalAddress } from '../zones/zone.js'

/**
 * Deposits tokens into a zone on the parent Tempo chain.
 * Batches approve and deposit into a single transaction.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempoModerato } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempoModerato,
 *   transport: http(),
 * })
 *
 * const hash = await Actions.zone.deposit(client, {
 *   token: '0x20c0...0001',
 *   amount: 1_000_000n,
 *   zoneId: 7,
 * })
 * ```
 *
 * @param client - Wallet client connected to the parent Tempo chain.
 * @param parameters - Deposit parameters.
 * @returns The transaction hash.
 */
export async function deposit<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: deposit.Parameters<chain, account>,
): Promise<deposit.ReturnValue> {
  const chainId = client.chain?.id
  if (!chainId) throw new Error('`chain` is required.')

  const { account = client.account, ...rest } = parameters

  const account_ = account ? parseAccount(account) : undefined
  if (!account) throw new Error('`account` is required.')

  const recipient = parameters.recipient ?? account_?.address
  if (!recipient) throw new Error('`recipient` is required.')

  const args = { ...parameters, chainId, recipient }
  return sendTransaction(client, {
    ...rest,
    calls: deposit.calls(args),
  } as never) as never
}

export namespace deposit {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> &
    Omit<Args, 'chainId' | 'recipient'> & {
      /** Recipient address in the zone. @default `account.address` */
      recipient?: Address | undefined
    }

  export type Args = {
    /** Amount of tokens to deposit. */
    amount: bigint
    /** Parent chain ID (e.g. `42431` for moderato). */
    chainId: number
    /** Optional deposit memo. @default `0x00...00` */
    memo?: Hex.Hex | undefined
    /** Recipient address in the zone. */
    recipient: Address
    /** Token address or ID to deposit. */
    token: TokenId.TokenIdOrAddress
    /** Zone ID (e.g. `7`). */
    zoneId: number
  }

  export type ReturnValue = SendTransactionReturnType

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType

  /**
   * Defines the calls to approve and deposit tokens into a zone.
   *
   * @param args - Arguments.
   * @returns The calls.
   */
  export function calls(args: Args) {
    const { amount, chainId, memo = zeroHash, recipient, token, zoneId } = args
    const portalAddress = getPortalAddress(chainId, zoneId)
    return [
      defineCall({
        address: TokenId.toAddress(token),
        abi: Abis.tip20,
        functionName: 'approve',
        args: [portalAddress, amount],
      }),
      defineCall({
        address: portalAddress,
        abi: ZoneAbis.zonePortal,
        functionName: 'deposit',
        args: [TokenId.toAddress(token), recipient, amount, memo],
      }),
    ]
  }
}

/**
 * Deposits tokens into a zone on the parent Tempo chain and waits for the
 * transaction receipt.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempoModerato } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempoModerato,
 *   transport: http(),
 * })
 *
 * const result = await Actions.zone.depositSync(client, {
 *   token: '0x20c0...0001',
 *   amount: 1_000_000n,
 *   zoneId: 7,
 * })
 * ```
 *
 * @param client - Wallet client connected to the parent Tempo chain.
 * @param parameters - Deposit parameters.
 * @returns The transaction receipt.
 */
export async function depositSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: depositSync.Parameters<chain, account>,
): Promise<depositSync.ReturnValue> {
  const chainId = client.chain?.id
  if (!chainId) throw new Error('`chain` is required.')

  const {
    account = client.account,
    throwOnReceiptRevert = true,
    ...rest
  } = parameters

  const account_ = account ? parseAccount(account) : undefined
  if (!account) throw new Error('`account` is required.')

  const recipient = parameters.recipient ?? account_?.address
  if (!recipient) throw new Error('`recipient` is required.')

  const args = { ...parameters, chainId, recipient }
  const receipt = await sendTransactionSync(client, {
    ...rest,
    throwOnReceiptRevert,
    calls: deposit.calls(args),
  } as never)
  return { receipt }
}

export namespace depositSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = deposit.Parameters<chain, account>

  export type Args = deposit.Args

  export type ReturnValue = Compute<{
    /** Transaction receipt. */
    receipt: TransactionReceipt
  }>

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Returns the authenticated account address and authorization token expiry.
 *
 * @example
 * ```ts
 * import { createClient } from 'viem'
 * import { http, zoneModerato } from 'viem/tempo/zones'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: zoneModerato(7),
 *   transport: http(),
 * })
 *
 * const info = await Actions.zone.getAuthorizationTokenInfo(client)
 * ```
 *
 * @param client - Zone client.
 * @returns Authorization token info.
 */
export async function getAuthorizationTokenInfo<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
): Promise<getAuthorizationTokenInfo.ReturnType> {
  const info = await client.request<{
    Method: 'zone_getAuthorizationTokenInfo'
    Parameters: []
    ReturnType: getAuthorizationTokenInfo.RpcReturnType
  }>({
    method: 'zone_getAuthorizationTokenInfo',
    params: [],
  })

  return {
    account: info.account,
    expiresAt: Hex.toBigInt(info.expiresAt),
  }
}

export namespace getAuthorizationTokenInfo {
  export type RpcReturnType = {
    account: Address
    expiresAt: Hex.Hex
  }

  export type ReturnType = {
    account: Address
    expiresAt: bigint
  }

  export type ErrorType = RequestErrorType | BaseErrorType
}

/**
 * Returns deposit processing status for a given Tempo block number.
 *
 * @example
 * ```ts
 * import { createClient } from 'viem'
 * import { http, zoneModerato } from 'viem/tempo/zones'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: zoneModerato(7),
 *   transport: http(),
 * })
 *
 * const status = await Actions.zone.getDepositStatus(client, {
 *   tempoBlockNumber: 42n,
 * })
 * ```
 *
 * @param client - Zone client.
 * @param parameters - Parameters including the Tempo block number.
 * @returns Deposit status.
 */
export async function getDepositStatus<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: getDepositStatus.Parameters,
): Promise<getDepositStatus.ReturnType> {
  const { tempoBlockNumber } = parameters
  const status = await client.request<{
    Method: 'zone_getDepositStatus'
    Parameters: [Hex.Hex]
    ReturnType: getDepositStatus.RpcReturnType
  }>({
    method: 'zone_getDepositStatus',
    params: [Hex.fromNumber(tempoBlockNumber)],
  })

  return {
    deposits: status.deposits.map((deposit) => ({
      amount: Hex.toBigInt(deposit.amount),
      depositHash: deposit.depositHash,
      kind: deposit.kind,
      memo: deposit.memo,
      recipient: deposit.recipient,
      sender: deposit.sender,
      status: deposit.status,
      token: deposit.token,
    })),
    processed: status.processed,
    tempoBlockNumber: Hex.toBigInt(status.tempoBlockNumber),
    zoneProcessedThrough: Hex.toBigInt(status.zoneProcessedThrough),
  }
}

export namespace getDepositStatus {
  export type DepositStatus = 'failed' | 'pending' | 'processed'
  export type DepositKind = 'encrypted' | 'regular'

  export type DepositRpc = {
    amount: Hex.Hex
    depositHash: Hex.Hex
    kind: DepositKind
    memo: Hex.Hex | null
    recipient: Address | null
    sender: Address
    status: DepositStatus
    token: Address
  }

  export type Deposit = {
    amount: bigint
    depositHash: Hex.Hex
    kind: DepositKind
    memo: Hex.Hex | null
    recipient: Address | null
    sender: Address
    status: DepositStatus
    token: Address
  }

  export type RpcReturnType = {
    deposits: readonly DepositRpc[]
    processed: boolean
    tempoBlockNumber: Hex.Hex
    zoneProcessedThrough: Hex.Hex
  }

  export type Parameters = {
    tempoBlockNumber: bigint
  }

  export type ReturnType = {
    deposits: readonly Deposit[]
    processed: boolean
    tempoBlockNumber: bigint
    zoneProcessedThrough: bigint
  }

  export type ErrorType = RequestErrorType | BaseErrorType
}

/**
 * Returns the fee required for a withdrawal from a zone, given a gas limit.
 *
 * The client must be connected to the **zone chain**.
 *
 * @example
 * ```ts
 * import { createClient } from 'viem'
 * import { http, zoneModerato } from 'viem/tempo/zones'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: zoneModerato(7),
 *   transport: http(),
 * })
 *
 * const fee = await Actions.zone.getWithdrawalFee(client)
 * ```
 *
 * @param client - Zone client.
 * @param parameters - Optional gas limit parameter.
 * @returns The withdrawal fee as a bigint.
 */
export async function getWithdrawalFee<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: getWithdrawalFee.Parameters = {},
): Promise<getWithdrawalFee.ReturnType> {
  const { gas = 0n, ...rest } = parameters
  return readContract(client, {
    ...rest,
    address: Addresses.zoneOutbox,
    abi: ZoneAbis.zoneOutbox,
    functionName: 'calculateWithdrawalFee',
    args: [gas],
  })
}

export namespace getWithdrawalFee {
  export type Parameters = ReadParameters & {
    /** Gas limit for the withdrawal callback. @default `0n` */
    gas?: bigint | undefined
  }

  export type ReturnType = bigint

  export type ErrorType = RequestErrorType | BaseErrorType
}

/**
 * Returns the current zone metadata.
 *
 * @example
 * ```ts
 * import { createClient } from 'viem'
 * import { http, zoneModerato } from 'viem/tempo/zones'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: zoneModerato(7),
 *   transport: http(),
 * })
 *
 * const info = await Actions.zone.getZoneInfo(client)
 * ```
 *
 * @param client - Zone client.
 * @returns Zone metadata.
 */
export async function getZoneInfo<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(client: Client<Transport, chain, account>): Promise<getZoneInfo.ReturnType> {
  const info = await client.request<{
    Method: 'zone_getZoneInfo'
    Parameters: []
    ReturnType: getZoneInfo.RpcReturnType
  }>({
    method: 'zone_getZoneInfo',
    params: [],
  })

  return {
    chainId: Hex.toNumber(info.chainId),
    sequencer: info.sequencer,
    zoneId: Hex.toNumber(info.zoneId),
    zoneTokens: info.zoneTokens,
  }
}

export namespace getZoneInfo {
  export type RpcReturnType = {
    chainId: Hex.Hex
    sequencer: Address
    zoneId: Hex.Hex
    zoneTokens: readonly Address[]
  }

  export type ReturnType = {
    chainId: number
    sequencer: Address
    zoneId: number
    zoneTokens: readonly Address[]
  }

  export type ErrorType = RequestErrorType | BaseErrorType
}

/**
 * Requests a withdrawal from a zone to the parent Tempo chain via the
 * ZoneOutbox contract.
 *
 * The client must be connected to the **zone chain**.
 *
 * @example
 * ```ts
 * import { createClient } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { http, zoneModerato } from 'viem/tempo/zones'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: zoneModerato(7),
 *   transport: http(),
 * })
 *
 * const hash = await Actions.zone.requestWithdrawal(client, {
 *   token: '0x20c0...0001',
 *   amount: 1_000_000n,
 * })
 * ```
 *
 * @param client - Wallet client connected to the zone chain.
 * @param parameters - Withdrawal parameters.
 * @returns The transaction hash.
 */
export async function requestWithdrawal<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: requestWithdrawal.Parameters<chain, account>,
): Promise<requestWithdrawal.ReturnValue> {
  const { account = client.account, ...rest } = parameters

  const account_ = account ? parseAccount(account) : undefined
  if (!account) throw new Error('`account` is required.')

  const to = parameters.to ?? account_?.address
  if (!to) throw new Error('`to` is required.')

  const args = { ...parameters, to }
  return sendTransaction(client, {
    ...rest,
    calls: requestWithdrawal.calls(args),
  } as never) as never
}

export namespace requestWithdrawal {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> &
    Omit<Args, 'to'> & {
      /** Recipient address on the parent Tempo chain. @default `account.address` */
      to?: Address | undefined
    }

  export type Args = {
    /** Amount of tokens to withdraw. */
    amount: bigint
    /** Optional callback data for the recipient. @default `'0x'` */
    data?: Hex.Hex | undefined
    /** Fallback address if callback fails. @default `to` */
    fallbackRecipient?: Address | undefined
    /** Gas limit reserved for the withdrawal callback on the parent chain. @default `0n` */
    gas?: bigint | undefined
    /** Optional withdrawal memo. @default `0x00...00` */
    memo?: Hex.Hex | undefined
    /** Recipient address on the parent Tempo chain. */
    to: Address
    /** Token address or ID to withdraw. */
    token: TokenId.TokenIdOrAddress
  }

  export type ReturnValue = SendTransactionReturnType

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType

  /**
   * Defines the calls to approve and request a withdrawal from a zone.
   *
   * @param args - Arguments.
   * @returns The calls.
   */
  export function calls(args: Args) {
    const {
      amount,
      data = '0x',
      fallbackRecipient = args.to,
      gas = 0n,
      memo = zeroHash,
      to,
      token,
    } = args
    return [
      defineCall({
        address: TokenId.toAddress(token),
        abi: Abis.tip20,
        functionName: 'approve',
        args: [Addresses.zoneOutbox, amount],
      }),
      defineCall({
        address: Addresses.zoneOutbox,
        abi: ZoneAbis.zoneOutbox,
        functionName: 'requestWithdrawal',
        args: [
          TokenId.toAddress(token),
          to,
          amount,
          memo,
          gas,
          fallbackRecipient,
          data,
        ],
      }),
    ]
  }
}

/**
 * Requests a withdrawal from a zone to the parent Tempo chain and waits for
 * the transaction receipt.
 *
 * @example
 * ```ts
 * import { createClient } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { http, zoneModerato } from 'viem/tempo/zones'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: zoneModerato(7),
 *   transport: http(),
 * })
 *
 * const result = await Actions.zone.requestWithdrawalSync(client, {
 *   token: '0x20c0...0001',
 *   amount: 1_000_000n,
 * })
 * ```
 *
 * @param client - Wallet client connected to the zone chain.
 * @param parameters - Withdrawal parameters.
 * @returns The transaction receipt.
 */
export async function requestWithdrawalSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: requestWithdrawalSync.Parameters<chain, account>,
): Promise<requestWithdrawalSync.ReturnValue> {
  const {
    account = client.account,
    throwOnReceiptRevert = true,
    ...rest
  } = parameters

  const account_ = account ? parseAccount(account) : undefined
  if (!account) throw new Error('`account` is required.')

  const to = parameters.to ?? account_?.address
  if (!to) throw new Error('`to` is required.')

  const args = { ...parameters, to }
  const receipt = await sendTransactionSync(client, {
    ...rest,
    calls: requestWithdrawal.calls(args),
    throwOnReceiptRevert,
  } as never)
  return { receipt }
}

export namespace requestWithdrawalSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = requestWithdrawal.Parameters<chain, account>

  export type Args = requestWithdrawal.Args

  export type ReturnValue = Compute<{
    /** Transaction receipt. */
    receipt: TransactionReceipt
  }>

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Signs a zone authorization token and stores it for the zone HTTP transport.
 *
 * Zone chains should define `contracts.zonePortal` with the portal address.
 * The `zoneId` is derived from `ZoneId.fromChainId(chain.id)` and can be overridden.
 *
 * @example
 * ```ts
 * import { createClient } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { http, zoneModerato } from 'viem/tempo/zones'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: zoneModerato(7),
 *   transport: http(),
 * })
 *
 * const result = await Actions.zone.signAuthorizationToken(client)
 * ```
 *
 * @param client - Zone wallet client.
 * @param parameters - Options including optional storage override.
 * @returns The authentication object and serialized token.
 */
export async function signAuthorizationToken<
  chain extends Chain | undefined,
  account extends Account | undefined,
  accountOverride extends Account | Address | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: signAuthorizationToken.Parameters<
    account,
    accountOverride
  > = {} as any,
): Promise<signAuthorizationToken.ReturnType> {
  const {
    account = client.account,
    issuedAt = Math.floor(Date.now() / 1000),
    expiresAt = issuedAt + 86_400,
    storage = Storage.defaultStorage(),
  } = parameters

  const chain = parameters.chain ?? client.chain
  if (!chain) throw new Error('`signAuthorizationToken` requires a chain.')

  const account_ = account ? parseAccount(account) : undefined
  if (!account_ || !account_.sign)
    throw new Error('`account` with `sign` is required.')

  const storageKey = `auth:${account_.address.toLowerCase()}:${chain.id}`

  const authentication = ZoneRpcAuthentication.from({
    chainId: chain.id,
    expiresAt,
    issuedAt,
    zoneId: ZoneId.fromChainId(chain.id),
  })

  const payload = ZoneRpcAuthentication.getSignPayload(authentication)
  const signature = await account_.sign({ hash: payload })

  const token = ZoneRpcAuthentication.serialize(authentication, {
    signature,
  })

  await storage.setItem(storageKey, token)
  await storage.setItem(`auth:token:${chain.id}`, token)

  return { authentication, token }
}

export namespace signAuthorizationToken {
  export type Parameters<
    account extends Account | undefined = Account | undefined,
    accountOverride extends Account | Address | undefined =
      | Account
      | Address
      | undefined,
  > = GetAccountParameter<account, accountOverride> & {
    /** Chain override. @default `client.chain`. */
    chain?: Chain | undefined
    /** Token expiry as a unix timestamp (seconds). @default `issuedAt + 86_400`. */
    expiresAt?: number | undefined
    /** Token issue time as a unix timestamp (seconds). @default `Date.now() / 1000`. */
    issuedAt?: number | undefined
    /** Storage to persist the token. @default sessionStorage (web) or memory (server). */
    storage?: Storage.Storage | undefined
  }

  export type ReturnType = {
    authentication: ZoneRpcAuthentication.ZoneRpcAuthentication
    token: Hex.Hex
  }

  export type ErrorType = BaseErrorType
}
