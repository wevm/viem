import type { Address } from '../../accounts/index.js'
import { readContract } from '../../actions/public/readContract.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import { isAddressEqual } from '../../utils/index.js'
import { l2SharedBridgeAbi } from '../constants/abis.js'
import {
  ethAddressInContracts,
  l2BaseTokenAddress,
  legacyEthAddress,
} from '../constants/address.js'
import { getBaseTokenL1Address } from './getBaseTokenL1Address.js'
import { getDefaultBridgeAddresses } from './getDefaultBridgeAddresses.js'

export type GetL2TokenAddressParameters = {
  /** The address of the token on L1. */
  token: Address
  /** The address of custom bridge, which will be used to get l2 token address. */
  bridgeAddress?: Address | undefined
}

export type GetL2TokenAddressReturnType = Address

/**
 * Returns the L2 token address equivalent for a L1 token address as they are not equal.
 * ETH address is set to zero address.
 *
 * @remarks Only works for tokens bridged on default ZKsync Era bridges.
 *
 * @param client - Client to use
 * @param parameters - {@link GetL2TokenAddressParameters}
 * @returns The L2 token address equivalent for a L1 token address.
 *
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { zksync } from 'viem/chains'
 * import { publicActionsL2 } from 'viem/zksync'
 *
 * const client = createPublicClient({
 *   chain: zksync,
 *   transport: http(),
 * }).extend(publicActionsL2())
 *
 * const address = await getL2TokenAddress(client, {token: '0x...'});
 */
export async function getL2TokenAddress<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: GetL2TokenAddressParameters,
): Promise<Address> {
  let { token, bridgeAddress } = parameters
  if (isAddressEqual(token, legacyEthAddress)) token = ethAddressInContracts

  const baseToken = await getBaseTokenL1Address(client)
  if (isAddressEqual(token, baseToken)) return l2BaseTokenAddress

  bridgeAddress ??= (await getDefaultBridgeAddresses(client)).sharedL2

  return await readContract(client, {
    address: bridgeAddress,
    abi: l2SharedBridgeAbi,
    functionName: 'l2TokenAddress',
    args: [token],
  })
}
