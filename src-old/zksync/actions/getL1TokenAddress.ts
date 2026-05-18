import type { Address } from '../../accounts/index.js'
import { readContract } from '../../actions/public/readContract.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import { isAddressEqual } from '../../utils/index.js'
import { l2SharedBridgeAbi } from '../constants/abis.js'
import { legacyEthAddress } from '../constants/address.js'
import { getDefaultBridgeAddresses } from './getDefaultBridgeAddresses.js'

export type GetL1TokenAddressParameters = {
  /** The address of the token on L2. */
  token: Address
}

export type GetL1TokenAddressReturnType = Address

/**
 * Returns the L1 token address equivalent for a L2 token address as they are not equal.
 * ETH address is set to zero address.
 *
 * @remarks Only works for tokens bridged on default ZKsync Era bridges.
 *
 * @param client - Client to use
 * @param parameters - {@link GetL1TokenAddressParameters}
 * @returns The L1 token address equivalent for a L2 token address.
 *
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { zksync } from 'viem/chains'
 *
 * const client = createPublicClient({
 *   chain: zksync,
 *   transport: http(),
 * })
 *
 * const address = await getL1TokenAddress(client, {token: '0x...'});
 */
export async function getL1TokenAddress<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: GetL1TokenAddressParameters,
): Promise<Address> {
  const { token } = parameters
  if (isAddressEqual(token, legacyEthAddress)) return legacyEthAddress

  const bridgeAddress = (await getDefaultBridgeAddresses(client)).sharedL2

  return await readContract(client, {
    address: bridgeAddress,
    abi: l2SharedBridgeAbi,
    functionName: 'l1TokenAddress',
    args: [token],
  })
}
