import type { PublicClient } from '../../clients'
import type { Filter, FilterType, Hash, Log } from '../../types'

import { formatLog } from '../../utils/formatters/log'

export type GetFilterLogsArgs = {
  filter: Filter<'event'>
}
export type GetFilterLogsResponse = Log[]

export async function getFilterLogs<TFilterType extends FilterType>(
  client: PublicClient,
  { filter }: GetFilterLogsArgs,
): Promise<GetFilterLogsResponse> {
  const logs = await client.request({
    method: 'eth_getFilterLogs',
    params: [filter.id],
  })
  return logs.map(formatLog)
}
