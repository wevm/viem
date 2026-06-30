import type { Abi } from 'abitype'
import * as AbiEvent from 'ox/AbiEvent'
import type * as Address from 'ox/Address'
import type * as Block from 'ox/Block'
import type * as Errors from 'ox/Errors'
import type * as Hex from 'ox/Hex'
import type * as Log from 'ox/Log'

import type * as Client from '../../Client.js'
import type { OneOf } from '../../internal/types.js'
import { getLogs as getEventLogs } from '../event/getLogs.js'

/**
 * Returns a list of event logs emitted by a contract (`eth_getLogs`).
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { Abi } from 'viem/utils'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const logs = await Actions.contract.getLogs(client, {
 *   abi: Abi.from([
 *     'event Transfer(address indexed from, address indexed to, uint256 value)',
 *   ]),
 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *   eventName: 'Transfer',
 * })
 * ```
 */
export async function getLogs<
  const abi extends Abi | readonly unknown[],
  eventName extends AbiEvent.extractLogs.EventName<abi> | undefined = undefined,
  strict extends boolean | undefined = undefined,
  fromBlock extends Block.Number | Block.Tag | undefined = undefined,
  toBlock extends Block.Number | Block.Tag | undefined = undefined,
>(
  client: Client.Client,
  options: getLogs.Options<abi, eventName, strict, fromBlock, toBlock>,
): Promise<getLogs.ReturnType<abi, eventName, strict, fromBlock, toBlock>> {
  const {
    abi,
    address,
    args,
    blockHash,
    eventName,
    fromBlock,
    toBlock,
    strict,
  } = options as getLogs.Options

  const event = eventName ? AbiEvent.fromAbi(abi, eventName) : undefined
  const events = event
    ? undefined
    : (abi as Abi).filter((item) => item.type === 'event')

  return getEventLogs(client, {
    address,
    args,
    blockHash,
    event,
    events,
    fromBlock,
    strict,
    toBlock,
  } as getEventLogs.Options) as never
}

export declare namespace getLogs {
  type Options<
    abi extends Abi | readonly unknown[] = Abi,
    eventName extends AbiEvent.extractLogs.EventName<abi> | undefined =
      | AbiEvent.extractLogs.EventName<abi>
      | undefined,
    strict extends boolean | undefined = undefined,
    fromBlock extends Block.Number | Block.Tag | undefined = undefined,
    toBlock extends Block.Number | Block.Tag | undefined = undefined,
  > = {
    /** Contract ABI. */
    abi: abi
    /** Address or list of addresses from which logs originated. */
    address?: Address.Address | readonly Address.Address[] | undefined
    /** Indexed argument values to filter logs by. */
    args?: AbiEvent.extractLogs.Args<ExtractEvent<abi, eventName>> | undefined
    /** Event name to filter and decode logs by. */
    eventName?: eventName | AbiEvent.extractLogs.EventName<abi> | undefined
    /**
     * Whether the logs must match the indexed/non-indexed arguments on the
     * event.
     *
     * @default false
     */
    strict?: strict | boolean | undefined
  } & OneOf<
    | {
        /** Block number or tag after which to include logs. */
        fromBlock?: fromBlock | Block.Number | Block.Tag | undefined
        /** Block number or tag before which to include logs. */
        toBlock?: toBlock | Block.Number | Block.Tag | undefined
      }
    | {
        /** Hash of the block to include logs from. */
        blockHash?: Hex.Hex | undefined
      }
  >

  type ReturnType<
    abi extends Abi | readonly unknown[] = readonly unknown[],
    eventName extends AbiEvent.extractLogs.EventName<abi> | undefined =
      | AbiEvent.extractLogs.EventName<abi>
      | undefined,
    strict extends boolean | undefined = undefined,
    fromBlock extends Block.Number | Block.Tag | undefined = undefined,
    toBlock extends Block.Number | Block.Tag | undefined = undefined,
    _pending extends boolean =
      | (fromBlock extends 'pending' ? true : false)
      | (toBlock extends 'pending' ? true : false),
  > = readonly DistributeLog<
    AbiEvent.extractLogs.ExtractEvent<abi, eventName>,
    _pending,
    strict
  >[]

  type ErrorType =
    | AbiEvent.fromAbi.ErrorType
    | getEventLogs.ErrorType
    | Errors.GlobalErrorType

  /** Distributes a union of events into a union of decoded log shapes. */
  type DistributeLog<
    abiEvent,
    pending extends boolean,
    strict extends boolean | undefined,
  > = abiEvent extends AbiEvent.AbiEvent
    ? AbiEvent.extractLogs.ReturnType<abiEvent, Log.Log<pending>, strict>
    : never

  type ExtractEvent<
    abi extends Abi | readonly unknown[],
    eventName extends AbiEvent.extractLogs.EventName<abi> | undefined,
  > = AbiEvent.extractLogs.ExtractEvent<
    abi,
    eventName extends AbiEvent.extractLogs.EventName<abi>
      ? eventName
      : AbiEvent.extractLogs.EventName<abi>
  >
}
