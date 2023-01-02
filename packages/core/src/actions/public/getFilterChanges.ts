import type { PublicClient } from '../../clients'
import type { Data, Filter, FilterType, Log } from '../../types'

import { formatLog } from '../../utils/formatters/log'

export type GetFilterChangesArgs<TFilterType extends FilterType> = {
  filter: Filter<TFilterType>
}
export type GetFilterChangesResponse<TFilterType extends FilterType> =
  TFilterType extends 'default' ? Log[] : Data[]

export async function getFilterChanges<TFilterType extends FilterType>(
  client: PublicClient,
  { filter }: GetFilterChangesArgs<TFilterType>,
) {
  const logs = await client.request({
    method: 'eth_getFilterChanges',
    params: [filter.id],
  })
  return logs.map((log) =>
    typeof log === 'string' ? log : formatLog(log),
  ) as GetFilterChangesResponse<TFilterType>
}
