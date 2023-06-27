import type { Abi, AbiEvent, Address, Narrow } from 'abitype'

import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { BlockNumber, BlockTag } from '../../types/block.js'
import type { Chain } from '../../types/chain.js'
import type {
  MaybeAbiEventName,
  MaybeExtractEventArgsFromAbi,
} from '../../types/contract.js'
import type { Filter } from '../../types/filter.js'
import type { LogTopic } from '../../types/misc.js'
import type { Prettify } from '../../types/utils.js'
import {
  type EncodeEventTopicsParameters,
  encodeEventTopics,
} from '../../utils/abi/encodeEventTopics.js'
import { numberToHex } from '../../utils/encoding/toHex.js'
import { createFilterRequestScope } from '../../utils/filters/createFilterRequestScope.js'

export type CreateEventFilterParameters<
  TAbiEvent extends AbiEvent | undefined = undefined,
  TStrict extends boolean | undefined = undefined,
  _Abi extends Abi | readonly unknown[] = [TAbiEvent],
  _EventName extends string | undefined = MaybeAbiEventName<TAbiEvent>,
  _Args extends
    | MaybeExtractEventArgsFromAbi<_Abi, _EventName>
    | undefined = undefined,
> = {
  address?: Address | Address[]
  fromBlock?: BlockNumber | BlockTag
  toBlock?: BlockNumber | BlockTag
} & (MaybeExtractEventArgsFromAbi<
  _Abi,
  _EventName
> extends infer TEventFilterArgs
  ?
      | {
          args:
            | TEventFilterArgs
            | (_Args extends TEventFilterArgs ? _Args : never)
          event: Narrow<TAbiEvent>
          /**
           * Whether or not the logs must match the indexed/non-indexed arguments on `event`.
           * @default false
           */
          strict?: TStrict
        }
      | {
          args?: never
          event?: Narrow<TAbiEvent>
          /**
           * Whether or not the logs must match the indexed/non-indexed arguments on `event`.
           * @default false
           */
          strict?: TStrict
        }
      | {
          args?: never
          event?: never
          strict?: never
        }
  : {
      args?: never
      event?: never
      strict?: never
    })

export type CreateEventFilterReturnType<
  TAbiEvent extends AbiEvent | undefined = undefined,
  TStrict extends boolean | undefined = undefined,
  _Abi extends Abi | readonly unknown[] = [TAbiEvent],
  _EventName extends string | undefined = MaybeAbiEventName<TAbiEvent>,
  _Args extends
    | MaybeExtractEventArgsFromAbi<_Abi, _EventName>
    | undefined = undefined,
> = Prettify<Filter<'event', _Abi, _EventName, _Args, TStrict>>

/**
 * Creates a [`Filter`](https://viem.sh/docs/glossary/types.html#filter) to listen for new events that can be used with [`getFilterChanges`](https://viem.sh/docs/actions/public/getFilterChanges.html).
 *
 * - Docs: https://viem.sh/docs/actions/public/createEventFilter.html
 * - JSON-RPC Methods: [`eth_newFilter`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_newfilter)
 *
 * @param client - Client to use
 * @param parameters - {@link CreateEventFilterParameters}
 * @returns [`Filter`](https://viem.sh/docs/glossary/types.html#filter). {@link CreateEventFilterReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { createEventFilter } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const filter = await createEventFilter(client, {
 *   address: '0xfba3912ca04dd458c843e2ee08967fc04f3579c2',
 * })
 */
export async function createEventFilter<
  TChain extends Chain | undefined,
  TAbiEvent extends AbiEvent | undefined,
  TStrict extends boolean | undefined = undefined,
  _Abi extends Abi | readonly unknown[] = [TAbiEvent],
  _EventName extends string | undefined = MaybeAbiEventName<TAbiEvent>,
  _Args extends
    | MaybeExtractEventArgsFromAbi<_Abi, _EventName>
    | undefined = undefined,
>(
  client: Client<Transport, TChain>,
  {
    address,
    args,
    event,
    fromBlock,
    strict,
    toBlock,
  }: CreateEventFilterParameters<
    TAbiEvent,
    TStrict,
    _Abi,
    _EventName,
    _Args
  > = {} as any,
): Promise<
  CreateEventFilterReturnType<TAbiEvent, TStrict, _Abi, _EventName, _Args>
> {
  const getRequest = createFilterRequestScope(client, {
    method: 'eth_newFilter',
  })

  let topics: LogTopic[] = []
  if (event)
    topics = encodeEventTopics({
      abi: [event],
      eventName: (event as AbiEvent).name,
      args,
    } as EncodeEventTopicsParameters)

  const id = await client.request({
    method: 'eth_newFilter',
    params: [
      {
        address,
        fromBlock:
          typeof fromBlock === 'bigint' ? numberToHex(fromBlock) : fromBlock,
        toBlock: typeof toBlock === 'bigint' ? numberToHex(toBlock) : toBlock,
        ...(topics.length ? { topics } : {}),
      },
    ],
  })

  return {
    abi: event ? [event] : undefined,
    args,
    eventName: event ? (event as AbiEvent).name : undefined,
    id,
    request: getRequest(id),
    strict,
    type: 'event',
  } as unknown as CreateEventFilterReturnType<
    TAbiEvent,
    TStrict,
    _Abi,
    _EventName,
    _Args
  >
}
