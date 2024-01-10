import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { ErrorType } from '../../../errors/utils.js'
import type { Account } from '../../../types/account.js'
import type {
  Chain,
  DeriveChain,
  GetChainParameter,
} from '../../../types/chain.js'
import type { TransactionReceipt } from '../../../types/transaction.js'
import type { GetContractAddressParameter } from '../types/contract.js'
import {
  type GetTimeToNextL2OutputErrorType,
  type GetTimeToNextL2OutputParameters,
  type GetTimeToNextL2OutputReturnType,
  getTimeToNextL2Output,
} from './getTimeToNextL2Output.js'

export type GetTimeToProveParameters<
  chain extends Chain | undefined = Chain | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  _derivedChain extends Chain | undefined = DeriveChain<chain, chainOverride>,
> = GetChainParameter<chain, chainOverride> &
  GetContractAddressParameter<_derivedChain, 'l2OutputOracle'> & {
    /**
     * The buffer to account for discrepencies between non-deterministic time intervals.
     * @default 1.1
     */
    intervalBuffer?: GetTimeToNextL2OutputParameters['intervalBuffer']
    receipt: TransactionReceipt
  }
export type GetTimeToProveReturnType = GetTimeToNextL2OutputReturnType
export type GetTimeToProveErrorType = GetTimeToNextL2OutputErrorType | ErrorType

/**
 * Returns the time until the withdrawal transaction is ready to prove. Used for the [Withdrawal](/op-stack/guides/withdrawals) flow.
 *
 * - Docs: https://viem.sh/op-stack/actions/getTimeToProve
 *
 * @param client - Client to use
 * @param parameters - {@link GetTimeToNextL2OutputParameters}
 * @returns Time until prove step is ready. {@link GetTimeToNextL2OutputReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { getBlockNumber } from 'viem/actions'
 * import { mainnet, optimism } from 'viem/chains'
 * import { getTimeToProve } from 'viem/op-stack'
 *
 * const publicClientL1 = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const publicClientL2 = createPublicClient({
 *   chain: optimism,
 *   transport: http(),
 * })
 *
 * const receipt = await publicClientL2.getTransactionReceipt({ hash: '0x...' })
 * const { period, seconds, timestamp } = await getTimeToProve(publicClientL1, {
 *   receipt,
 *   targetChain: optimism
 * })
 */
export async function getTimeToProve<
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: GetTimeToProveParameters<chain, chainOverride>,
): Promise<GetTimeToProveReturnType> {
  const { receipt } = parameters

  return getTimeToNextL2Output(client, {
    ...parameters,
    l2BlockNumber: receipt.blockNumber,
  })
}
