import type { Address } from 'abitype'
import { test } from 'vitest'

import { createWalletClient, http } from '../../clients/index.js'
import type { Account, Chain } from '../../types/index.js'
import { anvilChain, localHttpUrl } from '../../_test/index.js'
import { sendTransaction } from './sendTransaction.js'

const walletClient = createWalletClient({
  account: '0x',
  chain: anvilChain,
  transport: http(localHttpUrl),
})
const walletClientWithoutAccount = createWalletClient({
  chain: anvilChain,
  transport: http(localHttpUrl),
})
const walletClientWithoutChain = createWalletClient({
  account: '0x',
  transport: http(localHttpUrl),
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

test('with and without `account`', () => {
  sendTransaction(walletClient, {
    chain: anvilChain as Chain | undefined,
    // ^?
  })
  sendTransaction(walletClientWithoutChain, {
    chain: anvilChain as Chain,
    // ^?
  })
})
