import { waitForTransactionReceipt } from '../../../actions/index.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import {
  type ApproveErc20L1Parameters,
  approveErc20L1,
} from '../../actions/approveL1Erc20Token.js'
import { getAllowanceL1 } from '../../actions/getAllowanceL1.js'
import { getBaseToken } from '../../actions/getBaseToken.js'
import { getL2TransactionBaseCost } from '../../actions/getL2TransactionBaseCost.js'
import type { DepositTransaction } from '../../types/deposit.js'
import { constructDepositSpecification } from './constructDepositSpecification.js'
import type { ConstructSendParametersRequestExecuteParametersReturnType } from './constructRequestL2TransactionDirectParameters.js'
import { constructRequestL2TransactionTwoBridges } from './constructRequestL2TransactionTwoBridges.js'
import { getDepositETHOnNonETHBasedChainTx } from './getDepositETHOnNonETHBasedChainTx.js'
import { getDepositTxWithDefaults } from './getDepositTxWithDefaults.js'
import { getRequestExecuteTxDefaults } from './getRequestExecuteTxDefaults.js'

export type DepositEthToNonEthBasedChainParameters = DepositTransaction

export type DepositEthToNonEthBasedChainReturnType =
  ConstructSendParametersRequestExecuteParametersReturnType

export async function depositEthToNonEthBasedChain<
  TChainL1 extends Chain | undefined,
  TChainL2 extends Chain | undefined,
>(
  clientL1: Client<Transport, TChainL1, Account>,
  clientL2: Client<Transport, TChainL2, Account>,
  parameters: DepositEthToNonEthBasedChainParameters,
): Promise<DepositEthToNonEthBasedChainReturnType> {
  const depositSpecification = await constructDepositSpecification(
    clientL1,
    parameters,
  )

  const depositTxWithDefaults = await getDepositTxWithDefaults(
    clientL2,
    depositSpecification,
  )

  const baseToken = await getBaseToken(clientL1, {
    bridgehubContractAddress: depositTxWithDefaults.bridgehubContractAddress,
    l2ChainId: depositTxWithDefaults.l2ChainId,
  })

  const baseCost = await getL2TransactionBaseCost(
    clientL1,
    depositTxWithDefaults,
  )

  const getDepositTokenOnEthBasedChainTxParams = {
    ...depositTxWithDefaults,
    baseCost,
  }

  const sharedBridge = depositTxWithDefaults.bridgeAddresses!.sharedL1

  const depositTx = await getDepositETHOnNonETHBasedChainTx(
    getDepositTokenOnEthBasedChainTxParams,
  )

  if (
    depositSpecification.approveERC20 ||
    depositSpecification.approveBaseERC20
  ) {
    const allowance = await getAllowanceL1(clientL1, {
      token: baseToken,
      bridgeAddress: sharedBridge,
    })

    if (allowance < depositTx.mintValue) {
      const approveTxHash = await approveErc20L1(clientL1, {
        token: baseToken,
        amount: depositTx.mintValue,
        sharedL1Address: sharedBridge,
        overrides: {
          bridgeAddress: sharedBridge,
          ...depositSpecification.approveBaseOverrides!,
        },
      } as ApproveErc20L1Parameters)
      await waitForTransactionReceipt(clientL1, { hash: approveTxHash })
    }
  }

  const requestExecuteTxDefauls = await getRequestExecuteTxDefaults(
    clientL2,
    depositTx,
  )

  const depositTxEth = await getDepositETHOnNonETHBasedChainTx(
    requestExecuteTxDefauls,
  )

  const requestL2TransactionTwoBridgesParams =
    constructRequestL2TransactionTwoBridges(depositTxEth)
  return requestL2TransactionTwoBridgesParams
}
