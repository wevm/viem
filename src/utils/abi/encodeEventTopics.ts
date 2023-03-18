import type {
  Abi,
  AbiParameter,
  AbiParameterToPrimitiveType,
  Narrow,
} from 'abitype'

import {
  AbiEventNotFoundError,
  FilterTypeNotSupportedError,
} from '../../errors'
import type {
  EventDefinition,
  ExtractEventArgsFromAbi,
  ExtractEventNameFromAbi,
  Hex,
} from '../../types'
import { toBytes } from '../encoding'
import { getEventSelector, keccak256 } from '../hash'
import { encodeAbiParameters } from './encodeAbiParameters'
import { formatAbiItem } from './formatAbiItem'
import { getAbiItem, GetAbiItemParameters } from './getAbiItem'

export type EncodeEventTopicsParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
  TEventName extends string = string,
> = {
  abi: Narrow<TAbi>
  args?: ExtractEventArgsFromAbi<TAbi, TEventName>
  eventName: ExtractEventNameFromAbi<TAbi, TEventName>
}

export function encodeEventTopics<
  TAbi extends Abi | readonly unknown[],
  TEventName extends string,
>({ abi, eventName, args }: EncodeEventTopicsParameters<TAbi, TEventName>) {
  const abiItem = getAbiItem({
    abi,
    args,
    name: eventName,
  } as GetAbiItemParameters)
  if (!abiItem)
    throw new AbiEventNotFoundError(eventName, {
      docsPath: '/docs/contract/encodeEventTopics',
    })
  const definition = formatAbiItem(abiItem)
  const signature = getEventSelector(definition as EventDefinition)

  let topics: Hex[] = []
  if (args && 'inputs' in abiItem) {
    const args_ = Array.isArray(args)
      ? args
      : abiItem.inputs?.map((x: any) => (args as any)[x.name]) ?? []
    topics =
      abiItem.inputs
        ?.filter((param) => 'indexed' in param && param.indexed)
        .map((param, i) =>
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
