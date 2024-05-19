import type { Address } from 'abitype'
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
import { isAddressEqualLite } from '../../utils/address/isAddressEqualLite.js'
import {
  ETH_ADDRESS_IN_CONTRACTS,
  LEGACY_ETH_ADDRESS,
} from '../constants/number.js'
import { publicActionsL1 } from '../decorators/publicL1.js'
import { publicActionsL2 } from '../decorators/publicL2.js'
import { constructSendParametersRequestExecute } from '../utils/constructSendParametersRequestExecute.js'
import {
  type DepositETHOnETHBasedChainTxReturnType,
  getDepositETHOnETHBasedChainTx,
} from '../utils/getDepositETHOnETHBasedChainTx.js'
import { getDepositTxWithDefaults } from '../utils/getDepositTxWithDefaults.js'
import { getERC20DefaultBridgeData } from '../utils/getERC20DefaultBridgeData.js'
import { getL2TransactionFromPriorityOp } from '../utils/getL2TransactionFromPriorityOp.js'
import { getRequestExecuteTxDefaults } from '../utils/getRequestExecuteTxDefaults.js'
import { getBridgehubContractAddress } from './getBridgehubContractAddress.js'
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
  const bridgehubContractAddress = await getBridgehubContractAddress(clientL2)

  const l2ChainId = BigInt(clientL2.chain.id)

  let token = '0x0000000000000000000000000000000000000000' as Address

  if (isAddressEqualLite(token, LEGACY_ETH_ADDRESS)) {
    token = ETH_ADDRESS_IN_CONTRACTS
  }
  const amount = 7_000_000_000n

  const depositParams = {
    token: token as Address,
    amount: amount,
    bridgehubContractAddress,
    l2ChainId,
    eRC20DefaultBridgeData: await getERC20DefaultBridgeData(clientL1, token),
    refundRecipient: account.address,
  }

  const depositTxWithDefaults = await getDepositTxWithDefaults(
    clientL2,
    depositParams,
  )

  const baseCost = await clientL1.getL2TransactionBaseCost(
    depositTxWithDefaults,
  )

  const getDepositETHOnETHBasedChainTxParams = {
    ...depositTxWithDefaults,
    baseCost,
  }
  const depositTx: DepositETHOnETHBasedChainTxReturnType =
    getDepositETHOnETHBasedChainTx(getDepositETHOnETHBasedChainTxParams)

  const requestExecuteTxDefauls: DepositETHOnETHBasedChainTxReturnType =
    await getRequestExecuteTxDefaults(clientL2, depositTx)

  requestExecuteTxDefauls.overrides!.maxFeePerGas = 1500000001n
  requestExecuteTxDefauls.overrides!.maxPriorityFeePerGas = 1500000000n

  const result = await constructSendParametersRequestExecute(
    clientL1,
    requestExecuteTxDefauls,
  )

  const hash = await sendTransaction(walletL1, result)

  await waitForTransactionReceipt(clientL1, { hash: hash })

  const l1TxReceipt = await getTransactionReceipt(clientL1, { hash })

  expect(
    await getL2TransactionFromPriorityOp(clientL2, {
      l1TransactionReceipt: l1TxReceipt,
    }),
  ).toBeDefined()
})
