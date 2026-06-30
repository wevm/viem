import * as AbiEvent from 'ox/AbiEvent'
import type * as Address from 'ox/Address'
import type * as Block from 'ox/Block'
import type * as Errors from 'ox/Errors'
import type * as Hex from 'ox/Hex'
import * as Log from 'ox/Log'

import type * as Client from '../../Client.js'
import { observe } from '../../internal/observe.js'
import { poll } from '../../internal/poll.js'
import { withResolvers } from '../../internal/promise.js'
import { stringify } from '../../internal/stringify.js'
import type { OneOf } from '../../internal/types.js'
import { getNumber } from '../block/getNumber.js'
import type { Filter } from '../filter/Filter.js'
import { getChanges } from '../filter/getChanges.js'
import { uninstall } from '../filter/uninstall.js'
import { getSubscribe } from '../internal/getSubscribe.js'
import { createFilter } from './createFilter.js'
import { getLogs } from './getLogs.js'

/**
 * Watches incoming event logs, returning a watcher handle.
 *
 * Register listeners with {@link watch.Watcher.onLogs} /
 * {@link watch.Watcher.onError}, or consume the handle as an async iterable. The
 * underlying source starts lazily once the first listener (or iterator)
 * attaches, and is torn down via {@link watch.Watcher.off}.
 *
 * Uses a WebSocket / IPC subscription (`eth_subscribe` over `logs`) when the
 * Client's transport supports it. Otherwise it installs an event filter and
 * polls `eth_getFilterChanges`, falling back to `eth_getLogs` across the block
 * delta when the provider does not support filters. Pass `poll` to force one
 * mode or the other.
 *
 * @example
 * ```ts
 * import * as AbiEvent from 'ox/AbiEvent'
 * import { Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const watch = Actions.event.watch(client, {
 *   event: AbiEvent.from(
 *     'event Transfer(address indexed from, address indexed to, uint256 value)',
 *   ),
 * })
 * watch.onLogs((logs) => console.log(logs))
 * // later: watch.off()
 * ```
 *
 * @example
 * ```ts
 * // Async iteration (latest-only state stream).
 * for await (const { logs } of watch) console.log(logs)
 * ```
 */
export function watch<
  const abiEvent extends
    | AbiEvent.AbiEvent
    | readonly AbiEvent.AbiEvent[]
    | undefined = undefined,
  strict extends boolean | undefined = undefined,
  fromBlock extends Block.Number | undefined = undefined,
>(
  client: Client.Client,
  options: watch.Options<abiEvent, strict, fromBlock> = {},
): watch.Watcher<abiEvent, strict> {
  const {
    address,
    args,
    batch = true,
    event,
    events: events_,
    fromBlock,
    strict = false,
    pollingInterval = client.pollingInterval,
  } = options as watch.Options

  const events = events_ ?? (event ? [event] : undefined)

  const subscribe = getSubscribe(client.transport)
  const enablePolling =
    options.poll ?? (typeof fromBlock === 'bigint' ? true : !subscribe)

  const logsListeners = new Set<watch.OnLogsFn>()
  const errorListeners = new Set<watch.OnErrorFn>()
  const iteratorEnds = new Set<() => void>()

  let unwatch: (() => void) | undefined
  let closed = false

  const emitLogs: watch.OnLogsFn = (logs) => {
    for (const listener of logsListeners) listener(logs)
  }
  const emitError: watch.OnErrorFn = (error) => {
    for (const listener of errorListeners) listener(error)
  }

  function start() {
    if (closed || unwatch) return

    if (enablePolling) {
      const observerId = stringify([
        'event.watch',
        client.uid,
        address,
        args,
        batch,
        event,
        events_,
        fromBlock,
        pollingInterval,
        strict,
      ])
      unwatch = observe(
        observerId,
        { onLogs: emitLogs, onError: emitError },
        (emit) => {
          let prevBlockNumber =
            typeof fromBlock === 'bigint' ? fromBlock - 1n : undefined
          let filter: Filter<'event'> | undefined
          let initialized = false

          const unpoll = poll(
            async () => {
              if (!initialized) {
                try {
                  filter = (await createFilter(client, {
                    address,
                    args,
                    event,
                    events: events_,
                    fromBlock,
                    strict,
                  } as createFilter.Options)) as Filter<'event'>
                } catch {}
                initialized = true
                return
              }

              try {
                let logs: readonly unknown[]
                if (filter) {
                  logs = await getChanges(client, { filter })
                } else {
                  const blockNumber = await getNumber(client, { cacheTime: 0 })
                  if (
                    prevBlockNumber !== undefined &&
                    prevBlockNumber !== blockNumber
                  )
                    logs = await getLogs(client, {
                      address,
                      args,
                      event,
                      events: events_,
                      fromBlock: prevBlockNumber + 1n,
                      toBlock: blockNumber,
                    } as getLogs.Options)
                  else logs = []
                  prevBlockNumber = blockNumber
                }

                if (logs.length === 0) return
                if (batch) emit.onLogs(logs as never)
                else for (const log of logs) emit.onLogs([log] as never)
              } catch (err) {
                // Providers throw "invalid input" when a filter is uninstalled;
                // reinitialize it on the next tick.
                if (filter && isFilterExpired(err)) initialized = false
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

    const topics = (() => {
      if (!events) return undefined
      if (event)
        return AbiEvent.encode(
          event,
          ...((args !== undefined ? [args] : []) as []),
        ).topics
      return [events.map((event) => AbiEvent.encode(event).topics[0])]
    })() as readonly Hex.Hex[] | undefined

    const observerId = stringify([
      'event.watch',
      client.uid,
      address,
      args,
      event,
      events_,
      strict,
    ])
    unwatch = observe(
      observerId,
      { onLogs: emitLogs, onError: emitError },
      (emit) => {
        let active = true
        let unsubscribe = () => {
          active = false
        }
        ;(async () => {
          try {
            const subscription = await subscribe!({
              params: ['logs', { address, topics }],
            })
            subscription.onData((data) => {
              if (!active) return
              const log = Log.fromRpc(data.result as never)
              const logs = events
                ? AbiEvent.extractLogs(events, [log], { args, strict })
                : [log]
              if (logs.length === 0) return
              emit.onLogs(logs as never)
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

  function createIterator(): AsyncIterableIterator<watch.Emitted<abiEvent, strict>> {
    type Item = watch.Emitted<abiEvent, strict>
    let latest: Item | undefined
    let error: Error | undefined
    let pending:
      | {
          resolve: (result: IteratorResult<Item>) => void
          reject: (error: Error) => void
        }
      | undefined
    let done = false

    const offLogs = watcher.onLogs((logs) => {
      const value = { logs } as Item
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
      offLogs()
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
          withResolvers<IteratorResult<Item>>()
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

  const watcher: watch.Watcher<abiEvent, strict> = {
    onLogs(fn) {
      if (closed) return () => {}
      logsListeners.add(fn as watch.OnLogsFn)
      start()
      return () => {
        logsListeners.delete(fn as watch.OnLogsFn)
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
      logsListeners.clear()
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

export declare namespace watch {
  type OnLogsParameter<
    abiEvent extends
      | AbiEvent.AbiEvent
      | readonly AbiEvent.AbiEvent[]
      | undefined = undefined,
    strict extends boolean | undefined = undefined,
  > = getLogs.ReturnType<abiEvent, strict>

  type OnLogsFn<
    abiEvent extends
      | AbiEvent.AbiEvent
      | readonly AbiEvent.AbiEvent[]
      | undefined = undefined,
    strict extends boolean | undefined = undefined,
  > = (logs: OnLogsParameter<abiEvent, strict>) => void

  type OnErrorFn = (error: Error) => void

  type Emitted<
    abiEvent extends
      | AbiEvent.AbiEvent
      | readonly AbiEvent.AbiEvent[]
      | undefined = undefined,
    strict extends boolean | undefined = undefined,
  > = {
    /** The incoming event logs. */
    logs: OnLogsParameter<abiEvent, strict>
  }

  type Options<
    abiEvent extends
      | AbiEvent.AbiEvent
      | readonly AbiEvent.AbiEvent[]
      | undefined = undefined,
    strict extends boolean | undefined = undefined,
    fromBlock extends Block.Number | undefined = undefined,
  > = {
    /** Address or list of addresses from which logs originated. */
    address?: Address.Address | readonly Address.Address[] | undefined
    /**
     * Whether to batch the logs found within a poll interval into a single
     * emission. When `false`, each log is emitted on its own.
     *
     * @default true
     */
    batch?: boolean | undefined
    /** Block number from which to start watching for logs. */
    fromBlock?: fromBlock | Block.Number | undefined
    /**
     * Whether to poll for new logs instead of using a subscription. Defaults to
     * `true` when the transport cannot subscribe or `fromBlock` is provided.
     */
    poll?: boolean | undefined
    /** Polling frequency (in ms). @default client.pollingInterval */
    pollingInterval?: number | undefined
  } & OneOf<
    | {
        /** Event to filter and decode logs by. */
        event: abiEvent extends readonly AbiEvent.AbiEvent[] ? never : abiEvent
        /** Indexed argument values to filter logs by. */
        args?:
          | getLogs.EventArgs<
              abiEvent extends AbiEvent.AbiEvent ? abiEvent : undefined
            >
          | undefined
        /**
         * Whether the logs must match the indexed/non-indexed arguments on
         * `event`.
         *
         * @default false
         */
        strict?: strict | boolean | undefined
      }
    | {
        /** Events to filter and decode logs by. */
        events: abiEvent extends AbiEvent.AbiEvent ? never : abiEvent
        /**
         * Whether the logs must match the indexed/non-indexed arguments on
         * `events`.
         *
         * @default false
         */
        strict?: strict | boolean | undefined
      }
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    | {}
  >

  type Watcher<
    abiEvent extends
      | AbiEvent.AbiEvent
      | readonly AbiEvent.AbiEvent[]
      | undefined = undefined,
    strict extends boolean | undefined = undefined,
  > = {
    /**
     * Registers a listener invoked with each batch of new event logs. Starts the
     * watcher on first registration. Returns a function that unregisters this
     * listener.
     */
    onLogs: (fn: OnLogsFn<abiEvent, strict>) => () => void
    /**
     * Registers a listener invoked when polling for logs fails. Returns a
     * function that unregisters this listener.
     */
    onError: (fn: OnErrorFn) => () => void
    /**
     * Tears down the watcher: removes all listeners, ends all iterators, stops
     * the underlying poll / subscription, and uninstalls the filter. Idempotent
     * and terminal.
     */
    off: () => void
    /**
     * Async-iterates emitted event logs. The iterator is a latest-only state
     * stream (it may skip intermediate values under slow consumption) and throws
     * if the source errors.
     */
    [Symbol.asyncIterator]: () => AsyncIterableIterator<Emitted<abiEvent, strict>>
  }

  type ReturnType<
    abiEvent extends
      | AbiEvent.AbiEvent
      | readonly AbiEvent.AbiEvent[]
      | undefined = undefined,
    strict extends boolean | undefined = undefined,
  > = Watcher<abiEvent, strict>

  type ErrorType =
    | createFilter.ErrorType
    | getChanges.ErrorType
    | getLogs.ErrorType
    | getNumber.ErrorType
    | uninstall.ErrorType
    | Errors.GlobalErrorType
}

/** Whether an error indicates the server-side filter no longer exists. */
function isFilterExpired(error: unknown): boolean {
  let current: unknown = error
  while (current && typeof current === 'object') {
    const value = current as { code?: unknown; cause?: unknown }
    // -32000: "invalid input" / "filter not found" (filter expired).
    if (value.code === -32000) return true
    current = value.cause
  }
  return false
}
