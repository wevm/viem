import type { Abi, AbiParameter, AbiParameterToPrimitiveType } from 'abitype'

import {
  AbiEventNotFoundError,
  type AbiEventNotFoundErrorType,
} from '../../errors/abi.js'
import {
  FilterTypeNotSupportedError,
  type FilterTypeNotSupportedErrorType,
} from '../../errors/log.js'
import type {
  AbiItem,
  EventDefinition,
  GetEventArgs,
  InferEventName,
} from '../../types/contract.js'
import type { Hex } from '../../types/misc.js'
import { type ToBytesErrorType, toBytes } from '../encoding/toBytes.js'
import {
  type GetEventSelectorErrorType,
  getEventSelector,
} from '../hash/getEventSelector.js'
import { type Keccak256ErrorType, keccak256 } from '../hash/keccak256.js'

import type { ErrorType } from '../../errors/utils.js'
import {
  type EncodeAbiParametersErrorType,
  encodeAbiParameters,
} from './encodeAbiParameters.js'
import { type FormatAbiItemErrorType, formatAbiItem } from './formatAbiItem.js'
import { type GetAbiItemParameters, getAbiItem } from './getAbiItem.js'

export type EncodeEventTopicsParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
  TEventName extends string | undefined = string,
  _EventName = InferEventName<TAbi, TEventName>,
> = {
  eventName?: _EventName
} & (TEventName extends string
  ? { abi: TAbi; args?: GetEventArgs<TAbi, TEventName> }
  : _EventName extends string
    ? { abi: [TAbi[number]]; args?: GetEventArgs<TAbi, _EventName> }
    : never)

export type EncodeEventTopicsErrorType =
  | AbiEventNotFoundErrorType
  | EncodeArgErrorType
  | FormatAbiItemErrorType
  | GetEventSelectorErrorType
  | ErrorType

export function encodeEventTopics<
  const TAbi extends Abi | readonly unknown[],
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
      : Object.values(args).length > 0
        ? indexedInputs?.map((x: any) => (args as any)[x.name]) ?? []
        : []

    if (args_.length > 0) {
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
  }
  return [signature, ...topics]
}

export type EncodeArgErrorType =
  | Keccak256ErrorType
  | ToBytesErrorType
  | EncodeAbiParametersErrorType
  | FilterTypeNotSupportedErrorType
  | ErrorType

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
