import {
  type MulticallErrorType,
  multicall,
} from '../../../actions/public/multicall.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { ErrorType } from '../../../errors/utils.js'
import type { Account } from '../../../types/account.js'
import type {
  Chain,
  DeriveChain,
  GetChainParameter,
} from '../../../types/chain.js'
import { l2OutputOracleAbi } from '../abis.js'
import type { GetContractAddressParameter } from '../types/contract.js'

export type GetTimeToNextL2OutputParameters<
  chain extends Chain | undefined = Chain | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  _derivedChain extends Chain | undefined = DeriveChain<chain, chainOverride>,
> = GetChainParameter<chain, chainOverride> &
  GetContractAddressParameter<_derivedChain, 'l2OutputOracle'> & {
    l2BlockNumber: bigint
  }
export type GetTimeToNextL2OutputReturnType = {
  /** Seconds until the next L2 output. */
  seconds: number
  /** Estimated timestamp of the next L2 output. */
  timestamp: number
}
export type GetTimeToNextL2OutputErrorType = MulticallErrorType | ErrorType

/**
 * Returns the time until the next L2 output (after a provided block number) is submitted. Used for the [Withdrawal](/op-stack/guides/withdrawals.html) flow.
 *
 * - Docs: https://viem.sh/op-stack/actions/getTimeToNextL2Output.html
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
 * const l2BlockNumber = await getBlockNumber(publicClientL2)
 * const { seconds } = await getTimeToNextL2Output(publicClientL1, {
 *   l2BlockNumber,
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
  const { chain = client.chain, l2BlockNumber, targetChain } = parameters

  const l2OutputOracleAddress = (() => {
    if (parameters.l2OutputOracleAddress)
      return parameters.l2OutputOracleAddress
    if (chain) return targetChain!.contracts.l2OutputOracle[chain.id].address
    return Object.values(targetChain!.contracts.l2OutputOracle)[0].address
  })()

  const [nextBlockNumber, latestBlockNumber, blockTime] = await multicall(
    client,
    {
      allowFailure: false,
      contracts: [
        {
          abi: l2OutputOracleAbi,
          address: l2OutputOracleAddress,
          functionName: 'nextBlockNumber',
        },
        {
          abi: l2OutputOracleAbi,
          address: l2OutputOracleAddress,
          functionName: 'latestBlockNumber',
        },
        {
          abi: l2OutputOracleAbi,
          address: l2OutputOracleAddress,
          functionName: 'L2_BLOCK_TIME',
        },
      ],
    },
  )

  const seconds = (() => {
    // If the latest block number is greater than the provided block number,
    // we assume that the output for that block has already been submitted.
    if (latestBlockNumber > l2BlockNumber) return 0

    // If the next block number is lesser than the provided block number, we will
    // assume the block has already been submitted
    if (nextBlockNumber < l2BlockNumber) return 0

    return Number((nextBlockNumber - l2BlockNumber) * blockTime)
  })()

  const timestamp = Date.now() + seconds * 1000

  return { seconds, timestamp }
}
