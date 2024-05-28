import { expect, test } from 'vitest'
import {
  getTransactionReceipt,
  sendTransaction,
  waitForTransactionReceipt,
} from '~viem/actions/index.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import {
  zkSyncLocalHyperchain,
  zkSyncLocalHyperchainL1,
} from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { createWalletClient } from '../../clients/createWalletClient.js'
import { http } from '../../clients/transports/http.js'
import { approveErc20L1 } from '../actions/approveL1Erc20Token.js'
import { getAllowanceL1 } from '../actions/getAllowanceL1.js'
import { publicActionsL1 } from '../decorators/publicL1.js'
import { publicActionsL2 } from '../decorators/publicL2.js'
import { constructDepositSpecification } from '../utils/constructDepositSpecification.js'
import { getDepositTxWithDefaults } from '../utils/getDepositTxWithDefaults.js'
import { getL2TransactionFromPriorityOp } from '../utils/getL2TransactionFromPriorityOp.js'
import { constructRequestL2TransactionTwoBridges } from './constructRequestL2TransactionTwoBridges.js'
import { getDepositTokenOnEthBasedChainTx } from './getDepositTokenOnEthBasedChainTx.js'

const account = privateKeyToAccount(
  '0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110',
)

const clientL1 = createClient({
  chain: zkSyncLocalHyperchainL1,
  transport: http(),
  account,
}).extend(publicActionsL1())

const clientL2 = createClient({
  chain: zkSyncLocalHyperchain,
  transport: http(),
  account,
}).extend(publicActionsL2())

const walletL1 = createWalletClient({
  chain: zkSyncLocalHyperchainL1,
  transport: http(),
  account,
})

test('depositTokenToETHBasedChain', async () => {
  const DAI_L1 = '0x70a0F165d6f8054d0d0CF8dFd4DD2005f0AF6B55'
  const token = DAI_L1
  const amount = 5n

  const depositSpecification = await constructDepositSpecification(clientL1, {
    token,
    amount,
    to: account.address,
    refundRecipient: account.address,
    approveERC20: true,
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
      })
      await waitForTransactionReceipt(clientL1, { hash: approveTxHash })
    }
  }

  const baseCost = await clientL1.getL2TransactionBaseCost(
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

  const hash = await sendTransaction(
    walletL1,
    requestL2TransactionTwoBridgesParams,
  )

  await waitForTransactionReceipt(clientL1, { hash })

  const l1TxReceipt = await getTransactionReceipt(clientL1, {
    hash,
  })

  expect(
    await getL2TransactionFromPriorityOp(clientL2, {
      l1TransactionReceipt: l1TxReceipt,
    }),
  ).toBeDefined()
})
