import { attest } from '@ark/attest'
import { createClient, http } from 'viem'
import { test } from 'vitest'
import { decorator } from './Decorator.js'

test('decorator', () => {
  createClient({
    transport: http('https://cloudflare-eth.com'),
  }).extend(decorator())
  attest.instantiations([40758, 'instantiations'])
})
