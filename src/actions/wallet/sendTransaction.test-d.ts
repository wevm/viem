import type { Address } from 'abitype'

import { test } from 'vitest'

import { localHttpUrl } from '../../_test/constants.js'
import { anvilChain } from '../../_test/utils.js'
import type { Account } from '../../accounts/types.js'
import { createWalletClient } from '../../clients/createWalletClient.js'
import { http } from '../../clients/transports/http.js'
import type { Chain } from '../../types/chain.js'

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
