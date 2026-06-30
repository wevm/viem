import type * as AbiEvent from 'ox/AbiEvent'
import type * as Block from 'ox/Block'
import type * as Hex from 'ox/Hex'

import type * as Transport from '../../Transport.js'

/**
 * A filter created by an `eth_new*Filter` request, consumed by
 * {@link getChanges}, {@link getLogs}, and {@link uninstall}.
 *
 * The `request` function is scoped to the specific transport that created the
 * filter, so subsequent calls reach the node that owns the filter id (this
 * matters for `fallback` / `loadBalance` transports).
 */
export type Filter<
  type extends Type = Type,
  abiEvent extends
    | AbiEvent.AbiEvent
    | readonly AbiEvent.AbiEvent[]
    | undefined = undefined,
  strict extends boolean | undefined = undefined,
  fromBlock extends Block.Number | Block.Tag | undefined = undefined,
  toBlock extends Block.Number | Block.Tag | undefined = undefined,
> = {
  /** Filter identifier returned by the originating `eth_new*Filter` call. */
  id: Hex.Hex
  /** Request function scoped to the transport that created the filter. */
  request: Transport.RequestFn
  /** Discriminant: which `eth_new*Filter` produced the filter. */
  type: type
} & (type extends 'event'
  ? {
      /** Event(s) matched logs are decoded by. */
      abiEvent?: abiEvent | undefined
      /** Indexed argument values matched logs were filtered by. */
      args?: unknown | undefined
      /**
       * Whether matched logs must conform to the indexed/non-indexed arguments
       * on `abiEvent`.
       */
      strict?: strict | boolean | undefined
      /** Block number or tag the filter includes logs from. */
      fromBlock?: fromBlock | undefined
      /** Block number or tag the filter includes logs to. */
      toBlock?: toBlock | undefined
    }
  : {})

/** The kind of filter, by the `eth_new*Filter` method that produced it. */
export type Type = 'block' | 'transaction' | 'event'
