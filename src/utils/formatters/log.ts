import type { ErrorType } from '../../errors/utils.js'
import type { Log } from '../../types/log.js'
import type { RpcLog } from '../../types/rpc.js'

export type FormatLogErrorType = ErrorType

export function formatLog(
  log: Partial<RpcLog>,
  { args, eventName }: { args?: unknown; eventName?: string } = {},
) {
  return {
    ...log,
    blockHash: log.blockHash ? log.blockHash : null,
    blockNumber: log.blockNumber ? BigInt(log.blockNumber) : null,
    logIndex: log.logIndex ? Number(log.logIndex) : null,
    transactionHash: log.transactionHash ? log.transactionHash : null,
    transactionIndex: log.transactionIndex
      ? Number(log.transactionIndex)
      : null,
    ...(eventName ? { args, eventName } : {}),
  } as Log
}
