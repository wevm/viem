import type { Abi } from 'abitype'
import * as AbiEvent from 'ox/AbiEvent'
import type * as Address from 'ox/Address'
import type * as Block from 'ox/Block'
import type * as Errors from 'ox/Errors'

import type * as Client from '../../Client.js'
import type { Filter } from '../filter/Filter.js'
import { createFilter as createEventFilter_ } from '../event/createFilter.js'

/**
 * Creates a filter to listen for new event logs emitted by a contract
 * (`eth_newFilter`).
 *
 * The returned filter can be polled with {@link Actions.filter.getChanges} (or
 * fully re-read with {@link Actions.filter.getLogs}) and torn down with
 * {@link Actions.filter.uninstall}. Matched logs are decoded against the
 * contract's ABI.
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
 * const filter = await Actions.contract.createEventFilter(client, {
 *   abi: Abi.from([
 *     'event Transfer(address indexed from, address indexed to, uint256 value)',
 *   ]),
 *   eventName: 'Transfer',
 * })
 * const logs = await Actions.filter.getChanges(client, { filter })
 * ```
 */
export async function createEventFilter<
  const abi extends Abi | readonly unknown[],
  eventName extends AbiEvent.extractLogs.EventName<abi> | undefined = undefined,
  strict extends boolean | undefined = undefined,
  fromBlock extends Block.Number | Block.Tag | undefined = undefined,
  toBlock extends Block.Number | Block.Tag | undefined = undefined,
>(
  client: Client.Client,
  options: createEventFilter.Options<
    abi,
    eventName,
    strict,
    fromBlock,
    toBlock
  >,
): Promise<
  createEventFilter.ReturnType<abi, eventName, strict, fromBlock, toBlock>
> {
  const { abi, address, args, eventName, fromBlock, toBlock, strict } =
    options as createEventFilter.Options

  const event = eventName ? AbiEvent.fromAbi(abi, eventName) : undefined
  const events = event
    ? undefined
    : (abi as Abi).filter((item) => item.type === 'event')

  return createEventFilter_(client, {
    address,
    args,
    event,
    events,
    fromBlock,
    strict,
    toBlock,
  } as createEventFilter_.Options) as never
}

export declare namespace createEventFilter {
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
    /** Block number or tag after which to include logs. */
    fromBlock?: fromBlock | Block.Number | Block.Tag | undefined
    /** Block number or tag before which to include logs. */
    toBlock?: toBlock | Block.Number | Block.Tag | undefined
    /**
     * Whether the logs must match the indexed/non-indexed arguments on the
     * event.
     *
     * @default false
     */
    strict?: strict | undefined
  }

  type ReturnType<
    abi extends Abi | readonly unknown[] = readonly unknown[],
    eventName extends AbiEvent.extractLogs.EventName<abi> | undefined =
      | AbiEvent.extractLogs.EventName<abi>
      | undefined,
    strict extends boolean | undefined = undefined,
    fromBlock extends Block.Number | Block.Tag | undefined = undefined,
    toBlock extends Block.Number | Block.Tag | undefined = undefined,
  > = Filter<
    'event',
    AbiEvent.extractLogs.ExtractEvent<abi, eventName>,
    strict,
    fromBlock,
    toBlock
  >

  type ErrorType =
    | AbiEvent.fromAbi.ErrorType
    | createEventFilter_.ErrorType
    | Errors.GlobalErrorType

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
