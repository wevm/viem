// TODO(v3): checksum address.

import type { Abi, AbiEvent, AbiEventParameter, Address } from 'abitype'
import type { ErrorType } from '../../errors/utils.js'
import type { ContractEventName, GetEventArgs } from '../../types/contract.js'
import type { Log } from '../../types/log.js'
import type { RpcLog } from '../../types/rpc.js'
import { isAddressEqual } from '../address/isAddressEqual.js'
import { toBytes } from '../encoding/toBytes.js'
import { keccak256 } from '../hash/keccak256.js'
import { toEventSelector } from '../hash/toEventSelector.js'
import {
  type DecodeEventLogErrorType,
  decodeEventLog,
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

  const abiTopics = (abi as Abi)
    .filter((abiItem) => abiItem.type === 'event')
    .map((abiItem) => ({
      abi: abiItem,
      selector: toEventSelector(abiItem),
    }))

  return logs
    .map((log) => {
      // Find all matching ABI items with the same selector.
      // Multiple events can share the same selector but differ in indexed parameters
      // (e.g., ERC20 vs ERC721 Transfer events).
      const abiItems = abiTopics.filter(
        (abiTopic) => log.topics[0] === abiTopic.selector,
      )
      if (abiItems.length === 0) return null

      // Try each matching ABI item until one successfully decodes.
      let event: { eventName: string; args: unknown } | undefined
      let abiItem: { abi: AbiEvent; selector: Address } | undefined

      for (const item of abiItems) {
        try {
          event = decodeEventLog({
            ...log,
            abi: [item.abi],
            strict: true,
          })
          abiItem = item
          break
        } catch {
          // Try next ABI item
        }
      }

      // If strict decoding failed for all, and we're in non-strict mode,
      // fall back to the first matching ABI item.
      if (!event && !strict) {
        abiItem = abiItems[0]
        try {
          event = decodeEventLog({
            data: log.data,
            topics: log.topics,
            abi: [abiItem.abi],
            strict: false,
          })
        } catch {
          // If decoding still fails, return partial log in non-strict mode.
          const isUnnamed = abiItem.abi.inputs?.some(
            (x) => !('name' in x && x.name),
          )
          return {
            ...log,
            args: isUnnamed ? [] : {},
            eventName: abiItem.abi.name,
          }
        }
      }

      // If no event was found, return null.
      if (!event || !abiItem) return null

      // Check that the decoded event name matches the provided event name.
      if (eventName && !eventName.includes(event.eventName)) return null

      // Check that the decoded event args match the provided args.
      if (
        !includesArgs({
          args: event.args,
          inputs: abiItem.abi.inputs,
          matchArgs: args,
        })
      )
        return null

      return { ...event, ...log }
    })
    .filter(Boolean) as unknown as ParseEventLogsReturnType<
    abi,
    eventName,
    strict
  >
}

function includesArgs(parameters: {
  args: unknown
  inputs: AbiEvent['inputs']
  matchArgs: unknown
}) {
  const { args, inputs, matchArgs } = parameters

  if (!matchArgs) return true
  if (!args) return false

  function isEqual(input: AbiEventParameter, value: unknown, arg: unknown) {
    try {
      if (input.type === 'address')
        return isAddressEqual(value as Address, arg as Address)
      if (input.type === 'string' || input.type === 'bytes')
        return keccak256(toBytes(value as string)) === arg
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
