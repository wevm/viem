import {
  type ReadContractErrorType,
  readContract,
} from '../../actions/public/readContract.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Account } from '../../types/account.js'
import type {
  Chain,
  DeriveChain,
  GetChainParameter,
} from '../../types/chain.js'
import type { Hex } from '../../types/misc.js'
import type { OneOf } from '../../types/utils.js'
import { l2OutputOracleAbi } from '../abis.js'
import type { TargetChain } from '../types/chain.js'
import type { GetContractAddressParameter } from '../types/contract.js'
import { type GetGameParameters, getGame } from './getGame.js'
import {
  type GetPortalVersionParameters,
  getPortalVersion,
} from './getPortalVersion.js'

export type GetL2OutputParameters<
  chain extends Chain | undefined = Chain | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  _derivedChain extends Chain | undefined = DeriveChain<chain, chainOverride>,
> = GetChainParameter<chain, chainOverride> &
  OneOf<
    | GetContractAddressParameter<_derivedChain, 'l2OutputOracle'>
    | (GetContractAddressParameter<
        _derivedChain,
        'portal' | 'disputeGameFactory'
      > & {
        /**
         * Limit of games to extract.
         * @default 100
         */
        limit?: number | undefined
      })
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

  const version = await getPortalVersion(
    client,
    parameters as GetPortalVersionParameters,
  )

  if (version.major >= 3) {
    const game = await getGame(client, parameters as GetGameParameters)
    return {
      l2BlockNumber: game.l2BlockNumber,
      outputIndex: game.index,
      outputRoot: game.rootClaim,
      timestamp: game.timestamp,
    }
  }

  const l2OutputOracleAddress = (() => {
    if (parameters.l2OutputOracleAddress)
      return parameters.l2OutputOracleAddress
    if (chain)
      return (targetChain as unknown as TargetChain)!.contracts.l2OutputOracle[
        chain.id
      ].address
    return (
      Object.values(
        (targetChain as unknown as TargetChain)!.contracts.l2OutputOracle,
      ) as any
    )[0].address
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
