import type { Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { BaseError } from '../../../core/Errors.js'
import {
  observe,
  type ObserveErrorType,
} from '../../../core/internal/observe.js'
import { poll, type PollErrorType } from '../../../core/internal/poll.js'
import { withResolvers } from '../../../core/internal/promise.js'
import { stringify } from '../../../core/internal/stringify.js'
import { getDepositStatus } from './getDepositStatus.js'

/**
 * Waits for a Tempo block's deposits to be processed by a zone.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({ transport: http() })
 *
 * const status = await Actions.zone.waitForDepositStatus(client, {
 *   tempoBlockNumber: 42n,
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The processed deposit status.
 */
export async function waitForDepositStatus<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: waitForDepositStatus.Options,
): Promise<waitForDepositStatus.ReturnType> {
  const {
    pollingInterval = client.pollingInterval,
    tempoBlockNumber,
    timeout = 60_000,
  } = options
  const observerId = stringify([
    'waitForDepositStatus',
    client.uid,
    tempoBlockNumber,
  ])
  const { promise, reject, resolve } =
    withResolvers<waitForDepositStatus.ReturnType>()

  let timer: ReturnType<typeof setTimeout> | undefined
  let unobserve: () => void
  const cleanup = () => {
    clearTimeout(timer)
    unobserve()
  }
  const resolve_ = (status: waitForDepositStatus.ReturnType) => {
    cleanup()
    resolve(status)
  }
  const reject_ = (error: unknown) => {
    cleanup()
    reject(error)
  }

  unobserve = observe(
    observerId,
    { reject: reject_, resolve: resolve_ },
    (emit) => {
      const unpoll = poll(
        async ({ unpoll }) => {
          try {
            const status = await getDepositStatus(client, { tempoBlockNumber })
            if (!status.processed) return
            unpoll()
            emit.resolve(status)
          } catch (error) {
            unpoll()
            emit.reject(error)
          }
        },
        { emitOnBegin: true, interval: pollingInterval },
      )
      return unpoll
    },
  )

  timer = timeout
    ? setTimeout(() => {
        reject_(new WaitForDepositStatusTimeoutError({ tempoBlockNumber }))
      }, timeout)
    : undefined

  return await promise
}

export namespace waitForDepositStatus {
  /** Options for {@link waitForDepositStatus}. */
  export type Options = getDepositStatus.Options & {
    /** Polling frequency in milliseconds. Defaults to `client.pollingInterval`. */
    pollingInterval?: number | undefined
    /** Timeout in milliseconds. Defaults to 60 seconds. Pass `0` to disable. */
    timeout?: number | undefined
  }
  /** Return value for {@link waitForDepositStatus}. */
  export type ReturnType = getDepositStatus.ReturnType
  /** Error type for {@link waitForDepositStatus}. */
  export type ErrorType =
    | getDepositStatus.ErrorType
    | ObserveErrorType
    | PollErrorType
    | WaitForDepositStatusTimeoutError
    | Errors.GlobalErrorType
}

/** Thrown when waiting for zone deposits times out. */
export class WaitForDepositStatusTimeoutError extends BaseError {
  override readonly name = 'Actions.zone.waitForDepositStatus.TimeoutError'

  constructor(options: { tempoBlockNumber: bigint }) {
    super(
      `Timed out while waiting for deposits from Tempo block "${options.tempoBlockNumber}" to be processed.`,
    )
  }
}
