import type { Errors } from 'ox'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { read } from '../../../core/actions/contract/read.js'
import { multicall } from '../../../core/actions/multicall.js'
import { l2OutputOracleAbi } from '../../abis.js'
import { type ContractParameters, getContractAddress } from './internal.js'

/** Estimates when the next legacy L2 output will be submitted. */
export async function getTimeToNextL2Output<
  chain extends Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: getTimeToNextL2Output.Options,
): Promise<getTimeToNextL2Output.ReturnType> {
  const { intervalBuffer = 1.1, l2BlockNumber } = options
  const chain = options.chain ?? client.chain
  const address = getContractAddress({ ...options, chain }, 'l2OutputOracle')
  const { results } = await multicall(client, {
    allowFailure: false,
    calls: [
      {
        abi: l2OutputOracleAbi,
        functionName: 'latestOutputIndex',
        to: address,
      },
      {
        abi: l2OutputOracleAbi,
        functionName: 'L2_BLOCK_TIME',
        to: address,
      },
      {
        abi: l2OutputOracleAbi,
        functionName: 'SUBMISSION_INTERVAL',
        to: address,
      },
    ] as const,
  })
  const [latestOutputIndex, blockTime, blockInterval] = results
  const latestOutput = await read(client, {
    abi: l2OutputOracleAbi,
    address,
    args: [latestOutputIndex],
    functionName: 'getL2Output',
  })

  const latestOutputTimestamp = Number(latestOutput.timestamp) * 1000
  const interval = Number(blockInterval * blockTime)
  const blockIntervalNumber = Number(blockInterval)
  const intervalWithBuffer = Math.ceil(interval * intervalBuffer)
  const now = Date.now()
  const seconds = (() => {
    if (now < latestOutputTimestamp) return 0
    if (latestOutput.l2BlockNumber > l2BlockNumber) return 0

    const elapsedBlocks = Number(l2BlockNumber - latestOutput.l2BlockNumber)
    const elapsed = Math.ceil((now - latestOutputTimestamp) / 1000)
    const secondsToNextOutput =
      intervalWithBuffer - (elapsed % intervalWithBuffer)
    if (elapsedBlocks < blockIntervalNumber) return secondsToNextOutput
    return (
      Math.floor(elapsedBlocks / blockIntervalNumber) * intervalWithBuffer +
      secondsToNextOutput
    )
  })()

  return {
    interval,
    seconds,
    ...(seconds > 0 ? { timestamp: now + seconds * 1000 } : {}),
  }
}

export declare namespace getTimeToNextL2Output {
  /** Options for {@link getTimeToNextL2Output}. */
  type Options = ContractParameters<'l2OutputOracle'> & {
    /** Chain used to resolve the L2 output oracle. @default client.chain */
    chain?: Chain.Chain | undefined
    /** Buffer applied to the configured output interval. @default 1.1 */
    intervalBuffer?: number | undefined
    /** Minimum L2 block number for the next output. */
    l2BlockNumber: bigint
  }

  /** Estimated wait for the next output. */
  type ReturnType = {
    /** Configured interval between outputs, in seconds. */
    interval: number
    /** Estimated seconds until the next output. */
    seconds: number
    /** Estimated submission timestamp in milliseconds. */
    timestamp?: number | undefined
  }

  /** Errors thrown by {@link getTimeToNextL2Output}. */
  type ErrorType =
    | read.ErrorType
    | multicall.ErrorType
    | Chain.getContractAddress.ErrorType
    | Errors.GlobalErrorType
}
