import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { BridgeContractAddresses } from '../types/contract.js'
import type { PublicZksyncRpcSchema } from '../types/eip1193.js'

export type GetDefaultBridgeAddressesReturnType = BridgeContractAddresses

export async function getDefaultBridgeAddresses<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account, PublicZksyncRpcSchema>,
): Promise<GetDefaultBridgeAddressesReturnType> {
  const addresses = await client.request({ method: 'zks_getBridgeContracts' })
  return {
    erc20L1: addresses.l1Erc20DefaultBridge,
    sharedL1: addresses.l1SharedDefaultBridge,
    sharedL2: addresses.l2SharedDefaultBridge,
  }
}
