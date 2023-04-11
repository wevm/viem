import type { Abi, Narrow } from 'abitype'
import type { PublicClient, Transport } from '../../clients/index.js'

import type {
  Address,
  BlockNumber,
  BlockTag,
  Chain,
  InferEventName,
  Filter,
  MaybeExtractEventArgsFromAbi,
} from '../../types/index.js'
import { encodeEventTopics, numberToHex } from '../../utils/index.js'
import type { EncodeEventTopicsParameters } from '../../utils/index.js'
import type { OnResponseFn } from '../../clients/transports/fallback.js'

export type CreateContractEventFilterParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
  TEventName extends string | undefined = undefined,
  TArgs extends
    | MaybeExtractEventArgsFromAbi<TAbi, TEventName>
    | undefined = undefined,
> = {
  address?: Address | Address[]
  abi: Narrow<TAbi>
  eventName?: InferEventName<TAbi, TEventName>
  fromBlock?: BlockNumber | BlockTag
  toBlock?: BlockNumber | BlockTag
} & (undefined extends TEventName
  ? {
      args?: never
    }
  : MaybeExtractEventArgsFromAbi<
      TAbi,
      TEventName
    > extends infer TEventFilterArgs
  ? {
      args?: TEventFilterArgs | (TArgs extends TEventFilterArgs ? TArgs : never)
    }
  : {
      args?: never
    })

export type CreateContractEventFilterReturnType<
  TAbi extends Abi | readonly unknown[] = Abi,
  TEventName extends string | undefined = undefined,
  TArgs extends
    | MaybeExtractEventArgsFromAbi<TAbi, TEventName>
    | undefined = undefined,
> = Filter<'event', TAbi, TEventName, TArgs>

export async function createContractEventFilter<
  TChain extends Chain | undefined,
  TAbi extends Abi | readonly unknown[],
  TEventName extends string | undefined,
  TArgs extends MaybeExtractEventArgsFromAbi<TAbi, TEventName> | undefined,
>(
  client: PublicClient<Transport, TChain>,
  {
    address,
    abi,
    args,
    eventName,
    fromBlock,
    toBlock,
  }: CreateContractEventFilterParameters<TAbi, TEventName, TArgs>,
): Promise<CreateContractEventFilterReturnType<TAbi, TEventName, TArgs>> {
  let request = client.request

  // If the transport is a fallback, we want to scope the request function
  // to the successful child transport. This is because we want to keep the
  // request function scoped & don't want to apply the fallback behavior to
  // methods such as `eth_getFilterChanges`, `eth_getFilterLogs`, etc.
  if (client.transport.type === 'fallback')
    client.transport.onResponse(
      ({ method, status, transport }: Parameters<OnResponseFn>[0]) => {
        if (status === 'success' && method === 'eth_newFilter') {
          request = transport.request
        }
      },
    )

  const topics = eventName
    ? encodeEventTopics({
        abi,
        args,
        eventName,
      } as unknown as EncodeEventTopicsParameters)
    : undefined
  const id = await client.request({
    method: 'eth_newFilter',
    params: [
      {
        address,
        fromBlock:
          typeof fromBlock === 'bigint' ? numberToHex(fromBlock) : fromBlock,
        toBlock: typeof toBlock === 'bigint' ? numberToHex(toBlock) : toBlock,
        topics,
      },
    ],
  })
  return {
    abi,
    args,
    eventName,
    id,
    request,
    type: 'event',
  } as unknown as CreateContractEventFilterReturnType<TAbi, TEventName, TArgs>
}
