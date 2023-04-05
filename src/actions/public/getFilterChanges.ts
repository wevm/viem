import type { Abi, AbiEvent } from 'abitype'
import type { PublicClient, Transport } from '../../clients/index.js'
import type {
  Chain,
  Filter,
  FilterType,
  Hash,
  Log,
  MaybeAbiEventName,
} from '../../types/index.js'
import { decodeEventLog } from '../../utils/index.js'

import { formatLog } from '../../utils/formatters/log.js'

export type GetFilterChangesParameters<
  TFilterType extends FilterType = FilterType,
  TAbiEvent extends AbiEvent | undefined = undefined,
  TAbi extends Abi | readonly unknown[] = [TAbiEvent],
  TEventName extends string | undefined = MaybeAbiEventName<TAbiEvent>,
> = {
  filter: Filter<TFilterType, TAbi, TEventName, any>
}

export type GetFilterChangesReturnType<
  TFilterType extends FilterType = FilterType,
  TAbiEvent extends AbiEvent | undefined = undefined,
  TAbi extends Abi | readonly unknown[] = [TAbiEvent],
  TEventName extends string | undefined = MaybeAbiEventName<TAbiEvent>,
> = TFilterType extends 'event'
  ? Log<bigint, number, TAbiEvent, TAbi, TEventName>[]
  : Hash[]

export async function getFilterChanges<
  TTransport extends Transport,
  TChain extends Chain | undefined,
  TFilterType extends FilterType,
  TAbiEvent extends AbiEvent | undefined,
  TAbi extends Abi | readonly unknown[],
  TEventName extends string | undefined,
>(
  client: PublicClient<TTransport, TChain>,
  {
    filter,
  }: GetFilterChangesParameters<TFilterType, TAbiEvent, TAbi, TEventName>,
) {
  const logs = await client.request({
    method: 'eth_getFilterChanges',
    params: [filter.id],
  })
  return logs.map((log) => {
    if (typeof log === 'string') return log
    const { eventName, args } =
      'abi' in filter && filter.abi
        ? decodeEventLog({
            abi: filter.abi,
            data: log.data,
            topics: log.topics as any,
          })
        : { eventName: undefined, args: undefined }
    return formatLog(log, { args, eventName })
  }) as GetFilterChangesReturnType<TFilterType, TAbiEvent, TAbi, TEventName>
}
