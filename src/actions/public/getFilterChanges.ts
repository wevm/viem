import type { Abi, AbiEvent, ExtractAbiEvent } from 'abitype'

import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { RpcLog } from '../../index.js'
import type { BlockNumber, BlockTag } from '../../types/block.js'
import type { Chain } from '../../types/chain.js'
import type { Filter, FilterType } from '../../types/filter.js'
import type { Log } from '../../types/log.js'
import type { Hash } from '../../types/misc.js'
import type { DecodeEventLogErrorType } from '../../utils/abi/decodeEventLog.js'
import { parseEventLogs } from '../../utils/abi/parseEventLogs.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import {
  type FormatLogErrorType,
  formatLog,
} from '../../utils/formatters/log.js'

export type GetFilterChangesParameters<
  filterType extends FilterType = FilterType,
  abi extends Abi | readonly unknown[] | undefined = undefined,
  eventName extends string | undefined = undefined,
  strict extends boolean | undefined = undefined,
  fromBlock extends BlockNumber | BlockTag | undefined = undefined,
  toBlock extends BlockNumber | BlockTag | undefined = undefined,
> = {
  filter: Filter<filterType, abi, eventName, any, strict, fromBlock, toBlock>
}

export type GetFilterChangesReturnType<
  filterType extends FilterType = FilterType,
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
> = filterType extends 'event'
  ? Log<bigint, number, _Pending, _AbiEvent, strict, abi, eventName>[]
  : Hash[]

export type GetFilterChangesErrorType =
  | RequestErrorType
  | DecodeEventLogErrorType
  | FormatLogErrorType
  | ErrorType

/**
 * Returns a list of logs or hashes based on a [Filter](/docs/glossary/terms#filter) since the last time it was called.
 *
 * - Docs: https://viem.sh/docs/actions/public/getFilterChanges
 * - JSON-RPC Methods: [`eth_getFilterChanges`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getfilterchanges)
 *
 * A Filter can be created from the following actions:
 *
 * - [`createBlockFilter`](https://viem.sh/docs/actions/public/createBlockFilter)
 * - [`createContractEventFilter`](https://viem.sh/docs/contract/createContractEventFilter)
 * - [`createEventFilter`](https://viem.sh/docs/actions/public/createEventFilter)
 * - [`createPendingTransactionFilter`](https://viem.sh/docs/actions/public/createPendingTransactionFilter)
 *
 * Depending on the type of filter, the return value will be different:
 *
 * - If the filter was created with `createContractEventFilter` or `createEventFilter`, it returns a list of logs.
 * - If the filter was created with `createPendingTransactionFilter`, it returns a list of transaction hashes.
 * - If the filter was created with `createBlockFilter`, it returns a list of block hashes.
 *
 * @param client - Client to use
 * @param parameters - {@link GetFilterChangesParameters}
 * @returns Logs or hashes. {@link GetFilterChangesReturnType}
 *
 * @example
 * // Blocks
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { createBlockFilter, getFilterChanges } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const filter = await createBlockFilter(client)
 * const hashes = await getFilterChanges(client, { filter })
 *
 * @example
 * // Contract Events
 * import { createPublicClient, http, parseAbi } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { createContractEventFilter, getFilterChanges } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const filter = await createContractEventFilter(client, {
 *   address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
 *   abi: parseAbi(['event Transfer(address indexed, address indexed, uint256)']),
 *   eventName: 'Transfer',
 * })
 * const logs = await getFilterChanges(client, { filter })
 *
 * @example
 * // Raw Events
 * import { createPublicClient, http, parseAbiItem } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { createEventFilter, getFilterChanges } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const filter = await createEventFilter(client, {
 *   address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
 *   event: parseAbiItem('event Transfer(address indexed, address indexed, uint256)'),
 * })
 * const logs = await getFilterChanges(client, { filter })
 *
 * @example
 * // Transactions
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { createPendingTransactionFilter, getFilterChanges } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const filter = await createPendingTransactionFilter(client)
 * const hashes = await getFilterChanges(client, { filter })
 */
export async function getFilterChanges<
  transport extends Transport,
  chain extends Chain | undefined,
  filterType extends FilterType,
  const abi extends Abi | readonly unknown[] | undefined,
  eventName extends string | undefined,
  strict extends boolean | undefined = undefined,
  fromBlock extends BlockNumber | BlockTag | undefined = undefined,
  toBlock extends BlockNumber | BlockTag | undefined = undefined,
>(
  _client: Client<transport, chain>,
  {
    filter,
  }: GetFilterChangesParameters<
    filterType,
    abi,
    eventName,
    strict,
    fromBlock,
    toBlock
  >,
): Promise<
  GetFilterChangesReturnType<
    filterType,
    abi,
    eventName,
    strict,
    fromBlock,
    toBlock
  >
> {
  const strict = 'strict' in filter && filter.strict

  const logs = await filter.request({
    method: 'eth_getFilterChanges',
    params: [filter.id],
  })

  if (typeof logs[0] === 'string')
    return logs as GetFilterChangesReturnType<
      filterType,
      abi,
      eventName,
      strict,
      fromBlock,
      toBlock
    >

  const formattedLogs = logs.map((log) => formatLog(log as RpcLog))
  if (!('abi' in filter) || !filter.abi)
    return formattedLogs as GetFilterChangesReturnType<
      filterType,
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
  }) as unknown as GetFilterChangesReturnType<
    filterType,
    abi,
    eventName,
    strict,
    fromBlock,
    toBlock
  >
}
