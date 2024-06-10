import type { Address } from 'abitype'
import { expect, test } from 'vitest'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import {
  zkSyncLocalHyperchain,
  zkSyncLocalHyperchainL1,
  zkSyncLocalHyperchainL3,
} from '../../../chains/index.js'
import { createClient } from '../../../clients/createClient.js'
import { http } from '../../../clients/transports/http.js'
import { getBaseTokenL1Address } from '../../actions/getBaseTokenL1Address.js'
import { publicActionsL1 } from '../../decorators/publicL1.js'
import { publicActionsL2 } from '../../decorators/publicL2.js'
import { deposit } from './buildDepositTransaction.js'

const account = privateKeyToAccount(
  '0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110',
)

const clientL1Hyperchain = createClient({
  chain: zkSyncLocalHyperchainL1,
  transport: http(),
  account,
}).extend(publicActionsL1())

const clientL3Hyperchain = createClient({
  chain: zkSyncLocalHyperchainL3,
  transport: http(),
  account,
}).extend(publicActionsL2())

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

test('deposit - BaseTokenToNonEthBasedChain', async () => {
  const baseTokenL1 = await getBaseTokenL1Address(clientL3Hyperchain)
  const amount = 1n
  const walletAddress = account.address

  const tx = {
    token: baseTokenL1,
    to: walletAddress,
    amount: amount,
    approveERC20: true,
    refundRecipient: walletAddress,
  }

  const sendTxParams = await deposit(clientL1Hyperchain, clientL3Hyperchain, tx)

  expect(sendTxParams).toBeDefined()
})

test('deposit - NonBaseTokenOnNonETHBasedChain', async () => {
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

  const txSendParams = await deposit(
    clientL1Hyperchain,
    clientL3Hyperchain,
    depositParams,
  )

  expect(txSendParams).toBeDefined()
})

test('deposit - EthToNonEthBasedChain', async () => {
  const amount = 1n
  const depositParams = {
    token: '0x0000000000000000000000000000000000000000' as Address,
    amount,
    refundRecipient: account.address,
    approveBaseERC20: true,
  }

  const depositArgs = await deposit(
    clientL1Hyperchain,
    clientL3Hyperchain,
    depositParams,
  )

  expect(depositArgs).toBeDefined()
})

test('deposit - TokenToETHBasedChain', async () => {
  const DAI_L1 = '0x70a0F165d6f8054d0d0CF8dFd4DD2005f0AF6B55'
  const token = DAI_L1
  const amount = 5n

  const depositTokenArgs = await deposit(clientL1, clientL2, {
    token,
    amount,
    approveERC20: true,
  })

  expect(depositTokenArgs).toBeDefined()
})

test('deposit - ETHToETHBasedChain', async () => {
  const amount = 1n

  const depositArgs = await deposit(clientL1, clientL2, {
    amount,
    refundRecipient: account.address,
  })
  expect(depositArgs).toBeDefined()
})
