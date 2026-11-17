import type { Errors } from 'ox'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import type { PollErrorType } from '../../../core/internal/poll.js'
import { poll } from '../../../core/internal/poll.js'
import * as Game from '../../Game.js'
import { getGame } from './getGame.js'
import { getTimeToNextGame } from './getTimeToNextGame.js'

/** Waits for a dispute game after an L2 position. */
export async function waitForNextGame<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: waitForNextGame.Options,
): Promise<waitForNextGame.ReturnType> {
  const { pollingInterval = client.pollingInterval } = options
  const { seconds } = await getTimeToNextGame(client, options)

  return new Promise((resolve, reject) => {
    poll(
      async ({ unpoll }) => {
        try {
          const game = await getGame(client, {
            ...options,
            strategy: 'random',
          })
          unpoll()
          resolve(game)
        } catch (error) {
          if (error instanceof Game.NotFoundError) return
          unpoll()
          reject(error)
        }
      },
      {
        initialWaitTime: async () => seconds * 1000,
        interval: pollingInterval,
      },
    )
  })
}

export declare namespace waitForNextGame {
  /** Options for {@link waitForNextGame}. */
  type Options = getTimeToNextGame.Options & {
    /** Maximum number of recent games to inspect. @default 100 */
    limit?: number | undefined
    /** Polling interval in milliseconds. @default client.pollingInterval */
    pollingInterval?: number | undefined
  }

  /** Return type of {@link waitForNextGame}. */
  type ReturnType = getGame.ReturnType

  /** Errors thrown by {@link waitForNextGame}. */
  type ErrorType =
    | getGame.ErrorType
    | getTimeToNextGame.ErrorType
    | PollErrorType
    | Errors.GlobalErrorType
}
