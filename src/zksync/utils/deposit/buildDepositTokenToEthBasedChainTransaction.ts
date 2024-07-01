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
import { getL2TransactionBaseCost } from '../../actions/getL2TransactionBaseCost.js'
import type { DepositTransaction } from '../../types/deposit.js'
import { constructDepositSpecification } from './constructDepositSpecification.js'
import type { ConstructSendParametersRequestExecuteParametersReturnType as DepositArgs } from './constructRequestL2TransactionDirectParameters.js'
import { constructRequestL2TransactionTwoBridges } from './constructRequestL2TransactionTwoBridges.js'
import { getDepositTokenOnEthBasedChainTx } from './getDepositTokenOnEthBasedChainTx.js'
import { getDepositTxWithDefaults } from './getDepositTxWithDefaults.js'

export type DepositTokenToEthBasedChainParameters = DepositTransaction

export type DepositTOkenToEthBasedChainReturnType = DepositArgs

export async function depositTokenToEthBasedChain<
  TChainL1 extends Chain | undefined,
  TChainL2 extends Chain | undefined,
>(
  clientL1: Client<Transport, TChainL1, Account>,
  clientL2: Client<Transport, TChainL2, Account>,
  parameters: DepositTokenToEthBasedChainParameters,
): Promise<DepositTOkenToEthBasedChainReturnType> {
  const depositSpecification = await constructDepositSpecification(clientL1, {
    token: parameters.token!,
    amount: parameters.amount,
    to: clientL1.account.address,
    refundRecipient: clientL1.account.address,
    approveERC20: parameters.approveERC20 || false,
  })

  const depositTxWithDefaults = await getDepositTxWithDefaults(
    clientL2,
    depositSpecification,
  )

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

  const baseCost = await getL2TransactionBaseCost(
    clientL1,
    depositTxWithDefaults,
  )

  const getDepositTokenOnEthBasedChainTxParams = {
    ...depositTxWithDefaults,
    baseCost,
  }

  const depositTokenTx = await getDepositTokenOnEthBasedChainTx(
    getDepositTokenOnEthBasedChainTxParams,
  )

  const requestL2TransactionTwoBridgesParams =
    constructRequestL2TransactionTwoBridges(depositTokenTx)

  return requestL2TransactionTwoBridgesParams
}
