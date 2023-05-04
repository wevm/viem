import type {
  Abi,
  AbiParameter,
  AbiParameterToPrimitiveType,
  Narrow,
} from 'abitype'

import {
  AbiEventNotFoundError,
  FilterTypeNotSupportedError,
} from '../../errors/index.js'
import type {
  AbiItem,
  EventDefinition,
  GetEventArgs,
  Hex,
  InferEventName,
} from '../../types/index.js'
import { toBytes } from '../encoding/index.js'
import { getEventSelector, keccak256 } from '../hash/index.js'
import { encodeAbiParameters } from './encodeAbiParameters.js'
import { formatAbiItem } from './formatAbiItem.js'
import { getAbiItem } from './getAbiItem.js'
import type { GetAbiItemParameters } from './getAbiItem.js'

export type EncodeEventTopicsParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
  TEventName extends string | undefined = string,
  _EventName = InferEventName<TAbi, TEventName>,
> = {
  eventName?: _EventName | undefined
} & (TEventName extends string
  ? { abi: Narrow<TAbi>; args?: GetEventArgs<TAbi, TEventName> | undefined }
  : _EventName extends string
  ? {
      abi: [Narrow<TAbi[number]>]
      args?: GetEventArgs<TAbi, _EventName> | undefined
    }
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
