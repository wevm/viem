import type { Abi } from 'abitype'

import type { BlockNumber, BlockTag } from './block.js'
import type { MaybeExtractEventArgsFromAbi } from './contract.js'
import type { EIP1193RequestFn, PublicRpcSchema } from './eip1193.js'
import type { Hex } from './misc.js'
import type { Filter as Filter_ } from './utils.js'

export type FilterType = 'transaction' | 'block' | 'event'

type FilterRpcSchema = Filter_<
  PublicRpcSchema,
  {
    Method: 'eth_getFilterLogs' | 'eth_getFilterChanges' | 'eth_uninstallFilter'
  }
>

export type Filter<
  filterType extends FilterType = 'event',
  abi extends Abi | readonly unknown[] | undefined = undefined,
  eventName extends string | undefined = undefined,
  args extends
    | MaybeExtractEventArgsFromAbi<abi, eventName>
    | undefined = MaybeExtractEventArgsFromAbi<abi, eventName>,
  strict extends boolean | undefined = undefined,
  fromBlock extends BlockNumber | BlockTag | undefined = undefined,
  toBlock extends BlockNumber | BlockTag | undefined = undefined,
> = {
  id: Hex
  request: EIP1193RequestFn<FilterRpcSchema>
  type: filterType
} & (filterType extends 'event'
  ? {
      fromBlock?: fromBlock | undefined
      toBlock?: toBlock | undefined
    } & (abi extends Abi
      ? undefined extends eventName
        ? {
            abi: abi
            args?: undefined
            eventName?: undefined
            strict: strict
          }
        : args extends MaybeExtractEventArgsFromAbi<abi, eventName>
          ? {
              abi: abi
              args: args
              eventName: eventName
              strict: strict
            }
          : {
              abi: abi
              args?: undefined
              eventName: eventName
              strict: strict
            }
      : {
          abi?: undefined
          args?: undefined
          eventName?: undefined
          strict?: undefined
        })
  : {})
