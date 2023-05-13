import type {
  Abi,
  AbiParameter,
  AbiParameterToPrimitiveType,
  Narrow,
} from 'abitype'

import { AbiEventNotFoundError } from '../../errors/abi.js'
import { FilterTypeNotSupportedError } from '../../errors/log.js'
import type {
  AbiItem,
  EventDefinition,
  GetEventArgs,
  InferEventName,
} from '../../types/contract.js'
import type { Hex } from '../../types/misc.js'
import { toBytes } from '../encoding/toBytes.js'
import { getEventSelector } from '../hash/getEventSelector.js'
import { keccak256 } from '../hash/keccak256.js'

import { encodeAbiParameters } from './encodeAbiParameters.js'
import { formatAbiItem } from './formatAbiItem.js'
import { type GetAbiItemParameters, getAbiItem } from './getAbiItem.js'

export type EncodeEventTopicsParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
  TEventName extends string | undefined = string,
  _EventName = InferEventName<TAbi, TEventName>,
> = {
  eventName?: _EventName
} & (TEventName extends string
  ? { abi: Narrow<TAbi>; args?: GetEventArgs<TAbi, TEventName> }
  : _EventName extends string
  ? { abi: [Narrow<TAbi[number]>]; args?: GetEventArgs<TAbi, _EventName> }
  : never)

export function encodeEventTopics<
  TAbi extends Abi | readonly unknown[],
  TEventName extends string | undefined = undefined,
>({ abi, eventName, args }: EncodeEventTopicsParameters<TAbi, TEventName>) {
  let abiItem = abi[0] as AbiItem
  if (eventName) {
    abiItem = getAbiItem({
      abi,
      args,
      name: eventName,
    } as GetAbiItemParameters)
    if (!abiItem)
      throw new AbiEventNotFoundError(eventName, {
        docsPath: '/docs/contract/encodeEventTopics',
      })
  }

  if (abiItem.type !== 'event')
    throw new AbiEventNotFoundError(undefined, {
      docsPath: '/docs/contract/encodeEventTopics',
    })

  const definition = formatAbiItem(abiItem)
  const signature = getEventSelector(definition as EventDefinition)

  let topics: Hex[] = []
  if (args && 'inputs' in abiItem) {
    const indexedInputs = abiItem.inputs?.filter(
      (param) => 'indexed' in param && param.indexed,
    )
    const args_ = Array.isArray(args)
      ? args
      : indexedInputs?.map((x: any) => (args as any)[x.name]) ?? []
    topics =
      indexedInputs?.map((param, i) =>
        Array.isArray(args_[i])
          ? args_[i].map((_: any, j: number) =>
              encodeArg({ param, value: args_[i][j] }),
            )
          : args_[i]
          ? encodeArg({ param, value: args_[i] })
          : null,
      ) ?? []
  }
  return [signature, ...topics]
}

function encodeArg({
  param,
  value,
}: { param: AbiParameter; value: AbiParameterToPrimitiveType<AbiParameter> }) {
  if (param.type === 'string' || param.type === 'bytes')
    return keccak256(toBytes(value as string))
  if (param.type === 'tuple' || param.type.match(/^(.*)\[(\d+)?\]$/))
    throw new FilterTypeNotSupportedError(param.type)
  return encodeAbiParameters([param], [value])
}
