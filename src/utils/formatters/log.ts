import type { ErrorType } from '../../errors/utils.js'
import type { Log } from '../../types/log.js'
import type { RpcLog } from '../../types/rpc.js'
import type { ExactPartial } from '../../types/utils.js'

export type FormatLogErrorType = ErrorType

export function formatLog(
  log: ExactPartial<RpcLog>,
  {
    args,
    eventName,
  }: { args?: unknown | undefined; eventName?: string | undefined } = {},
) {
  const result = {
    ...log,
    blockHash: log.blockHash ? log.blockHash : null,
    blockNumber: log.blockNumber ? BigInt(log.blockNumber) : null,
    blockTimestamp: log.blockTimestamp
      ? BigInt(log.blockTimestamp)
      : log.blockTimestamp === null
        ? null
        : undefined,
    logIndex: log.logIndex ? Number(log.logIndex) : null,
    transactionHash: log.transactionHash ? log.transactionHash : null,
    transactionIndex: log.transactionIndex
      ? Number(log.transactionIndex)
      : null,
  } as Record<string, unknown>
  if (eventName) {
    result.args = args
    result.eventName = eventName
  }
  return result as Log
}
