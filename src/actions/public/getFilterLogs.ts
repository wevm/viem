import type { Abi, AbiEvent } from 'abitype'
import type { PublicClient, Transport } from '../../clients/index.js'
import type {
  Chain,
  Filter,
  Log,
  MaybeAbiEventName,
} from '../../types/index.js'
import { decodeEventLog } from '../../utils/index.js'

import { formatLog } from '../../utils/formatters/log.js'

export type GetFilterLogsParameters<
  TAbiEvent extends AbiEvent | undefined = undefined,
  TAbi extends Abi | readonly unknown[] = [TAbiEvent],
  TEventName extends string | undefined = MaybeAbiEventName<TAbiEvent>,
> = {
  filter: Filter<'event', TAbi, TEventName, any>
}
export type GetFilterLogsReturnType<
  TAbiEvent extends AbiEvent | undefined = undefined,
  TAbi extends Abi | readonly unknown[] = [TAbiEvent],
  TEventName extends string | undefined = MaybeAbiEventName<TAbiEvent>,
> = Log<bigint, number, TAbiEvent, TAbi, TEventName>[]

export async function getFilterLogs<
  TChain extends Chain | undefined,
  TAbiEvent extends AbiEvent | undefined,
  TAbi extends Abi | readonly unknown[],
  TEventName extends string | undefined,
>(
  client: PublicClient<Transport, TChain>,
  { filter }: GetFilterLogsParameters<TAbiEvent, TAbi, TEventName>,
): Promise<GetFilterLogsReturnType<TAbiEvent, TAbi, TEventName>> {
  const logs = await client.request({
    method: 'eth_getFilterLogs',
    params: [filter.id],
  })
  return logs.map((log) => {
    const { eventName, args } =
      'abi' in filter && filter.abi
        ? decodeEventLog({
            abi: filter.abi,
            data: log.data,
            topics: log.topics as any,
          })
        : { eventName: undefined, args: undefined }
    return formatLog(log, { args, eventName })
  }) as unknown as GetFilterLogsReturnType<TAbiEvent, TAbi, TEventName>
}
