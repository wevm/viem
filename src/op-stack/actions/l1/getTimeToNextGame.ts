import type { Errors } from 'ox'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { getGames } from './getGames.js'

/** Estimates when the next dispute game will be submitted. */
export async function getTimeToNextGame<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getTimeToNextGame.Options,
): Promise<getTimeToNextGame.ReturnType> {
  const { intervalBuffer = 1.1, l2BlockNumber, ...rest } = options
  const games = await getGames(client, { ...rest, limit: 10 })
  if (games.length === 0) return { interval: 0, seconds: 0 }

  let intervalTotal = 0
  let blockIntervalTotal = 0
  for (let index = 0; index < games.length - 1; index++) {
    const game = games[index]!
    const next = games[index + 1]!
    intervalTotal += Number(game.timestamp - next.timestamp)
    blockIntervalTotal += Number(game.l2BlockNumber - next.l2BlockNumber)
  }
  const samples = games.length - 1
  const interval = samples > 0 ? Math.ceil(intervalTotal / samples) : 0
  const blockInterval =
    samples > 0 ? Math.ceil(blockIntervalTotal / samples) : 0
  const latestGame = games[0]!
  const latestGameTimestamp = Number(latestGame.timestamp) * 1000
  const intervalWithBuffer = Math.ceil(interval * intervalBuffer)
  const now = Date.now()

  const seconds = (() => {
    if (now < latestGameTimestamp) return 0
    if (latestGame.l2BlockNumber > l2BlockNumber) return 0
    if (intervalWithBuffer === 0) return 0

    const elapsedBlocks = Number(l2BlockNumber - latestGame.l2BlockNumber)
    const elapsed = Math.ceil((now - latestGameTimestamp) / 1000)
    const secondsToNextGame =
      intervalWithBuffer - (elapsed % intervalWithBuffer)
    if (blockInterval <= 0 || elapsedBlocks < blockInterval)
      return secondsToNextGame
    return (
      Math.floor(elapsedBlocks / blockInterval) * intervalWithBuffer +
      secondsToNextGame
    )
  })()

  return {
    interval,
    seconds,
    ...(seconds > 0 ? { timestamp: now + seconds * 1000 } : {}),
  }
}

export declare namespace getTimeToNextGame {
  /** Options for {@link getTimeToNextGame}. */
  type Options = getGames.Options & {
    /** Buffer applied to the observed game interval. @default 1.1 */
    intervalBuffer?: number | undefined
    /** Minimum anchored L2 block number or timestamp. */
    l2BlockNumber: bigint
  }

  /** Estimated wait for the next game. */
  type ReturnType = {
    /** Estimated interval between games, in seconds. */
    interval: number
    /** Estimated seconds until the next game. */
    seconds: number
    /** Estimated submission timestamp in milliseconds. */
    timestamp?: number | undefined
  }

  /** Errors thrown by {@link getTimeToNextGame}. */
  type ErrorType = getGames.ErrorType | Errors.GlobalErrorType
}
