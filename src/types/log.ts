import type { Abi, AbiEvent, Address, ExtractAbiEventNames } from 'abitype'
import type { GetEventArgs } from './contract.js'
import type { Hash, Hex } from './misc.js'

type DecodedAbiEvent<
  TAbiEvent extends AbiEvent | undefined = undefined,
  TAbi extends Abi | readonly unknown[] = [TAbiEvent],
  TEventName extends string | undefined = TAbiEvent extends AbiEvent
    ? TAbiEvent['name']
    : undefined,
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
      }
    : {
        args: GetEventArgs<
          TAbi,
          string,
          { EnableUnion: false; IndexedOnly: false; Required: true }
        >
        /** The event name decoded from `topics`. */
        eventName: ExtractAbiEventNames<TAbi>
      }
  : {}

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
  /** List of order-dependent topics */
  topics: [Hex, ...Hex[]] | []
  /** `true` if this filter has been destroyed and is invalid */
  removed: boolean
} & DecodedAbiEvent<TAbiEvent, TAbi, TEventName>
