import type { Address } from 'abitype'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import { l1SharedBridge } from './l1SharedBridge.js'

export type GetIsL2BridgeLegacyParameters = {
  address: Address
}

export type GetIsL2BridgeLegacyReturnType = boolean

export async function isL2BridgeLegacy<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  clientL2: Client<Transport, TChain, TAccount>,
  parameters: GetIsL2BridgeLegacyParameters,
): Promise<GetIsL2BridgeLegacyReturnType> {
  try {
    await l1SharedBridge(clientL2, {
      address: parameters.address,
    })
  } catch (_e) {
    //skip
  }
  return true
}
