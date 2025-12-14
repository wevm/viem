import { attest } from '@ark/attest'
import { createClient, http } from 'viem'
import { tempoTestnet } from 'viem/chains'
import { test } from 'vitest'

test('decorator', () => {
  createClient({
    chain: tempoTestnet,
    transport: http('https://cloudflare-eth.com'),
  })
  attest.instantiations([79013, 'instantiations'])
})
