import {
  type ReadContractErrorType,
  readContract,
} from '../../../actions/public/readContract.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { ErrorType } from '../../../errors/utils.js'
import type {
  Chain,
  DeriveChain,
  GetChainParameter,
} from '../../../types/chain.js'
import type { UnionEvaluate, UnionOmit } from '../../../types/utils.js'
import type { FormattedTransactionRequest } from '../../../utils/formatters/transactionRequest.js'
import { portal2Abi } from '../abis.js'
import type { GetContractAddressParameter } from '../types/contract.js'

/**
 * Parameters for the {@link getPortalVersion} action
 */
export type GetPortalVersionParameters<
  chain extends Chain | undefined = Chain | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  _derivedChain extends Chain | undefined = DeriveChain<chain, chainOverride>,
> = UnionEvaluate<
  UnionOmit<
    FormattedTransactionRequest<_derivedChain>,
    | 'accessList'
    | 'data'
    | 'from'
    | 'gas'
    | 'gasPrice'
    | 'to'
    | 'type'
    | 'value'
  >
> &
  GetChainParameter<chain, chainOverride> &
  GetContractAddressParameter<_derivedChain, 'portal'>

/**
 * The portal contract version returned as semver object
 */
export type GetPortalVersionReturnType = {
  major: number
  minor: number
  patch: number
}

export type GetPortalVersionErrorType = ReadContractErrorType | ErrorType

/**
 * @internal
 * Reads the version of the Optimism Portal contract on L1. The portal contract
 * is a key l1 contract and can be used for determining which version of
 * the Optimism protocol is being used.
 *
 * - Docs: https://viem.sh/op-stack/actions/portalVersion
 *
 * @param client - Client to use
 * @param parameters - {@link GetPortalVersionParameters}
 * @returns The version as an object with `major` `minor` and `patch` properties.
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getPortalVersion } from 'viem/op-stack'
 *
 * const l1EthereumClient = createPublicClient({
 *   chain: mainnet,
 *   transport: http('https://mainnet.optimism.io'),
 * })
 *
 * const {major, minor, patch} = await getPortalVersion(l1EthereumClient, {
 *   targetChain: optimism,
 * })
 *
 * if (major > 3) {
 *   console.log('Fault proofs are enabled on this version of optimism')
 * } else {
 *   console.log('Fault proofs are not enabled on this version of optimism')
 * }
 */
export async function getPortalVersion<
  chain extends Chain | undefined,
  chainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, chain>,
  parameters: GetPortalVersionParameters<chain, chainOverride>,
) {
  const { chain = client.chain, targetChain } = parameters

  const portalAddress = (() => {
    if (parameters.portalAddress) return parameters.portalAddress
    if (chain) return targetChain!.contracts.portal[chain.id].address
    return Object.values(targetChain!.contracts.portal)[0].address
  })()

  const version = await readContract(client, {
    abi: portal2Abi,
    address: portalAddress,
    functionName: 'version',
  })

  const [major, minor, patch] = version.split('.').map(Number)

  return { major, minor, patch }
}
