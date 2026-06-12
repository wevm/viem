import type { ErrorType } from '../../errors/utils.js'
import type { Log } from '../../types/log.js'
import type { Hex } from '../../types/misc.js'
import { extractTransactionDepositedLogs } from './extractTransactionDepositedLogs.js'
import { getL2TransactionHash } from './getL2TransactionHash.js'

export type GetL2TransactionHashesParameters = {
  /** The L1 transaction receipt logs. */
  logs: Log[]
}

export type GetL2TransactionHashesReturnType = Hex[]

export type GetL2TransactionHashesErrorType = ErrorType

export function getL2TransactionHashes({
  logs,
}: GetL2TransactionHashesParameters): GetL2TransactionHashesReturnType {
  const extractedLogs = extractTransactionDepositedLogs({ logs })
  return extractedLogs.map((log) => getL2TransactionHash({ log }))
}
