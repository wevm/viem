import type { Abi, AbiEvent, AbiParameter } from 'abitype'

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
import { BaseError } from '../../errors/base.js'
import { PositionOutOfBoundsError } from '../../errors/cursor.js'
import type { ErrorType } from '../../errors/utils.js'
import type {
  ContractEventArgsFromTopics,
  ContractEventName,
  EventDefinition,
} from '../../types/contract.js'
import type { Hex } from '../../types/misc.js'
import type {
  IsNarrowable,
  Prettify,
  UnionEvaluate,
} from '../../types/utils.js'
import { size } from '../data/size.js'
import {
  type ToEventSelectorErrorType,
  toEventSelector,
} from '../hash/toEventSelector.js'
import {
  type DecodeAbiParametersErrorType,
  decodeAbiParameters,
} from './decodeAbiParameters.js'
import { type FormatAbiItemErrorType, formatAbiItem } from './formatAbiItem.js'

export type DecodeEventLogParameters<
  abi extends Abi | readonly unknown[] = Abi,
  eventName extends ContractEventName<abi> | undefined = ContractEventName<abi>,
  topics extends Hex[] = Hex[],
  data extends Hex | undefined = undefined,
  strict extends boolean = true,
> = {
  abi: abi
  data?: data | undefined
  eventName?: eventName | ContractEventName<abi> | undefined
  strict?: strict | boolean | undefined
  topics: [signature: Hex, ...args: topics] | []
}

export type DecodeEventLogReturnType<
  abi extends Abi | readonly unknown[] = Abi,
  eventName extends ContractEventName<abi> | undefined = ContractEventName<abi>,
  topics extends Hex[] = Hex[],
  data extends Hex | undefined = undefined,
  strict extends boolean = true,
  ///
  allEventNames extends
    ContractEventName<abi> = eventName extends ContractEventName<abi>
    ? eventName
    : ContractEventName<abi>,
> = IsNarrowable<abi, Abi> extends true
  ? {
      [name in allEventNames]: Prettify<
        {
          eventName: name
        } & UnionEvaluate<
          ContractEventArgsFromTopics<abi, name, strict> extends infer allArgs
            ? topics extends readonly []
              ? data extends undefined
                ? { args?: undefined }
                : { args?: allArgs | undefined }
              : { args: allArgs }
            : never
        >
      >
    }[allEventNames]
  : {
      eventName: eventName
      args: readonly unknown[] | undefined
    }

export type DecodeEventLogErrorType =
  | AbiDecodingDataSizeTooSmallErrorType
  | AbiEventAmbiguityErrorType
  | AbiEventSignatureEmptyTopicsErrorType
  | AbiEventSignatureNotFoundErrorType
  | DecodeAbiParametersErrorType
  | DecodeLogTopicsMismatchErrorType
  | DecodeLogDataMismatchErrorType
  | FormatAbiItemErrorType
  | ToEventSelectorErrorType
  | ErrorType

const docsPath = '/docs/contract/decodeEventLog'

export function decodeEventLog<
  const abi extends Abi | readonly unknown[],
  eventName extends ContractEventName<abi> | undefined = undefined,
  topics extends Hex[] = Hex[],
  data extends Hex | undefined = undefined,
  strict extends boolean = true,
>(
  parameters: DecodeEventLogParameters<abi, eventName, topics, data, strict>,
): DecodeEventLogReturnType<abi, eventName, topics, data, strict> {
  const {
    abi,
    data,
    eventName,
    strict: strict_,
    topics,
  } = parameters as DecodeEventLogParameters

  const strict = strict_ ?? true
  const events = abi.filter(
    (item): item is AbiEvent => item.type === 'event' && 'name' in item,
  )
  // Anonymous events omit the signature topic, so `topics[0]` is an indexed
  // argument. A signature match still wins when the log has one.
  const signature = topics[0]
  const bySelector = signature
    ? events.find(
        (item) =>
          !item.anonymous &&
          signature === toEventSelector(formatAbiItem(item) as EventDefinition),
      )
    : undefined
  const candidates = bySelector
    ? [bySelector]
    : anonymousCandidates(events, topics.length, eventName)

  if (candidates.length > 1)
    throw new AbiEventAmbiguityError(candidates.map((item) => item.name))
  const abiItem = candidates[0]
  if (!abiItem) {
    if (!signature) throw new AbiEventSignatureEmptyTopicsError({ docsPath })
    throw new AbiEventSignatureNotFoundError(signature, { docsPath })
  }

  return decodeMatchedEventLog({
    abiItem,
    argTopics: abiItem.anonymous ? topics : topics.slice(1),
    data,
    strict,
  }) as DecodeEventLogReturnType<abi, eventName, topics, data, strict>
}

function anonymousCandidates(
  events: readonly AbiEvent[],
  topicCount: number,
  eventName: string | undefined,
) {
  // Nothing in a log identifies an anonymous event, so any log with the same
  // topic count fits it. Anonymous events are only considered when requested:
  // `eventName` names one, or every event in the ABI is anonymous. Otherwise a
  // log from another contract is decoded as the anonymous event.
  const requested = (() => {
    if (eventName) return events.filter((item) => item.name === eventName)
    if (events.every((item) => item.anonymous)) return events
    return []
  })()
  // `eventName` does not skip the arity check, or a same-name overload with
  // extra topics is guessed.
  return requested.filter(
    (item) => item.anonymous && indexedCount(item) === topicCount,
  )
}

function indexedCount(item: AbiEvent) {
  return item.inputs?.filter((input) => input.indexed).length ?? 0
}

function decodeMatchedEventLog({
  abiItem,
  argTopics,
  data,
  strict,
}: {
  abiItem: AbiEvent
  argTopics: readonly Hex[]
  data: Hex | undefined
  strict: boolean
}): DecodeEventLogReturnType {
  const { name, inputs } = abiItem
  const isUnnamed = inputs?.some((x) => !('name' in x && x.name))

  const args: any = isUnnamed ? [] : {}

  // Decode topics (indexed args).
  const indexedInputs = inputs
    .map((x, i) => [x, i] as const)
    .filter(([x]) => 'indexed' in x && x.indexed)

  const missingIndexedInputs: [AbiParameter, number][] = []

  for (let i = 0; i < indexedInputs.length; i++) {
    const [param, argIndex] = indexedInputs[i]
    const topic = argTopics[i]
    if (!topic) {
      if (strict)
        throw new DecodeLogTopicsMismatch({
          abiItem,
          param: param as AbiParameter & { indexed: boolean },
        })
      // Track missing indexed inputs to decode from data when strict is false
      missingIndexedInputs.push([param, argIndex])
      continue
    }
    args[isUnnamed ? argIndex : param.name || argIndex] = decodeTopic({
      param,
      value: topic,
    })
  }

  // Decode data (non-indexed args + missing indexed args when strict is false).
  const nonIndexedInputs = inputs.filter((x) => !('indexed' in x && x.indexed))

  // When strict is false, missing indexed inputs should be decoded from data
  const inputsToDecode = strict
    ? nonIndexedInputs
    : [...missingIndexedInputs.map(([param]) => param), ...nonIndexedInputs]

  if (inputsToDecode.length > 0) {
    if (data && data !== '0x') {
      try {
        const decodedData = decodeAbiParameters(
          inputsToDecode,
          data,
        ) as unknown[]
        if (decodedData) {
          let dataIndex = 0
          // First, assign missing indexed parameters (when strict is false)
          if (!strict) {
            for (const [param, argIndex] of missingIndexedInputs) {
              args[isUnnamed ? argIndex : param.name || argIndex] =
                decodedData[dataIndex++]
            }
          }
          // Then, assign non-indexed parameters
          if (isUnnamed) {
            for (let i = 0; i < inputs.length; i++)
              if (args[i] === undefined && dataIndex < decodedData.length)
                args[i] = decodedData[dataIndex++]
          } else
            for (let i = 0; i < nonIndexedInputs.length; i++)
              args[nonIndexedInputs[i].name!] = decodedData[dataIndex++]
        }
      } catch (err) {
        if (strict) {
          if (
            err instanceof AbiDecodingDataSizeTooSmallError ||
            err instanceof PositionOutOfBoundsError
          )
            throw new DecodeLogDataMismatch({
              abiItem,
              data: data,
              params: inputsToDecode,
              size: size(data),
            })
          throw err
        }
      }
    } else if (strict) {
      throw new DecodeLogDataMismatch({
        abiItem,
        data: '0x',
        params: inputsToDecode,
        size: 0,
      })
    }
  }

  return {
    eventName: name,
    args: Object.values(args).length > 0 ? args : undefined,
  } as DecodeEventLogReturnType
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

/** Error type thrown when an anonymous event log matches more than one event. */
export type AbiEventAmbiguityErrorType = AbiEventAmbiguityError & {
  name: 'AbiEventAmbiguityError'
}
/**
 * Thrown by {@link decodeEventLog} when an anonymous event log fits more than
 * one requested anonymous event with the same number of indexed inputs.
 */
export class AbiEventAmbiguityError extends BaseError {
  constructor(eventNames: readonly string[]) {
    // `eventName` cannot choose between overloads that share a name, so those
    // need an ABI narrowed to one event.
    const distinct = new Set(eventNames).size === eventNames.length
    super('Ambiguous anonymous event log.', {
      docsPath,
      metaMessages: [
        `Matched ${eventNames.map((name) => `\`${name}\``).join(', ')}.`,
        'These events take the same number of indexed topics.',
        distinct
          ? 'Pass `eventName` to choose one.'
          : 'Pass an `abi` that holds only the event to decode.',
      ],
      name: 'AbiEventAmbiguityError',
    })
  }
}
