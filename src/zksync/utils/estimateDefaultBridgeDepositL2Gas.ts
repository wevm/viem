import type { Address } from 'abitype'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { Hex } from '../../types/misc.js'
import { createRandomAddress } from '../../utils/address/createRandomAddress.js'
import { isAddressEqualLite } from '../../utils/address/isAddressEqualLite.js'
import { getDefaultBridgeAddresses } from '../actions/getDefaultBridgeAddresses.js'
import {
  ethAddressInContracts,
  legacyEthAddress,
} from '../constants/address.js'
import { estimateCustomBridgeDepositL2Gas } from './estimateCustomBridgeDepositL2Gas.js'
import { estimateL1ToL2Execute } from './estimateL1ToL2Execute.js'
import { isBaseToken } from './isBaseToken.js'

export type EstimateDefaultBridgeDepositL2GasParameters = {
  token: Address
  amount: bigint
  to: Address
  gasPerPubdataByte: bigint
  erc20DefaultBridgeData: Hex
}

export async function estimateDefaultBridgeDepositL2Gas<
  TChain extends Chain | undefined,
>(
  clientL2: Client<Transport, TChain, Account>,
  parameters: EstimateDefaultBridgeDepositL2GasParameters,
): Promise<bigint> {
  const from = clientL2.account.address ?? createRandomAddress()
  const isBase = await isBaseToken(clientL2, { token: parameters.token })

  if (isBase) {
    return await estimateL1ToL2Execute(clientL2, {
      contractAddress: parameters.to,
      gasPerPubdataByte: parameters.gasPerPubdataByte!,
      caller: from,
      calldata: '0x',
      l2Value: parameters.amount,
    })
  }
  const birdgeAddresses = await getDefaultBridgeAddresses(clientL2)
  const l2Value = 0n
  const l1BridgeAddress = birdgeAddresses.sharedL1
  const l2BridgeAddress = birdgeAddresses.sharedL2
  const bridgeData = parameters.erc20DefaultBridgeData

  return await estimateCustomBridgeDepositL2Gas(clientL2, {
    l1BridgeAddress,
    l2BridgeAddress,
    token: isAddressEqualLite(parameters.token, legacyEthAddress)
      ? ethAddressInContracts
      : parameters.token,
    amount: parameters.amount,
    to: parameters.to,
    bridgeData,
    from,
    gasPerPubdataByte: parameters.gasPerPubdataByte,
    l2Value,
  })
}
