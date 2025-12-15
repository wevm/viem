import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { ErrorType } from '../../../errors/utils.js'
import type { Hash } from '../../../types/misc.js'
import type { Prettify } from '../../../types/utils.js'
import { getAction } from '../../../utils/getAction.js'
import { type ObserveErrorType, observe } from '../../../utils/observe.js'
import { type PollErrorType, poll } from '../../../utils/poll.js'
import { stringify } from '../../../utils/stringify.js'
import {
  WaitForUserOperationReceiptTimeoutError,
  type WaitForUserOperationReceiptTimeoutErrorType,
} from '../../errors/userOperation.js'
import type { UserOperationReceipt } from '../../types/userOperation.js'
import {
  type GetUserOperationReceiptErrorType,
  getUserOperationReceipt,
} from './getUserOperationReceipt.js'

export type WaitForUserOperationReceiptParameters = {
  /** The hash of the User Operation. */
  hash: Hash
  /**
   * Polling frequency (in ms). Defaults to the client's pollingInterval config.
   * @default client.pollingInterval
   */
  pollingInterval?: number | undefined
  /**
   * The number of times to retry.
   * @default 6
   */
  retryCount?: number | undefined
  /** Optional timeout (in ms) to wait before stopping polling. */
  timeout?: number | undefined
}

export type WaitForUserOperationReceiptReturnType =
  Prettify<UserOperationReceipt>

export type WaitForUserOperationReceiptErrorType =
  | WaitForUserOperationReceiptTimeoutErrorType
  | PollErrorType
  | ObserveErrorType
  | ErrorType

/**
 * Waits for the User Operation to be included on a [Block](https://viem.sh/docs/glossary/terms#block) (one confirmation), and then returns the User Operation receipt.
 *
 * - Docs: https://viem.sh/docs/actions/bundler/waitForUserOperationReceipt
 *
 * @param client - Client to use
 * @param parameters - {@link WaitForUserOperationReceiptParameters}
 * @returns The receipt. {@link WaitForUserOperationReceiptReturnType}
 *
 * @example
 * import { createBundlerClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { waitForUserOperationReceipt } from 'viem/actions'
 *
 * const client = createBundlerClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const receipt = await waitForUserOperationReceipt(client, {
 *   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
 * })
 */
export function waitForUserOperationReceipt(
  client: Client<Transport>,
  parameters: WaitForUserOperationReceiptParameters,
): Promise<WaitForUserOperationReceiptReturnType> {
  const {
    hash,
    pollingInterval = client.pollingInterval,
    retryCount,
    timeout = 120_000,
  } = parameters

  let count = 0
  const observerId = stringify([
    'waitForUserOperationReceipt',
    client.uid,
    hash,
  ])

  return new Promise((resolve, reject) => {
    const unobserve = observe(observerId, { resolve, reject }, (emit) => {
      const done = (fn: () => void) => {
        unpoll()
        fn()
        unobserve()
      }

      const timeoutId = timeout
        ? setTimeout(
            () =>
              done(() =>
                emit.reject(
                  new WaitForUserOperationReceiptTimeoutError({ hash }),
                ),
              ),
            timeout,
          )
        : undefined

      const unpoll = poll(
        async () => {
          if (retryCount && count >= retryCount) {
            clearTimeout(timeoutId)
            done(() =>
              emit.reject(
                new WaitForUserOperationReceiptTimeoutError({ hash }),
              ),
            )
          }

          try {
            const receipt = await getAction(
              client,
              getUserOperationReceipt,
              'getUserOperationReceipt',
            )({ hash })
            clearTimeout(timeoutId)
            done(() => emit.resolve(receipt))
          } catch (err) {
            const error = err as GetUserOperationReceiptErrorType
            if (error.name !== 'UserOperationReceiptNotFoundError') {
              clearTimeout(timeoutId)
              done(() => emit.reject(error))
            }
          }

          count++
        },
        {
          emitOnBegin: true,
          interval: pollingInterval,
        },
      )

      return unpoll
    })
  })
}
