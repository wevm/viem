import { expect, test } from 'vitest'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import {
  getTransactionReceipt,
  waitForTransactionReceipt,
} from '../../actions/index.js'
import { zkSyncLocalNode, zkSyncLocalNodeL1 } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { createWalletClient } from '../../clients/createWalletClient.js'
import { http } from '../../clients/transports/http.js'
import { publicActionsL1 } from '../decorators/publicL1.js'
import { publicActionsL2 } from '../decorators/publicL2.js'
import { constructDepositSpecification } from '../utils/constructDepositParams.js'
import { constructRequestL2TransactionDirectParameters } from '../utils/constructRequestL2TransactionDirectParameters.js'
import { getDepositETHOnETHBasedChainTx } from '../utils/getDepositETHOnETHBasedChainTx.js'
import { getDepositTxWithDefaults } from '../utils/getDepositTxWithDefaults.js'
import { getL2TransactionFromPriorityOp } from '../utils/getL2TransactionFromPriorityOp.js'
import { getRequestExecuteTxDefaults } from '../utils/getRequestExecuteTxDefaults.js'
import { sendTransaction } from './sendTransaction.js'

const account = privateKeyToAccount(
  '0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110',
)

const clientL1 = createClient({
  chain: zkSyncLocalNodeL1,
  transport: http(),
  account,
}).extend(publicActionsL1())

const clientL2 = createClient({
  chain: zkSyncLocalNode,
  transport: http(),
  account,
}).extend(publicActionsL2())

const walletL1 = createWalletClient({
  chain: zkSyncLocalNodeL1,
  transport: http(),
  account,
})

test('depositETHToETHBasedChain', async () => {
  const token = '0x0000000000000000000000000000000000000000'
  const amount = 1n

  const depositSpecification = await constructDepositSpecification(clientL1, {
    token,
    amount,
    refundRecipient: account.address,
  })

  const depositTxWithDefaults = await getDepositTxWithDefaults(
    clientL2,
    depositSpecification,
  )

  const baseCost = await clientL1.getL2TransactionBaseCost(
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

  const hash = await sendTransaction(
    walletL1,
    requestL2TransactionDirectParameters,
  )

  await waitForTransactionReceipt(clientL1, { hash })

  const l1TxReceipt = await getTransactionReceipt(clientL1, { hash })

  expect(
    await getL2TransactionFromPriorityOp(clientL2, {
      l1TransactionReceipt: l1TxReceipt,
    }),
  ).toBeDefined()
})
