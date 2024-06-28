import { attest } from '@arktype/attest'
import { test } from 'vitest'

import { createClient } from './createClient.js'
import { createPublicClient } from './createPublicClient.js'
import { publicActions } from './decorators/public.js'
import { http } from './transports/http.js'

test('createPublicClient', () => {
  createPublicClient({
    transport: http('https://cloudflare-eth.com'),
  })
  attest.instantiations([12236, 'instantiations'])
})

test('createClient.extend + publicActions', () => {
  createClient({
    transport: http('https://cloudflare-eth.com'),
  }).extend(publicActions)
  attest.instantiations([247705, 'instantiations'])
})
