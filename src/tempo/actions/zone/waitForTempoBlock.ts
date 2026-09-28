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
import { getZoneInfo } from './getZoneInfo.js'

/**
 * Waits for a zone to import a Tempo block.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({ transport: http() })
 *
 * const info = await Actions.zone.waitForTempoBlock(client, {
 *   tempoBlockNumber: 42n,
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns Zone metadata after the block has been imported.
 */
export async function waitForTempoBlock<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: waitForTempoBlock.Options,
): Promise<waitForTempoBlock.ReturnType> {
  const {
    pollingInterval = client.pollingInterval,
    tempoBlockNumber,
    timeout = 60_000,
  } = options
  const observerId = stringify([
    'waitForTempoBlock',
    client.uid,
    tempoBlockNumber,
  ])
  const { promise, reject, resolve } =
    withResolvers<waitForTempoBlock.ReturnType>()

  let timer: ReturnType<typeof setTimeout> | undefined
  let unobserve: () => void
  const cleanup = () => {
    clearTimeout(timer)
    unobserve()
  }

  unobserve = observe(observerId, { reject, resolve }, (emit) => {
    const unpoll = poll(
      async () => {
        try {
          const info = await getZoneInfo(client)
          if (info.tempoBlockNumber < tempoBlockNumber) return
          unpoll()
          emit.resolve(info)
        } catch (error) {
          unpoll()
          emit.reject(error)
        }
      },
      { emitOnBegin: true, interval: pollingInterval },
    )
    return unpoll
  })

  timer = timeout
    ? setTimeout(() => {
        reject(new WaitForTempoBlockTimeoutError({ tempoBlockNumber }))
      }, timeout)
    : undefined

  return await promise.finally(cleanup)
}

export namespace waitForTempoBlock {
  /** Options for {@link waitForTempoBlock}. */
  export type Options = {
    /** Polling frequency in milliseconds. Defaults to `client.pollingInterval`. */
    pollingInterval?: number | undefined
    /** Tempo block number to wait for. */
    tempoBlockNumber: bigint
    /** Timeout in milliseconds. Defaults to 60 seconds. Pass `0` to disable. */
    timeout?: number | undefined
  }
  /** Return value for {@link waitForTempoBlock}. */
  export type ReturnType = getZoneInfo.ReturnType
  /** Error type for {@link waitForTempoBlock}. */
  export type ErrorType =
    | getZoneInfo.ErrorType
    | ObserveErrorType
    | PollErrorType
    | WaitForTempoBlockTimeoutError
    | Errors.GlobalErrorType
}

/** Thrown when waiting for a Zone to import a Tempo block times out. */
export class WaitForTempoBlockTimeoutError extends BaseError {
  override readonly name = 'Actions.zone.waitForTempoBlock.TimeoutError'

  constructor(options: { tempoBlockNumber: bigint }) {
    super(
      `Timed out while waiting for Tempo block "${options.tempoBlockNumber}" to be imported by the zone.`,
    )
  }
}
