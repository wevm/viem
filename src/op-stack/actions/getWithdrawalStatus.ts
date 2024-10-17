import {
  type ReadContractErrorType,
  readContract,
} from '../../actions/public/readContract.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { ContractFunctionRevertedError } from '../../errors/contract.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Account } from '../../types/account.js'
import type {
  Chain,
  DeriveChain,
  GetChainParameter,
} from '../../types/chain.js'
import type { TransactionReceipt } from '../../types/transaction.js'
import type { OneOf } from '../../types/utils.js'
import { portal2Abi, portalAbi } from '../abis.js'
import {
  ReceiptContainsNoWithdrawalsError,
  type ReceiptContainsNoWithdrawalsErrorType,
} from '../errors/withdrawal.js'
import type { TargetChain } from '../types/chain.js'
import type { GetContractAddressParameter } from '../types/contract.js'
import {
  type GetWithdrawalsErrorType,
  getWithdrawals,
} from '../utils/getWithdrawals.js'
import {
  type GetGameErrorType,
  type GetGameParameters,
  getGame,
} from './getGame.js'
import {
  type GetL2OutputErrorType,
  type GetL2OutputParameters,
  getL2Output,
} from './getL2Output.js'
import {
  type GetPortalVersionParameters,
  getPortalVersion,
} from './getPortalVersion.js'
import {
  type GetTimeToFinalizeErrorType,
  type GetTimeToFinalizeParameters,
  getTimeToFinalize,
} from './getTimeToFinalize.js'

export type GetWithdrawalStatusParameters<
  chain extends Chain | undefined = Chain | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  _derivedChain extends Chain | undefined = DeriveChain<chain, chainOverride>,
> = GetChainParameter<chain, chainOverride> &
  OneOf<
    | GetContractAddressParameter<_derivedChain, 'l2OutputOracle' | 'portal'>
    | GetContractAddressParameter<
        _derivedChain,
        'disputeGameFactory' | 'portal'
      >
  > & {
    /**
     * Limit of games to extract to check withdrawal status.
     * @default 100
     */
    gameLimit?: number
    receipt: TransactionReceipt
  }
export type GetWithdrawalStatusReturnType =
  | 'waiting-to-prove'
  | 'ready-to-prove'
  | 'waiting-to-finalize'
  | 'ready-to-finalize'
  | 'finalized'

export type GetWithdrawalStatusErrorType =
  | GetL2OutputErrorType
  | GetTimeToFinalizeErrorType
  | GetWithdrawalsErrorType
  | ReadContractErrorType
  | ReceiptContainsNoWithdrawalsErrorType
  | ErrorType

/**
 * Returns the current status of a withdrawal. Used for the [Withdrawal](/op-stack/guides/withdrawals) flow.
 *
 * - Docs: https://viem.sh/op-stack/actions/getWithdrawalStatus
 *
 * @param client - Client to use
 * @param parameters - {@link GetWithdrawalStatusParameters}
 * @returns Status of the withdrawal. {@link GetWithdrawalStatusReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { getBlockNumber } from 'viem/actions'
 * import { mainnet, optimism } from 'viem/chains'
 * import { getWithdrawalStatus } from 'viem/op-stack'
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
 * const status = await getWithdrawalStatus(publicClientL1, {
 *   receipt,
 *   targetChain: optimism
 * })
 */
export async function getWithdrawalStatus<
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: GetWithdrawalStatusParameters<chain, chainOverride>,
  logIndex = 0
): Promise<GetWithdrawalStatusReturnType> {
  const {
    chain = client.chain,
    gameLimit = 100,
    receipt,
    targetChain: targetChain_,
  } = parameters

  const targetChain = targetChain_ as unknown as TargetChain

  const portalAddress = (() => {
    if (parameters.portalAddress) return parameters.portalAddress
    if (chain) return targetChain.contracts.portal[chain.id].address
    return Object.values(targetChain.contracts.portal)[0].address
  })()

  const withdrawal = getWithdrawals(receipt)[logIndex]

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
    const [outputResult, proveResult, finalizedResult, timeToFinalizeResult] =
      await Promise.allSettled([
        getL2Output(client, {
          ...parameters,
          l2BlockNumber: receipt.blockNumber,
        } as GetL2OutputParameters),
        readContract(client, {
          abi: portalAbi,
          address: portalAddress,
          functionName: 'provenWithdrawals',
          args: [withdrawal.withdrawalHash],
        }),
        readContract(client, {
          abi: portalAbi,
          address: portalAddress,
          functionName: 'finalizedWithdrawals',
          args: [withdrawal.withdrawalHash],
        }),
        getTimeToFinalize(client, {
          ...parameters,
          withdrawalHash: withdrawal.withdrawalHash,
        } as GetTimeToFinalizeParameters),
      ])

    // If the L2 Output is not processed yet (ie. the actions throws), this means
    // that the withdrawal is not ready to prove.
    if (outputResult.status === 'rejected') {
      const error = outputResult.reason as GetL2OutputErrorType
      if (
        error.cause instanceof ContractFunctionRevertedError &&
        error.cause.data?.args?.[0] ===
          'L2OutputOracle: cannot get output for a block that has not been proposed'
      )
        return 'waiting-to-prove'
      throw error
    }
    if (proveResult.status === 'rejected') throw proveResult.reason
    if (finalizedResult.status === 'rejected') throw finalizedResult.reason
    if (timeToFinalizeResult.status === 'rejected')
      throw timeToFinalizeResult.reason

    const [_, proveTimestamp] = proveResult.value
    if (!proveTimestamp) return 'ready-to-prove'

    const finalized = finalizedResult.value
    if (finalized) return 'finalized'

    const { seconds } = timeToFinalizeResult.value
    return seconds > 0 ? 'waiting-to-finalize' : 'ready-to-finalize'
  }

  const numProofSubmitters = await readContract(client, {
    abi: portal2Abi,
    address: portalAddress,
    functionName: 'numProofSubmitters',
    args: [withdrawal.withdrawalHash],
  }).catch(() => 1n)

  const proofSubmitter = await readContract(client, {
    abi: portal2Abi,
    address: portalAddress,
    functionName: 'proofSubmitters',
    args: [withdrawal.withdrawalHash, numProofSubmitters - 1n],
  }).catch(() => withdrawal.sender)

  const [disputeGameResult, checkWithdrawalResult, finalizedResult] =
    await Promise.allSettled([
      getGame(client, {
        ...parameters,
        l2BlockNumber: receipt.blockNumber,
        limit: gameLimit,
      } as GetGameParameters),
      readContract(client, {
        abi: portal2Abi,
        address: portalAddress,
        functionName: 'checkWithdrawal',
        args: [withdrawal.withdrawalHash, proofSubmitter],
      }),
      readContract(client, {
        abi: portal2Abi,
        address: portalAddress,
        functionName: 'finalizedWithdrawals',
        args: [withdrawal.withdrawalHash],
      }),
    ])

  if (finalizedResult.status === 'fulfilled' && finalizedResult.value)
    return 'finalized'

  if (disputeGameResult.status === 'rejected') {
    const error = disputeGameResult.reason as GetGameErrorType
    if (error.name === 'GameNotFoundError') return 'waiting-to-prove'
    throw disputeGameResult.reason
  }
  if (checkWithdrawalResult.status === 'rejected') {
    const error = checkWithdrawalResult.reason as ReadContractErrorType
    if (error.cause instanceof ContractFunctionRevertedError) {
      const errorMessage = error.cause.data?.args?.[0]
      if (
        errorMessage === 'OptimismPortal: invalid game type' ||
        errorMessage === 'OptimismPortal: withdrawal has not been proven yet' ||
        errorMessage ===
          'OptimismPortal: withdrawal has not been proven by proof submitter address yet' ||
        errorMessage ===
          'OptimismPortal: dispute game created before respected game type was updated'
      )
        return 'ready-to-prove'
      if (
        errorMessage ===
          'OptimismPortal: proven withdrawal has not matured yet' ||
        errorMessage ===
          'OptimismPortal: output proposal has not been finalized yet' ||
        errorMessage === 'OptimismPortal: output proposal in air-gap'
      )
        return 'waiting-to-finalize'

      if (error.cause.data?.errorName === 'InvalidGameType')
        return 'ready-to-prove'
    }
    throw checkWithdrawalResult.reason
  }
  if (finalizedResult.status === 'rejected') throw finalizedResult.reason

  return 'ready-to-finalize'
}
