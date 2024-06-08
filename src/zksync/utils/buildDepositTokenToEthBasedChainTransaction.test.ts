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
import { http } from '../../clients/transports/http.js'
import { publicActionsL1 } from '../decorators/publicL1.js'
import { publicActionsL2 } from '../decorators/publicL2.js'
import { getL2TransactionFromPriorityOp } from '../utils/getL2TransactionFromPriorityOp.js'
import { depositTokenToEthBasedChain } from './buildDepositTokenToEthBasedChainTransaction.js'

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

test('depositTokenToETHBasedChain', async () => {
  const DAI_L1 = '0x70a0F165d6f8054d0d0CF8dFd4DD2005f0AF6B55'
  const token = DAI_L1
  const amount = 5n

  const depositTokenArgs = await depositTokenToEthBasedChain(
    clientL1,
    clientL2,
    {
      token,
      amount,
      approveERC20: true,
    },
  )

  const hash = await sendTransaction(clientL1, depositTokenArgs)

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
