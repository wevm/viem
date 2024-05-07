import type { ErrorType } from '../../errors/utils.js'
import type { Log } from '../../types/log.js'
import type { RpcLog } from '../../types/rpc.js'
import type { ExactPartial } from '../../types/utils.js'
import { getAddress } from '../index.js'

export type FormatLogErrorType = ErrorType

export function formatLog(
  log: ExactPartial<RpcLog>,
  {
    args,
    eventName,
  }: { args?: unknown | undefined; eventName?: string | undefined } = {},
) {
  return {
    ...log,
    address: log.address ? getAddress(log.address) : null,
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
