import type { ErrorType } from '../../../errors/utils.js'
import type { Log } from '../../../types/log.js'
import type { Withdrawal } from '../types/withdrawals.js'
import { extractWithdrawalMessageLogs } from './extractWithdrawalMessageLogs.js'

export type GetWithdrawalsParameters = {
  /** The L2 transaction receipt logs. */
  logs: Log[]
}

export type GetWithdrawalsReturnType = Withdrawal[]

export type GetWithdrawalsErrorType = ErrorType

export function getWithdrawals({
  logs,
}: GetWithdrawalsParameters): GetWithdrawalsReturnType {
  const extractedLogs = extractWithdrawalMessageLogs({ logs })
  return extractedLogs.map((log) => log.args)
}
