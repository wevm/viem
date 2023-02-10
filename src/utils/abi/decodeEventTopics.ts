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

export type DecodeEventTopicsArgs<
  TAbi extends Abi | readonly unknown[] = Abi,
  TEventName extends string = string,
  TTopics extends LogTopic[] = LogTopic[],
> = {
  abi: Narrow<TAbi>
  eventName?: ExtractEventNameFromAbi<TAbi, TEventName>
  topics: [signature: Hex, ...args: TTopics]
}

export type DecodeEventTopicsResponse<
  TAbi extends Abi | readonly unknown[] = Abi,
  TEventName extends string = string,
  TTopics extends LogTopic[] = LogTopic[],
> = {
  eventName: TEventName
} & ExtractEventArgsFromTopics<TAbi, TEventName, TTopics>

export function decodeEventTopics<
  TAbi extends Abi | readonly unknown[],
  TEventName extends string,
  TTopics extends LogTopic[],
>({
  abi,
  topics,
}: DecodeEventTopicsArgs<TAbi, TEventName, TTopics>): DecodeEventTopicsResponse<
  TAbi,
  TEventName,
  TTopics
> {
  const [signature, ...argTopics] = topics
  const abiItem = (abi as Abi).find(
    (x) => signature === getEventSignature(formatAbiItem(x) as EventDefinition),
  )
  if (!(abiItem && 'name' in abiItem))
    throw new AbiEventSignatureNotFoundError(signature, {
      docsPath: '/docs/contract/decodeEventTopics',
    })
  const { name, inputs } = abiItem
  const isUnnamed = inputs?.some((x) => !('name' in x && x.name))
  let args: any = isUnnamed ? [] : {}
  for (let i = 0; i < inputs.length; i++) {
    const param = inputs[i]
    const topic = argTopics[i]
    if (topic === null) args[param.name || i] = null
    if (!topic) continue
    if (Array.isArray(topic)) {
      args[param.name || i] = topic.map((t) => decodeArg({ param, value: t }))
    } else {
      args[param.name || i] = decodeArg({ param, value: topic })
    }
  }
  return {
    eventName: name,
    args: Object.values(args).length > 0 ? args : undefined,
  } as unknown as DecodeEventTopicsResponse<TAbi, TEventName, TTopics>
}

function decodeArg({ param, value }: { param: AbiParameter; value: Hex }) {
  if (
    param.type === 'string' ||
    param.type === 'bytes' ||
    param.type === 'tuple' ||
    param.type.match(/^(.*)\[(\d+)?\]$/)
  )
    return value
  const decodedArg = decodeAbi({ params: [param], data: value })
  if (!decodedArg) return
  return decodedArg[0]
}
