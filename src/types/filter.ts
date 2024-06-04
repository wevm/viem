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
  TFilterType extends FilterType = 'event',
  TAbi extends Abi | readonly unknown[] | undefined = undefined,
  TEventName extends string | undefined = undefined,
  TArgs extends
    | MaybeExtractEventArgsFromAbi<TAbi, TEventName>
    | undefined = MaybeExtractEventArgsFromAbi<TAbi, TEventName>,
  TStrict extends boolean | undefined = undefined,
  TFromBlock extends BlockNumber | BlockTag | undefined = undefined,
  TToBlock extends BlockNumber | BlockTag | undefined = undefined,
> = {
  id: Hex
  request: EIP1193RequestFn<FilterRpcSchema>
  type: TFilterType
} & (TFilterType extends 'event'
  ? {
      fromBlock?: TFromBlock | undefined
      toBlock?: TToBlock | undefined
    } & (TAbi extends Abi
      ? undefined extends TEventName
        ? {
            abi: TAbi
            args?: undefined
            eventName?: undefined
            strict: TStrict
          }
        : TArgs extends MaybeExtractEventArgsFromAbi<TAbi, TEventName>
          ? {
              abi: TAbi
              args: TArgs
              eventName: TEventName
              strict: TStrict
            }
          : {
              abi: TAbi
              args?: undefined
              eventName: TEventName
              strict: TStrict
            }
      : {
          abi?: undefined
          args?: undefined
          eventName?: undefined
          strict?: undefined
        })
  : {})
