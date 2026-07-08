import { Hex } from 'ox'
import type { Address, Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'

/**
 * Returns deposit processing status for a given Tempo block number.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({ transport: http() })
 *
 * const status = await Actions.zone.getDepositStatus(client, {
 *   tempoBlockNumber: 42n,
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns Deposit status.
 */
export async function getDepositStatus<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: getDepositStatus.Options,
): Promise<getDepositStatus.ReturnType> {
  const { tempoBlockNumber } = options
  const status = (await client.request({
    method: 'zone_getDepositStatus',
    params: [Hex.fromNumber(tempoBlockNumber)],
  })) as getDepositStatus.RpcReturnType
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
  export type DepositKind = 'encrypted' | 'regular'
  export type DepositStatus = 'failed' | 'pending' | 'processed'
  export type DepositRpc = {
    amount: Hex.Hex
    depositHash: Hex.Hex
    kind: DepositKind
    memo: Hex.Hex | null
    recipient: Address.Address | null
    sender: Address.Address
    status: DepositStatus
    token: Address.Address
  }
  export type Deposit = {
    amount: bigint
    depositHash: Hex.Hex
    kind: DepositKind
    memo: Hex.Hex | null
    recipient: Address.Address | null
    sender: Address.Address
    status: DepositStatus
    token: Address.Address
  }
  export type Options = {
    /** Tempo block number to query. */
    tempoBlockNumber: bigint
  }
  export type RpcReturnType = {
    deposits: readonly DepositRpc[]
    processed: boolean
    tempoBlockNumber: Hex.Hex
    zoneProcessedThrough: Hex.Hex
  }
  export type ReturnType = {
    deposits: readonly Deposit[]
    processed: boolean
    tempoBlockNumber: bigint
    zoneProcessedThrough: bigint
  }
  export type ErrorType = Errors.GlobalErrorType
}
