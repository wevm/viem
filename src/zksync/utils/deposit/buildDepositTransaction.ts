import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import { isAddressEqualLite } from '../../../utils/address/isAddressEqualLite.js'
import { getBaseTokenL1Address } from '../../actions/getBaseTokenL1Address.js'
import {
  ethAddressInContracts,
  legacyEthAddress,
} from '../../constants/address.js'
import type { DepositTransaction } from '../../types/deposit.js'
import { depositBaseTokenToNonEthBasedChain } from './buildDepositBaseTokenToNonEthBasedChainTransaction.js'
import { depositEthToEthBasedChain } from './buildDepositEthToEthBasedChainTransaction.js'
import { depositEthToNonEthBasedChain } from './buildDepositEthToNonEthBasedChainTransaction.js'
import { depositNonBaseTokenToNonEthBasedChain } from './buildDepositNonBaseTokenToNonEthBasedChainTransaction.js'
import { depositTokenToEthBasedChain } from './buildDepositTokenToEthBasedChainTransaction.js'
import type { ConstructSendParametersRequestExecuteParametersReturnType } from './constructRequestL2TransactionDirectParameters.js'

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
    parameters.token = ethAddressInContracts
  }
  if (isAddressEqualLite(parameters.token, legacyEthAddress)) {
    parameters.token = ethAddressInContracts
  }
  const baseTokenAddress = await getBaseTokenL1Address(clientL2)
  const isEthBasedChain = isAddressEqualLite(
    baseTokenAddress,
    ethAddressInContracts,
  )

  if (
    isEthBasedChain &&
    isAddressEqualLite(parameters.token, ethAddressInContracts)
  ) {
    return await depositEthToEthBasedChain(clientL1, clientL2, parameters)
  }
  if (isAddressEqualLite(baseTokenAddress, ethAddressInContracts)) {
    return await depositTokenToEthBasedChain(clientL1, clientL2, parameters)
  }
  if (isAddressEqualLite(parameters.token, ethAddressInContracts)) {
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
