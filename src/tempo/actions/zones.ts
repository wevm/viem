import type { Address } from 'abitype'
import * as Hex from 'ox/Hex'
import { ZoneId, ZoneRpcAuthentication } from 'ox/tempo'
import type { Account } from '../../accounts/types.js'
import { parseAccount } from '../../accounts/utils/parseAccount.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { BaseErrorType } from '../../errors/base.js'
import type { Chain } from '../../types/chain.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import { getChainContractAddress } from '../../utils/chain/getChainContractAddress.js'
import type { GetAccountParameter } from '../internal/types.js'
import * as Storage from '../Storage.js'

/**
 * Signs a zone authorization token and stores it for the zone HTTP transport.
 *
 * Zone chains should define `contracts.zonePortal` with the portal address.
 * The `zoneId` is derived from `ZoneId.fromChainId(chain.id)` and can be overridden.
 *
 * @example
 * ```ts
 * import { createWalletClient } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { http, zone003 } from 'viem/tempo/zones'
 * import * as zones from 'viem/tempo/zones'
 *
 * const client = createWalletClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: zone003,
 *   transport: http(),
 * })
 *
 * const result = await zones.signAuthorizationToken(client)
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
  parameters: signAuthorizationToken.Parameters<account, accountOverride>,
): Promise<signAuthorizationToken.ReturnType> {
  const {
    account = client.account,
    issuedAt = Math.floor(Date.now() / 1000),
    expiresAt = issuedAt + 86_400,
    storage = Storage.defaultStorage(),
  } = parameters

  const chain = parameters.chain ?? client.chain
  if (!chain) throw new Error('`signAuthorizationToken` requires a chain.')

  const portalAddress = (() => {
    if (parameters.portalAddress) return parameters.portalAddress
    return getChainContractAddress({ chain, contract: 'zonePortal' })
  })()

  const account_ = account ? parseAccount(account) : undefined
  if (!account_ || !account_.sign)
    throw new Error('`account` with `sign` is required.')

  const storageKey = `auth:${account_.address.toLowerCase()}:${chain.id}`

  const authentication = ZoneRpcAuthentication.from({
    chainId: chain.id,
    expiresAt,
    issuedAt,
    zoneId: ZoneId.fromChainId(chain.id),
    zonePortal: portalAddress,
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
    /** Zone portal contract address. @default `chain.contracts.zonePortal.address`. */
    portalAddress?: Address | undefined
    /** Storage to persist the token. @default sessionStorage (web) or memory (server). */
    storage?: Storage.Storage | undefined
  }

  export type ReturnType = {
    authentication: ZoneRpcAuthentication.ZoneRpcAuthentication
    token: Hex.Hex
  }

  export type ErrorType = BaseErrorType
}

/**
 * Returns the authenticated account address and authorization token expiry.
 *
 * @example
 * ```ts
 * import { createPublicClient } from 'viem'
 * import { http, zone003 } from 'viem/tempo/zones'
 * import * as zones from 'viem/tempo/zones'
 *
 * const client = createPublicClient({
 *   chain: zone003,
 *   transport: http(),
 * })
 *
 * const info = await zones.getAuthorizationTokenInfo(client)
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
 * Returns the current zone metadata.
 *
 * @example
 * ```ts
 * import { createPublicClient } from 'viem'
 * import { http, zone003 } from 'viem/tempo/zones'
 * import * as zones from 'viem/tempo/zones'
 *
 * const client = createPublicClient({
 *   chain: zone003,
 *   transport: http(),
 * })
 *
 * const info = await zones.getZoneInfo(client)
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
 * Returns deposit processing status for a given Tempo block number.
 *
 * @example
 * ```ts
 * import { createPublicClient } from 'viem'
 * import { http, zone003 } from 'viem/tempo/zones'
 * import * as zones from 'viem/tempo/zones'
 *
 * const client = createPublicClient({
 *   chain: zone003,
 *   transport: http(),
 * })
 *
 * const status = await zones.getDepositStatus(client, {
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
