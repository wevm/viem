import { Abi, AbiParameter, Narrow } from 'abitype'
import { AbiEventSignatureNotFoundError } from '../../errors'
import {
  EventDefinition,
  ExtractEventArgsFromTopics,
  ExtractEventNameFromAbi,
  Hex,
  LogTopic,
} from '../../types'
import { getEventSignature } from '../hash'
import { decodeAbi } from './decodeAbi'
import { formatAbiItem } from './formatAbiItem'

export type DecodeEventLogArgs<
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

export type DecodeEventLogResponse<
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
}: DecodeEventLogArgs<
  TAbi,
  TEventName,
  TTopics,
  TData
>): DecodeEventLogResponse<TAbi, TEventName, TTopics, TData> {
  const [signature, ...argTopics] = topics
  const abiItem = (abi as Abi).find(
    (x) => signature === getEventSignature(formatAbiItem(x) as EventDefinition),
  )
  if (!(abiItem && 'name' in abiItem))
    throw new AbiEventSignatureNotFoundError(signature, {
      docsPath: '/docs/contract/decodeEventLog',
    })

  const { name, inputs } = abiItem
  const isUnnamed = inputs?.some((x) => !('name' in x && x.name))

  let args: any = isUnnamed ? [] : {}

  // Decode topics (indexed args).
  for (let i = 0; i < inputs.length; i++) {
    const param = inputs[i]
    const topic = argTopics[i]
    if (topic === null) args[param.name || i] = null
    if (!topic) continue
    if (Array.isArray(topic)) {
      args[param.name || i] = topic.map((t) => decodeTopic({ param, value: t }))
    } else {
      args[param.name || i] = decodeTopic({ param, value: topic })
    }
  }

  // Decode data (non-indexed args).
  if (data) {
    const params = inputs.filter((x) => !('indexed' in x && x.indexed))
    const decodedData = decodeAbi({ params, data })
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
  } as unknown as DecodeEventLogResponse<TAbi, TEventName, TTopics, TData>
}

function decodeTopic({ param, value }: { param: AbiParameter; value: Hex }) {
  if (
    param.type === 'string' ||
    param.type === 'bytes' ||
    param.type === 'tuple' ||
    param.type.match(/^(.*)\[(\d+)?\]$/)
  )
    return value
  const decodedArg = decodeAbi({ params: [param], data: value }) || []
  return decodedArg[0]
}
