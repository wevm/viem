import type { Errors } from 'ox'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import * as ContractError from '../../../core/ContractError.js'
import type { PollErrorType } from '../../../core/internal/poll.js'
import { poll } from '../../../core/internal/poll.js'
import { getL2Output } from './getL2Output.js'
import { getTimeToNextL2Output } from './getTimeToNextL2Output.js'

/** Waits for a legacy L2 output after an L2 block number. */
export async function waitForNextL2Output<
  chain extends Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: waitForNextL2Output.Options,
): Promise<waitForNextL2Output.ReturnType> {
  const { pollingInterval = client.pollingInterval } = options
  const { seconds } = await getTimeToNextL2Output(client, options)

  return new Promise((resolve, reject) => {
    poll(
      async ({ unpoll }) => {
        try {
          const output = await getL2Output(client, options)
          unpoll()
          resolve(output)
        } catch (error) {
          if (
            error instanceof ContractError.ContractFunctionExecutionError &&
            error.cause instanceof
              ContractError.ContractFunctionRevertedError &&
            (error.cause.reason === outputNotProposedError ||
              error.cause.data?.args?.[0] === outputNotProposedError)
          )
            return
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

const outputNotProposedError =
  'L2OutputOracle: cannot get output for a block that has not been proposed'

export declare namespace waitForNextL2Output {
  /** Options for {@link waitForNextL2Output}. */
  type Options = getL2Output.Options &
    getTimeToNextL2Output.Options & {
      /** Polling interval in milliseconds. @default client.pollingInterval */
      pollingInterval?: number | undefined
    }

  /** Return type of {@link waitForNextL2Output}. */
  type ReturnType = getL2Output.ReturnType

  /** Errors thrown by {@link waitForNextL2Output}. */
  type ErrorType =
    | getL2Output.ErrorType
    | getTimeToNextL2Output.ErrorType
    | PollErrorType
    | Errors.GlobalErrorType
}
