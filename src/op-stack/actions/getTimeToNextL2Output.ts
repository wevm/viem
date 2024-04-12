import {
  type MulticallErrorType,
  multicall,
} from '../../actions/public/multicall.js'
import {
  type ReadContractErrorType,
  readContract,
} from '../../actions/public/readContract.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Account } from '../../types/account.js'
import type {
  Chain,
  DeriveChain,
  GetChainParameter,
} from '../../types/chain.js'
import { l2OutputOracleAbi } from '../abis.js'
import type { GetContractAddressParameter } from '../types/contract.js'

export type GetTimeToNextL2OutputParameters<
  chain extends Chain | undefined = Chain | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  _derivedChain extends Chain | undefined = DeriveChain<chain, chainOverride>,
> = GetChainParameter<chain, chainOverride> &
  GetContractAddressParameter<_derivedChain, 'l2OutputOracle'> & {
    /**
     * The buffer to account for discrepancies between non-deterministic time intervals.
     * @default 1.1
     */
    intervalBuffer?: number | undefined
    l2BlockNumber: bigint
  }
export type GetTimeToNextL2OutputReturnType = {
  /** The interval (in seconds) between L2 outputs. */
  interval: number
  /**
   * Seconds until the next L2 output.
   * `0` if the next L2 output has already been submitted.
   */
  seconds: number
  /**
   * Estimated timestamp of the next L2 output.
   * `undefined` if the next L2 output has already been submitted.
   */
  timestamp?: number | undefined
}
export type GetTimeToNextL2OutputErrorType =
  | MulticallErrorType
  | ReadContractErrorType
  | ErrorType

/**
 * Returns the time until the next L2 output (after the provided block number) is submitted. Used for the [Withdrawal](/op-stack/guides/withdrawals) flow.
 *
 * - Docs: https://viem.sh/op-stack/actions/getTimeToNextL2Output
 *
 * @param client - Client to use
 * @param parameters - {@link GetTimeToNextL2OutputParameters}
 * @returns The L2 transaction hash. {@link GetTimeToNextL2OutputReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { getBlockNumber } from 'viem/actions'
 * import { mainnet, optimism } from 'viem/chains'
 * import { getTimeToNextL2Output } from 'viem/op-stack'
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
 * const { seconds } = await getTimeToNextL2Output(publicClientL1, {
 *   targetChain: optimism
 * })
 */
export async function getTimeToNextL2Output<
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: GetTimeToNextL2OutputParameters<chain, chainOverride>,
): Promise<GetTimeToNextL2OutputReturnType> {
  const {
    intervalBuffer = 1.1,
    chain = client.chain,
    l2BlockNumber,
    targetChain,
  } = parameters

  const l2OutputOracleAddress = (() => {
    if (parameters.l2OutputOracleAddress)
      return parameters.l2OutputOracleAddress
    if (chain) return targetChain!.contracts.l2OutputOracle[chain.id].address
    return Object.values(targetChain!.contracts.l2OutputOracle)[0].address
  })()

  const [latestOutputIndex, blockTime, blockInterval] = await multicall(
    client,
    {
      allowFailure: false,
      contracts: [
        {
          abi: l2OutputOracleAbi,
          address: l2OutputOracleAddress,
          functionName: 'latestOutputIndex',
        },
        {
          abi: l2OutputOracleAbi,
          address: l2OutputOracleAddress,
          functionName: 'L2_BLOCK_TIME',
        },
        {
          abi: l2OutputOracleAbi,
          address: l2OutputOracleAddress,
          functionName: 'SUBMISSION_INTERVAL',
        },
      ],
    },
  )
  const latestOutput = await readContract(client, {
    abi: l2OutputOracleAbi,
    address: l2OutputOracleAddress,
    functionName: 'getL2Output',
    args: [latestOutputIndex],
  })
  const latestOutputTimestamp = Number(latestOutput.timestamp) * 1000

  const interval = Number(blockInterval * blockTime)
  const intervalWithBuffer = Math.ceil(interval * intervalBuffer)

  const now = Date.now()

  const seconds = (() => {
    // If the current timestamp is lesser than the latest L2 output timestamp,
    // then we assume that the L2 output has already been submitted.
    if (now < latestOutputTimestamp) return 0

    // If the latest L2 output block is newer than the provided L2 block number,
    // then we assume that the L2 output has already been submitted.
    if (latestOutput.l2BlockNumber > l2BlockNumber) return 0

    const elapsedBlocks = Number(l2BlockNumber - latestOutput.l2BlockNumber)

    const elapsed = Math.ceil((now - latestOutputTimestamp) / 1000)
    const secondsToNextOutput =
      intervalWithBuffer - (elapsed % intervalWithBuffer)
    return elapsedBlocks < blockInterval
      ? secondsToNextOutput
      : Math.floor(elapsedBlocks / Number(blockInterval)) * intervalWithBuffer +
          secondsToNextOutput
  })()

  const timestamp = seconds > 0 ? now + seconds * 1000 : undefined

  return { interval, seconds, timestamp }
}
