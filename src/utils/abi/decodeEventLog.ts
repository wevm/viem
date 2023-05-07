import type { Abi, AbiParameter, ExtractAbiEventNames, Narrow } from 'abitype'

import {
  AbiDecodingDataSizeTooSmallError,
  AbiEventSignatureEmptyTopicsError,
  AbiEventSignatureNotFoundError,
  DecodeLogDataMismatch,
  DecodeLogTopicsMismatch,
} from '../../errors/abi.js'
import type {
  EventDefinition,
  GetEventArgsFromTopics,
  InferEventName,
} from '../../types/contract.js'
import type { Hex } from '../../types/misc.js'
import type { Prettify } from '../../types/utils.js'
import { getEventSelector } from '../hash/getEventSelector.js'

import { decodeAbiParameters } from './decodeAbiParameters.js'
import { formatAbiItem } from './formatAbiItem.js'

export type DecodeEventLogParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
  TEventName extends string | undefined = string,
  TTopics extends Hex[] = Hex[],
  TData extends Hex | undefined = undefined,
> = {
  abi: Narrow<TAbi>
  data?: TData
  eventName?: InferEventName<TAbi, TEventName>
  topics: [signature: Hex, ...args: TTopics] | []
}

export type DecodeEventLogReturnType<
  TAbi extends Abi | readonly unknown[] = Abi,
  TEventName extends string | undefined = string,
  TTopics extends Hex[] = Hex[],
  TData extends Hex | undefined = undefined,
  _EventNames extends string = TAbi extends Abi
    ? Abi extends TAbi
      ? string
      : ExtractAbiEventNames<TAbi>
    : string,
> = TEventName extends _EventNames[number]
  ? Prettify<
      {
        eventName: TEventName
      } & GetEventArgsFromTopics<TAbi, TEventName, TTopics, TData>
    >
  : {
      [TName in _EventNames]: Prettify<
        {
          eventName: TName
        } & GetEventArgsFromTopics<TAbi, TName, TTopics, TData>
      >
    }[_EventNames]

const docsPath = '/docs/contract/decodeEventLog'

export function decodeEventLog<
  TAbi extends Abi | readonly unknown[],
  TEventName extends string | undefined = undefined,
  TTopics extends Hex[] = Hex[],
  TData extends Hex | undefined = undefined,
>({
  abi,
  data,
  topics,
}: DecodeEventLogParameters<
  TAbi,
  TEventName,
  TTopics,
  TData
>): DecodeEventLogReturnType<TAbi, TEventName, TTopics, TData> {
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
  if (!(abiItem && 'name' in abiItem))
    throw new AbiEventSignatureNotFoundError(signature, {
      docsPath,
    })

  const { name, inputs } = abiItem
  const isUnnamed = inputs?.some((x) => !('name' in x && x.name))

  let args: any = isUnnamed ? [] : {}

  // Decode topics (indexed args).
  if (argTopics.length > 0) {
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
  }

  // Decode data (non-indexed args).
  if (data && data !== '0x') {
    const params = inputs.filter((x) => !('indexed' in x && x.indexed))
    try {
      const decodedData = decodeAbiParameters(params, data)
      if (decodedData) {
        if (isUnnamed) args = [...args, ...decodedData]
        else {
          for (let i = 0; i < params.length; i++) {
            args[params[i].name!] = decodedData[i]
          }
        }
      }
    } catch (err) {
      if (err instanceof AbiDecodingDataSizeTooSmallError)
        throw new DecodeLogDataMismatch({
          data: err.data,
          params: err.params,
          size: err.size,
        })
      throw err
    }
  }

  return {
    eventName: name,
    args: Object.values(args).length > 0 ? args : undefined,
  } as unknown as DecodeEventLogReturnType<TAbi, TEventName, TTopics, TData>
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
