import type { Errors, TransactionReceipt } from 'ox'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { getPortalVersion } from './getPortalVersion.js'
import { getTimeToNextGame } from './getTimeToNextGame.js'
import { getTimeToNextL2Output } from './getTimeToNextL2Output.js'
import type { ContractParameters } from './internal.js'

/** Returns the time until an OP Stack withdrawal can be proved. */
export async function getTimeToProve<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getTimeToProve.Options,
): Promise<getTimeToProve.ReturnType> {
  const { l2Timestamp, receipt } = options
  const version = await getPortalVersion(client, options)
  const l2BlockNumber = l2Timestamp ?? receipt.blockNumber

  if (version.major < 3)
    return getTimeToNextL2Output(client, { ...options, l2BlockNumber })
  return getTimeToNextGame(client, { ...options, l2BlockNumber })
}

export declare namespace getTimeToProve {
  /** Options for {@link getTimeToProve}. */
  type Options = ContractParameters<
    'disputeGameFactory' | 'l2OutputOracle' | 'portal'
  > & {
    /** Chain used to resolve L1 contracts. @default client.chain */
    chain?: Chain.Chain | undefined
    /** Buffer applied to observed output intervals. @default 1.1 */
    intervalBuffer?: number | undefined
    /** L2 timestamp required by super-root games. */
    l2Timestamp?: bigint | undefined
    /** L2 withdrawal transaction receipt. */
    receipt: TransactionReceipt.TransactionReceipt
  }

  /** Return type of {@link getTimeToProve}. */
  type ReturnType =
    | getTimeToNextGame.ReturnType
    | getTimeToNextL2Output.ReturnType

  /** Errors thrown by {@link getTimeToProve}. */
  type ErrorType =
    | getPortalVersion.ErrorType
    | getTimeToNextGame.ErrorType
    | getTimeToNextL2Output.ErrorType
    | Errors.GlobalErrorType
}
