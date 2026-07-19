import { attest } from '@ark/attest'
import { test } from 'vitest'

import { Client, http, publicActions } from 'viem'

test('create', () => {
  Client.create({ transport: http('https://cloudflare-eth.com') })
  attest.instantiations([1080, 'instantiations'])
})

test('create + extend(publicActions())', () => {
  Client.create({ transport: http('https://cloudflare-eth.com') }).extend(
    publicActions(),
  )
  attest.instantiations([114847, 'instantiations'])
})
