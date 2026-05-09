import type { Abi, AbiEvent, ExtractAbiEvent } from 'abitype'

import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'

import type { ErrorType } from '../../errors/utils.js'
import type { BlockNumber, BlockTag } from '../../types/block.js'
import type { Chain } from '../../types/chain.js'
import type { Filter } from '../../types/filter.js'
import type { Log } from '../../types/log.js'
import type { DecodeEventLogErrorType } from '../../utils/abi/decodeEventLog.js'
import { parseEventLogs } from '../../utils/abi/parseEventLogs.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import {
  type FormatLogErrorType,
  formatLog,
} from '../../utils/formatters/log.js'

export type GetFilterLogsParameters<
  abi extends Abi | readonly unknown[] | undefined = undefined,
  eventName extends string | undefined = undefined,
  strict extends boolean | undefined = undefined,
  fromBlock extends BlockNumber | BlockTag | undefined = undefined,
  toBlock extends BlockNumber | BlockTag | undefined = undefined,
> = {
  filter: Filter<'event', abi, eventName, any, strict, fromBlock, toBlock>
}
export type GetFilterLogsReturnType<
  abi extends Abi | readonly unknown[] | undefined = undefined,
  eventName extends string | undefined = undefined,
  strict extends boolean | undefined = undefined,
  fromBlock extends BlockNumber | BlockTag | undefined = undefined,
  toBlock extends BlockNumber | BlockTag | undefined = undefined,
  _AbiEvent extends AbiEvent | undefined = abi extends Abi
    ? eventName extends string
      ? ExtractAbiEvent<abi, eventName>
      : undefined
    : undefined,
  _Pending extends boolean =
    | (fromBlock extends 'pending' ? true : false)
    | (toBlock extends 'pending' ? true : false),
> = Log<bigint, number, _Pending, _AbiEvent, strict, abi, eventName>[]

export type GetFilterLogsErrorType =
  | RequestErrorType
  | DecodeEventLogErrorType
  | FormatLogErrorType
  | ErrorType

/**
 * Returns a list of event logs since the filter was created.
 *
 * - Docs: https://viem.sh/docs/actions/public/getFilterLogs
 * - JSON-RPC Methods: [`eth_getFilterLogs`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getfilterlogs)
 *
 * `getFilterLogs` is only compatible with **event filters**.
 *
 * @param client - Client to use
 * @param parameters - {@link GetFilterLogsParameters}
 * @returns A list of event logs. {@link GetFilterLogsReturnType}
 *
 * @example
 * import { createPublicClient, http, parseAbiItem } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { createEventFilter, getFilterLogs } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const filter = await createEventFilter(client, {
 *   address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
 *   event: parseAbiItem('event Transfer(address indexed, address indexed, uint256)'),
 * })
 * const logs = await getFilterLogs(client, { filter })
 */
export async function getFilterLogs<
  chain extends Chain | undefined,
  const abi extends Abi | readonly unknown[] | undefined,
  eventName extends string | undefined,
  strict extends boolean | undefined = undefined,
  fromBlock extends BlockNumber | BlockTag | undefined = undefined,
  toBlock extends BlockNumber | BlockTag | undefined = undefined,
>(
  _client: Client<Transport, chain>,
  {
    filter,
  }: GetFilterLogsParameters<abi, eventName, strict, fromBlock, toBlock>,
): Promise<
  GetFilterLogsReturnType<abi, eventName, strict, fromBlock, toBlock>
> {
  const strict = filter.strict ?? false

  const logs = await filter.request({
    method: 'eth_getFilterLogs',
    params: [filter.id],
  })

  const formattedLogs = logs.map((log) => formatLog(log))
  if (!filter.abi)
    return formattedLogs as GetFilterLogsReturnType<
      abi,
      eventName,
      strict,
      fromBlock,
      toBlock
    >
  return parseEventLogs({
    abi: filter.abi,
    logs: formattedLogs,
    strict,
  }) as unknown as GetFilterLogsReturnType<
    abi,
    eventName,
    strict,
    fromBlock,
    toBlock
  >
}
