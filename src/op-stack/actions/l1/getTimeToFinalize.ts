import type { Errors, Hex } from 'ox'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { BaseError } from '../../../core/Errors.js'
import { read } from '../../../core/actions/contract/read.js'
import { multicall } from '../../../core/actions/multicall.js'
import { l2OutputOracleAbi, portal2Abi, portalAbi } from '../../abis.js'
import { getPortalVersion } from './getPortalVersion.js'
import {
  type ContractParameters,
  getContractAddress,
  isContractCallUnavailable,
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
  const [{ timestamp: proveTimestamp }, period] = await Promise.all([
    proofSubmitter
      ? read(client, {
          abi: portal2Abi,
          address: portalAddress,
          args: [withdrawalHash, proofSubmitter],
          functionName: 'provenWithdrawals',
        })
      : Promise.resolve({
          disputeGameProxy: zeroHex,
          timestamp: 0n,
        } as const),
    read(client, {
      abi: portal2Abi,
      address: portalAddress,
      functionName: 'proofMaturityDelaySeconds',
    }),
  ])
  if (proveTimestamp === 0n) throw new WithdrawalNotProvenError()
  return getTime({ period, proveTimestamp })
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
    /** Finalization period in seconds. */
    period: number
    /** Seconds until finalization is available. */
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
  period,
  proveTimestamp,
}: {
  period: bigint
  proveTimestamp: bigint
}): getTimeToFinalize.ReturnType {
  const now = Date.now()
  const elapsed = now / 1000 - Number(proveTimestamp)
  const remaining = Number(period) - elapsed
  const seconds = Math.floor(remaining < 0 ? 0 : remaining + buffer)
  return { period: Number(period), seconds, timestamp: now + seconds * 1000 }
}

const zeroHex = '0x' as const

/** Thrown when a withdrawal has not been proven on L1. */
export class WithdrawalNotProvenError extends BaseError {
  override readonly name =
    'Actions.l1.getTimeToFinalize.WithdrawalNotProvenError'

  constructor() {
    super('Withdrawal has not been proven on L1.')
  }
}
