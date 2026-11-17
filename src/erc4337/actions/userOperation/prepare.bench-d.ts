import { attest } from '@ark/attest'
import { test } from 'vitest'

import { http } from 'viem'
import * as BundlerClient from '../../BundlerClient.js'
import type * as Simple7702SmartAccount from '../../Simple7702SmartAccount.js'
import { prepare } from './prepare.js'
import { send } from './send.js'

// Type-only stand-in; the account is never invoked at runtime.
const account = {} as Simple7702SmartAccount.Account
const address = '0x0000000000000000000000000000000000000001'

const client = BundlerClient.create({
  account,
  transport: http('https://cloudflare-eth.com'),
})

// Calls stay wrapped in uninvoked closures; only inference cost is measured.
test('prepare', () => {
  const res = () => prepare(client, { calls: [{ to: address }] })
  attest.instantiations([313196, 'instantiations'])
  void res
})

test('send', () => {
  const res = () => send(client, { calls: [{ to: address }] })
  attest.instantiations([308672, 'instantiations'])
  void res
})
