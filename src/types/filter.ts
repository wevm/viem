import type { Abi } from 'abitype'

import type { MaybeExtractEventArgsFromAbi } from './contract.js'
import type { Requests } from './eip1193.js'
import type { Hex } from './misc.js'

export type FilterType = 'transaction' | 'block' | 'event'

export type Filter<
  TFilterType extends FilterType = 'event',
  TAbi extends Abi | readonly unknown[] = Abi,
  TEventName extends string | undefined = undefined,
  TArgs extends
    | MaybeExtractEventArgsFromAbi<TAbi, TEventName>
    | undefined = MaybeExtractEventArgsFromAbi<TAbi, TEventName>,
> = {
  id: Hex
  // TODO: Narrow `request` to filter-based methods (ie. `eth_getFilterLogs`, etc).
  request: Requests['request']
  type: TFilterType
} & (TFilterType extends 'event'
  ? TAbi extends Abi
    ? undefined extends TEventName
      ? {
          abi: TAbi
          args?: never
          eventName?: never
        }
      : TArgs extends MaybeExtractEventArgsFromAbi<TAbi, TEventName>
      ? {
          abi: TAbi
          args: TArgs
          eventName: TEventName
        }
      : {
          abi: TAbi
          args?: never
          eventName: TEventName
        }
    : {
        abi?: never
        args?: never
        eventName?: never
      }
  : {})
