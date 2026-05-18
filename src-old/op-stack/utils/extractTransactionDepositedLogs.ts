import type { ErrorType } from '../../errors/utils.js'
import type { Log } from '../../types/log.js'
import {
  type ParseEventLogsErrorType,
  parseEventLogs,
} from '../../utils/abi/parseEventLogs.js'
import { portalAbi } from '../abis.js'

export type ExtractTransactionDepositedLogsParameters = {
  /** An opaque array of logs. */
  logs: Log[]
}

export type ExtractTransactionDepositedLogsReturnType = Log<
  bigint,
  number,
  false,
  undefined,
  true,
  typeof portalAbi,
  'TransactionDeposited'
>[]

export type ExtractTransactionDepositedLogsErrorType =
  | ParseEventLogsErrorType
  | ErrorType

export function extractTransactionDepositedLogs({
  logs,
}: ExtractTransactionDepositedLogsParameters) {
  return parseEventLogs({
    abi: portalAbi,
    eventName: 'TransactionDeposited',
    logs,
  })
}
