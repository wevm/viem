import { isAddressEqualLite } from '~viem/utils/address/isAddressEqualLite.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import { getBaseTokenL1Address } from '../actions/getBaseTokenL1Address.js'
import {
  ETH_ADDRESS_IN_CONTRACTS,
  LEGACY_ETH_ADDRESS,
} from '../constants/number.js'
import type { DepositTransaction } from '../types/deposit.js'
import type { ConstructSendParametersRequestExecuteParametersReturnType } from './constructRequestL2TransactionDirectParameters.js'
import { depositBaseTokenToNonEthBasedChain } from './depositBaseTokenToNonEthBasedChain.js'
import { depositEthToEthBasedChain } from './depositEthToEthBasedChain.js'
import { depositEthToNonEthBasedChain } from './depositEthToNonEthBasedChain.js'
import { depositNonBaseTokenToNonEthBasedChain } from './depositNonBaseTokenToNonEthBasedChain.js'
import { depositTokenToEthBasedChain } from './depositTokenToEthBasedChain.js'

export type DepositParameters = DepositTransaction

export type DepositReturnType =
  ConstructSendParametersRequestExecuteParametersReturnType

export async function deposit<
  TChainL1 extends Chain | undefined,
  TChainL2 extends Chain | undefined,
>(
  clientL1: Client<Transport, TChainL1, Account>,
  clientL2: Client<Transport, TChainL2, Account>,
  parameters: DepositParameters,
): Promise<DepositReturnType> {
  if (!parameters.token) {
    parameters.token = ETH_ADDRESS_IN_CONTRACTS
  }
  if (isAddressEqualLite(parameters.token, LEGACY_ETH_ADDRESS)) {
    parameters.token = ETH_ADDRESS_IN_CONTRACTS
  }
  const baseTokenAddress = await getBaseTokenL1Address(clientL2)
  const isEthBasedChain = isAddressEqualLite(
    baseTokenAddress,
    ETH_ADDRESS_IN_CONTRACTS,
  )

  if (
    isEthBasedChain &&
    isAddressEqualLite(parameters.token, ETH_ADDRESS_IN_CONTRACTS)
  ) {
    return await depositEthToEthBasedChain(clientL1, clientL2, parameters)
  }
  if (isAddressEqualLite(baseTokenAddress, ETH_ADDRESS_IN_CONTRACTS)) {
    return await depositTokenToEthBasedChain(clientL1, clientL2, parameters)
  }
  if (isAddressEqualLite(parameters.token, ETH_ADDRESS_IN_CONTRACTS)) {
    return await depositEthToNonEthBasedChain(clientL1, clientL2, parameters)
  }
  if (isAddressEqualLite(parameters.token, baseTokenAddress)) {
    return await depositBaseTokenToNonEthBasedChain(
      clientL1,
      clientL2,
      parameters,
    )
  }
  return await depositNonBaseTokenToNonEthBasedChain(
    clientL1,
    clientL2,
    parameters,
  )
}
