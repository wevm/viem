import type { Errors, Hex } from 'ox'

import type * as Client from '../../../core/Client.js'
import { observe } from '../../../core/internal/observe.js'
import { poll } from '../../../core/internal/poll.js'
import { withResolvers } from '../../../core/internal/promise.js'
import { stringify } from '../../../core/internal/stringify.js'
import type * as EntryPoint from '../../EntryPoint.js'
import {
  UserOperationReceiptNotFoundError,
  WaitForUserOperationReceiptTimeoutError,
} from '../../errors.js'
import { getReceipt } from './getReceipt.js'

/**
 * Waits for a User Operation to be included on a block, then returns its
 * receipt.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/account-abstraction'
 *
 * const client = Client.create({ transport: http() })
 * const receipt = await Actions.userOperation.waitForReceipt(client, {
 *   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
 * })
 * ```
 */
export async function waitForReceipt<
  entryPointVersion extends EntryPoint.Version = EntryPoint.Version,
>(
  client: Pick<Client.Client, 'pollingInterval' | 'request' | 'uid'>,
  options: waitForReceipt.Options,
): Promise<waitForReceipt.ReturnType<entryPointVersion>> {
  const {
    hash,
    pollingInterval = client.pollingInterval,
    retryCount,
    timeout = 120_000,
  } = options

  let count = 0
  const observerId = stringify([
    'waitForUserOperationReceipt',
    client.uid,
    hash,
  ])
  const { promise, resolve, reject } =
    withResolvers<waitForReceipt.ReturnType<entryPointVersion>>()

  const unobserve = observe(observerId, { reject, resolve }, (emit) => {
    let timer: ReturnType<typeof setTimeout> | undefined

    const unpoll = poll(
      async () => {
        if (retryCount && count >= retryCount) {
          done(() =>
            emit.reject(new WaitForUserOperationReceiptTimeoutError({ hash })),
          )
          return
        }

        try {
          const receipt = await getReceipt<entryPointVersion>(client, { hash })
          done(() => emit.resolve(receipt))
        } catch (error) {
          if (!(error instanceof UserOperationReceiptNotFoundError))
            done(() => emit.reject(error))
        }

        count++
      },
      {
        emitOnBegin: true,
        interval: pollingInterval,
      },
    )

    timer = timeout
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

    function done(fn: () => void) {
      clearTimeout(timer)
      unpoll()
      fn()
      unobserve()
    }

    return unpoll
  })

  return promise
}

export declare namespace waitForReceipt {
  type Options = {
    /** Hash of the User Operation. */
    hash: Hex.Hex
    /** Polling frequency (in ms). @default client.pollingInterval */
    pollingInterval?: number | undefined
    /** Number of polling attempts before timing out. */
    retryCount?: number | undefined
    /** Time (in ms) before timing out. @default 120_000 */
    timeout?: number | undefined
  }

  type ReturnType<
    entryPointVersion extends EntryPoint.Version = EntryPoint.Version,
  > = getReceipt.ReturnType<entryPointVersion>

  type ErrorType =
    | getReceipt.ErrorType
    | WaitForUserOperationReceiptTimeoutError
    | Errors.GlobalErrorType
}
