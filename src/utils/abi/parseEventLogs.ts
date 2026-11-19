// TODO(v3): checksum address.

import type { Abi, AbiEvent, AbiEventParameter, Address } from 'abitype'
import type { ErrorType } from '../../errors/utils.js'
import type { ContractEventName, GetEventArgs } from '../../types/contract.js'
import type { Log } from '../../types/log.js'
import type { Hex } from '../../types/misc.js'
import type { RpcLog } from '../../types/rpc.js'
import { isAddressEqual } from '../address/isAddressEqual.js'
import { stringToBytes, toBytes } from '../encoding/toBytes.js'
import { formatLog } from '../formatters/log.js'
import { keccak256 } from '../hash/keccak256.js'
import { toEventSelector } from '../hash/toEventSelector.js'
import { bytesRegex, integerRegex } from '../regex.js'
import {
  type DecodeEventLogErrorType,
  decodeEventLogWithPlan,
  type EventPlan,
  toEventPlan,
} from './decodeEventLog.js'

export type ParseEventLogsParameters<
  abi extends Abi | readonly unknown[] = Abi,
  eventName extends
    | ContractEventName<abi>
    | ContractEventName<abi>[]
    | undefined = ContractEventName<abi>,
  strict extends boolean | undefined = boolean | undefined,
  ///
  allArgs = GetEventArgs<
    abi,
    eventName extends ContractEventName<abi>
      ? eventName
      : ContractEventName<abi>,
    {
      EnableUnion: true
      IndexedOnly: false
      Required: false
    }
  >,
> = {
  /** Contract ABI. */
  abi: abi
  /** Arguments for the event. */
  args?: allArgs | undefined
  /** Contract event. */
  eventName?:
    | eventName
    | ContractEventName<abi>
    | ContractEventName<abi>[]
    | undefined
  /** List of logs. */
  logs: (Log | RpcLog)[]
  strict?: strict | boolean | undefined
}

export type ParseEventLogsReturnType<
  abi extends Abi | readonly unknown[] = Abi,
  eventName extends
    | ContractEventName<abi>
    | ContractEventName<abi>[]
    | undefined = ContractEventName<abi>,
  strict extends boolean | undefined = boolean | undefined,
  ///
  derivedEventName extends
    | ContractEventName<abi>
    | undefined = eventName extends ContractEventName<abi>[]
    ? eventName[number]
    : eventName,
> = Log<bigint, number, false, undefined, strict, abi, derivedEventName>[]

export type ParseEventLogsErrorType = DecodeEventLogErrorType | ErrorType

/**
 * Extracts & decodes logs matching the provided signature(s) (`abi` + optional `eventName`)
 * from a set of opaque logs.
 *
 * @param parameters - {@link ParseEventLogsParameters}
 * @returns The logs. {@link ParseEventLogsReturnType}
 *
 * @example
 * import { createClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { parseEventLogs } from 'viem/op-stack'
 *
 * const client = createClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const receipt = await getTransactionReceipt(client, {
 *   hash: '0xec23b2ba4bc59ba61554507c1b1bc91649e6586eb2dd00c728e8ed0db8bb37ea',
 * })
 *
 * const logs = parseEventLogs({ logs: receipt.logs })
 * // [{ args: { ... }, eventName: 'TransactionDeposited', ... }, ...]
 */
export function parseEventLogs<
  abi extends Abi | readonly unknown[],
  strict extends boolean | undefined = true,
  eventName extends
    | ContractEventName<abi>
    | ContractEventName<abi>[]
    | undefined = undefined,
>(
  parameters: ParseEventLogsParameters<abi, eventName, strict>,
): ParseEventLogsReturnType<abi, eventName, strict> {
  const { abi, args, logs, strict = true } = parameters

  const eventName = (() => {
    if (!parameters.eventName) return undefined
    if (Array.isArray(parameters.eventName)) return parameters.eventName
    return [parameters.eventName as string]
  })()

  // Selectors map to events in ABI order, so overloads keep their precedence.
  const plans: Plan[] = []
  const bySelector = new Map<Hex, Plan[]>()
  for (const abiItem of abi as Abi) {
    if (abiItem.type !== 'event') continue
    const topic = toEventSelector(abiItem)
    const plan: Plan = { ...toEventPlan(abiItem), topic }
    plans.push(plan)
    if (abiItem.anonymous) continue
    const list = bySelector.get(plan.topic)
    if (list) list.push(plan)
    else bySelector.set(plan.topic, [plan])
  }

  // Nothing in a log identifies an anonymous event, so any log with the same
  // topic count fits it. Anonymous events are only considered when requested:
  // `eventName` names one, or every event in the ABI is anonymous. Otherwise a
  // log from another contract in the same receipt is decoded as the anonymous
  // event.
  const anonymousPlans = (() => {
    if (eventName)
      return plans.filter(
        (item) =>
          item.abiItem.anonymous && eventName.includes(item.abiItem.name),
      )
    if (plans.every((item) => item.abiItem.anonymous)) return plans
    return []
  })()

  const result: unknown[] = []
  for (const log of logs) {
    // Normalize RpcLog (hex-encoded quantities) to Log (bigint/number).
    // When logs come directly from an RPC response (e.g. eth_getLogs),
    // fields like blockNumber are hex strings instead of bigints.
    const formattedLog =
      typeof log.blockNumber === 'string' ? formatLog(log as RpcLog) : log
    const { topics } = formattedLog

    // Non-anonymous events share a signature topic. Several events can share
    // that selector and differ in indexed parameters (ERC-20 vs ERC-721
    // `Transfer`). Check that against the whole ABI before `eventName`, so
    // an anonymous event never claims a log whose signature is known.
    const plansBySelector = bySelector.get(topics[0]!)
    const candidates = (() => {
      if (plansBySelector) {
        if (!eventName) return plansBySelector
        return plansBySelector.filter((item) =>
          eventName.includes(item.abiItem.name),
        )
      }
      // A dynamic ABI value can decode as a static type without throwing, so
      // several anonymous events of the same arity are not guessed.
      const anonymous = anonymousPlans.filter(
        (item) => item.indexedInputs.length === topics.length,
      )
      if (anonymous.length === 1) return anonymous
      return []
    })()
    if (candidates.length === 0) continue

    let event: { eventName: string; args: unknown } | undefined
    let plan: Plan | undefined

    // Try each matching event until one decodes successfully.
    for (const item of candidates) {
      // Strict decoding throws without enough topics, or without data for
      // non-indexed inputs (an ERC-721 `Transfer` against ERC-20's), so skip
      // building that error.
      if (
        topics.length - (item.abiItem.anonymous ? 0 : 1) <
          item.indexedInputs.length ||
        (item.nonIndexedInputs.length > 0 &&
          (!formattedLog.data || formattedLog.data === '0x'))
      )
        continue
      try {
        event = decodeEventLogWithPlan(item, {
          data: formattedLog.data,
          // A log's own `eventName` narrows anonymous events, as before.
          eventName: (formattedLog as { eventName?: string | undefined })
            .eventName,
          strict: true,
          topics,
        })
        plan = item
        break
      } catch {
        // Try the next matching event.
      }
    }

    // In non-strict mode, fall back to the first selector match. Anonymous
    // events have no selector to prove the log came from them.
    if (!event && !strict) {
      const fallback = candidates[0]
      if (!fallback || fallback.abiItem.anonymous) continue
      plan = fallback
      try {
        event = decodeEventLogWithPlan(plan, {
          data: formattedLog.data,
          eventName: undefined,
          strict: false,
          topics,
        })
      } catch {
        // If the log cannot be decoded at all, keep its event name with empty args.
        event = { eventName: plan.abiItem.name, args: plan.isUnnamed ? [] : {} }
      }
    }

    if (!event || !plan) continue

    // Check that the decoded event name matches the provided event name.
    if (eventName && !eventName.includes(event.eventName)) continue

    // Check that the decoded event args match the provided args.
    if (
      !includesArgs({
        anonymous: plan.abiItem.anonymous,
        args: event.args,
        inputs: plan.abiItem.inputs,
        matchArgs: args,
        topics,
      })
    )
      continue

    result.push({ ...event, ...formattedLog })
  }
  return result as unknown as ParseEventLogsReturnType<abi, eventName, strict>
}

/** An event plan plus its selector as `parseEventLogs` matches it. */
type Plan = EventPlan & { topic: Hex }

function includesArgs(parameters: {
  anonymous?: boolean | undefined
  args: unknown
  inputs: AbiEvent['inputs']
  matchArgs: unknown
  topics: Log['topics']
}) {
  const { anonymous, args, inputs, matchArgs, topics } = parameters

  if (!matchArgs) return true
  if (!args) return false

  // Topics hold the signature, then indexed inputs in order. Anonymous events
  // have no signature topic. Non-strict decoding reads indexed inputs without
  // a topic from data.
  const topicInputs = inputs
    .filter((input) => input.indexed)
    .slice(0, anonymous ? topics.length : topics.length - 1)

  function isEqual(input: AbiEventParameter, value: unknown, arg: unknown) {
    try {
      if (input.type === 'address')
        return isAddressEqual(value as Address, arg as Address)
      // `string` and `bytes` topics hold the keccak256 of their contents.
      // Other values are ABI-decoded.
      if (
        topicInputs.includes(input) &&
        (input.type === 'string' || input.type === 'bytes')
      ) {
        const bytes =
          input.type === 'string'
            ? stringToBytes(value as string)
            : toBytes(value as string)
        return keccak256(bytes) === arg
      }
      // Decoded `bytes` and `bytesN` are lowercase hex. Match either case,
      // same as the indexed `bytes` hash path.
      if (
        typeof value === 'string' &&
        typeof arg === 'string' &&
        bytesRegex.test(input.type)
      )
        return value.toLowerCase() === arg.toLowerCase()
      // Normalize number and bigint filters for ABI integer comparison.
      if (
        integerRegex.test(input.type) &&
        (typeof value === 'number' || typeof value === 'bigint') &&
        (typeof arg === 'number' || typeof arg === 'bigint')
      )
        return BigInt(value) === BigInt(arg)
      return value === arg
    } catch {
      return false
    }
  }

  if (Array.isArray(args) && Array.isArray(matchArgs)) {
    return matchArgs.every((value, index) => {
      if (value === null || value === undefined) return true
      const input = inputs[index]
      if (!input) return false
      const value_ = Array.isArray(value) ? value : [value]
      return value_.some((value) => isEqual(input, value, args[index]))
    })
  }

  if (
    typeof args === 'object' &&
    !Array.isArray(args) &&
    typeof matchArgs === 'object' &&
    !Array.isArray(matchArgs)
  )
    return Object.entries(matchArgs).every(([key, value]) => {
      if (value === null || value === undefined) return true
      const input = inputs.find((input) => input.name === key)
      if (!input) return false
      const value_ = Array.isArray(value) ? value : [value]
      return value_.some((value) =>
        isEqual(input, value, (args as Record<string, unknown>)[key]),
      )
    })

  return false
}
