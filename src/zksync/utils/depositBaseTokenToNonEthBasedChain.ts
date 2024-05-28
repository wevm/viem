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
import { getBaseToken } from '../actions/getBaseToken.js'
import { getL2TransactionBaseCost } from '../actions/getL2TransactionBaseCost.js'
import type { DepositTransaction } from '../types/deposit.js'
import { constructDepositSpecification } from './constructDepositSpecification.js'
import {
  type ConstructSendParametersRequestExecuteParametersReturnType,
  constructRequestL2TransactionDirectParameters,
} from './constructRequestL2TransactionDirectParameters.js'
import { getDepositBaseTokenOnNonEthBasedChainTx } from './getDepositBaseTokenOnNonEthBasedChainTx.js'
import { getDepositTxWithDefaults } from './getDepositTxWithDefaults.js'

export type DepositBaseTokenToNonEthBasedChainParameters = DepositTransaction

export type DepositBaseTokenToNonEthBasedChainReturnType =
  ConstructSendParametersRequestExecuteParametersReturnType

export async function depositBaseTokenToNonEthBasedChain<
  TChainL1 extends Chain | undefined,
  TChainL2 extends Chain | undefined,
>(
  clientL1: Client<Transport, TChainL1, Account>,
  clientL2: Client<Transport, TChainL2, Account>,
  parameters: DepositBaseTokenToNonEthBasedChainParameters,
): Promise<DepositBaseTokenToNonEthBasedChainReturnType> {
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

  const getDepositTokenOnEthBasedChainTxParams = {
    ...depositTxWithDefaults,
    baseCost,
  }

  const depositTx = await getDepositBaseTokenOnNonEthBasedChainTx(
    getDepositTokenOnEthBasedChainTxParams,
  )
  const baseToken = await getBaseToken(clientL1, {
    bridgehubContractAddress: depositTxWithDefaults.bridgehubContractAddress,
    l2ChainId: depositTxWithDefaults.l2ChainId,
  })

  const sharedBridge = depositTxWithDefaults.bridgeAddresses!.sharedL1

  if (
    depositSpecification.approveERC20 ||
    depositSpecification.approveBaseERC20
  ) {
    const allowance = await getAllowanceL1(clientL1, {
      token: baseToken,
      bridgeAddress: sharedBridge,
    })

    if (allowance < depositTx.approveMintValue) {
      const approveTxHash = await approveErc20L1(clientL1, {
        token: baseToken,
        amount: depositTx.approveMintValue,
        sharedL1Address: sharedBridge,
        overrides: {
          bridgeAddress: sharedBridge,
          ...depositSpecification.approveBaseOverrides!,
        },
      } as ApproveErc20L1Parameters)
      await waitForTransactionReceipt(clientL1, { hash: approveTxHash })
    }
  }

  return await constructRequestL2TransactionDirectParameters(
    clientL1,
    depositTx,
  )
}
