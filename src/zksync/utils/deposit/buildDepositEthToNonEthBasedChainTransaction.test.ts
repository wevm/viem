import type { Address } from 'abitype'
import { expect, test } from 'vitest'
import {
  getTransactionReceipt,
  sendTransaction,
  waitForTransactionReceipt,
} from '~viem/actions/index.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import { zkSyncChainL1, zkSyncChainL3 } from '../../../chains/index.js'
import { createClient } from '../../../clients/createClient.js'
import { http } from '../../../clients/transports/http.js'
import { getBalanceL1 } from '../../actions/getBalanceL1.js'
import { l2TokenAddress } from '../../actions/l2TokenAddress.js'
import { ethAddressInContracts } from '../../constants/address.js'
import { publicActionsL1 } from '../../decorators/publicL1.js'
import { publicActionsL2 } from '../../decorators/publicL2.js'
import { depositEthToNonEthBasedChain } from './buildDepositEthToNonEthBasedChainTransaction.js'
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

test('DepositETHOnNonETHBasedChain', async () => {
  const amount = 1n
  const depositParams = {
    token: '0x0000000000000000000000000000000000000000' as Address,
    amount,
    refundRecipient: account.address,
    approveBaseERC20: true,
  }

  const requestL2TransactionTwoBridgesParams =
    await depositEthToNonEthBasedChain(clientL1, clientL2, depositParams)

  const bridges = await clientL2.getDefaultBridgeAddresses()
  const l2EthAddress = await l2TokenAddress(clientL2, {
    token: ethAddressInContracts,
    sharedL2: bridges.sharedL2,
  })

  const allBalances = await clientL2.getAllBalances({ account })
  const l2BalanceBeforeDeposit =
    allBalances[l2EthAddress.toLowerCase() as Address]
  const l1BalanceBeforeDeposit = await getBalanceL1(clientL1, { account })

  const hash = await sendTransaction(
    clientL1,
    requestL2TransactionTwoBridgesParams,
  )

  await waitForTransactionReceipt(clientL1, { hash })

  const l1TxReceipt = await getTransactionReceipt(clientL1, { hash })

  expect(
    await getL2TransactionFromPriorityOp(clientL2, {
      l1TransactionReceipt: l1TxReceipt,
    }),
  ).toBeDefined()

  const allBalancesAfterDeposit = await clientL2.getAllBalances({ account })
  const l2BalanceAfterDeposit =
    allBalancesAfterDeposit[l2EthAddress.toLowerCase() as Address]
  const l1BalanceAfterDeposit = await getBalanceL1(clientL1, { account })

  expect(l2BalanceAfterDeposit - l2BalanceBeforeDeposit >= amount).to.be.true
  expect(l1BalanceBeforeDeposit - l1BalanceAfterDeposit >= amount).to.be.true
})
