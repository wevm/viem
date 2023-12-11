import type { ErrorType } from '../../../errors/utils.js'
import type { Log } from '../../../types/log.js'
import {
  type ParseEventLogsErrorType,
  parseEventLogs,
} from '../../../utils/abi/parseEventLogs.js'
import { l2ToL1MessagePasserAbi } from '../abis.js'

export type ExtractWithdrawalMessageLogsParameters = {
  /** An opaque array of logs. */
  logs: Log[]
}

export type ExtractWithdrawalMessageLogsReturnType = Log<
  bigint,
  number,
  false,
  undefined,
  true,
  typeof l2ToL1MessagePasserAbi,
  'MessagePassed'
>[]

export type ExtractWithdrawalMessageLogsErrorType =
  | ParseEventLogsErrorType
  | ErrorType

export function extractWithdrawalMessageLogs({
  logs,
}: ExtractWithdrawalMessageLogsParameters) {
  return parseEventLogs({
    abi: l2ToL1MessagePasserAbi,
    eventName: 'MessagePassed',
    logs,
  })
}
