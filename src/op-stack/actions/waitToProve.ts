import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Account } from '../../types/account.js'
import type {
  Chain,
  DeriveChain,
  GetChainParameter,
} from '../../types/chain.js'
import type { TransactionReceipt } from '../../types/transaction.js'
import type { OneOf } from '../../types/utils.js'
import { ReceiptContainsNoWithdrawalsError } from '../errors/withdrawal.js'
import type { GetContractAddressParameter } from '../types/contract.js'
import type { Withdrawal } from '../types/withdrawal.js'
import {
  type GetWithdrawalsErrorType,
  getWithdrawals,
} from '../utils/getWithdrawals.js'
import {
  type GetPortalVersionParameters,
  getPortalVersion,
} from './getPortalVersion.js'
import {
  type WaitForNextGameParameters,
  type WaitForNextGameReturnType,
  waitForNextGame,
} from './waitForNextGame.js'
import {
  type WaitForNextL2OutputErrorType,
  type WaitForNextL2OutputParameters,
  type WaitForNextL2OutputReturnType,
  waitForNextL2Output,
} from './waitForNextL2Output.js'

export type WaitToProveParameters<
  chain extends Chain | undefined = Chain | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  _derivedChain extends Chain | undefined = DeriveChain<chain, chainOverride>,
> = GetChainParameter<chain, chainOverride> &
  OneOf<
    | GetContractAddressParameter<_derivedChain, 'l2OutputOracle'>
    | GetContractAddressParameter<
        _derivedChain,
        'disputeGameFactory' | 'portal'
      >
  > & {
    /**
     * Limit of games to extract.
     * @default 100
     */
    gameLimit?: number | undefined
    receipt: TransactionReceipt
    /**
     * Polling frequency (in ms). Defaults to Client's pollingInterval config.
     * @default client.pollingInterval
     */
    pollingInterval?: number | undefined
  }
export type WaitToProveReturnType = {
  game: WaitForNextGameReturnType
  output: WaitForNextL2OutputReturnType
  withdrawal: Withdrawal
}

export type WaitToProveErrorType =
  | GetWithdrawalsErrorType
  | WaitForNextL2OutputErrorType
  | ErrorType

/**
 * Waits until the L2 withdrawal transaction is ready to be proved. Used for the [Withdrawal](/op-stack/guides/withdrawals) flow.
 *
 * - Docs: https://viem.sh/op-stack/actions/waitToProve
 *
 * @param client - Client to use
 * @param parameters - {@link WaitToProveParameters}
 * @returns The L2 output and withdrawal message. {@link WaitToProveReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { getBlockNumber } from 'viem/actions'
 * import { mainnet, optimism } from 'viem/chains'
 * import { waitToProve } from 'viem/op-stack'
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
 * await waitToProve(publicClientL1, {
 *   receipt,
 *   targetChain: optimism
 * })
 */
export async function waitToProve<
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: WaitToProveParameters<chain, chainOverride>,
): Promise<WaitToProveReturnType> {
  const { gameLimit, receipt } = parameters

  const [withdrawal] = getWithdrawals(receipt)

  if (!withdrawal)
    throw new ReceiptContainsNoWithdrawalsError({
      hash: receipt.transactionHash,
    })

  const portalVersion = await getPortalVersion(
    client,
    parameters as GetPortalVersionParameters,
  )

  // Legacy (Portal < v3)
  if (portalVersion.major < 3) {
    const output = await waitForNextL2Output(client, {
      ...parameters,
      l2BlockNumber: receipt.blockNumber,
    } as WaitForNextL2OutputParameters)
    return {
      game: {
        extraData: '0x',
        index: output.outputIndex,
        l2BlockNumber: output.l2BlockNumber,
        metadata: '0x',
        rootClaim: output.outputRoot,
        timestamp: output.timestamp,
      },
      output,
      withdrawal,
    }
  }

  const game = await waitForNextGame(client, {
    ...parameters,
    limit: gameLimit,
    l2BlockNumber: receipt.blockNumber,
  } as WaitForNextGameParameters)
  return {
    game,
    output: {
      l2BlockNumber: game.l2BlockNumber,
      outputIndex: game.index,
      outputRoot: game.rootClaim,
      timestamp: game.timestamp,
    },
    withdrawal,
  }
}
