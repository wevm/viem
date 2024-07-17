import { attest } from '@arktype/attest'
import { test } from 'vitest'

import { createClient } from './createClient.js'
import { createTestClient } from './createTestClient.js'
import { testActions } from './decorators/test.js'
import { http } from './transports/http.js'

test('createTestClient', () => {
  createTestClient({
    mode: 'anvil',
    transport: http('https://cloudflare-eth.com'),
  })
  attest.instantiations([2100, 'instantiations'])
})

test('createClient.extend + testActions', () => {
  createClient({
    transport: http('https://cloudflare-eth.com'),
  }).extend(testActions({ mode: 'anvil' }))
  attest.instantiations([6329, 'instantiations'])
})
