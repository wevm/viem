import type { Errors } from 'ox'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import * as Game from '../../Game.js'
import { getGames } from './getGames.js'

/** Retrieves a respected dispute game after an L2 position. */
export async function getGame<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getGame.Options,
): Promise<getGame.ReturnType> {
  const { l2BlockNumber, strategy = 'latest' } = options
  const games = (await getGames(client, options)).filter(
    (game) => game.l2BlockNumber > l2BlockNumber,
  )
  const game =
    strategy === 'random'
      ? games[Math.floor(Math.random() * games.length)]
      : games[0]
  if (!game) throw new Game.NotFoundError()
  return game
}

export declare namespace getGame {
  /** Options for {@link getGame}. */
  type Options = getGames.Options & {
    /** Minimum anchored L2 block number or timestamp. */
    l2BlockNumber: bigint
    /** Game selection strategy. @default 'latest' */
    strategy?: 'latest' | 'random' | undefined
  }

  /** Return type of {@link getGame}. */
  type ReturnType = getGames.Result

  /** Errors thrown by {@link getGame}. */
  type ErrorType =
    | getGames.ErrorType
    | Game.NotFoundError
    | Errors.GlobalErrorType
}
