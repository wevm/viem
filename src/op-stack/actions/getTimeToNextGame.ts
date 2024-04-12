import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Account } from '../../types/account.js'
import type {
  Chain,
  DeriveChain,
  GetChainParameter,
} from '../../types/chain.js'
import type { GetContractAddressParameter } from '../types/contract.js'
import { type GetGamesErrorType, getGames } from './getGames.js'

export type GetTimeToNextGameParameters<
  chain extends Chain | undefined = Chain | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  _derivedChain extends Chain | undefined = DeriveChain<chain, chainOverride>,
> = GetChainParameter<chain, chainOverride> &
  GetContractAddressParameter<
    _derivedChain,
    'portal' | 'disputeGameFactory'
  > & {
    /**
     * The buffer to account for discrepancies between non-deterministic time intervals.
     * @default 1.1
     */
    intervalBuffer?: number | undefined
    /**
     * The minimum L2 block number of the next game.
     */
    l2BlockNumber: bigint
  }
export type GetTimeToNextGameReturnType = {
  /** The estimated interval (in seconds) between L2 dispute games. */
  interval: number
  /**
   * Estimated seconds until the next L2 dispute game.
   * `0` if the next L2 dispute game has already been submitted.
   */
  seconds: number
  /**
   * Estimated timestamp of the next L2 dispute game.
   * `undefined` if the next L2 dispute game has already been submitted.
   */
  timestamp?: number | undefined
}
export type GetTimeToNextGameErrorType = GetGamesErrorType | ErrorType

/**
 * Returns the time until the next L2 dispute game (after the provided block number) is submitted.
 * Used for the [Withdrawal](/op-stack/guides/withdrawals) flow.
 *
 * - Docs: https://viem.sh/op-stack/actions/getTimeToNextGame
 *
 * @param client - Client to use
 * @param parameters - {@link GetTimeToNextGameParameters}
 * @returns The L2 transaction hash. {@link GetTimeToNextGameReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { getBlockNumber } from 'viem/actions'
 * import { mainnet, optimism } from 'viem/chains'
 * import { getTimeToNextGame } from 'viem/op-stack'
 *
 * const publicClientL1 = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const { seconds } = await getTimeToNextGame(publicClientL1, {
 *   l2BlockNumber: 113405763n,
 *   targetChain: optimism
 * })
 */
export async function getTimeToNextGame<
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: GetTimeToNextGameParameters<chain, chainOverride>,
): Promise<GetTimeToNextGameReturnType> {
  const { intervalBuffer = 1.1, l2BlockNumber } = parameters

  const games = await getGames(client, {
    ...parameters,
    l2BlockNumber: undefined,
    limit: 10,
  })

  const deltas = games
    .map(({ l2BlockNumber, timestamp }, index) => {
      return index === games.length - 1
        ? null
        : [
            games[index + 1].timestamp - timestamp,
            games[index + 1].l2BlockNumber - l2BlockNumber,
          ]
    })
    .filter(Boolean)
  const interval = Math.ceil(
    (deltas as [bigint, bigint][]).reduce(
      (a, [b]) => Number(a) - Number(b),
      0,
    ) / deltas.length,
  )
  const blockInterval = Math.ceil(
    (deltas as [bigint, bigint][]).reduce(
      (a, [_, b]) => Number(a) - Number(b),
      0,
    ) / deltas.length,
  )

  const latestGame = games[0]
  const latestGameTimestamp = Number(latestGame.timestamp) * 1000

  const intervalWithBuffer = Math.ceil(interval * intervalBuffer)

  const now = Date.now()

  const seconds = (() => {
    // If the current timestamp is lesser than the latest dispute game timestamp,
    // then we assume that the dispute game has already been submitted.
    if (now < latestGameTimestamp) return 0

    // If the latest dispute game block is newer than the provided dispute game block number,
    // then we assume that the dispute game has already been submitted.
    if (latestGame.l2BlockNumber > l2BlockNumber) return 0

    const elapsedBlocks = Number(l2BlockNumber - latestGame.l2BlockNumber)

    const elapsed = Math.ceil((now - latestGameTimestamp) / 1000)
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
