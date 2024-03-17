import type { Abi, Address } from 'abitype'

import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { BlockNumber, BlockTag } from '../../types/block.js'
import type { Chain } from '../../types/chain.js'
import type {
  ContractEventArgs,
  ContractEventName,
} from '../../types/contract.js'
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
  abi extends Abi | readonly unknown[] = Abi,
  eventName extends ContractEventName<abi> | undefined =
    | ContractEventName<abi>
    | undefined,
  strict extends boolean | undefined = undefined,
  fromBlock extends BlockNumber | BlockTag | undefined = undefined,
  toBlock extends BlockNumber | BlockTag | undefined = undefined,
> = {
  /** The address of the contract. */
  address?: Address | Address[] | undefined
  /** Contract ABI. */
  abi: abi
  args?:
    | ContractEventArgs<
        abi,
        eventName extends ContractEventName<abi>
          ? eventName
          : ContractEventName<abi>
      >
    | undefined
  /** Contract event. */
  eventName?: eventName | ContractEventName<abi> | undefined
  /**
   * Whether or not the logs must match the indexed/non-indexed arguments on `event`.
   * @default false
   */
  strict?: strict | boolean | undefined
} & (
  | {
      /** Block number or tag after which to include logs */
      fromBlock?: fromBlock | BlockNumber | BlockTag | undefined
      /** Block number or tag before which to include logs */
      toBlock?: toBlock | BlockNumber | BlockTag | undefined
      blockHash?: undefined
    }
  | {
      fromBlock?: undefined
      toBlock?: undefined
      /** Hash of block to include logs from */
      blockHash?: Hash | undefined
    }
)

export type GetContractEventsReturnType<
  abi extends Abi | readonly unknown[] = readonly unknown[],
  eventName extends ContractEventName<abi> | undefined =
    | ContractEventName<abi>
    | undefined,
  strict extends boolean | undefined = undefined,
  fromBlock extends BlockNumber | BlockTag | undefined = undefined,
  toBlock extends BlockNumber | BlockTag | undefined = undefined,
  ///
  isPending extends boolean =
    | (fromBlock extends 'pending' ? true : false)
    | (toBlock extends 'pending' ? true : false),
> = Log<bigint, number, isPending, undefined, strict, abi, eventName>[]

export type GetContractEventsErrorType =
  | GetAbiItemErrorType
  | GetLogsErrorType
  | ErrorType

/**
 * Returns a list of event logs emitted by a contract.
 *
 * - Docs: https://viem.sh/docs/actions/public/getContractEvents
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
  chain extends Chain | undefined,
  const abi extends Abi | readonly unknown[],
  eventName extends ContractEventName<abi> | undefined = undefined,
  TStrict extends boolean | undefined = undefined,
  TFromBlock extends BlockNumber | BlockTag | undefined = undefined,
  TToBlock extends BlockNumber | BlockTag | undefined = undefined,
>(
  client: Client<Transport, chain>,
  parameters: GetContractEventsParameters<
    abi,
    eventName,
    TStrict,
    TFromBlock,
    TToBlock
  >,
): Promise<
  GetContractEventsReturnType<abi, eventName, TStrict, TFromBlock, TToBlock>
> {
  const {
    abi,
    address,
    args,
    blockHash,
    eventName,
    fromBlock,
    toBlock,
    strict,
  } = parameters
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
    abi,
    eventName,
    TStrict,
    TFromBlock,
    TToBlock
  >
}
