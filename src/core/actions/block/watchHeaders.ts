import { Block } from 'ox'
import type { Errors } from 'ox'

import type * as Chain from '../../Chain.js'
import type * as Client from '../../Client.js'
import { createAsyncIterator } from '../../internal/asyncIterator.js'
import { observe } from '../../internal/observe.js'
import { stringify } from '../../internal/stringify.js'
import { getSubscribe } from '../internal/getSubscribe.js'

const fullBlockFields = [
  'size',
  'totalDifficulty',
  'transactions',
  'uncles',
  'withdrawals',
] as const

/**
 * Watches incoming block headers without fetching full blocks.
 *
 * Register listeners with {@link watchHeaders.Watcher.onBlockHeader} /
 * {@link watchHeaders.Watcher.onError}, or consume the handle as an async
 * iterable. The underlying subscription starts lazily once the first block
 * header listener (or iterator) attaches and is torn down via
 * {@link watchHeaders.Watcher.off}.
 *
 * Requires a WebSocket or IPC transport that supports `eth_subscribe`.
 *
 * @example
 * ```ts
 * import { Actions, Client, webSocket } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: webSocket(),
 * })
 *
 * const watch = Actions.block.watchHeaders(client)
 * watch.onBlockHeader((header) => console.log(header.number))
 * // later: watch.off()
 * ```
 */
export function watchHeaders<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
): watchHeaders.Watcher<chain> {
  type Header = watchHeaders.BlockHeader<chain>

  const blockHeaderListeners = new Set<watchHeaders.OnBlockHeaderFn<chain>>()
  const errorListeners = new Set<watchHeaders.OnErrorFn>()
  const iteratorEnds = new Set<() => void>()

  let unwatch: (() => void) | undefined
  let closed = false

  const emitBlockHeader: watchHeaders.OnBlockHeaderFn<chain> = (
    blockHeader,
    prevBlockHeader,
  ) => {
    for (const listener of blockHeaderListeners)
      listener(blockHeader, prevBlockHeader)
  }
  const emitError: watchHeaders.OnErrorFn = (error) => {
    for (const listener of errorListeners) listener(error)
  }

  function start() {
    if (closed || unwatch) return

    let prevBlockHeader: Header | undefined
    const observerId = stringify(['block.watchHeaders', client.uid])
    unwatch = observe(
      observerId,
      { onBlockHeader: emitBlockHeader, onError: emitError },
      (emit) => {
        let active = true
        let unsubscribe = () => {
          active = false
        }
        ;(async () => {
          try {
            const subscribe = getSubscribe(client.transport)
            if (!subscribe)
              throw new Error(
                '`block.watchHeaders` requires a subscription transport.',
              )
            const subscription = await subscribe({ params: ['newHeads'] })
            subscription.onData((data) => {
              if (!active) return
              const result = data.result as Block.Rpc
              const rpc = {
                ...result,
                size: result.size ?? '0x0',
                transactions: result.transactions ?? [],
                uncles: result.uncles ?? [],
              } as Block.Rpc
              const fromRpc = client.chain?.codecs?.block?.fromRpc
              const blockHeader = (
                fromRpc ? fromRpc(rpc) : Block.fromRpc(rpc)
              ) as Header & Record<string, unknown>
              for (const field of fullBlockFields) delete blockHeader[field]
              emit.onBlockHeader(blockHeader, prevBlockHeader)
              prevBlockHeader = blockHeader
            })
            subscription.onError((error) => emit.onError?.(error as Error))
            unsubscribe = () => {
              active = false
              void subscription.unsubscribe()
            }
            if (!active) unsubscribe()
          } catch (error) {
            emit.onError?.(error as Error)
          }
        })()
        return () => unsubscribe()
      },
    )
  }

  function createIterator(): AsyncIterableIterator<
    watchHeaders.Emitted<chain>
  > {
    type Item = watchHeaders.Emitted<chain>
    return createAsyncIterator<Item>((onData, onError, end) => {
      const off = watcher.onBlockHeader((blockHeader, prevBlockHeader) => {
        const value = { blockHeader, prevBlockHeader } as Item
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

  const watcher: watchHeaders.Watcher<chain> = {
    onBlockHeader(fn) {
      if (closed) return () => {}
      blockHeaderListeners.add(fn)
      start()
      return () => blockHeaderListeners.delete(fn)
    },
    onError(fn) {
      if (closed) return () => {}
      errorListeners.add(fn)
      return () => errorListeners.delete(fn)
    },
    off() {
      if (closed) return
      closed = true
      const ends = Array.from(iteratorEnds)
      iteratorEnds.clear()
      for (const end of ends) end()
      blockHeaderListeners.clear()
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

export declare namespace watchHeaders {
  type BlockHeader<chain extends Chain.Chain | undefined = undefined> = Omit<
    Chain.ExtractBlock<chain, false, 'latest'>,
    (typeof fullBlockFields)[number]
  >

  type OnBlockHeaderFn<chain extends Chain.Chain | undefined = undefined> = (
    blockHeader: BlockHeader<chain>,
    prevBlockHeader: BlockHeader<chain> | undefined,
  ) => void

  type OnErrorFn = (error: Error) => void

  type Emitted<chain extends Chain.Chain | undefined = undefined> = {
    /** The incoming block header. */
    blockHeader: BlockHeader<chain>
    /** The previous block header, if any. */
    prevBlockHeader: BlockHeader<chain> | undefined
  }

  type Watcher<chain extends Chain.Chain | undefined = undefined> = {
    /** Registers a block header listener and starts the subscription. */
    onBlockHeader: (fn: OnBlockHeaderFn<chain>) => () => void
    /** Registers a listener invoked when the subscription fails. */
    onError: (fn: OnErrorFn) => () => void
    /** Tears down the watcher. Idempotent and terminal. */
    off: () => void
    /** Async-iterates incoming block headers as a latest-only state stream. */
    [Symbol.asyncIterator]: () => AsyncIterableIterator<Emitted<chain>>
  }

  type ReturnType<chain extends Chain.Chain | undefined = undefined> =
    Watcher<chain>

  type ErrorType = Errors.GlobalErrorType
}
