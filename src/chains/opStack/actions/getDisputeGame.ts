import {
  type ReadContractErrorType,
  readContract,
} from '../../../actions/public/readContract.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { ErrorType } from '../../../errors/utils.js'
import type { Account } from '../../../types/account.js'
import type {
  Chain,
  DeriveChain,
  GetChainParameter,
} from '../../../types/chain.js'
import { decodeAbiParameters } from '../../../utils/index.js'
import { disputeGameFactoryAbi, portal2Abi } from '../abis.js'
import type { GetContractAddressParameter } from '../types/contract.js'

export type GetDisputeGameParameters<
  chain extends Chain | undefined = Chain | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  _derivedChain extends Chain | undefined = DeriveChain<chain, chainOverride>,
> = GetChainParameter<chain, chainOverride> &
  GetContractAddressParameter<
    _derivedChain,
    'portal' | 'disputeGameFactory'
  > & {
    l2BlockNumber: bigint
    // Decides whether to get the latest output or a random one
    // random one is useful because it can help prevent a malicious actor from
    // ddossing via submitting invalid outputs
    strategy: 'latest' | 'random'
  }
export type GetDisputeGameReturnType =
  | (Game & {
      l2BlockNumber: bigint
    })
  | null
export type GetDisputeGameErrorType = ReadContractErrorType | ErrorType

/**
 * The type of game returned by dispute game factory method findLatestGames
 */
export type Game = {
  index: bigint
  metadata: `0x${string}`
  timestamp: bigint
  rootClaim: `0x${string}`
  extraData: `0x${string}`
}

/**
 * Retrieves the dispute game for a given withdrawal
 * Returns null if no dispute game is found
 */
export async function getDisputeGame<
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: GetDisputeGameParameters<chain, chainOverride>,
): Promise<GetDisputeGameReturnType> {
  const { chain = client.chain, l2BlockNumber, targetChain } = parameters

  const portalAddress = (() => {
    if (parameters.portalAddress) return parameters.portalAddress
    if (chain) return targetChain!.contracts.portal[chain.id].address
    return Object.values(targetChain!.contracts.portal)[0].address
  })()

  const disputeGameFactoryAddress = (() => {
    if (parameters.disputeGameFactoryAddress)
      return parameters.disputeGameFactoryAddress
    if (chain)
      return targetChain!.contracts.disputeGameFactory[chain.id].address
    return Object.values(targetChain!.contracts.disputeGameFactory)[0].address
  })()

  // Get the total game count from the DisputeGameFactory since that will give us the end of
  // the array that we're searching over. We'll then use that to find the latest games.
  const gameCount = await readContract(client, {
    abi: disputeGameFactoryAbi,
    functionName: 'gameCount',
    args: [],
    address: disputeGameFactoryAddress,
  })
  const gameType = await readContract(client, {
    abi: portal2Abi,
    functionName: 'respectedGameType',
    address: portalAddress,
  })

  // Find the latest 100 games (or as many as we can up to 100).
  const latestGames = (await readContract(client, {
    abi: disputeGameFactoryAbi,
    functionName: 'findLatestGames',
    address: disputeGameFactoryAddress,
    args: [
      gameType,
      BigInt(Math.max(0, Number(gameCount - 1n))),
      BigInt(Math.min(100, Number(gameCount))),
    ],
  })) satisfies readonly Game[]
  const validGames = latestGames.filter((game) => {
    const [blockNumber] = decodeAbiParameters(
      [{ type: 'uint256' }],
      game.extraData,
    )
    return blockNumber > l2BlockNumber
  })

  if (validGames.length === 0) {
    return null
  }

  const game: Game = (() => {
    switch (parameters.strategy) {
      case 'latest': {
        return validGames.at(-1) as Game
      }
      case 'random': {
        const randomIndex = Math.floor(Math.random() * validGames.length)
        return validGames[randomIndex]
      }
      default: {
        // Since this is an internally used function at the moement this should never happen
        // thus we are able to not have this be a typesafe error
        throw new Error(
          `Invalid strategy ${
            parameters.strategy satisfies never
          } provided as parameter to getDisputeGame. Valid strategies are 'latest' and 'random'.`,
        )
      }
    }
  })()

  const [blockNumber] = decodeAbiParameters(
    [{ type: 'uint256' }],
    game.extraData,
  )

  return {
    ...game,
    l2BlockNumber: blockNumber,
  }
}
