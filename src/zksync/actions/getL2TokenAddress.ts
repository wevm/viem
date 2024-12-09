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
