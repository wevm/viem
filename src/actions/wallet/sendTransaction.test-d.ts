import type { Address } from 'abitype'

import { test } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'
import type { Account } from '../../accounts/types.js'
import { createWalletClient } from '../../clients/createWalletClient.js'
import { http } from '../../clients/transports/http.js'
import type { Chain } from '../../types/chain.js'

import { sendTransaction } from './sendTransaction.js'

const walletClient = createWalletClient({
  account: '0x',
  chain: anvilMainnet.chain,
  transport: http(anvilMainnet.rpcUrl.http),
})
const walletClientWithoutAccount = createWalletClient({
  chain: anvilMainnet.chain,
  transport: http(anvilMainnet.rpcUrl.http),
})
const walletClientWithoutChain = createWalletClient({
  account: '0x',
  transport: http(anvilMainnet.rpcUrl.http),
})

test('with and without `account`', () => {
  sendTransaction(walletClient, {
    account: '0x' as Account | Address | undefined,
    // ^?
  })
  sendTransaction(walletClientWithoutAccount, {
    account: '0x' as Account | Address,
    // ^?
  })
})

test('with and without `chain`', () => {
  sendTransaction(walletClient, {
    chain: anvilMainnet.chain as Chain | undefined,
    // ^?
  })
  sendTransaction(walletClientWithoutChain, {
    chain: anvilMainnet.chain as Chain,
    // ^?
  })
})

test('legacy', () => {
  sendTransaction(walletClient, {
    gasPrice: 0n,
  })

  // @ts-expect-error
  sendTransaction(walletClient, {
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  sendTransaction(walletClient, {
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'legacy',
  })
  // @ts-expect-error
  sendTransaction(walletClient, {
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'legacy',
  })
})

test('eip1559', () => {
  sendTransaction(walletClient, {
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  sendTransaction(walletClient, {
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  sendTransaction(walletClient, {
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip1559',
  })
  // @ts-expect-error
  sendTransaction(walletClient, {
    gasPrice: 0n,
    type: 'eip1559',
  })
})

test('eip2930', () => {
  sendTransaction(walletClient, {
    accessList: [],
    gasPrice: 0n,
  })

  // @ts-expect-error
  sendTransaction(walletClient, {
    accessList: [],
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  sendTransaction(walletClient, {
    accessList: [],
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip2930',
  })
  // @ts-expect-error
  sendTransaction(walletClient, {
    accessList: [],
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip2930',
  })
})
