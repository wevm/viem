import type { Abi, Address } from 'abitype'

import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { BlockNumber, BlockTag } from '../../types/block.js'
import type { Chain } from '../../types/chain.js'
import type { GetEventArgs, InferEventName } from '../../types/contract.js'
import type { Log } from '../../types/log.js'
import type { Hash } from '../../types/misc.js'
import {
  type GetAbiItemErrorType,
  type GetAbiItemParameters,
  getAbiItem,
} from '../../utils/abi/getAbiItem.js'
import { getAction } from '../../utils/getAction.js'
import {
  type GetLogsErrorType,
  type GetLogsParameters,
  getLogs,
} from './getLogs.js'

export type GetContractEventsParameters<
  TAbi extends Abi | readonly unknown[] = readonly unknown[],
  TEventName extends string | undefined = string | undefined,
  TStrict extends boolean | undefined = undefined,
  TFromBlock extends BlockNumber | BlockTag | undefined = undefined,
  TToBlock extends BlockNumber | BlockTag | undefined = undefined,
> = {
  /** The address of the contract. */
  address?: Address | Address[]
  /** Contract ABI. */
  abi: TAbi
  args?: TEventName extends string ? GetEventArgs<TAbi, TEventName> : undefined
  /** Contract event. */
  eventName?: InferEventName<TAbi, TEventName>
  /**
   * Whether or not the logs must match the indexed/non-indexed arguments on `event`.
   * @default false
   */
  strict?: TStrict
} & (
  | {
      /** Block number or tag after which to include logs */
      fromBlock?: TFromBlock | BlockNumber | BlockTag
      /** Block number or tag before which to include logs */
      toBlock?: TToBlock | BlockNumber | BlockTag
      blockHash?: never
    }
  | {
      fromBlock?: never
      toBlock?: never
      /** Hash of block to include logs from */
      blockHash?: Hash
    }
)

export type GetContractEventsReturnType<
  TAbi extends Abi | readonly unknown[] = readonly unknown[],
  TEventName extends string | undefined = string | undefined,
  TStrict extends boolean | undefined = undefined,
  TFromBlock extends BlockNumber | BlockTag | undefined = undefined,
  TToBlock extends BlockNumber | BlockTag | undefined = undefined,
  _Pending extends boolean =
    | (TFromBlock extends 'pending' ? true : false)
    | (TToBlock extends 'pending' ? true : false),
> = Log<bigint, number, _Pending, undefined, TStrict, TAbi, TEventName>[]

export type GetContractEventsErrorType =
  | GetAbiItemErrorType
  | GetLogsErrorType
  | ErrorType

/**
 * Returns a list of event logs emitted by a contract.
 *
 * - Docs: https://viem.sh/docs/actions/public/getContractEvents.html
 * - JSON-RPC Methods: [`eth_getLogs`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getlogs)
 *
 * @param client - Client to use
 * @param parameters - {@link GetContractEventsParameters}
 * @returns A list of event logs. {@link GetContractEventsReturnType}
 *
 * @example
 * import { createClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getContractEvents } from 'viem/public'
 * import { wagmiAbi } from './abi'
 *
 * const client = createClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const logs = await getContractEvents(client, {
 *  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *  abi: wagmiAbi,
 *  eventName: 'Transfer'
 * })
 */
export async function getContractEvents<
  TChain extends Chain | undefined,
  const TAbi extends Abi | readonly unknown[],
  TEventName extends string | undefined = undefined,
  TStrict extends boolean | undefined = undefined,
  TFromBlock extends BlockNumber | BlockTag | undefined = undefined,
  TToBlock extends BlockNumber | BlockTag | undefined = undefined,
>(
  client: Client<Transport, TChain>,
  {
    abi,
    address,
    args,
    blockHash,
    eventName,
    fromBlock,
    toBlock,
    strict,
  }: GetContractEventsParameters<
    TAbi,
    TEventName,
    TStrict,
    TFromBlock,
    TToBlock
  >,
): Promise<
  GetContractEventsReturnType<TAbi, TEventName, TStrict, TFromBlock, TToBlock>
> {
  const event = eventName
    ? getAbiItem({ abi, name: eventName } as GetAbiItemParameters)
    : undefined
  const events = !event
    ? (abi as Abi).filter((x) => x.type === 'event')
    : undefined
  return getAction(
    client,
    getLogs,
    'getLogs',
  )({
    address,
    args,
    blockHash,
    event,
    events,
    fromBlock,
    toBlock,
    strict,
  } as {} as GetLogsParameters) as unknown as GetContractEventsReturnType<
    TAbi,
    TEventName,
    TStrict,
    TFromBlock,
    TToBlock
  >
}
