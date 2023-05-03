import type {
  Abi,
  AbiEvent,
  Address,
  ExtractAbiEvent,
  ExtractAbiEventNames,
} from 'abitype'

import type {
  AbiEventParametersToPrimitiveTypes,
  GetEventArgs,
} from './contract.js'
import type { Hash, Hex } from './misc.js'

export type Log<
  TQuantity = bigint,
  TIndex = number,
  TAbiEvent extends AbiEvent | undefined = undefined,
  TAbi extends Abi | readonly unknown[] = [TAbiEvent],
  TEventName extends string | undefined = TAbiEvent extends AbiEvent
    ? TAbiEvent['name']
    : undefined,
> = {
  /** The address from which this log originated */
  address: Address
  /** Hash of block containing this log or `null` if pending */
  blockHash: Hash | null
  /** Number of block containing this log or `null` if pending */
  blockNumber: TQuantity | null
  /** Contains the non-indexed arguments of the log */
  data: Hex
  /** Index of this log within its block or `null` if pending */
  logIndex: TIndex | null
  /** Hash of the transaction that created this log or `null` if pending */
  transactionHash: Hash | null
  /** Index of the transaction that created this log or `null` if pending */
  transactionIndex: TIndex | null
  /** `true` if this filter has been destroyed and is invalid */
  removed: boolean
} & GetInferredLogValues<TAbiEvent, TAbi, TEventName>

type Topics<
  THead extends AbiEvent['inputs'],
  TBase = [Hex],
> = THead extends readonly [
  infer _Head,
  ...infer Tail extends AbiEvent['inputs'],
]
  ? _Head extends { indexed: true }
    ? [Hex, ...Topics<Tail>]
    : Topics<Tail>
  : TBase

type GetTopics<
  TAbiEvent extends AbiEvent | undefined = undefined,
  TAbi extends Abi | readonly unknown[] = [TAbiEvent],
  TEventName extends string | undefined = TAbiEvent extends AbiEvent
    ? TAbiEvent['name']
    : undefined,
  _AbiEvent extends AbiEvent | undefined = TAbi extends Abi
    ? TEventName extends string
      ? ExtractAbiEvent<TAbi, TEventName>
      : undefined
    : undefined,
  _Args = _AbiEvent extends AbiEvent
    ? AbiEventParametersToPrimitiveTypes<_AbiEvent['inputs']>
    : never,
  _FailedToParseArgs =
    | ([_Args] extends [never] ? true : false)
    | (readonly unknown[] extends _Args ? true : false),
> = true extends _FailedToParseArgs
  ? [Hex, ...Hex[]] | []
  : TAbiEvent extends AbiEvent
  ? Topics<TAbiEvent['inputs']>
  : _AbiEvent extends AbiEvent
  ? Topics<_AbiEvent['inputs']>
  : [Hex, ...Hex[]] | []

type GetInferredLogValues<
  TAbiEvent extends AbiEvent | undefined = undefined,
  TAbi extends Abi | readonly unknown[] = [TAbiEvent],
  TEventName extends string | undefined = TAbiEvent extends AbiEvent
    ? TAbiEvent['name']
    : undefined,
  _EventNames extends string = TAbi extends Abi
    ? Abi extends TAbi
      ? string
      : ExtractAbiEventNames<TAbi>
    : string,
> = TAbi extends Abi
  ? TEventName extends string
    ? {
        args: GetEventArgs<
          TAbi,
          TEventName,
          { EnableUnion: false; IndexedOnly: false; Required: true }
        >
        /** The event name decoded from `topics`. */
        eventName: TEventName
        /** List of order-dependent topics */
        topics: GetTopics<TAbiEvent, TAbi, TEventName>
      }
    : {
        [TName in _EventNames]: {
          args: GetEventArgs<
            TAbi,
            string,
            { EnableUnion: false; IndexedOnly: false; Required: true }
          >
          /** The event name decoded from `topics`. */
          eventName: TName
          /** List of order-dependent topics */
          topics: GetTopics<TAbiEvent, TAbi, TName>
        }
      }[_EventNames]
  : {
      topics: [Hex, ...Hex[]] | []
    }
