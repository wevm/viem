import { Hex } from 'ox'
import type { Block, Errors } from 'ox'

import type * as Chain from '../../Chain.js'
import type * as Client from '../../Client.js'
import { createAsyncIterator } from '../../internal/asyncIterator.js'
import { observe } from '../../internal/observe.js'
import { poll } from '../../internal/poll.js'
import { stringify } from '../../internal/stringify.js'
import { getSubscribe } from '../internal/getSubscribe.js'
import { get } from './get.js'

/**
 * Watches incoming blocks, returning a watcher handle.
 *
 * Register listeners with {@link watch.Watcher.onBlock} /
 * {@link watch.Watcher.onError}, or consume the handle as an async iterable.
 * The underlying source starts lazily once the first block listener (or
 * iterator) attaches, and is torn down via {@link watch.Watcher.off}.
 *
 * Uses a WebSocket / IPC subscription (`eth_subscribe` over `newHeads`) when the
 * Client's transport supports it, otherwise polls `eth_getBlockByNumber` on an
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
 * const watch = Actions.block.watch(client)
 * watch.onBlock((block) => console.log(block))
 * // later: watch.off()
 * ```
 *
 * @example
 * ```ts
 * // Async iteration (latest-only state stream).
 * for await (const { block } of watch) console.log(block)
 * ```
 */
export function watch<
  chain extends Chain.Chain | undefined,
  includeTransactions extends boolean = false,
  blockTag extends Block.Tag = 'latest',
>(
  client: Client.Client<chain>,
  options: watch.Options<includeTransactions, blockTag> = {},
): watch.Watcher<chain, includeTransactions, blockTag> {
  type Value = get.ReturnType<chain, includeTransactions, blockTag>

  const {
    blockTag = client.blockTag ?? 'latest',
    emitOnBegin = false,
    includeTransactions = false as includeTransactions,
    pollingInterval = client.pollingInterval,
  } = options

  // Polling less than twice per block skips blocks, so emit the missed ones
  // unless told otherwise. `safe` and `finalized` can move by thousands of
  // blocks at once (such as on Arbitrum) at any polling interval, so they
  // emit missed blocks only when asked.
  const blockTime = client.chain?.blockTime
  const emitMissed =
    options.emitMissed ??
    ((blockTag === 'latest' || blockTag === 'pending') &&
      blockTime !== undefined &&
      pollingInterval > blockTime / 2)
  // The default catches up at most 100 blocks, so a long gap, such as a
  // device waking from sleep, skips to the latest block.
  const maxMissed =
    options.emitMissed === undefined ? 100 : Number.POSITIVE_INFINITY

  const subscribe = getSubscribe(client.transport)
  const enablePolling = options.poll ?? !subscribe

  const blockListeners = new Set<
    watch.OnBlockFn<chain, includeTransactions, blockTag>
  >()
  const errorListeners = new Set<watch.OnErrorFn>()
  const iteratorEnds = new Set<() => void>()

  let unwatch: (() => void) | undefined
  let closed = false

  const emitBlock: watch.OnBlockFn<chain, includeTransactions, blockTag> = (
    block,
    prevBlock,
  ) => {
    for (const listener of blockListeners) listener(block, prevBlock)
  }
  const emitError: watch.OnErrorFn = (error) => {
    for (const listener of errorListeners) listener(error)
  }

  function start() {
    if (closed || unwatch) return

    let prevBlock: Value | undefined

    if (enablePolling) {
      const observerId = stringify([
        'block.watch',
        client.uid,
        blockTag,
        emitMissed,
        emitOnBegin,
        includeTransactions,
        maxMissed,
        pollingInterval,
      ])
      unwatch = observe(
        observerId,
        { onBlock: emitBlock, onError: emitError },
        (emit) =>
          poll(
            async () => {
              try {
                const block = (await get(client, {
                  blockTag,
                  includeTransactions,
                })) as Value & { number: bigint | null }

                if (block.number !== null && prevBlock?.number != null) {
                  // Skip if the block number has not advanced.
                  if (block.number === prevBlock.number) return

                  // Backfill the blocks missed between polls when requested.
                  // Fetch them in parallel batches so catching up takes a few
                  // round trips rather than one per block.
                  const missed = Number(block.number - prevBlock.number) - 1
                  if (emitMissed && missed > 0 && missed <= maxMissed) {
                    const batchSize = 10
                    const start = prevBlock.number + 1n
                    for (let i = 0; i < missed; i += batchSize) {
                      const blocks = (await Promise.all(
                        Array.from(
                          { length: Math.min(batchSize, missed - i) },
                          (_, j) =>
                            get(client, {
                              blockNumber: start + BigInt(i + j),
                              includeTransactions,
                            }),
                        ),
                      )) as Value[]
                      for (const missedBlock of blocks) {
                        emit.onBlock(missedBlock, prevBlock)
                        prevBlock = missedBlock
                      }
                    }
                  }
                }

                if (
                  prevBlock?.number == null ||
                  (blockTag === 'pending' && block.number == null) ||
                  (block.number !== null && block.number > prevBlock.number)
                ) {
                  emit.onBlock(block, prevBlock)
                  prevBlock = block
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

    const observerId = stringify([
      'block.watch',
      client.uid,
      blockTag,
      emitOnBegin,
      includeTransactions,
    ])
    unwatch = observe(
      observerId,
      { onBlock: emitBlock, onError: emitError },
      (emit) => {
        let active = true
        // Guards against the begin emission racing the first `newHeads`.
        let emitFetched = true
        let unsubscribe = () => {
          active = false
        }
        ;(async () => {
          try {
            if (emitOnBegin)
              get(client, { blockTag, includeTransactions })
                .then((block) => {
                  if (!active || !emitFetched) return
                  emit.onBlock(block as Value, undefined)
                  emitFetched = false
                })
                .catch((error) => emit.onError?.(error as Error))

            const subscription = await subscribe!({ params: ['newHeads'] })
            subscription.onData(async (data) => {
              if (!active) return
              const header = data.result as { number?: Hex.Hex | undefined }
              if (!header?.number) return
              const block = (await get(client, {
                blockNumber: Hex.toBigInt(header.number),
                includeTransactions,
              }).catch(() => undefined)) as Value | undefined
              if (!active || !block) return
              emit.onBlock(block, prevBlock)
              emitFetched = false
              prevBlock = block
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

  function createIterator(): AsyncIterableIterator<
    watch.Emitted<chain, includeTransactions, blockTag>
  > {
    type Item = watch.Emitted<chain, includeTransactions, blockTag>
    return createAsyncIterator<Item>((onData, onError, end) => {
      const off = watcher.onBlock((block, prevBlock) => {
        const value = { block, prevBlock } as Item
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

  const watcher: watch.Watcher<chain, includeTransactions, blockTag> = {
    onBlock(fn) {
      if (closed) return () => {}
      blockListeners.add(fn)
      start()
      return () => {
        blockListeners.delete(fn)
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
      blockListeners.clear()
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
  type OnBlockFn<
    chain extends Chain.Chain | undefined = undefined,
    includeTransactions extends boolean = false,
    blockTag extends Block.Tag = 'latest',
  > = (
    block: get.ReturnType<chain, includeTransactions, blockTag>,
    prevBlock: get.ReturnType<chain, includeTransactions, blockTag> | undefined,
  ) => void

  type OnErrorFn = (error: Error) => void

  type Emitted<
    chain extends Chain.Chain | undefined = undefined,
    includeTransactions extends boolean = false,
    blockTag extends Block.Tag = 'latest',
  > = {
    /** The incoming block. */
    block: get.ReturnType<chain, includeTransactions, blockTag>
    /** The previous block, if any. */
    prevBlock: get.ReturnType<chain, includeTransactions, blockTag> | undefined
  }

  type Options<
    includeTransactions extends boolean = false,
    blockTag extends Block.Tag = 'latest',
  > = {
    /** The block tag. @default 'latest' */
    blockTag?: blockTag | Block.Tag | undefined
    /**
     * Whether to emit the missed blocks between polls. Defaults to `true` when
     * `blockTag` is `latest` or `pending` and the polling interval is longer
     * than half the chain's block time, otherwise `false`. The default skips
     * gaps of more than 100 blocks.
     */
    emitMissed?: boolean | undefined
    /** Whether to emit the latest block when the watcher opens. */
    emitOnBegin?: boolean | undefined
    /** Whether to include transaction data in the response. @default false */
    includeTransactions?: includeTransactions | undefined
    /**
     * Whether to poll for new blocks instead of using a subscription.
     * Defaults to `true` when the transport cannot subscribe.
     */
    poll?: boolean | undefined
    /** Polling frequency (in ms). @default client.pollingInterval */
    pollingInterval?: number | undefined
  }

  type Watcher<
    chain extends Chain.Chain | undefined = undefined,
    includeTransactions extends boolean = false,
    blockTag extends Block.Tag = 'latest',
  > = {
    /**
     * Registers a listener invoked with each new block. Starts the watcher on
     * first registration. Returns a function that unregisters this listener.
     */
    onBlock: (fn: OnBlockFn<chain, includeTransactions, blockTag>) => () => void
    /**
     * Registers a listener invoked when fetching a new block fails. Returns a
     * function that unregisters this listener.
     */
    onError: (fn: OnErrorFn) => () => void
    /**
     * Tears down the watcher: removes all listeners, ends all iterators, and
     * stops the underlying poll / subscription. Idempotent and terminal.
     */
    off: () => void
    /**
     * Async-iterates emitted blocks. The iterator is a latest-only state stream
     * (it may skip intermediate values under slow consumption) and throws if
     * the source errors.
     */
    [Symbol.asyncIterator]: () => AsyncIterableIterator<
      Emitted<chain, includeTransactions, blockTag>
    >
  }

  type ReturnType<
    chain extends Chain.Chain | undefined = undefined,
    includeTransactions extends boolean = false,
    blockTag extends Block.Tag = 'latest',
  > = Watcher<chain, includeTransactions, blockTag>

  type ErrorType = get.ErrorType | Errors.GlobalErrorType
}
