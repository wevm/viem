import type { Errors, TransactionReceipt } from 'ox'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import * as Game from '../../Game.js'
import * as Withdrawal from '../../Withdrawal.js'
import { getPortalVersion } from './getPortalVersion.js'
import type { getL2Output } from './getL2Output.js'
import type { ContractParameters } from './internal.js'
import { waitForNextGame } from './waitForNextGame.js'
import { waitForNextL2Output } from './waitForNextL2Output.js'

/** Waits until an OP Stack withdrawal can be proved. */
export async function waitToProve<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: waitToProve.Options,
): Promise<waitToProve.ReturnType> {
  const { gameLimit, l2Timestamp, receipt } = options
  const [withdrawal] = Withdrawal.getWithdrawals({ logs: receipt.logs })
  if (!withdrawal)
    throw new Withdrawal.ReceiptContainsNoWithdrawalsError({
      hash: receipt.transactionHash,
    })

  const version = await getPortalVersion(client, options)
  const l2BlockNumber = l2Timestamp ?? receipt.blockNumber
  if (version.major < 3) {
    const output = await waitForNextL2Output(client, {
      ...options,
      l2BlockNumber,
    })
    return {
      game: {
        extraData: '0x',
        index: output.outputIndex,
        l2BlockNumber: output.l2BlockNumber,
        metadata: '0x',
        rootClaim: output.outputRoot,
        timestamp: output.timestamp,
        usesSuperRoots: false,
      },
      output,
      withdrawal,
    }
  }

  const game = await waitForNextGame(client, {
    ...options,
    l2BlockNumber,
    limit: gameLimit,
  })
  return {
    game,
    output: {
      l2BlockNumber: game.l2BlockNumber,
      outputIndex: game.index,
      outputRoot: game.rootClaim,
      timestamp: game.timestamp,
    },
    withdrawal,
  }
}

export declare namespace waitToProve {
  /** Options for {@link waitToProve}. */
  type Options = ContractParameters<
    'disputeGameFactory' | 'l2OutputOracle' | 'portal'
  > & {
    /** Chain used to resolve L1 contracts. @default client.chain */
    chain?: Chain.Chain | undefined
    /** Maximum number of recent games to inspect. @default 100 */
    gameLimit?: number | undefined
    /** L2 timestamp required by super-root games. */
    l2Timestamp?: bigint | undefined
    /** Polling interval in milliseconds. @default client.pollingInterval */
    pollingInterval?: number | undefined
    /** L2 withdrawal transaction receipt. */
    receipt: TransactionReceipt.TransactionReceipt
  }

  /** Data required to build and submit the proof. */
  type ReturnType = {
    /** Dispute game or legacy output represented as a game. */
    game: Game.Game & {
      /** Anchored L2 block number or timestamp. */
      l2BlockNumber: bigint
      /** Whether the game anchors on super roots. */
      usesSuperRoots: boolean
    }
    /** L2 output or dispute-game claim. */
    output: getL2Output.ReturnType
    /** Withdrawal extracted from the receipt. */
    withdrawal: Withdrawal.Withdrawal
  }

  /** Errors thrown by {@link waitToProve}. */
  type ErrorType =
    | getPortalVersion.ErrorType
    | waitForNextGame.ErrorType
    | waitForNextL2Output.ErrorType
    | Withdrawal.getWithdrawals.ErrorType
    | Withdrawal.ReceiptContainsNoWithdrawalsError
    | Errors.GlobalErrorType
}
