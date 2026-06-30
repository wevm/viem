import type { Abi } from 'abitype'
import * as AbiEvent from 'ox/AbiEvent'
import type * as Address from 'ox/Address'
import type * as Block from 'ox/Block'
import type * as Errors from 'ox/Errors'

import type * as Client from '../../Client.js'
import { watch as watchEvent_ } from '../event/watch.js'
import type { getLogs } from './getLogs.js'

/**
 * Watches incoming contract event logs, returning a watcher handle.
 *
 * Register listeners with {@link watchEvent.Watcher.onLogs} /
 * {@link watchEvent.Watcher.onError}, or consume the handle as an async
 * iterable. The underlying source starts lazily once the first listener (or
 * iterator) attaches, and is torn down via {@link watchEvent.Watcher.off}.
 *
 * Uses a WebSocket / IPC subscription (`eth_subscribe` over `logs`) when the
 * Client's transport supports it. Otherwise it installs an event filter and
 * polls `eth_getFilterChanges`, falling back to `eth_getLogs` across the block
 * delta when the provider does not support filters. Pass `poll` to force one
 * mode or the other.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { Abi } from 'viem/utils'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const watch = Actions.contract.watchEvent(client, {
 *   abi: Abi.from([
 *     'event Transfer(address indexed from, address indexed to, uint256 value)',
 *   ]),
 *   eventName: 'Transfer',
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
export function watchEvent<
  const abi extends Abi | readonly unknown[],
  eventName extends AbiEvent.extractLogs.EventName<abi> | undefined = undefined,
  strict extends boolean | undefined = undefined,
  fromBlock extends Block.Number | undefined = undefined,
>(
  client: Client.Client,
  options: watchEvent.Options<abi, eventName, strict, fromBlock>,
): watchEvent.Watcher<abi, eventName, strict> {
  const {
    abi,
    address,
    args,
    batch,
    eventName,
    fromBlock,
    poll,
    pollingInterval,
    strict,
  } = options as watchEvent.Options

  const event = eventName ? AbiEvent.fromAbi(abi, eventName) : undefined
  const events = event
    ? undefined
    : (abi as Abi).filter((item) => item.type === 'event')

  return watchEvent_(client, {
    address,
    args,
    batch,
    event,
    events,
    fromBlock,
    poll,
    pollingInterval,
    strict,
  } as watchEvent_.Options) as never
}

export declare namespace watchEvent {
  type OnLogsParameter<
    abi extends Abi | readonly unknown[] = Abi,
    eventName extends AbiEvent.extractLogs.EventName<abi> | undefined =
      | AbiEvent.extractLogs.EventName<abi>
      | undefined,
    strict extends boolean | undefined = undefined,
  > = getLogs.ReturnType<abi, eventName, strict>

  type OnLogsFn<
    abi extends Abi | readonly unknown[] = Abi,
    eventName extends AbiEvent.extractLogs.EventName<abi> | undefined =
      | AbiEvent.extractLogs.EventName<abi>
      | undefined,
    strict extends boolean | undefined = undefined,
  > = (logs: OnLogsParameter<abi, eventName, strict>) => void

  type OnErrorFn = (error: Error) => void

  type Emitted<
    abi extends Abi | readonly unknown[] = Abi,
    eventName extends AbiEvent.extractLogs.EventName<abi> | undefined =
      | AbiEvent.extractLogs.EventName<abi>
      | undefined,
    strict extends boolean | undefined = undefined,
  > = {
    /** The incoming contract event logs. */
    logs: OnLogsParameter<abi, eventName, strict>
  }

  type Options<
    abi extends Abi | readonly unknown[] = Abi,
    eventName extends AbiEvent.extractLogs.EventName<abi> | undefined =
      | AbiEvent.extractLogs.EventName<abi>
      | undefined,
    strict extends boolean | undefined = undefined,
    fromBlock extends Block.Number | undefined = undefined,
  > = {
    /** Contract ABI. */
    abi: abi
    /** Address or list of addresses from which logs originated. */
    address?: Address.Address | readonly Address.Address[] | undefined
    /** Indexed argument values to filter logs by. */
    args?:
      | AbiEvent.extractLogs.Args<getLogs.ExtractEvent<abi, eventName>>
      | undefined
    /**
     * Whether to batch the logs found within a poll interval into a single
     * emission. When `false`, each log is emitted on its own.
     *
     * @default true
     */
    batch?: boolean | undefined
    /** Event name to filter and decode logs by. */
    eventName?: eventName | AbiEvent.extractLogs.EventName<abi> | undefined
    /** Block number from which to start watching for logs. */
    fromBlock?: fromBlock | Block.Number | undefined
    /**
     * Whether to poll for new logs instead of using a subscription. Defaults to
     * `true` when the transport cannot subscribe or `fromBlock` is provided.
     */
    poll?: boolean | undefined
    /** Polling frequency (in ms). @default client.pollingInterval */
    pollingInterval?: number | undefined
    /**
     * Whether the logs must match the indexed/non-indexed arguments on the
     * event.
     *
     * @default false
     */
    strict?: strict | boolean | undefined
  }

  type Watcher<
    abi extends Abi | readonly unknown[] = Abi,
    eventName extends AbiEvent.extractLogs.EventName<abi> | undefined =
      | AbiEvent.extractLogs.EventName<abi>
      | undefined,
    strict extends boolean | undefined = undefined,
  > = {
    /**
     * Registers a listener invoked with each batch of new contract event logs.
     * Starts the watcher on first registration. Returns a function that
     * unregisters this listener.
     */
    onLogs: (fn: OnLogsFn<abi, eventName, strict>) => () => void
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
     * Async-iterates emitted contract event logs. The iterator is a latest-only
     * state stream (it may skip intermediate values under slow consumption) and
     * throws if the source errors.
     */
    [Symbol.asyncIterator]: () => AsyncIterableIterator<
      Emitted<abi, eventName, strict>
    >
  }

  type ReturnType<
    abi extends Abi | readonly unknown[] = Abi,
    eventName extends AbiEvent.extractLogs.EventName<abi> | undefined =
      | AbiEvent.extractLogs.EventName<abi>
      | undefined,
    strict extends boolean | undefined = undefined,
  > = Watcher<abi, eventName, strict>

  type ErrorType =
    | AbiEvent.fromAbi.ErrorType
    | watchEvent_.ErrorType
    | Errors.GlobalErrorType
}
