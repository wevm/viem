import { attest } from '@ark/attest'
import { test } from 'vitest'

import { createClient } from './createClient.js'
import { createPublicClient } from './createPublicClient.js'
import { publicActions } from './decorators/public.js'
import { http } from './transports/http.js'

test('createPublicClient', () => {
  createPublicClient({
    transport: http('https://cloudflare-eth.com'),
  })
  attest.instantiations([13956, 'instantiations'])
})

test('createClient.extend + publicActions', () => {
  createClient({
    transport: http('https://cloudflare-eth.com'),
  }).extend(publicActions)
  attest.instantiations([328328, 'instantiations'])
})
