import { attest } from '@ark/attest'
import { createClient, http } from 'viem'
import { tempoTestnet } from 'viem/chains'
import { test } from 'vitest'

test('default', () => {
  createClient({
    chain: tempoTestnet,
    transport: http('https://cloudflare-eth.com'),
  })
  attest.instantiations([145120, 'instantiations'])
})

test('behavior: with extend', () => {
  createClient({
    chain: tempoTestnet.extend({ feeToken: 1n }),
    transport: http('https://cloudflare-eth.com'),
  })
  attest.instantiations([145848, 'instantiations'])
})
