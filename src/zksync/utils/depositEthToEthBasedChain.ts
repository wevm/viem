import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import { getL2TransactionBaseCost } from '../actions/getL2TransactionBaseCost.js'
import type { DepositTransaction } from '../types/deposit.js'
import { constructDepositSpecification } from './constructDepositSpecification.js'
import {
  type ConstructSendParametersRequestExecuteParametersReturnType,
  constructRequestL2TransactionDirectParameters,
} from './constructRequestL2TransactionDirectParameters.js'
import { getDepositETHOnETHBasedChainTx } from './getDepositETHOnETHBasedChainTx.js'
import { getDepositTxWithDefaults } from './getDepositTxWithDefaults.js'
import { getRequestExecuteTxDefaults } from './getRequestExecuteTxDefaults.js'

export type DepositEthToEthBasedChainParameters = DepositTransaction

export type DepositEthToEthBasedChainReturnType =
  ConstructSendParametersRequestExecuteParametersReturnType

export async function depositEthToEthBasedChain<
  TChainL1 extends Chain | undefined,
  TChainL2 extends Chain | undefined,
>(
  clientL1: Client<Transport, TChainL1, Account>,
  clientL2: Client<Transport, TChainL2, Account>,
  parameters: DepositEthToEthBasedChainParameters,
): Promise<DepositEthToEthBasedChainReturnType> {
  const depositSpecification = await constructDepositSpecification(
    clientL1,
    parameters,
  )

  const depositTxWithDefaults = await getDepositTxWithDefaults(
    clientL2,
    depositSpecification,
  )

  const baseCost = await getL2TransactionBaseCost(
    clientL1,
    depositTxWithDefaults,
  )

  const getDepositETHOnETHBasedChainTxParams = {
    ...depositTxWithDefaults,
    baseCost,
  }

  const depositTx = getDepositETHOnETHBasedChainTx(
    getDepositETHOnETHBasedChainTxParams,
  )

  const requestExecuteTxDefauls = await getRequestExecuteTxDefaults(
    clientL2,
    depositTx,
  )

  const requestL2TransactionDirectParameters =
    await constructRequestL2TransactionDirectParameters(
      clientL1,
      requestExecuteTxDefauls,
    )

  return requestL2TransactionDirectParameters
}
