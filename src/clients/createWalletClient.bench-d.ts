import { attest } from '@ark/attest'
import { test } from 'vitest'

import { createClient } from './createClient.js'
import { createWalletClient } from './createWalletClient.js'
import { walletActions } from './decorators/wallet.js'
import { http } from './transports/http.js'

test('createWalletClient', () => {
  createWalletClient({
    transport: http('https://cloudflare-eth.com'),
  })
  attest.instantiations([3000, 'instantiations'])
})

test('createClient.extend + walletActions', () => {
  createClient({
    transport: http('https://cloudflare-eth.com'),
  }).extend(walletActions)
  attest.instantiations([179759, 'instantiations'])
})
