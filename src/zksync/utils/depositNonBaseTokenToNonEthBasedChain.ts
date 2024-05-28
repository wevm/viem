import { waitForTransactionReceipt } from '~viem/actions/index.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import {
  type ApproveErc20L1Parameters,
  approveErc20L1,
} from '../actions/approveL1Erc20Token.js'
import { getAllowanceL1 } from '../actions/getAllowanceL1.js'
import { getBaseTokenL1Address } from '../actions/getBaseTokenL1Address.js'
import { getL2TransactionBaseCost } from '../actions/getL2TransactionBaseCost.js'
import type { DepositTransaction } from '../types/deposit.js'
import { constructDepositSpecification } from './constructDepositSpecification.js'
import type { ConstructSendParametersRequestExecuteParametersReturnType } from './constructRequestL2TransactionDirectParameters.js'
import { constructRequestL2TransactionTwoBridges } from './constructRequestL2TransactionTwoBridges.js'
import { getDepositNonBaseTokenToNonEthBasedChainTx } from './getDepositNonBaseTokenToNonETHBasedChainTx.js'
import { getDepositTxWithDefaults } from './getDepositTxWithDefaults.js'

export type DepositNonBaseTokenToNonEthBasedChainParameters = DepositTransaction

export type DepositNonBaseTokenToNonEthBasedChainReturnType =
  ConstructSendParametersRequestExecuteParametersReturnType

export async function depositNonBaseTokenToNonEthBasedChain<
  TChainL1 extends Chain | undefined,
  TChainL2 extends Chain | undefined,
>(
  clientL1: Client<Transport, TChainL1, Account>,
  clientL2: Client<Transport, TChainL2, Account>,
  parameters: DepositNonBaseTokenToNonEthBasedChainParameters,
): Promise<DepositNonBaseTokenToNonEthBasedChainReturnType> {
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

  const depositTxParams = {
    ...depositTxWithDefaults,
    baseCost,
  }

  const depositTx =
    await getDepositNonBaseTokenToNonEthBasedChainTx(depositTxParams)

  const baseToken = await getBaseTokenL1Address(clientL2)

  if (depositSpecification.approveBaseERC20) {
    const proposedBridge = depositTxWithDefaults.bridgeAddresses!.sharedL1
    const bridgeAddress = depositSpecification.bridgeAddress
      ? depositSpecification.bridgeAddress
      : proposedBridge

    const allowance = await getAllowanceL1(clientL1, {
      token: baseToken,
      bridgeAddress,
    })

    if (allowance < depositTx.mintValue) {
      const approveTxHash = await approveErc20L1(clientL1, {
        token: baseToken,
        amount: depositTx.mintValue,
        sharedL1Address: depositTxWithDefaults.bridgeAddresses!.sharedL1,
        overrides: {
          bridgeAddress,
          ...depositSpecification.approveOverrides!,
        },
      } as ApproveErc20L1Parameters)
      await waitForTransactionReceipt(clientL1, { hash: approveTxHash })
    }
  }

  if (depositSpecification.approveERC20) {
    const proposedBridge = depositTxWithDefaults.bridgeAddresses!.sharedL1
    const bridgeAddress = depositSpecification.bridgeAddress
      ? depositSpecification.bridgeAddress
      : proposedBridge

    const allowance = await getAllowanceL1(clientL1, {
      token: depositSpecification.token!,
      bridgeAddress,
    })

    if (allowance < depositSpecification.amount) {
      const approveTxHash = await approveErc20L1(clientL1, {
        token: depositSpecification.token!,
        amount: depositSpecification.amount,
        sharedL1Address: depositTxWithDefaults.bridgeAddresses!.sharedL1,
        overrides: {
          bridgeAddress,
          ...depositSpecification.approveOverrides!,
        },
      } as ApproveErc20L1Parameters)
      await waitForTransactionReceipt(clientL1, { hash: approveTxHash })
    }
  }

  return await constructRequestL2TransactionTwoBridges(depositTx)
}
