import type {
  Abi,
  AbiParameter,
  AbiParameterToPrimitiveType,
  ExtractAbiEvents,
} from 'abitype'

import {
  AbiEventNotFoundError,
  type AbiEventNotFoundErrorType,
} from '../../errors/abi.js'
import {
  FilterTypeNotSupportedError,
  type FilterTypeNotSupportedErrorType,
} from '../../errors/log.js'
import type { ErrorType } from '../../errors/utils.js'
import type {
  ContractEventArgs,
  ContractEventName,
  EventDefinition,
} from '../../types/contract.js'
import type { Hex } from '../../types/misc.js'
import type { IsNarrowable, UnionEvaluate } from '../../types/utils.js'
import { type ToBytesErrorType, toBytes } from '../encoding/toBytes.js'
import { type Keccak256ErrorType, keccak256 } from '../hash/keccak256.js'
import {
  type ToEventSelectorErrorType,
  toEventSelector,
} from '../hash/toEventSelector.js'
import {
  type EncodeAbiParametersErrorType,
  encodeAbiParameters,
} from './encodeAbiParameters.js'
import { type FormatAbiItemErrorType, formatAbiItem } from './formatAbiItem.js'
import { type GetAbiItemErrorType, getAbiItem } from './getAbiItem.js'

const docsPath = '/docs/contract/encodeEventTopics'

export type EncodeEventTopicsParameters<
  abi extends Abi | readonly unknown[] = Abi,
  eventName extends ContractEventName<abi> | undefined = ContractEventName<abi>,
  ///
  hasEvents = abi extends Abi
    ? Abi extends abi
      ? true
      : [ExtractAbiEvents<abi>] extends [never]
        ? false
        : true
    : true,
  allArgs = ContractEventArgs<
    abi,
    eventName extends ContractEventName<abi>
      ? eventName
      : ContractEventName<abi>
  >,
  allErrorNames = ContractEventName<abi>,
> = {
  abi: abi
  args?: allArgs | undefined
} & UnionEvaluate<
  IsNarrowable<abi, Abi> extends true
    ? abi['length'] extends 1
      ? { eventName?: eventName | allErrorNames | undefined }
      : { eventName: eventName | allErrorNames }
    : { eventName?: eventName | allErrorNames | undefined }
> &
  (hasEvents extends true ? unknown : never)

export type EncodeEventTopicsReturnType = [Hex, ...(Hex | Hex[] | null)[]]

export type EncodeEventTopicsErrorType =
  | AbiEventNotFoundErrorType
  | EncodeArgErrorType
  | FormatAbiItemErrorType
  | GetAbiItemErrorType
  | ToEventSelectorErrorType
  | ErrorType

export function encodeEventTopics<
  const abi extends Abi | readonly unknown[],
  eventName extends ContractEventName<abi> | undefined = undefined,
>(
  parameters: EncodeEventTopicsParameters<abi, eventName>,
): EncodeEventTopicsReturnType {
  const { abi, eventName, args } = parameters as EncodeEventTopicsParameters

  let abiItem = abi[0]
  if (eventName) {
    const item = getAbiItem({ abi, name: eventName })
    if (!item) throw new AbiEventNotFoundError(eventName, { docsPath })
    abiItem = item
  }

  if (abiItem.type !== 'event')
    throw new AbiEventNotFoundError(undefined, { docsPath })

  const definition = formatAbiItem(abiItem)
  const signature = toEventSelector(definition as EventDefinition)

  let topics: (Hex | Hex[] | null)[] = []
  if (args && 'inputs' in abiItem) {
    const indexedInputs = abiItem.inputs?.filter(
      (param) => 'indexed' in param && param.indexed,
    )
    const args_ = Array.isArray(args)
      ? args
      : Object.values(args).length > 0
        ? (indexedInputs?.map((x: any) => (args as any)[x.name]) ?? [])
        : []

    if (args_.length > 0) {
      topics =
        indexedInputs?.map((param, i) => {
          if (Array.isArray(args_[i]))
            return args_[i].map((_: any, j: number) =>
              encodeArg({ param, value: args_[i][j] }),
            )
          return typeof args_[i] !== 'undefined' && args_[i] !== null
            ? encodeArg({ param, value: args_[i] })
            : null
        }) ?? []
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
