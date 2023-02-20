import type { Log, RpcLog } from '../../types'

export function formatLog(
  log: Partial<RpcLog>,
  { args, eventName }: { args?: unknown; eventName?: string } = {},
) {
  return {
    ...log,
    blockNumber: log.blockNumber ? BigInt(log.blockNumber) : null,
    logIndex: log.logIndex ? BigInt(log.logIndex) : null,
    transactionIndex: log.transactionIndex
      ? BigInt(log.transactionIndex)
      : null,
    ...(eventName ? { args, eventName } : {}),
  } as Log
}
