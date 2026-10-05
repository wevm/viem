import type { Errors } from 'ox'

import type * as Client from '../../Client.js'
import { BaseError } from '../../Errors.js'
import { observe } from '../../internal/observe.js'
import { poll } from '../../internal/poll.js'
import {
  type WithRetryParameters,
  withResolvers,
  withRetry,
} from '../../internal/promise.js'
import { stringify } from '../../internal/stringify.js'
import { getCallsStatus } from './getCallsStatus.js'

/**
 * Waits for the status & receipts of a call bundle that was sent via
 * `sendCalls`.
 *
 * @example
 * ```ts
 * import { Actions, Client, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: custom(window.ethereum!),
 * })
 * const { receipts, status } = await Actions.wallet.waitForCallsStatus(client, {
 *   id: '0xdeadbeef',
 * })
 * ```
 */
export async function waitForCallsStatus(
  client: Client.Client,
  options: waitForCallsStatus.Options,
): Promise<waitForCallsStatus.ReturnType> {
  const {
    id,
    pollingInterval = client.pollingInterval,
    status = ({ statusCode }) => statusCode === 200 || statusCode >= 300,
    retryCount = 4,
    retryDelay = ({ count }) => ~~(1 << count) * 200, // exponential backoff
    timeout = 60_000,
    throwOnFailure = false,
  } = options
  const observerId = stringify(['waitForCallsStatus', client.uid, id])

  const { promise, resolve, reject } =
    withResolvers<waitForCallsStatus.ReturnType>()

  let timer: ReturnType<typeof setTimeout> | undefined
  let unobserve: () => void

  // Settles this caller: clears its timer and removes its listener from the
  // shared observer (stopping the poll once the last caller settles).
  const done = (fn: () => void) => {
    clearTimeout(timer)
    fn()
    unobserve?.()
  }

  unobserve = observe(
    observerId,
    {
      reject: (error: unknown) => done(() => reject(error)),
      resolve: (result: waitForCallsStatus.ReturnType) =>
        done(() => resolve(result)),
    },
    (emit) =>
      poll(
        async ({ unpoll }) => {
          try {
            const result = await withRetry(
              async () => {
                const result = await getCallsStatus(client, { id })
                if (throwOnFailure && result.status === 'failure')
                  throw new BundleFailedError(result)
                return result
              },
              {
                retryCount,
                delay: retryDelay,
              },
            )
            if (!status(result)) return
            unpoll()
            emit.resolve(result)
          } catch (error) {
            unpoll()
            emit.reject(error)
          }
        },
        {
          interval: pollingInterval,
          emitOnBegin: true,
        },
      ),
  )

  timer = timeout
    ? setTimeout(
        () => done(() => reject(new WaitForCallsStatusTimeoutError({ id }))),
        timeout,
      )
    : undefined

  return await promise
}

export declare namespace waitForCallsStatus {
  type Options = {
    /** The id of the call batch to wait for. */
    id: string
    /**
     * Polling frequency (in ms).
     * @default client.pollingInterval
     */
    pollingInterval?: number | undefined
    /**
     * Number of times to retry if the call bundle failed.
     * @default 4 (exponential backoff)
     */
    retryCount?: WithRetryParameters['retryCount'] | undefined
    /**
     * Time to wait (in ms) between retries.
     * @default `({ count }) => ~~(1 << count) * 200` (exponential backoff)
     */
    retryDelay?: WithRetryParameters['delay'] | undefined
    /**
     * The status range to wait for.
     * @default (status) => status >= 200
     */
    status?: ((parameters: getCallsStatus.ReturnType) => boolean) | undefined
    /**
     * Whether to throw an error if the call bundle fails.
     * @default false
     */
    throwOnFailure?: boolean | undefined
    /**
     * Optional timeout (in ms) to wait before stopping polling.
     * @default 60_000
     */
    timeout?: number | undefined
  }

  type ReturnType = getCallsStatus.ReturnType

  type ErrorType =
    | getCallsStatus.ErrorType
    | BundleFailedError
    | WaitForCallsStatusTimeoutError
    | Errors.GlobalErrorType
}

/** Thrown when waiting for a call bundle times out. */
export class WaitForCallsStatusTimeoutError extends BaseError {
  override readonly name = 'Actions.wallet.waitForCallsStatus.TimeoutError'

  constructor({ id }: { id: string }) {
    super(
      `Timed out while waiting for call bundle with id "${id}" to be confirmed.`,
    )
  }
}

/** Thrown when a call bundle fails and `throwOnFailure` is enabled. */
export class BundleFailedError extends BaseError {
  override readonly name = 'Actions.wallet.waitForCallsStatus.BundleFailedError'
  readonly result: getCallsStatus.ReturnType

  constructor(result: getCallsStatus.ReturnType) {
    super(`Call bundle failed with status: ${result.statusCode}`)
    this.result = result
  }
}
