import type { Address } from 'abitype'
import { expect, test } from 'vitest'
import {
  getTransactionReceipt,
  sendTransaction,
  waitForTransactionReceipt,
} from '~viem/actions/index.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import {
  zkSyncLocalHyperchainL1,
  zkSyncLocalHyperchainL3,
} from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { http } from '../../clients/transports/http.js'
import { getAllBalances } from '../actions/getAllBalances.js'
import { getL1TokenBalance } from '../actions/getL1TokenBalance.js'
import { publicActionsL1 } from '../decorators/publicL1.js'
import { publicActionsL2 } from '../decorators/publicL2.js'
import { getL2TransactionFromPriorityOp } from '../utils/getL2TransactionFromPriorityOp.js'
import { depositNonBaseTokenToNonEthBasedChain } from './buildDepositNonBaseTokenToNonEthBasedChainTransaction.js'
import { getL2TokenAddress } from './l2TokenAddress.js'

const account = privateKeyToAccount(
  '0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110',
)

const clientL1 = createClient({
  chain: zkSyncLocalHyperchainL1,
  transport: http(),
  account,
}).extend(publicActionsL1())

const clientL2 = createClient({
  chain: zkSyncLocalHyperchainL3,
  transport: http(),
  account,
}).extend(publicActionsL2())

test('DepositNonBaseTokenOnNonETHBasedChainTx', async () => {
  const DAI_L1 = '0x70a0F165d6f8054d0d0CF8dFd4DD2005f0AF6B55' as Address
  const token = DAI_L1
  const amount = 5n

  const depositParams = {
    token,
    amount,
    refundRecipient: account.address,
    approveBaseERC20: true,
    approveERC20: true,
  }

  const defaultBridges = await clientL2.getDefaultBridgeAddresses()
  const baseToken = await clientL2.getBaseTokenL1Address()

  const l2DaiAddress = await getL2TokenAddress(clientL2, {
    token: DAI_L1,
    sharedL2: defaultBridges.sharedL2,
    baseTokenAddress: baseToken,
  })
  const allBalances = await getAllBalances(clientL2, { account })
  const l2DaiBalance = allBalances[l2DaiAddress.toLowerCase() as Address]
  const l2BalanceBeforeDeposit = l2DaiBalance
  const l1BalanceBeforeDeposit = await getL1TokenBalance(clientL1, {
    token: DAI_L1,
  })

  const txSend = await depositNonBaseTokenToNonEthBasedChain(
    clientL1,
    clientL2,
    depositParams,
  )

  const hash = await sendTransaction(clientL1, txSend)

  await waitForTransactionReceipt(clientL1, { hash })

  const l1TxReceipt = await getTransactionReceipt(clientL1, {
    hash,
  })

  expect(
    await getL2TransactionFromPriorityOp(clientL2, {
      l1TransactionReceipt: l1TxReceipt,
    }),
  ).toBeDefined()

  const allBalancesAfterDeposit = await getAllBalances(clientL2, { account })
  const l2DaiBalanceAfterDeposit =
    allBalancesAfterDeposit[l2DaiAddress.toLowerCase() as Address]
  const l2BalanceAfterDeposit = l2DaiBalanceAfterDeposit
  const l1BalanceAfterDeposit = await getL1TokenBalance(clientL1, {
    token: DAI_L1,
  })

  expect(l2BalanceAfterDeposit - l2BalanceBeforeDeposit >= amount).to.be.true
  expect(l1BalanceBeforeDeposit - l1BalanceAfterDeposit >= amount).to.be.true
})
