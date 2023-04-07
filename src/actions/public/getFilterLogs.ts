import type { Abi, AbiEvent } from 'abitype'
import type { PublicClient, Transport } from '../../clients'
import type { Chain, Filter, Log, MaybeAbiEventName } from '../../types'
import { decodeEventLog } from '../../utils'

import { formatLog } from '../../utils/formatters/log'

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
  return logs
    .map((log) => {
      try {
        const { eventName, args } =
          'abi' in filter && filter.abi
            ? decodeEventLog({
                abi: filter.abi,
                data: log.data,
                topics: log.topics as any,
              })
            : { eventName: undefined, args: undefined }
        return formatLog(log, { args, eventName })
      } catch {
        // Skip log if there is an error decoding (e.g. indexed/non-indexed params mismatch).
        return
      }
    })
    .filter(Boolean) as unknown as GetFilterLogsReturnType<
    TAbiEvent,
    TAbi,
    TEventName
  >
}
