import type { Address, Errors, Hex, TransactionReceipt } from 'ox'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import * as ContractError from '../../../core/ContractError.js'
import { read } from '../../../core/actions/contract/read.js'
import * as Game from '../../Game.js'
import * as Withdrawal from '../../Withdrawal.js'
import { anchorStateRegistryAbi, portal2Abi, portalAbi } from '../../abis.js'
import { getGame } from './getGame.js'
import { getL2Output } from './getL2Output.js'
import { getPortalVersion } from './getPortalVersion.js'
import { getTimeToFinalize } from './getTimeToFinalize.js'
import {
  type ContractParameters,
  getContractAddress,
  isContractCallUnavailable,
} from './internal.js'

/** Returns the current lifecycle status of an OP Stack withdrawal. */
export async function getWithdrawalStatus<
  chain extends Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: getWithdrawalStatus.Options,
): Promise<getWithdrawalStatus.ReturnType> {
  const chain = options.chain ?? client.chain
  const receipt = 'receipt' in options ? options.receipt : undefined
  const portalAddress = getContractAddress({ ...options, chain }, 'portal')
  const l2BlockNumber =
    options.l2Timestamp ??
    receipt?.blockNumber ??
    ('l2BlockNumber' in options ? options.l2BlockNumber : 0n)
  const withdrawal = (() => {
    if ('receipt' in options) {
      const withdrawals = Withdrawal.getWithdrawals({
        logs: options.receipt.logs,
      })
      const logIndex = options.logIndex ?? 0
      const withdrawal = withdrawals[logIndex]
      if (!withdrawal)
        throw new Withdrawal.ReceiptContainsNoWithdrawalsError({
          hash: options.receipt.transactionHash,
        })
      return withdrawal
    }
    return {
      sender: options.sender,
      withdrawalHash: options.withdrawalHash,
    }
  })()
  const version = await getPortalVersion(client, { portalAddress })

  if (version.major < 3)
    return getLegacyStatus(client, {
      l2BlockNumber,
      options,
      portalAddress,
      withdrawal,
    })

  const numProofSubmitters = await (async () => {
    try {
      return await read(client, {
        abi: portal2Abi,
        address: portalAddress,
        args: [withdrawal.withdrawalHash],
        functionName: 'numProofSubmitters',
      })
    } catch (error) {
      if (!isContractCallUnavailable(error)) throw error
      return 1n
    }
  })()
  const proofSubmitter = await (async () => {
    if (numProofSubmitters === 0n) return withdrawal.sender
    try {
      return await read(client, {
        abi: portal2Abi,
        address: portalAddress,
        args: [withdrawal.withdrawalHash, numProofSubmitters - 1n],
        functionName: 'proofSubmitters',
      })
    } catch (error) {
      if (!isContractCallUnavailable(error)) throw error
      return withdrawal.sender
    }
  })()

  const [gameResult, provenResult, checkResult, finalizedResult] =
    await Promise.allSettled([
      getGame(client, {
        ...options,
        l2BlockNumber,
        limit: options.gameLimit ?? 100,
      }),
      read(client, {
        abi: portal2Abi,
        address: portalAddress,
        args: [withdrawal.withdrawalHash, proofSubmitter],
        functionName: 'provenWithdrawals',
      }),
      read(client, {
        abi: portal2Abi,
        address: portalAddress,
        args: [withdrawal.withdrawalHash, proofSubmitter],
        functionName: 'checkWithdrawal',
      }),
      read(client, {
        abi: portal2Abi,
        address: portalAddress,
        args: [withdrawal.withdrawalHash],
        functionName: 'finalizedWithdrawals',
      }),
    ])

  if (finalizedResult.status === 'fulfilled' && finalizedResult.value)
    return 'finalized'
  if (provenResult.status === 'rejected') throw provenResult.reason
  if (gameResult.status === 'rejected') {
    if (gameResult.reason instanceof Game.NotFoundError)
      return 'waiting-to-prove'
    throw gameResult.reason
  }

  if (checkResult.status === 'rejected') {
    const revert = getRevert(checkResult.reason)
    if (!revert) throw checkResult.reason
    const errors = [revert.data?.name, revert.data?.args?.[0], revert.reason]

    if (
      errors.includes('OptimismPortal_InvalidRootClaim') ||
      errors.includes('OptimismPortal_ProofNotOldEnough')
    ) {
      const disputeGameAddress = provenResult.value[0]
      const anchorStateRegistry = await read(client, {
        abi: portal2Abi,
        address: portalAddress,
        functionName: 'anchorStateRegistry',
      })
      const [proper, respected, finalized] = await Promise.all([
        read(client, {
          abi: anchorStateRegistryAbi,
          address: anchorStateRegistry,
          args: [disputeGameAddress],
          functionName: 'isGameProper',
        }),
        read(client, {
          abi: anchorStateRegistryAbi,
          address: anchorStateRegistry,
          args: [disputeGameAddress],
          functionName: 'isGameRespected',
        }),
        read(client, {
          abi: anchorStateRegistryAbi,
          address: anchorStateRegistry,
          args: [disputeGameAddress],
          functionName: 'isGameFinalized',
        }),
      ])
      if (!proper || !respected) return 'ready-to-prove'
      if (!finalized) return 'waiting-to-finalize'
      if (errors.includes('OptimismPortal_ProofNotOldEnough'))
        return 'waiting-to-finalize'
      return 'ready-to-prove'
    }

    if (readyToProveErrors.some((error) => errors.includes(error)))
      return 'ready-to-prove'
    if (waitingToFinalizeErrors.some((error) => errors.includes(error)))
      return 'waiting-to-finalize'
    throw checkResult.reason
  }
  if (finalizedResult.status === 'rejected') throw finalizedResult.reason
  return 'ready-to-finalize'
}

export declare namespace getWithdrawalStatus {
  /** Options for {@link getWithdrawalStatus}. */
  type Options = ContractParameters<
    'disputeGameFactory' | 'l2OutputOracle' | 'portal'
  > & {
    /** Chain used to resolve L1 contracts. @default client.chain */
    chain?: Chain.Chain | undefined
    /** Maximum number of dispute games to inspect. @default 100 */
    gameLimit?: number | undefined
    /** L2 timestamp required by super-root games. */
    l2Timestamp?: bigint | undefined
  } & (
      | {
          /** Relative withdrawal log index. @default 0 */
          logIndex?: number | undefined
          /** L2 withdrawal transaction receipt. */
          receipt: TransactionReceipt.TransactionReceipt
        }
      | {
          /** Withdrawal L2 block number. */
          l2BlockNumber: bigint
          /** Withdrawal sender. */
          sender: Address.Address
          /** Withdrawal hash. */
          withdrawalHash: Hex.Hex
        }
    )

  /** Return type of {@link getWithdrawalStatus}. */
  type ReturnType =
    | 'finalized'
    | 'ready-to-finalize'
    | 'ready-to-prove'
    | 'waiting-to-finalize'
    | 'waiting-to-prove'

  /** Errors thrown by {@link getWithdrawalStatus}. */
  type ErrorType =
    | read.ErrorType
    | getGame.ErrorType
    | getL2Output.ErrorType
    | getPortalVersion.ErrorType
    | getTimeToFinalize.ErrorType
    | Withdrawal.getWithdrawals.ErrorType
    | Withdrawal.ReceiptContainsNoWithdrawalsError
    | Chain.getContractAddress.ErrorType
    | Errors.GlobalErrorType
}

async function getLegacyStatus<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  context: {
    l2BlockNumber: bigint
    options: getWithdrawalStatus.Options
    portalAddress: Address.Address
    withdrawal: Pick<Withdrawal.Withdrawal, 'sender' | 'withdrawalHash'>
  },
): Promise<getWithdrawalStatus.ReturnType> {
  const { l2BlockNumber, options, portalAddress, withdrawal } = context
  const [outputResult, provenResult, finalizedResult, timeResult] =
    await Promise.allSettled([
      getL2Output(client, { ...options, l2BlockNumber }),
      read(client, {
        abi: portalAbi,
        address: portalAddress,
        args: [withdrawal.withdrawalHash],
        functionName: 'provenWithdrawals',
      }),
      read(client, {
        abi: portalAbi,
        address: portalAddress,
        args: [withdrawal.withdrawalHash],
        functionName: 'finalizedWithdrawals',
      }),
      getTimeToFinalize(client, {
        ...options,
        withdrawalHash: withdrawal.withdrawalHash,
      }),
    ])
  if (outputResult.status === 'rejected') {
    const revert = getRevert(outputResult.reason)
    if (
      revert?.reason ===
        'L2OutputOracle: cannot get output for a block that has not been proposed' ||
      revert?.data?.args?.[0] ===
        'L2OutputOracle: cannot get output for a block that has not been proposed'
    )
      return 'waiting-to-prove'
    throw outputResult.reason
  }
  if (provenResult.status === 'rejected') throw provenResult.reason
  if (finalizedResult.status === 'rejected') throw finalizedResult.reason
  if (timeResult.status === 'rejected') throw timeResult.reason

  const [, proveTimestamp] = provenResult.value
  if (proveTimestamp === 0n) return 'ready-to-prove'
  if (finalizedResult.value) return 'finalized'
  return timeResult.value.seconds > 0
    ? 'waiting-to-finalize'
    : 'ready-to-finalize'
}

function getRevert(error: unknown) {
  if (
    error instanceof ContractError.ContractFunctionExecutionError &&
    error.cause instanceof ContractError.ContractFunctionRevertedError
  )
    return error.cause
  return undefined
}

const readyToProveErrors = [
  'OptimismPortal: invalid game type',
  'OptimismPortal: withdrawal has not been proven yet',
  'OptimismPortal: withdrawal has not been proven by proof submitter address yet',
  'OptimismPortal: dispute game created before respected game type was updated',
  'InvalidGameType',
  'LegacyGame',
  'Unproven',
  'OptimismPortal_Unproven',
  'OptimismPortal_InvalidProofTimestamp',
] as const

const waitingToFinalizeErrors = [
  'OptimismPortal: proven withdrawal has not matured yet',
  'OptimismPortal: output proposal has not been finalized yet',
  'OptimismPortal: output proposal in air-gap',
] as const
