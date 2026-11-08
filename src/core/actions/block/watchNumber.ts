import { Hex } from 'ox'
import type { Errors } from 'ox'

import type * as Client from '../../Client.js'
import { createAsyncIterator } from '../../internal/asyncIterator.js'
import { observe } from '../../internal/observe.js'
import { poll } from '../../internal/poll.js'
import { stringify } from '../../internal/stringify.js'
import { getSubscribe } from '../internal/getSubscribe.js'
import { getNumber } from './getNumber.js'

/**
 * Watches incoming block numbers, returning a watcher handle.
 *
 * Register listeners with {@link watchNumber.Watcher.onBlockNumber} /
 * {@link watchNumber.Watcher.onError}, or consume the handle as an async
 * iterable. The underlying source starts lazily once the first block listener
 * (or iterator) attaches, and is torn down via {@link watchNumber.Watcher.off}.
 *
 * Uses a WebSocket / IPC subscription (`eth_subscribe` over `newHeads`) when the
 * Client's transport supports it, otherwise polls `eth_blockNumber` on an
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
 * const watch = Actions.block.watchNumber(client)
 * watch.onBlockNumber((blockNumber) => console.log(blockNumber))
 * // later: watch.off()
 * ```
 *
 * @example
 * ```ts
 * // Async iteration (latest-only state stream).
 * for await (const { blockNumber } of watch) console.log(blockNumber)
 * ```
 */
export function watchNumber(
  client: Client.Client,
  options: watchNumber.Options = {},
): watchNumber.Watcher {
  const { emitOnBegin = false, pollingInterval = client.pollingInterval } =
    options

  // Polling less than twice per block skips blocks, so emit the missed ones
  // unless told otherwise.
  const blockTime = client.chain?.blockTime
  const emitMissed =
    options.emitMissed ??
    (blockTime !== undefined && pollingInterval > blockTime / 2)

  const subscribe = getSubscribe(client.transport)
  const enablePolling = options.poll ?? !subscribe

  const blockNumberListeners = new Set<watchNumber.OnBlockNumberFn>()
  const errorListeners = new Set<watchNumber.OnErrorFn>()
  const iteratorEnds = new Set<() => void>()

  let unwatch: (() => void) | undefined
  let closed = false

  // Fans an emission out to this handle's own listeners.
  const emitBlockNumber: watchNumber.OnBlockNumberFn = (
    blockNumber,
    prevBlockNumber,
  ) => {
    for (const listener of blockNumberListeners)
      listener(blockNumber, prevBlockNumber)
  }
  const emitError: watchNumber.OnErrorFn = (error) => {
    for (const listener of errorListeners) listener(error)
  }

  // Starts the shared source lazily on the first block consumer. Multiple
  // handles with the same `observerId` share a single poller/subscription.
  function start() {
    if (closed || unwatch) return

    let prevBlockNumber: bigint | undefined

    if (enablePolling) {
      const observerId = stringify([
        'watchNumber',
        client.uid,
        emitMissed,
        emitOnBegin,
        pollingInterval,
      ])
      unwatch = observe(
        observerId,
        { onBlockNumber: emitBlockNumber, onError: emitError },
        (emit) =>
          poll(
            async () => {
              try {
                const blockNumber = await getNumber(client, { cacheTime: 0 })

                if (prevBlockNumber !== undefined) {
                  // Skip if the block number has not advanced.
                  if (blockNumber === prevBlockNumber) return

                  // Backfill the blocks missed between polls when requested.
                  if (blockNumber - prevBlockNumber > 1n && emitMissed)
                    for (let i = prevBlockNumber + 1n; i < blockNumber; i++) {
                      emit.onBlockNumber(i, prevBlockNumber)
                      prevBlockNumber = i
                    }
                }

                if (
                  prevBlockNumber === undefined ||
                  blockNumber > prevBlockNumber
                ) {
                  emit.onBlockNumber(blockNumber, prevBlockNumber)
                  prevBlockNumber = blockNumber
                }
              } catch (err) {
                emit.onError?.(err as Error)
              }
            },
            { emitOnBegin, interval: pollingInterval },
          ),
      )
      return
    }

    const observerId = stringify(['watchNumber', client.uid])
    unwatch = observe(
      observerId,
      { onBlockNumber: emitBlockNumber, onError: emitError },
      (emit) => {
        let active = true
        let unsubscribe = () => {
          active = false
        }
        ;(async () => {
          try {
            const subscription = await subscribe!({ params: ['newHeads'] })
            subscription.onData((data) => {
              if (!active) return
              const header = data.result as { number?: Hex.Hex | undefined }
              if (!header?.number) return
              const blockNumber = Hex.toBigInt(header.number)
              emit.onBlockNumber(blockNumber, prevBlockNumber)
              prevBlockNumber = blockNumber
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

  function createIterator(): AsyncIterableIterator<watchNumber.Emitted> {
    return createAsyncIterator<watchNumber.Emitted>((onData, onError, end) => {
      const off = watcher.onBlockNumber((blockNumber, prevBlockNumber) => {
        const value = { blockNumber, prevBlockNumber }
        onData(value)
      })
      const offError = watcher.onError(onError)
      iteratorEnds.add(end)

      return () => {
        off()
        offError()
        iteratorEnds.delete(end)
      }
    })
  }

  const watcher: watchNumber.Watcher = {
    onBlockNumber(fn) {
      if (closed) return () => {}
      blockNumberListeners.add(fn)
      start()
      return () => {
        blockNumberListeners.delete(fn)
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
      blockNumberListeners.clear()
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

export declare namespace watchNumber {
  type OnBlockNumberFn = (
    blockNumber: bigint,
    prevBlockNumber: bigint | undefined,
  ) => void

  type OnErrorFn = (error: Error) => void

  type Emitted = {
    /** The incoming block number. */
    blockNumber: bigint
    /** The previous block number, if any. */
    prevBlockNumber: bigint | undefined
  }

  type Options = {
    /**
     * Whether to emit the missed block numbers between polls. Defaults to
     * `true` when the polling interval is longer than half the chain's block
     * time, otherwise `false`.
     */
    emitMissed?: boolean | undefined
    /** Whether to emit the latest block number when the watcher opens. */
    emitOnBegin?: boolean | undefined
    /**
     * Whether to poll for new block numbers instead of using a subscription.
     * Defaults to `true` when the transport cannot subscribe.
     */
    poll?: boolean | undefined
    /** Polling frequency (in ms). @default client.pollingInterval */
    pollingInterval?: number | undefined
  }

  type Watcher = {
    /**
     * Registers a listener invoked with each new block number. Starts the
     * watcher on first registration. Returns a function that unregisters this
     * listener.
     */
    onBlockNumber: (fn: OnBlockNumberFn) => () => void
    /**
     * Registers a listener invoked when fetching a new block number fails.
     * Returns a function that unregisters this listener.
     */
    onError: (fn: OnErrorFn) => () => void
    /**
     * Tears down the watcher: removes all listeners, ends all iterators, and
     * stops the underlying poll / subscription. Idempotent and terminal.
     */
    off: () => void
    /**
     * Async-iterates emitted block numbers. The iterator is a latest-only state
     * stream (it may skip intermediate values under slow consumption) and
     * throws if the source errors.
     */
    [Symbol.asyncIterator]: () => AsyncIterableIterator<Emitted>
  }

  type ReturnType = Watcher

  type ErrorType = getNumber.ErrorType | Errors.GlobalErrorType
}
