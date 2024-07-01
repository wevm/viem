import { expect, test } from 'vitest'
import {
  getBalance,
  getTransactionReceipt,
  sendTransaction,
  waitForTransactionReceipt,
} from '~viem/actions/index.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import { zkSyncChainL1, zkSyncChainL3 } from '../../../chains/index.js'
import { createClient } from '../../../clients/createClient.js'
import { http } from '../../../clients/transports/http.js'
import { getBaseTokenL1Address } from '../../actions/getBaseTokenL1Address.js'
import { publicActionsL1 } from '../../decorators/publicL1.js'
import { publicActionsL2 } from '../../decorators/publicL2.js'
import { depositBaseTokenToNonEthBasedChain } from './buildDepositBaseTokenToNonEthBasedChainTransaction.js'
import { getL2TransactionFromPriorityOp } from './getL2TransactionFromPriorityOp.js'

const account = privateKeyToAccount(
  '0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110',
)

const clientL1 = createClient({
  chain: zkSyncChainL1,
  transport: http(),
  account,
}).extend(publicActionsL1())

const clientL2 = createClient({
  chain: zkSyncChainL3,
  transport: http(),
  account,
}).extend(publicActionsL2())

test('depositBaseTokenToNonEthBasedChain.test', async () => {
  const baseTokenL1 = await getBaseTokenL1Address(clientL2)
  const amount = 1n
  const walletAddress = account.address

  const tx = {
    token: baseTokenL1,
    to: walletAddress,
    amount: amount,
    approveERC20: true,
    refundRecipient: walletAddress,
  }

  const sendTxParams = await depositBaseTokenToNonEthBasedChain(
    clientL1,
    clientL2,
    tx,
  )

  const l2BalanceBeforeDeposit = await getBalance(clientL2, {
    address: account.address,
  })
  const l1BalanceBeforeDeposit = await clientL1.getL1TokenBalance({
    token: baseTokenL1,
  })

  const hash = await sendTransaction(clientL1, sendTxParams)

  await waitForTransactionReceipt(clientL1, { hash })

  const l1TxReceipt = await getTransactionReceipt(clientL1, { hash })

  expect(
    await getL2TransactionFromPriorityOp(clientL2, {
      l1TransactionReceipt: l1TxReceipt,
    }),
  ).toBeDefined()

  const l2BalanceAfterDeposit = await getBalance(clientL2, {
    address: account.address,
  })
  const l1BalanceAfterDeposit = await clientL1.getL1TokenBalance({
    token: baseTokenL1,
  })

  expect(l2BalanceAfterDeposit - l2BalanceBeforeDeposit >= amount).to.be.true
  expect(l1BalanceBeforeDeposit - l1BalanceAfterDeposit >= 0n).to.be.true
})
