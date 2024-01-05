import type { ErrorType } from '../../../errors/utils.js'
import type { Log } from '../../../types/log.js'
import type { Withdrawal } from '../types/withdrawal.js'
import {
  type ExtractWithdrawalMessageLogsErrorType,
  extractWithdrawalMessageLogs,
} from './extractWithdrawalMessageLogs.js'

export type GetWithdrawalsParameters = {
  /** The L2 transaction receipt logs. */
  logs: Log[]
}

export type GetWithdrawalsReturnType = Withdrawal[]

export type GetWithdrawalsErrorType =
  | ExtractWithdrawalMessageLogsErrorType
  | ErrorType

export function getWithdrawals({
  logs,
}: GetWithdrawalsParameters): GetWithdrawalsReturnType {
  const extractedLogs = extractWithdrawalMessageLogs({ logs })
  return extractedLogs.map((log) => log.args)
}
