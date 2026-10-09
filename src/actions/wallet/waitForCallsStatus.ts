import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { BaseError } from '../../errors/base.js'
import { BundleFailedError } from '../../errors/calls.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Chain } from '../../types/chain.js'
import { getAction } from '../../utils/getAction.js'
import { type ObserveErrorType, observe } from '../../utils/observe.js'
import { type PollErrorType, poll } from '../../utils/poll.js'
import { withResolvers } from '../../utils/promise/withResolvers.js'
import {
  type WithRetryParameters,
  withRetry,
} from '../../utils/promise/withRetry.js'
import { stringify } from '../../utils/stringify.js'
import {
  type GetCallsStatusErrorType,
  type GetCallsStatusReturnType,
  getCallsStatus,
} from './getCallsStatus.js'

export type WaitForCallsStatusParameters = {
  /**
   * The id of the call batch to wait for.
   */
  id: string
  /**
   * Polling frequency (in ms). Defaults to the client's pollingInterval config.
   *
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
   *
   * @default (status) => status >= 200
   */
  status?: ((parameters: GetCallsStatusReturnType) => boolean) | undefined
  /**
   * Whether to throw an error if the call bundle fails.
   *
   * @default false
   */
  throwOnFailure?: boolean | undefined
  /**
   * Optional timeout (in milliseconds) to wait before stopping polling.
   *
   * @default 60_000
   */
  timeout?: number | undefined
}

export type WaitForCallsStatusReturnType = GetCallsStatusReturnType

export type WaitForCallsStatusErrorType =
  | ObserveErrorType
  | PollErrorType
  | GetCallsStatusErrorType
  | WaitForCallsStatusTimeoutError
  | ErrorType

const functionIds = /*#__PURE__*/ new WeakMap<object, number>()
let functionCount = 0
function getFunctionId(fn: object): number {
  let fnId = functionIds.get(fn)
  if (fnId === undefined) {
    fnId = ++functionCount
    functionIds.set(fn, fnId)
  }
  return fnId
}

/**
 * Waits for the status & receipts of a call bundle that was sent via `sendCalls`.
 *
 * - Docs: https://viem.sh/docs/actions/wallet/waitForCallsStatus
 * - JSON-RPC Methods: [`wallet_getCallsStatus`](https://eips.ethereum.org/EIPS/eip-5792)
 *
 * @param client - Client to use
 * @param parameters - {@link WaitForCallsStatusParameters}
 * @returns Status & receipts of the call bundle. {@link WaitForCallsStatusReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { waitForCallsStatus } from 'viem/actions'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 *
 * const { receipts, status } = await waitForCallsStatus(client, { id: '0xdeadbeef' })
 */
export async function waitForCallsStatus<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: WaitForCallsStatusParameters,
): Promise<WaitForCallsStatusReturnType> {
  const {
    id,
    pollingInterval = client.pollingInterval,
    status = ({ statusCode }) => statusCode === 200 || statusCode >= 300,
    retryCount = 4,
    retryDelay = ({ count }) => ~~(1 << count) * 200, // exponential backoff
    timeout = 60_000,
    throwOnFailure = false,
  } = parameters
  const observerId = stringify([
    'waitForCallsStatus',
    client.uid,
    id,
    // Concurrent calls with different behavior-defining options must not
    // share an observer: the first call's polling closure decides the
    // status check, failure handling and retry behavior for everyone.
    // `timeout` is enforced per caller below, so it is not included.
    {
      pollingInterval,
      retryCount,
      // Caller-provided functions are keyed by identity, not source text:
      // two predicates built by the same factory have identical source
      // but capture different values, so they must not share an observer.
      // Keying on `parameters.*` (not the destructured defaults) keeps
      // calls that use the defaults on one shared observer, since the
      // default functions are recreated on every call.
      retryDelay:
        typeof parameters.retryDelay === 'function'
          ? getFunctionId(parameters.retryDelay)
          : parameters.retryDelay,
      status: parameters.status ? getFunctionId(parameters.status) : undefined,
      throwOnFailure,
    },
  ])

  const { promise, resolve, reject } =
    withResolvers<WaitForCallsStatusReturnType>()

  let timer: ReturnType<typeof setTimeout> | undefined

  const unobserve = observe(observerId, { resolve, reject }, (emit) => {
    const unpoll = poll(
      async () => {
        const done = (fn: () => void) => {
          clearTimeout(timer)
          unpoll()
          fn()
          unobserve()
        }

        try {
          const result = await withRetry(
            async () => {
              const result = await getAction(
                client,
                getCallsStatus,
                'getCallsStatus',
              )({ id })
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
          done(() => emit.resolve(result))
        } catch (error) {
          done(() => emit.reject(error))
        }
      },
      {
        interval: pollingInterval,
        emitOnBegin: true,
      },
    )

    return unpoll
  })

  timer = timeout
    ? setTimeout(() => {
        unobserve()
        clearTimeout(timer)
        reject(new WaitForCallsStatusTimeoutError({ id }))
      }, timeout)
    : undefined

  // Remove this caller's listener once its promise settles. `done` only
  // unobserves the caller that started the poll, so a listener from a
  // concurrent caller would otherwise stay cached and block every later
  // wait for the same id from polling.
  return await promise.finally(() => unobserve())
}

export type WaitForCallsStatusTimeoutErrorType =
  WaitForCallsStatusTimeoutError & {
    name: 'WaitForCallsStatusTimeoutError'
  }
export class WaitForCallsStatusTimeoutError extends BaseError {
  constructor({ id }: { id: string }) {
    super(
      `Timed out while waiting for call bundle with id "${id}" to be confirmed.`,
      { name: 'WaitForCallsStatusTimeoutError' },
    )
  }
}
