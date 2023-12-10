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

export type GetSecondsToNextL2OutputParameters<
  chain extends Chain | undefined = Chain | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  _derivedChain extends Chain | undefined = DeriveChain<chain, chainOverride>,
> = GetChainParameter<chain, chainOverride> &
  GetContractAddressParameter<_derivedChain, 'l2OutputOracle'> & {
    l2BlockNumber: bigint
  }
export type GetSecondsToNextL2OutputReturnType = number
export type GetSecondsToNextL2OutputErrorType = MulticallErrorType | ErrorType

/**
 * Returns the number of seconds until the next L2 Output is submitted. Used for the Withdrawal flow.
 *
 * - Docs: https://viem.sh/op-stack/actions/getSecondsToNextL2Output.html
 *
 * @param client - Client to use
 * @param parameters - {@link GetSecondsToNextL2OutputParameters}
 * @returns The L2 transaction hash. {@link GetSecondsToNextL2OutputReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { getBlockNumber } from 'viem/actions'
 * import { mainnet, optimism } from 'viem/chains'
 * import { getSecondsToNextL2Output } from 'viem/op-stack'
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
 * const seconds = await getSecondsToNextL2Output(publicClientL1, {
 *   l2BlockNumber,
 * })
 */
export async function getSecondsToNextL2Output<
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: GetSecondsToNextL2OutputParameters<chain, chainOverride>,
): Promise<GetSecondsToNextL2OutputReturnType> {
  const { chain = client.chain, l2BlockNumber, targetChain } = parameters

  const l2OutputOracleAddress = (() => {
    if (parameters.l2OutputOracleAddress)
      return parameters.l2OutputOracleAddress
    if (chain) return targetChain!.contracts.l2OutputOracle[chain.id].address
    return Object.values(targetChain!.contracts.l2OutputOracle)[0].address
  })()

  const [nextBlockNumber, blockTime, interval] = await multicall(client, {
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
        functionName: 'L2_BLOCK_TIME',
      },
      {
        abi: l2OutputOracleAbi,
        address: l2OutputOracleAddress,
        functionName: 'SUBMISSION_INTERVAL',
      },
    ],
  })

  const blocksUntilNextOutput = nextBlockNumber - l2BlockNumber
  const timeUntilNextOutput =
    blocksUntilNextOutput < 0n
      ? // If for some reason, due to sync issues, the next block number is less
        // than the latest block number, we assume the next output is in the next
        // submission interval.
        nextBlockNumber + interval - l2BlockNumber
      : blocksUntilNextOutput * blockTime
  return Number(timeUntilNextOutput)
}
