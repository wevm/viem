import type { Abi, Narrow } from 'abitype'
import type { PublicClientArg } from '../../clients'

import type {
  Address,
  BlockNumber,
  BlockTag,
  ExtractEventNameFromAbi,
  Filter,
  MaybeExtractEventArgsFromAbi,
} from '../../types'
import {
  encodeEventTopics,
  EncodeEventTopicsParameters,
  numberToHex,
} from '../../utils'

export type CreateContractEventFilterParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
  TEventName extends string | undefined = undefined,
  TArgs extends
    | MaybeExtractEventArgsFromAbi<TAbi, TEventName>
    | undefined = undefined,
> = {
  address?: Address | Address[]
  abi: Narrow<TAbi>
  eventName?: ExtractEventNameFromAbi<TAbi, TEventName>
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
  TAbi extends Abi | readonly unknown[],
  TEventName extends string | undefined,
  TArgs extends MaybeExtractEventArgsFromAbi<TAbi, TEventName> | undefined,
>(
  client: PublicClientArg,
  {
    address,
    abi,
    args,
    eventName,
    fromBlock,
    toBlock,
  }: CreateContractEventFilterParameters<TAbi, TEventName, TArgs>,
): Promise<CreateContractEventFilterReturnType<TAbi, TEventName, TArgs>> {
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
    type: 'event',
  } as unknown as CreateContractEventFilterReturnType<TAbi, TEventName, TArgs>
}
