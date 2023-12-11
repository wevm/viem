import type { ErrorType } from '../../../errors/utils.js'
import type { Log } from '../../../types/log.js'
import {
  type ExtractWithdrawalMessageLogsReturnType,
  extractWithdrawalMessageLogs,
} from './extractWithdrawalMessageLogs.js'

export type GetWithdrawalMessagesParameters = {
  /** The L2 transaction receipt logs. */
  logs: Log[]
}

export type GetWithdrawalMessagesReturnType =
  ExtractWithdrawalMessageLogsReturnType[number]['args'][]

export type GetWithdrawalMessagesErrorType = ErrorType

export function getWithdrawalMessages({
  logs,
}: GetWithdrawalMessagesParameters): GetWithdrawalMessagesReturnType {
  const extractedLogs = extractWithdrawalMessageLogs({ logs })
  return extractedLogs.map((log) => log.args)
}
