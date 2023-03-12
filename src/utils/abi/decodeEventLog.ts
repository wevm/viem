import { Abi, AbiParameter, Narrow } from 'abitype'
import { AbiEventSignatureNotFoundError } from '../../errors'
import {
  EventDefinition,
  ExtractEventArgsFromTopics,
  ExtractEventNameFromAbi,
  Hex,
  LogTopic,
} from '../../types'
import { getEventSelector } from '../hash'
import { decodeAbiParameters } from './decodeAbiParameters'
import { formatAbiItem } from './formatAbiItem'

export type DecodeEventLogParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
  TEventName extends string = string,
  TTopics extends LogTopic[] = LogTopic[],
  TData extends Hex | undefined = undefined,
> = {
  abi: Narrow<TAbi>
  data?: TData
  eventName?: ExtractEventNameFromAbi<TAbi, TEventName>
  topics: [signature: Hex, ...args: TTopics]
}

export type DecodeEventLogReturnType<
  TAbi extends Abi | readonly unknown[] = Abi,
  TEventName extends string = string,
  TTopics extends LogTopic[] = LogTopic[],
  TData extends Hex | undefined = undefined,
> = {
  eventName: TEventName
} & ExtractEventArgsFromTopics<TAbi, TEventName, TTopics, TData>

export function decodeEventLog<
  TAbi extends Abi | readonly unknown[],
  TEventName extends string,
  TTopics extends LogTopic[],
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
  const abiItem = (abi as Abi).find(
    (x) =>
      x.type === 'event' &&
      signature === getEventSelector(formatAbiItem(x) as EventDefinition),
  )
  if (!(abiItem && 'name' in abiItem))
    throw new AbiEventSignatureNotFoundError(signature, {
      docsPath: '/docs/contract/decodeEventLog',
    })

  const { name, inputs } = abiItem
  const isUnnamed = inputs?.some((x) => !('name' in x && x.name))

  let args: any = isUnnamed ? [] : {}

  // Decode topics (indexed args).
  const indexedInputs = inputs.filter((x) => 'indexed' in x && x.indexed)
  for (let i = 0; i < indexedInputs.length; i++) {
    const param = indexedInputs[i]
    const topic = argTopics[i]
    if (topic === null) {
      args[param.name || i] = null
      continue
    }
    if (!topic) {
      throw new Error(`expected a topic for the indexed input ${i}`)
    }
    if (Array.isArray(topic)) {
      args[param.name || i] = topic.map((t) => decodeTopic({ param, value: t }))
    } else {
      args[param.name || i] = decodeTopic({ param, value: topic })
    }
  }

  // Decode data (non-indexed args).
  if (data && data !== '0x') {
    const params = inputs.filter((x) => !('indexed' in x && x.indexed))
    const decodedData = decodeAbiParameters(params, data)
    if (decodedData) {
      if (isUnnamed) args = [...args, ...decodedData]
      else {
        for (let i = 0; i < params.length; i++) {
          args[params[i].name!] = decodedData[i]
        }
      }
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
