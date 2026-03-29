import type { Address } from 'abitype'
import type { Account } from '../../accounts/types.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Chain } from '../../types/chain.js'
import type { Hex } from '../../types/misc.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import {
  type HexToBigIntErrorType,
  type HexToNumberErrorType,
  hexToBigInt,
  hexToNumber,
} from '../../utils/encoding/fromHex.js'
import {
  type NumberToHexErrorType,
  numberToHex,
} from '../../utils/encoding/toHex.js'

export type GetAuthorizationTokenInfoRpcReturnType = {
  account: Address
  expiresAt: Hex
}

export type GetAuthorizationTokenInfoReturnType = {
  account: Address
  expiresAt: bigint
}

export type PrepareAuthorizationTokenReturnType =
  GetAuthorizationTokenInfoReturnType

export type GetAuthorizationTokenInfoErrorType =
  | RequestErrorType
  | HexToBigIntErrorType
  | ErrorType

/**
 * Returns the authenticated account address and authorization token expiry.
 *
 * @param client - Zone client to use.
 * @returns Authorization token info.
 */
export async function getAuthorizationTokenInfo<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
): Promise<GetAuthorizationTokenInfoReturnType> {
  const info = await client.request<{
    Method: 'zone_getAuthorizationTokenInfo'
    Parameters: []
    ReturnType: GetAuthorizationTokenInfoRpcReturnType
  }>({
    method: 'zone_getAuthorizationTokenInfo',
    params: [],
  })

  return {
    account: info.account,
    expiresAt: hexToBigInt(info.expiresAt),
  }
}

export type GetZoneInfoRpcReturnType = {
  chainId: Hex
  sequencer: Address
  zoneId: Hex
  zoneTokens: readonly Address[]
}

export type GetZoneInfoReturnType = {
  chainId: number
  sequencer: Address
  zoneId: number
  zoneTokens: readonly Address[]
}

export type GetZoneInfoErrorType =
  | RequestErrorType
  | HexToNumberErrorType
  | ErrorType

/**
 * Returns the current zone metadata.
 *
 * @param client - Zone client to use.
 * @returns Zone metadata.
 */
export async function getZoneInfo<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(client: Client<Transport, chain, account>): Promise<GetZoneInfoReturnType> {
  const info = await client.request<{
    Method: 'zone_getZoneInfo'
    Parameters: []
    ReturnType: GetZoneInfoRpcReturnType
  }>({
    method: 'zone_getZoneInfo',
    params: [],
  })

  return {
    chainId: hexToNumber(info.chainId),
    sequencer: info.sequencer,
    zoneId: hexToNumber(info.zoneId),
    zoneTokens: info.zoneTokens,
  }
}

export type DepositStatus = 'failed' | 'pending' | 'processed'
export type DepositKind = 'encrypted' | 'regular'

export type DepositRpc = {
  amount: Hex
  depositHash: Hex
  kind: DepositKind
  memo: Hex | null
  recipient: Address | null
  sender: Address
  status: DepositStatus
  token: Address
}

export type Deposit = {
  amount: bigint
  depositHash: Hex
  kind: DepositKind
  memo: Hex | null
  recipient: Address | null
  sender: Address
  status: DepositStatus
  token: Address
}

export type GetDepositStatusRpcReturnType = {
  deposits: readonly DepositRpc[]
  processed: boolean
  tempoBlockNumber: Hex
  zoneProcessedThrough: Hex
}

export type GetDepositStatusReturnType = {
  deposits: readonly Deposit[]
  processed: boolean
  tempoBlockNumber: bigint
  zoneProcessedThrough: bigint
}

export type GetDepositStatusErrorType =
  | RequestErrorType
  | HexToBigIntErrorType
  | NumberToHexErrorType
  | ErrorType

export async function getDepositStatus<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: getDepositStatus.Parameters,
): Promise<GetDepositStatusReturnType> {
  const { tempoBlockNumber } = parameters
  const status = await client.request<{
    Method: 'zone_getDepositStatus'
    Parameters: [Hex]
    ReturnType: GetDepositStatusRpcReturnType
  }>({
    method: 'zone_getDepositStatus',
    params: [numberToHex(tempoBlockNumber)],
  })

  return {
    deposits: status.deposits.map((deposit) => ({
      amount: hexToBigInt(deposit.amount),
      depositHash: deposit.depositHash,
      kind: deposit.kind,
      memo: deposit.memo,
      recipient: deposit.recipient,
      sender: deposit.sender,
      status: deposit.status,
      token: deposit.token,
    })),
    processed: status.processed,
    tempoBlockNumber: hexToBigInt(status.tempoBlockNumber),
    zoneProcessedThrough: hexToBigInt(status.zoneProcessedThrough),
  }
}

export namespace getDepositStatus {
  export type Parameters = {
    tempoBlockNumber: bigint
  }
}

export type ZoneActions = {
  /**
   * Signs and caches a zone authorization token without making an RPC request.
   */
  prepareAuthorizationToken: () => Promise<PrepareAuthorizationTokenReturnType>
  /**
   * Returns the authenticated account address and token expiry.
   */
  getAuthorizationTokenInfo: () => Promise<GetAuthorizationTokenInfoReturnType>
  /**
   * Returns the current zone metadata.
   */
  getZoneInfo: () => Promise<GetZoneInfoReturnType>
  /**
   * Returns deposit processing status for a given Tempo L1 block.
   */
  getDepositStatus: (
    parameters: getDepositStatus.Parameters,
  ) => Promise<GetDepositStatusReturnType>
}
