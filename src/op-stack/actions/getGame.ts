import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Account } from '../../types/account.js'
import type {
  Chain,
  DeriveChain,
  GetChainParameter,
} from '../../types/chain.js'
import {
  GameNotFoundError,
  type GameNotFoundErrorType,
} from '../errors/withdrawal.js'
import type { GetContractAddressParameter } from '../types/contract.js'
import type { Game } from '../types/withdrawal.js'
import { type GetGamesErrorType, getGames } from './getGames.js'

export type GetGameParameters<
  chain extends Chain | undefined = Chain | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  _derivedChain extends Chain | undefined = DeriveChain<chain, chainOverride>,
> = GetChainParameter<chain, chainOverride> &
  GetContractAddressParameter<
    _derivedChain,
    'portal' | 'disputeGameFactory'
  > & {
    /**
     * The minimum block number of the dispute game.
     */
    l2BlockNumber: bigint
    /**
     * Limit of games to extract.
     * @default 100
     */
    limit?: number | undefined
    /**
     * Strategy for extracting a dispute game.
     *
     * - `latest` - Returns the latest dispute game.
     * - `random` - Returns a random dispute game.
     */
    strategy?: 'latest' | 'random'
  }
export type GetGameReturnType = Game & {
  l2BlockNumber: bigint
}

export type GetGameErrorType =
  | GetGamesErrorType
  | GameNotFoundErrorType
  | ErrorType

/**
 * Retrieves a valid dispute game on an L2 that occurred after a provided L2 block number.
 *
 * - Docs: https://viem.sh/op-stack/actions/getGame
 *
 * @param client - Client to use
 * @param parameters - {@link GetGameParameters}
 * @returns A valid dispute game. {@link GetGameReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet, optimism } from 'viem/chains'
 * import { getGame } from 'viem/op-stack'
 *
 * const publicClientL1 = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const game = await getGame(publicClientL1, {
 *   l2BlockNumber: 69420n,
 *   targetChain: optimism
 * })
 */
export async function getGame<
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: GetGameParameters<chain, chainOverride>,
): Promise<GetGameReturnType> {
  const { l2BlockNumber, strategy = 'latest' } = parameters

  const latestGames = await getGames(client, parameters)

  const games = latestGames.filter((game) => game.l2BlockNumber > l2BlockNumber)

  const game = (() => {
    if (strategy === 'random')
      return games[Math.floor(Math.random() * games.length)]
    return games[0]
  })()

  if (!game) throw new GameNotFoundError()
  return game
}
