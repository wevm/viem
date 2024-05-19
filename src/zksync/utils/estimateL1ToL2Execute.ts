import type { Address } from 'abitype'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { Hex } from '../../types/misc.js'
import { createRandomAddress } from '../../utils/address/createRandomAddress.js'
import { estimateGasL1ToL2 } from '../actions/estimateGasL1ToL2.js'
import { REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT } from '../constants/number.js'

export type EstimateL1ToL2ExecuteParameters = {
  contractAddress: Address
  calldata: Hex
  caller?: Address
  l2Value?: bigint
  factoryDeps?: Hex[]
  gasPerPubdataByte?: bigint
}

export async function estimateL1ToL2Execute<TChain extends Chain | undefined>(
  clientL2: Client<Transport, TChain, Account>,
  parameters: EstimateL1ToL2ExecuteParameters,
): Promise<bigint> {
  parameters.gasPerPubdataByte ??= REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT
  parameters.caller ??= createRandomAddress()

  const customData = {
    gasPerPubdataDefault: parameters.gasPerPubdataByte,
  }

  if (parameters.factoryDeps) {
    Object.assign(customData, { factoryDeps: parameters.factoryDeps })
  }

  return await estimateGasL1ToL2(clientL2, {
    data: parameters.calldata,
    to: parameters.contractAddress,
    value: parameters.l2Value || 0n,
    factoryDeps: parameters.factoryDeps ?? [],
    gasPerPubdata: parameters.gasPerPubdataByte,
    chain: clientL2.chain,
  })
}
