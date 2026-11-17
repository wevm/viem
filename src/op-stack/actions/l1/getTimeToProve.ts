import type { Errors, TransactionReceipt } from 'ox'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import type * as Withdrawal from '../../Withdrawal.js'
import { getPortalVersion } from './getPortalVersion.js'
import { getTimeToNextGame } from './getTimeToNextGame.js'
import { getTimeToNextL2Output } from './getTimeToNextL2Output.js'
import {
  type ContractParameters,
  getContractAddress,
  getGameL2BlockNumber,
} from './internal.js'

/** Returns the time until an OP Stack withdrawal can be proved. */
export async function getTimeToProve<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getTimeToProve.Options,
): Promise<getTimeToProve.ReturnType> {
  const { l2Timestamp, receipt } = options
  const chain = options.chain ?? client.chain
  const version = await getPortalVersion(client, options)

  if (version.major < 3)
    return getTimeToNextL2Output(client, {
      ...options,
      l2BlockNumber: l2Timestamp ?? receipt.blockNumber,
    })

  const l2BlockNumber = await getGameL2BlockNumber(client, {
    l2BlockNumber: receipt.blockNumber,
    l2Timestamp,
    portalAddress: getContractAddress({ ...options, chain }, 'portal'),
    receipt,
  })
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
    /**
     * L2 timestamp of the withdrawal, required by super-root games.
     * @default The `blockTimestamp` of the receipt logs (super-root games only).
     */
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
    | Withdrawal.L2TimestampRequiredError
    | Errors.GlobalErrorType
}
