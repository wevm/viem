import type { Errors, Hex } from 'ox'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { read } from '../../../core/actions/contract/read.js'
import { l2OutputOracleAbi } from '../../abis.js'
import { getGame } from './getGame.js'
import { getPortalVersion } from './getPortalVersion.js'
import { type ContractParameters, getContractAddress } from './internal.js'

/** Retrieves the first L2 output after an L2 block number. */
export async function getL2Output<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getL2Output.Options,
): Promise<getL2Output.ReturnType> {
  const chain = options.chain ?? client.chain

  // Without a portal, read the L2OutputOracle directly.
  if (
    ('portalAddress' in options && options.portalAddress) ||
    options.targetChain?.contracts?.portal
  ) {
    const version = await getPortalVersion(
      client,
      options as getPortalVersion.Options,
    )

    if (version.major >= 3) {
      const game = await getGame(client, options as getGame.Options)
      return {
        l2BlockNumber: game.l2BlockNumber,
        outputIndex: game.index,
        outputRoot: game.rootClaim,
        timestamp: game.timestamp,
        usesSuperRoots: game.usesSuperRoots,
      }
    }
  }

  const address = getContractAddress({ ...options, chain }, 'l2OutputOracle')
  const outputIndex = await read(client, {
    abi: l2OutputOracleAbi,
    address,
    args: [options.l2BlockNumber],
    functionName: 'getL2OutputIndexAfter',
  })
  const output = await read(client, {
    abi: l2OutputOracleAbi,
    address,
    args: [outputIndex],
    functionName: 'getL2Output',
  })
  return { outputIndex, ...output }
}

export declare namespace getL2Output {
  /** Options for {@link getL2Output}. */
  type Options = (
    | ContractParameters<'l2OutputOracle'>
    | (ContractParameters<'disputeGameFactory' | 'portal'> & {
        /** Maximum number of dispute games to inspect. @default 100 */
        limit?: number | undefined
      })
  ) & {
    /** Chain used to resolve L1 contracts. @default client.chain */
    chain?: Chain.Chain | undefined
    /** L2 block number or super-root timestamp. */
    l2BlockNumber: bigint
  }

  /** An L2 output proposal or dispute-game claim. */
  type ReturnType = {
    /**
     * Anchored L2 block number. For super-root dispute games, this value is
     * the L2 timestamp instead. Check `usesSuperRoots` to distinguish the unit.
     */
    l2BlockNumber: bigint
    /** Output or game index. */
    outputIndex: bigint
    /** Output root or root claim. */
    outputRoot: Hex.Hex
    /** Proposal or game timestamp. */
    timestamp: bigint
    /** Whether the output comes from a super-root dispute game. */
    usesSuperRoots?: boolean | undefined
  }

  /** Errors thrown by {@link getL2Output}. */
  type ErrorType =
    | read.ErrorType
    | getGame.ErrorType
    | getPortalVersion.ErrorType
    | Chain.getContractAddress.ErrorType
    | Errors.GlobalErrorType
}
