import type { Abi } from 'abitype'
import type { ErrorType } from '../../errors/utils.js'
import {
  AbiEventSignatureNotFoundError,
  DecodeLogDataMismatch,
  DecodeLogTopicsMismatch,
  type RpcLog,
} from '../../index.js'
import type { ContractEventName } from '../../types/contract.js'
import type { Log } from '../../types/log.js'
import {
  type DecodeEventLogErrorType,
  decodeEventLog,
} from './decodeEventLog.js'

export type ExtractEventLogsParameters<
  abi extends Abi | readonly unknown[] = Abi,
  eventName extends string | undefined = ContractEventName<abi>,
  strict extends boolean | undefined = boolean | undefined,
> = {
  /** Contract ABI. */
  abi: abi
  /** Contract event. */
  eventName?: eventName | ContractEventName<abi> | undefined
  /** List of logs. */
  logs: (Log | RpcLog)[]
  strict?: strict | boolean | undefined
}

export type ExtractEventLogsReturnType<
  abi extends Abi | readonly unknown[] = Abi,
  eventName extends string | undefined = ContractEventName<abi>,
  strict extends boolean | undefined = boolean | undefined,
> = Log<bigint, number, false, undefined, strict, abi, eventName>[]

export type ExtractEventLogsErrorType = DecodeEventLogErrorType | ErrorType

/**
 * Extracts & decodes logs matching the provided signature(s) (`abi` + optional `eventName`)
 * from a set of opaque logs.
 *
 * @param parameters - {@link ExtractEventLogsParameters}
 * @returns The logs. {@link ExtractEventLogsReturnType}
 *
 * @example
 * import { createClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { extractEventLogs } from 'viem/op-stack'
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
 * const logs = extractEventLogs({ logs: receipt.logs })
 * // [{ args: { ... }, eventName: 'TransactionDeposited', ... }, ...]
 */
export function extractEventLogs<
  abi extends Abi | readonly unknown[],
  strict extends boolean | undefined,
  eventName extends ContractEventName<abi> | undefined = undefined,
>({
  abi,
  eventName,
  logs,
  strict = true,
}: ExtractEventLogsParameters<
  abi,
  eventName,
  strict
>): ExtractEventLogsReturnType<abi, eventName, strict> {
  return logs
    .map((log) => {
      try {
        const event = decodeEventLog({
          ...log,
          abi,
          strict,
        })
        if (eventName && event.eventName !== eventName) return null
        return { ...event, ...log }
      } catch (err) {
        let eventName
        let isUnnamed

        if (err instanceof AbiEventSignatureNotFoundError) return null
        if (
          err instanceof DecodeLogDataMismatch ||
          err instanceof DecodeLogTopicsMismatch
        ) {
          // If strict mode is on, and log data/topics do not match event definition, skip.
          if (strict) return null
          eventName = err.abiItem.name
          isUnnamed = err.abiItem.inputs?.some((x) => !('name' in x && x.name))
        }

        // Set args to empty if there is an error decoding (e.g. indexed/non-indexed params mismatch).
        return { ...log, args: isUnnamed ? [] : {}, eventName }
      }
    })
    .filter(Boolean) as unknown as ExtractEventLogsReturnType<
    abi,
    eventName,
    strict
  >
}
