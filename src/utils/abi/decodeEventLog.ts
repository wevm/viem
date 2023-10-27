import type { Abi, AbiParameter, ExtractAbiEventNames } from 'abitype'

import {
  AbiDecodingDataSizeTooSmallError,
  type AbiDecodingDataSizeTooSmallErrorType,
  AbiEventSignatureEmptyTopicsError,
  type AbiEventSignatureEmptyTopicsErrorType,
  AbiEventSignatureNotFoundError,
  type AbiEventSignatureNotFoundErrorType,
  DecodeLogDataMismatch,
  type DecodeLogDataMismatchErrorType,
  DecodeLogTopicsMismatch,
  type DecodeLogTopicsMismatchErrorType,
} from '../../errors/abi.js'
import type {
  EventDefinition,
  GetEventArgsFromTopics,
  InferEventName,
} from '../../types/contract.js'
import type { Hex } from '../../types/misc.js'
import type { Prettify } from '../../types/utils.js'
import {
  type GetEventSelectorErrorType,
  getEventSelector,
} from '../hash/getEventSelector.js'

import type { ErrorType } from '../../errors/utils.js'
import {
  type DecodeAbiParametersErrorType,
  decodeAbiParameters,
} from './decodeAbiParameters.js'
import { type FormatAbiItemErrorType, formatAbiItem } from './formatAbiItem.js'

export type DecodeEventLogParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
  TEventName extends string | undefined = string,
  TTopics extends Hex[] = Hex[],
  TData extends Hex | undefined = undefined,
  TStrict extends boolean = true,
> = {
  abi: TAbi
  data?: TData
  eventName?: InferEventName<TAbi, TEventName>
  strict?: TStrict
  topics: [signature: Hex, ...args: TTopics] | []
}

export type DecodeEventLogReturnType<
  TAbi extends Abi | readonly unknown[] = Abi,
  TEventName extends string | undefined = string,
  TTopics extends Hex[] = Hex[],
  TData extends Hex | undefined = undefined,
  TStrict extends boolean = true,
  _EventNames extends string = TAbi extends Abi
    ? Abi extends TAbi
      ? string
      : ExtractAbiEventNames<TAbi>
    : string,
> = TEventName extends _EventNames[number]
  ? Prettify<
      {
        eventName: TEventName
      } & GetEventArgsFromTopics<TAbi, TEventName, TTopics, TData, TStrict>
    >
  : {
      [TName in _EventNames]: Prettify<
        {
          eventName: TName
        } & GetEventArgsFromTopics<TAbi, TName, TTopics, TData, TStrict>
      >
    }[_EventNames]

export type DecodeEventLogErrorType =
  | AbiDecodingDataSizeTooSmallErrorType
  | AbiEventSignatureEmptyTopicsErrorType
  | AbiEventSignatureNotFoundErrorType
  | DecodeAbiParametersErrorType
  | DecodeLogTopicsMismatchErrorType
  | DecodeLogDataMismatchErrorType
  | FormatAbiItemErrorType
  | GetEventSelectorErrorType
  | ErrorType

const docsPath = '/docs/contract/decodeEventLog'

export function decodeEventLog<
  const TAbi extends Abi | readonly unknown[],
  TEventName extends string | undefined = undefined,
  TTopics extends Hex[] = Hex[],
  TData extends Hex | undefined = undefined,
  TStrict extends boolean = true,
>({
  abi,
  data,
  strict: strict_,
  topics,
}: DecodeEventLogParameters<
  TAbi,
  TEventName,
  TTopics,
  TData,
  TStrict
>): DecodeEventLogReturnType<TAbi, TEventName, TTopics, TData, TStrict> {
  const strict = strict_ ?? true
  const [signature, ...argTopics] = topics
  if (!signature)
    throw new AbiEventSignatureEmptyTopicsError({
      docsPath,
    })
  const abiItem = (abi as Abi).find(
    (x) =>
      x.type === 'event' &&
      signature === getEventSelector(formatAbiItem(x) as EventDefinition),
  )
  if (!(abiItem && 'name' in abiItem) || abiItem.type !== 'event')
    throw new AbiEventSignatureNotFoundError(signature, {
      docsPath,
    })

  const { name, inputs } = abiItem
  const isUnnamed = inputs?.some((x) => !('name' in x && x.name))

  let args: any = isUnnamed ? [] : {}

  // Decode topics (indexed args).
  const indexedInputs = inputs.filter((x) => 'indexed' in x && x.indexed)
  for (let i = 0; i < indexedInputs.length; i++) {
    const param = indexedInputs[i]
    const topic = argTopics[i]
    if (!topic)
      throw new DecodeLogTopicsMismatch({
        abiItem,
        param: param as AbiParameter & { indexed: boolean },
      })
    args[param.name || i] = decodeTopic({ param, value: topic })
  }

  // Decode data (non-indexed args).
  const nonIndexedInputs = inputs.filter((x) => !('indexed' in x && x.indexed))
  if (nonIndexedInputs.length > 0) {
    if (data && data !== '0x') {
      try {
        const decodedData = decodeAbiParameters(nonIndexedInputs, data)
        if (decodedData) {
          if (isUnnamed) args = [...args, ...decodedData]
          else {
            for (let i = 0; i < nonIndexedInputs.length; i++) {
              args[nonIndexedInputs[i].name!] = decodedData[i]
            }
          }
        }
      } catch (err) {
        if (strict) {
          if (err instanceof AbiDecodingDataSizeTooSmallError)
            throw new DecodeLogDataMismatch({
              abiItem,
              data: err.data,
              params: err.params,
              size: err.size,
            })
          throw err
        }
      }
    } else if (strict) {
      throw new DecodeLogDataMismatch({
        abiItem,
        data: '0x',
        params: nonIndexedInputs,
        size: 0,
      })
    }
  }

  return {
    eventName: name,
    args: Object.values(args).length > 0 ? args : undefined,
  } as unknown as DecodeEventLogReturnType<
    TAbi,
    TEventName,
    TTopics,
    TData,
    TStrict
  >
}

function decodeTopic({ param, value }: { param: AbiParameter; value: Hex }) {
  if (
    param.type === 'string' ||
    param.type === 'bytes' ||
    param.type === 'tuple' ||
    param.type.match(/^(.*)\[(\d+)?\]$/)
  )
    return value
  const decodedArg = decodeAbiParameters([param], value) || []
  return decodedArg[0]
}
