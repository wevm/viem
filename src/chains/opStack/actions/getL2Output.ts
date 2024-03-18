import {
  type ReadContractErrorType,
  readContract,
} from '../../../actions/public/readContract.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { ErrorType } from '../../../errors/utils.js'
import type { Account } from '../../../types/account.js'
import type {
  Chain,
  DeriveChain,
  GetChainParameter,
} from '../../../types/chain.js'
import type { Hex } from '../../../types/misc.js'
import { decodeAbiParameters } from '../../../utils/index.js'
import {
  disputeGameFactoryAbi,
  l2OutputOracleAbi,
  portal2Abi,
} from '../abis.js'
import type { GetContractAddressParameter } from '../types/contract.js'
import { getPortalVersion } from './getPortalVersion.js'

export type GetL2OutputParameters<
  chain extends Chain | undefined = Chain | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  _derivedChain extends Chain | undefined = DeriveChain<chain, chainOverride>,
> = GetChainParameter<chain, chainOverride> &
  GetContractAddressParameter<
    _derivedChain,
    'l2OutputOracle' | 'portal' | 'disputeGameFactory'
  > & {
    l2BlockNumber: bigint
  }
export type GetL2OutputReturnType = {
  outputIndex: bigint
  outputRoot: Hex
  timestamp: bigint
  l2BlockNumber: bigint
}
export type GetL2OutputErrorType = ReadContractErrorType | ErrorType

/**
 * Retrieves the first L2 output proposal that occurred after a provided block number.
 *
 * - Docs: https://viem.sh/op-stack/actions/getL2Output
 *
 * @param client - Client to use
 * @param parameters - {@link GetL2OutputParameters}
 * @returns The L2 output. {@link GetL2OutputReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet, optimism } from 'viem/chains'
 * import { getL2Output } from 'viem/op-stack'
 *
 * const publicClientL1 = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const output = await getL2Output(publicClientL1, {
 *   l2BlockNumber: 69420n,
 *   targetChain: optimism
 * })
 */
export async function getL2Output<
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: GetL2OutputParameters<chain, chainOverride>,
): Promise<GetL2OutputReturnType> {
  const { chain = client.chain, l2BlockNumber, targetChain } = parameters

  const portalAddress = (() => {
    if (parameters.portalAddress) return parameters.portalAddress
    if (chain) return targetChain!.contracts.portal[chain.id].address
    return Object.values(targetChain!.contracts.portal)[0].address
  })()

  const version = await getPortalVersion(client, {
    portalAddress: portalAddress,
  })

  const isLegacy = version.major < 3

  // this entire code block can be removed after testnet and mainnet are both on >=3
  if (isLegacy) {
    const l2OutputOracleAddress = (() => {
      if (parameters.l2OutputOracleAddress)
        return parameters.l2OutputOracleAddress
      if (chain) return targetChain!.contracts.l2OutputOracle[chain.id].address
      return Object.values(targetChain!.contracts.l2OutputOracle)[0].address
    })()

    const outputIndex = await readContract(client, {
      address: l2OutputOracleAddress,
      abi: l2OutputOracleAbi,
      functionName: 'getL2OutputIndexAfter',
      args: [l2BlockNumber],
    })
    const output = await readContract(client, {
      address: l2OutputOracleAddress,
      abi: l2OutputOracleAbi,
      functionName: 'getL2Output',
      args: [outputIndex],
    })

    return { outputIndex, ...output }
  }

  const disputeGameFactoryAddress = (() => {
    if (parameters.disputeGameFactoryAddress)
      return parameters.disputeGameFactoryAddress
    if (chain)
      return targetChain!.contracts.disputeGameFactory[chain.id].address
    return Object.values(targetChain!.contracts.disputeGameFactory)[0].address
  })()

  // Get the total game count from the DisputeGameFactory since that will give us the end of
  // the array that we're searching over. We'll then use that to find the latest games.
  const gameCount = await readContract(client, {
    abi: disputeGameFactoryAbi,
    functionName: 'gameCount',
    args: [],
    address: disputeGameFactoryAddress,
  })
  const gameType = await readContract(client, {
    abi: portal2Abi,
    functionName: 'respectedGameType',
    address: portalAddress,
  })

  // Find the latest 100 games (or as many as we can up to 100).
  const latestGames = await readContract(client, {
    abi: disputeGameFactoryAbi,
    functionName: 'findLatestGames',
    address: disputeGameFactoryAddress,
    args: [
      gameType,
      BigInt(Math.max(0, Number(gameCount - 1n))),
      BigInt(Math.min(100, Number(gameCount))),
    ],
  })
  // Find a game with a block number that is greater than or equal to the block number that the
  // message was included in. We can use this proposal to prove the message to the portal.
  let match: any
  for (const game of latestGames) {
    const [blockNumber] = decodeAbiParameters(
      [{ type: 'uint256' }],
      game.extraData,
    )
    if (blockNumber > parameters.l2BlockNumber) {
      match = {
        ...game,
        l2BlockNumber: blockNumber,
      }
    }
  }
  if (!match) {
    throw new Error(
      'No L2 output found. Did you try calling `waitForNextL2Output` first?',
    )
  }

  return {
    l2BlockNumber: match.l2BlockNumber,
    outputIndex: match.index,
    outputRoot: match.rootClaim,
    timestamp: match.timestamp,
  }
}
