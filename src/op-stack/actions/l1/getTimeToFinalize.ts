import type { Errors, Hex } from 'ox'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import * as ContractError from '../../../core/ContractError.js'
import { BaseError } from '../../../core/Errors.js'
import { read } from '../../../core/actions/contract/read.js'
import { multicall } from '../../../core/actions/multicall.js'
import {
  disputeGameAbi,
  l2OutputOracleAbi,
  portal2Abi,
  portalAbi,
} from '../../abis.js'
import { getPortalVersion } from './getPortalVersion.js'
import {
  type ContractParameters,
  getContractAddress,
  isContractCallUnavailable,
  zeroAddress,
} from './internal.js'

const buffer = 10

/** Returns the time until an OP Stack withdrawal can be finalized. */
export async function getTimeToFinalize<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getTimeToFinalize.Options,
): Promise<getTimeToFinalize.ReturnType> {
  const { withdrawalHash } = options
  const chain = options.chain ?? client.chain
  const portalAddress = getContractAddress({ ...options, chain }, 'portal')
  const version = await getPortalVersion(client, { portalAddress })

  if (version.major < 3) {
    const l2OutputOracleAddress = getContractAddress(
      { ...options, chain },
      'l2OutputOracle',
    )
    const { results } = await multicall(client, {
      allowFailure: false,
      calls: [
        {
          abi: portalAbi,
          args: [withdrawalHash],
          functionName: 'provenWithdrawals',
          to: portalAddress,
        },
        {
          abi: l2OutputOracleAbi,
          functionName: 'FINALIZATION_PERIOD_SECONDS',
          to: l2OutputOracleAddress,
        },
      ] as const,
    })
    const [{ timestamp: proveTimestamp }, period] = results
    return getTime({ period, proveTimestamp })
  }

  const numProofSubmitters = await (async () => {
    try {
      return await read(client, {
        abi: portal2Abi,
        address: portalAddress,
        args: [withdrawalHash],
        functionName: 'numProofSubmitters',
      })
    } catch (error) {
      if (!isContractCallUnavailable(error)) throw error
      return 1n
    }
  })()
  const proofSubmitter = await (async () => {
    if (numProofSubmitters === 0n) return undefined
    try {
      return await read(client, {
        abi: portal2Abi,
        address: portalAddress,
        args: [withdrawalHash, numProofSubmitters - 1n],
        functionName: 'proofSubmitters',
      })
    } catch (error) {
      if (!isContractCallUnavailable(error)) throw error
      return undefined
    }
  })()
  const [{ disputeGameProxy, timestamp: proveTimestamp }, period] =
    await Promise.all([
      proofSubmitter
        ? read(client, {
            abi: portal2Abi,
            address: portalAddress,
            args: [withdrawalHash, proofSubmitter],
            functionName: 'provenWithdrawals',
          })
        : Promise.resolve({
            disputeGameProxy: zeroAddress,
            timestamp: 0n,
          } as const),
      read(client, {
        abi: portal2Abi,
        address: portalAddress,
        functionName: 'proofMaturityDelaySeconds',
      }),
    ])
  if (proveTimestamp === 0n) throw new WithdrawalNotProvenError()

  // The withdrawal can only be finalized once the proof's dispute game is
  // resolved and its finality delay has passed, so also read the game.
  const [
    resolvedAt,
    createdAt,
    expectedResolution,
    maxClockDuration,
    finalityDelay,
  ] = await Promise.all([
    read(client, {
      abi: disputeGameAbi,
      address: disputeGameProxy,
      functionName: 'resolvedAt',
    }),
    read(client, {
      abi: disputeGameAbi,
      address: disputeGameProxy,
      functionName: 'createdAt',
    }),
    // Only some game types implement `expectedResolution` (e.g. `AggregateVerifier`).
    read(client, {
      abi: disputeGameAbi,
      address: disputeGameProxy,
      functionName: 'expectedResolution',
    }).catch(unsupported),
    // Only some game types implement `maxClockDuration` (e.g. `FaultDisputeGame`).
    read(client, {
      abi: disputeGameAbi,
      address: disputeGameProxy,
      functionName: 'maxClockDuration',
    }).catch(unsupported),
    read(client, {
      abi: portal2Abi,
      address: portalAddress,
      functionName: 'disputeGameFinalityDelaySeconds',
    }),
  ])

  const now = Date.now()

  // When the game is not resolved yet, estimate when it will be: the expected
  // resolution reported by the game, or the end of an unchallenged root
  // claim's clock. An unresolved game cannot have resolved in the past, so the
  // estimate is at least `now`.
  const gameResolvedAt = (() => {
    if (resolvedAt > 0n) return Number(resolvedAt)
    const estimate = (() => {
      if (typeof expectedResolution === 'bigint') return expectedResolution
      if (typeof maxClockDuration === 'bigint')
        return createdAt + maxClockDuration
      return undefined
    })()
    // Without an estimate, only the proof maturity delay applies.
    if (estimate === undefined) return 0
    return Math.max(Number(estimate), now / 1000)
  })()

  return getTime({
    now,
    period,
    proveTimestamp,
    readyAt: gameResolvedAt + Number(finalityDelay),
  })
}

export declare namespace getTimeToFinalize {
  /** Options for {@link getTimeToFinalize}. */
  type Options = ContractParameters<'l2OutputOracle' | 'portal'> & {
    /** Chain used to resolve L1 contracts. @default client.chain */
    chain?: Chain.Chain | undefined
    /** Withdrawal hash. */
    withdrawalHash: Hex.Hex
  }

  /** Remaining finalization delay. */
  type ReturnType = {
    /** Proof maturity delay (or legacy finalization period) in seconds. */
    period: number
    /**
     * Seconds until finalization is available: the later of the proof maturity
     * delay and the resolution of the proof's dispute game plus its finality
     * delay. While the game is unresolved, its resolution time is an estimate.
     */
    seconds: number
    /** Finalization timestamp in milliseconds. */
    timestamp: number
  }

  /** Errors thrown by {@link getTimeToFinalize}. */
  type ErrorType =
    | read.ErrorType
    | multicall.ErrorType
    | getPortalVersion.ErrorType
    | Chain.getContractAddress.ErrorType
    | WithdrawalNotProvenError
    | Errors.GlobalErrorType
}

function getTime({
  now = Date.now(),
  period,
  proveTimestamp,
  readyAt = 0,
}: {
  now?: number | undefined
  period: bigint
  proveTimestamp: bigint
  readyAt?: number | undefined
}): getTimeToFinalize.ReturnType {
  const elapsed = now / 1000 - Number(proveTimestamp)
  const remaining = Math.max(Number(period) - elapsed, readyAt - now / 1000)
  const seconds = Math.floor(remaining < 0 ? 0 : remaining + buffer)
  return { period: Number(period), seconds, timestamp: now + seconds * 1000 }
}

/** Returns `undefined` when the game does not implement the getter, and rethrows other errors. */
function unsupported(error: unknown) {
  if (
    error instanceof ContractError.ContractFunctionExecutionError &&
    (error.cause instanceof ContractError.ContractFunctionRevertedError ||
      error.cause instanceof ContractError.ContractFunctionZeroDataError)
  )
    return undefined
  throw error
}

/** Thrown when a withdrawal has not been proven on L1. */
export class WithdrawalNotProvenError extends BaseError {
  override readonly name =
    'Actions.l1.getTimeToFinalize.WithdrawalNotProvenError'

  constructor() {
    super('Withdrawal has not been proven on L1.')
  }
}
