import type * as Errors from 'ox/Errors'
import type * as Hex from 'ox/Hex'

import type * as Client from '../../Client.js'
import { observe } from '../../internal/observe.js'
import { poll } from '../../internal/poll.js'
import { withResolvers } from '../../internal/promise.js'
import { stringify } from '../../internal/stringify.js'
import type { Filter } from '../filter/Filter.js'
import { getChanges } from '../filter/getChanges.js'
import { uninstall } from '../filter/uninstall.js'
import { getSubscribe } from '../internal/getSubscribe.js'
import { createPendingFilter } from './createPendingFilter.js'

/**
 * Watches incoming pending transaction hashes, returning a watcher handle.
 *
 * Register listeners with {@link watchPending.Watcher.onTransactions} /
 * {@link watchPending.Watcher.onError}, or consume the handle as an async
 * iterable. The underlying source starts lazily once the first listener (or
 * iterator) attaches, and is torn down via {@link watchPending.Watcher.off}.
 *
 * Uses a WebSocket / IPC subscription (`eth_subscribe` over
 * `newPendingTransactions`) when the Client's transport supports it, otherwise
 * installs a pending-transaction filter and polls `eth_getFilterChanges` on an
 * interval. Pass `poll` to force one mode or the other.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const watch = Actions.transaction.watchPending(client)
 * watch.onTransactions((hashes) => console.log(hashes))
 * // later: watch.off()
 * ```
 *
 * @example
 * ```ts
 * // Async iteration (latest-only state stream).
 * for await (const { hashes } of watch) console.log(hashes)
 * ```
 */
export function watchPending(
  client: Client.Client,
  options: watchPending.Options = {},
): watchPending.Watcher {
  const { batch = true, pollingInterval = client.pollingInterval } = options

  const subscribe = getSubscribe(client.transport)
  const enablePolling = options.poll ?? !subscribe

  const transactionsListeners = new Set<watchPending.OnTransactionsFn>()
  const errorListeners = new Set<watchPending.OnErrorFn>()
  const iteratorEnds = new Set<() => void>()

  let unwatch: (() => void) | undefined
  let closed = false

  const emitTransactions: watchPending.OnTransactionsFn = (hashes) => {
    for (const listener of transactionsListeners) listener(hashes)
  }
  const emitError: watchPending.OnErrorFn = (error) => {
    for (const listener of errorListeners) listener(error)
  }

  function start() {
    if (closed || unwatch) return

    if (enablePolling) {
      const observerId = stringify([
        'transaction.watchPending',
        client.uid,
        batch,
        pollingInterval,
      ])
      unwatch = observe(
        observerId,
        { onTransactions: emitTransactions, onError: emitError },
        (emit) => {
          let filter: Filter<'transaction'> | undefined

          const unpoll = poll(
            async () => {
              try {
                if (!filter) {
                  try {
                    filter = await createPendingFilter(client)
                  } catch (err) {
                    unpoll()
                    throw err
                  }
                  return
                }

                const hashes = await getChanges(client, { filter })
                if (hashes.length === 0) return
                if (batch) emit.onTransactions(hashes)
                else for (const hash of hashes) emit.onTransactions([hash])
              } catch (err) {
                emit.onError?.(err as Error)
              }
            },
            { emitOnBegin: true, interval: pollingInterval },
          )

          return async () => {
            if (filter) await uninstall(client, { filter })
            unpoll()
          }
        },
      )
      return
    }

    const observerId = stringify(['transaction.watchPending', client.uid])
    unwatch = observe(
      observerId,
      { onTransactions: emitTransactions, onError: emitError },
      (emit) => {
        let active = true
        let unsubscribe = () => {
          active = false
        }
        ;(async () => {
          try {
            const subscription = await subscribe!({
              params: ['newPendingTransactions'],
            })
            subscription.onData((data) => {
              if (!active) return
              emit.onTransactions([data.result as Hex.Hex])
            })
            subscription.onError((error) => emit.onError?.(error as Error))
            unsubscribe = () => {
              active = false
              void subscription.unsubscribe()
            }
            if (!active) unsubscribe()
          } catch (err) {
            emit.onError?.(err as Error)
          }
        })()
        return () => unsubscribe()
      },
    )
  }

  function createIterator(): AsyncIterableIterator<watchPending.Emitted> {
    let latest: watchPending.Emitted | undefined
    let error: Error | undefined
    let pending:
      | {
          resolve: (result: IteratorResult<watchPending.Emitted>) => void
          reject: (error: Error) => void
        }
      | undefined
    let done = false

    const offTransactions = watcher.onTransactions((hashes) => {
      const value = { hashes }
      if (pending) {
        const { resolve } = pending
        pending = undefined
        resolve({ done: false, value })
      } else {
        latest = value
      }
    })
    const offError = watcher.onError((err) => {
      if (pending) {
        const { reject } = pending
        pending = undefined
        done = true
        cleanup()
        reject(err)
      } else {
        error = err
      }
    })

    function cleanup() {
      offTransactions()
      offError()
      iteratorEnds.delete(end)
    }

    function end() {
      done = true
      cleanup()
      if (pending) {
        const { resolve } = pending
        pending = undefined
        resolve({ done: true, value: undefined })
      }
    }
    iteratorEnds.add(end)

    return {
      next() {
        if (latest) {
          const value = latest
          latest = undefined
          return Promise.resolve({ done: false, value })
        }
        if (error) {
          const err = error
          error = undefined
          done = true
          cleanup()
          return Promise.reject(err)
        }
        if (done) return Promise.resolve({ done: true, value: undefined })
        const { promise, resolve, reject } =
          withResolvers<IteratorResult<watchPending.Emitted>>()
        pending = { reject, resolve }
        return promise
      },
      return() {
        end()
        return Promise.resolve({ done: true, value: undefined })
      },
      [Symbol.asyncIterator]() {
        return this
      },
    }
  }

  const watcher: watchPending.Watcher = {
    onTransactions(fn) {
      if (closed) return () => {}
      transactionsListeners.add(fn)
      start()
      return () => {
        transactionsListeners.delete(fn)
      }
    },
    onError(fn) {
      if (closed) return () => {}
      errorListeners.add(fn)
      return () => {
        errorListeners.delete(fn)
      }
    },
    off() {
      if (closed) return
      closed = true
      const ends = Array.from(iteratorEnds)
      iteratorEnds.clear()
      for (const end of ends) end()
      transactionsListeners.clear()
      errorListeners.clear()
      unwatch?.()
      unwatch = undefined
    },
    [Symbol.asyncIterator]() {
      return createIterator()
    },
  }
  return watcher
}

export declare namespace watchPending {
  type OnTransactionsFn = (hashes: readonly Hex.Hex[]) => void

  type OnErrorFn = (error: Error) => void

  type Emitted = {
    /** The incoming pending transaction hashes. */
    hashes: readonly Hex.Hex[]
  }

  type Options = {
    /**
     * Whether to batch the hashes found within a poll interval into a single
     * emission. When `false`, each hash is emitted on its own.
     *
     * @default true
     */
    batch?: boolean | undefined
    /**
     * Whether to poll for new pending transactions instead of using a
     * subscription. Defaults to `true` when the transport cannot subscribe.
     */
    poll?: boolean | undefined
    /** Polling frequency (in ms). @default client.pollingInterval */
    pollingInterval?: number | undefined
  }

  type Watcher = {
    /**
     * Registers a listener invoked with each batch of new pending transaction
     * hashes. Starts the watcher on first registration. Returns a function that
     * unregisters this listener.
     */
    onTransactions: (fn: OnTransactionsFn) => () => void
    /**
     * Registers a listener invoked when polling for pending transactions fails.
     * Returns a function that unregisters this listener.
     */
    onError: (fn: OnErrorFn) => () => void
    /**
     * Tears down the watcher: removes all listeners, ends all iterators, stops
     * the underlying poll / subscription, and uninstalls the filter. Idempotent
     * and terminal.
     */
    off: () => void
    /**
     * Async-iterates emitted pending transaction hashes. The iterator is a
     * latest-only state stream (it may skip intermediate values under slow
     * consumption) and throws if the source errors.
     */
    [Symbol.asyncIterator]: () => AsyncIterableIterator<Emitted>
  }

  type ReturnType = Watcher

  type ErrorType =
    | createPendingFilter.ErrorType
    | getChanges.ErrorType
    | uninstall.ErrorType
    | Errors.GlobalErrorType
}
