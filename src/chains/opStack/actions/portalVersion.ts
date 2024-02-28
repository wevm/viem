// TODO replace this import with copy pasting the abi in
import { OptimismPortal2Abi as portalAbi } from '@tevm/opstack'
import {
  type ReadContractErrorType,
  readContract,
} from '~viem/actions/index.js'
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
import type { GetContractAddressParameter } from '../types/contract.js'

/**
 * Parameters for the {@link portalVersion} action
 * @experimental
 */
export type PortalVersionParameters<
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
export type PortalVersionReturnType = {
  major: number
  minor: number
  patch: number
}

export type PortalVersionErrorType = ReadContractErrorType | ErrorType

/**
 * Reads the version of the Optimism Portal contract on L1. The portal contract
 * is a key l1 contract and can be used for determining which version of
 * the Optimism protocol is being used.
 *
 * - Docs: https://viem.sh/op-stack/actions/portalVersion
 *
 * @param client - Client to use
 * @param parameters - {@link PortalVersionParameters}
 * @returns The version as an object with `major` `minor` and `patch` properties.
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { portalVersion } from 'viem/op-stack'
 *
 * const l1EthereumClient = createPublicClient({
 *   chain: mainnet,
 *   transport: http('https://mainnet.optimism.io'),
 * })
 *
 * const {major, minor, patch} = await portalVersion(l1EthereumClient, {
 *   targetChain: optimism,
 * })
 *
 * if (major > 3) {
 *   console.log('Fault proofs are enabled on this version of optimism')
 * } else {
 *   console.log('Fault proofs are not enabled on this version of optimism')
 * }
 */
export async function portalVersion<
  chain extends Chain | undefined,
  chainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, chain>,
  parameters: PortalVersionParameters<chain, chainOverride>,
) {
  const { chain = client.chain, targetChain } = parameters

  const portalAddress = (() => {
    if (parameters.portalAddress) return parameters.portalAddress
    if (chain) return targetChain!.contracts.portal[chain.id].address
    return Object.values(targetChain!.contracts.portal)[0].address
  })()

  const version = await readContract(client, {
    abi: portalAbi,
    address: portalAddress,
    functionName: 'version',
  })

  const [major, minor, patch] = version.split('.').map(Number)

  return { major, minor, patch }
}
