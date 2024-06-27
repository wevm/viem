import { expect, test } from 'vitest'
import { sendTransaction } from '../../actions/sendTransaction.js'

import type { Address } from 'abitype'
import { getBalance, waitForTransactionReceipt } from '~viem/actions/index.js'
import {
  approvalTokenAddress,
  paymasterAddress,
} from '~viem/zksync/constants/address.js'
import type { TransferTransaction } from '~viem/zksync/types/transfer.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import { zkSyncChainL2, zkSyncChainL3 } from '../../../chains/index.js'
import { createClient } from '../../../clients/createClient.js'
import { http } from '../../../clients/transports/http.js'
import { publicActionsL2 } from '../../decorators/publicL2.js'
import { getL2TokenAddress } from '../l2TokenAddress.js'
import { getApprovalBasedPaymasterInput } from '../paymaster/getApprovalBasedPaymasterInput.js'
import { getErc20TokenBalance } from '../withdraw/getErc20TokenBalance.js'
import { getTransferArgs } from './transfer.js'

const account = privateKeyToAccount(
  '0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110',
)

const clientL2 = createClient({
  chain: zkSyncChainL2,
  transport: http(),
  account,
}).extend(publicActionsL2())

const clientL3 = createClient({
  chain: zkSyncChainL3,
  transport: http(),
  account,
}).extend(publicActionsL2())

const address2 = '0xa61464658AfeAf65CccaaFD3a512b69A83B77618' as Address

test('transfer - ETH', async () => {
  const amount = 1n

  const transferTx = {
    amount: amount,
    to: address2,
  }

  const balanceBeforeTransfer = await getBalance(clientL2, {
    address: address2,
  })

  const result = await getTransferArgs(clientL2, transferTx)

  const hash = await sendTransaction(clientL2, result)

  const receipt = await waitForTransactionReceipt(clientL2, { hash })

  expect(receipt).toBeDefined()

  const balanceAfterTransfer = await getBalance(clientL2, { address: address2 })

  expect(balanceAfterTransfer - balanceBeforeTransfer).to.be.equal(amount)
})

test('transfer - ETH using paymaster to cover gas fees', async () => {
  const amount = 7_000_000_000n
  const minimalAllowance = 1n

  const transferTx: TransferTransaction = {
    amount: amount,
    to: address2,
    paymasterParams: {
      paymaster: paymasterAddress,
      paymasterInput: getApprovalBasedPaymasterInput({
        token: approvalTokenAddress,
        minAllowance: minimalAllowance,
        innerInput: '0x',
      }),
    },
  }

  const balanceBeforeTransfer = await getBalance(clientL2, {
    address: address2,
  })

  const result = await getTransferArgs(clientL2, transferTx)

  const hash = await sendTransaction(clientL2, { ...result })

  const receipt = await waitForTransactionReceipt(clientL2, { hash })

  expect(receipt).toBeDefined()

  const balanceAfterTransfer = await getBalance(clientL2, { address: address2 })

  expect(balanceAfterTransfer - balanceBeforeTransfer).to.be.equal(amount)
})

test('transfer - DAI', async () => {
  const amount = 5n

  const DAI_L1 = '0x70a0F165d6f8054d0d0CF8dFd4DD2005f0AF6B55' as Address
  const defaultBridges = await clientL2.getDefaultBridgeAddresses()
  const baseToken = await clientL2.getBaseTokenL1Address()

  const l2DaiAddress = await getL2TokenAddress(clientL2, {
    token: DAI_L1,
    sharedL2: defaultBridges.sharedL2,
    baseTokenAddress: baseToken,
  })

  const transferTx = {
    token: l2DaiAddress,
    amount: amount,
    to: address2,
  }

  const balanceBeforeTransfer = await getErc20TokenBalance(clientL2, {
    token: l2DaiAddress,
    address: address2,
  })

  const result = await getTransferArgs(clientL2, transferTx)

  const hash = await sendTransaction(clientL2, result)

  const receipt = await waitForTransactionReceipt(clientL2, { hash })

  expect(receipt).toBeDefined()

  const balanceAfterTransfer = await getErc20TokenBalance(clientL2, {
    token: l2DaiAddress,
    address: address2,
  })

  expect(balanceAfterTransfer - balanceBeforeTransfer).to.be.equal(amount)
})

test('transfer - non ETH based - ETH ', async () => {
  const amount = 1n

  const transferTx = {
    amount: amount,
    to: address2,
  }

  const balanceBeforeTransfer = await getBalance(clientL3, {
    address: address2,
  })

  const result = await getTransferArgs(clientL3, transferTx)

  const hash = await sendTransaction(clientL3, result)

  const receipt = await waitForTransactionReceipt(clientL3, { hash })

  expect(receipt).toBeDefined()

  const balanceAfterTransfer = await getBalance(clientL3, { address: address2 })

  expect(balanceAfterTransfer - balanceBeforeTransfer).to.be.equal(amount)
})

test('transfer - non ETH based - ETH using paymaster to cover gas fees', async () => {
  const amount = 10n
  const minimalAllowance = 1n

  const transferTx = {
    amount: amount,
    to: address2,
    paymasterParams: {
      paymaster: paymasterAddress,
      paymasterInput: getApprovalBasedPaymasterInput({
        token: approvalTokenAddress,
        minAllowance: minimalAllowance,
        innerInput: '0x',
      }),
    },
  }

  const balanceBeforeTransfer = await getBalance(clientL3, {
    address: address2,
  })

  const result = await getTransferArgs(clientL3, transferTx)

  const hash = await sendTransaction(clientL3, { ...result })

  const receipt = await waitForTransactionReceipt(clientL3, { hash })

  expect(receipt).toBeDefined()

  const balanceAfterTransfer = await getBalance(clientL3, { address: address2 })

  expect(balanceAfterTransfer - balanceBeforeTransfer).to.be.equal(amount)
})
