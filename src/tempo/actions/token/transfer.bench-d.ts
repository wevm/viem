import { attest } from '@ark/attest'
import { test } from 'vitest'

import { tempoLocalnet } from 'viem/chains'
import { Account, Client, http } from 'viem/tempo'

import { transfer } from './transfer.js'

const account = Account.fromSecp256k1(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)
const client = Client.create({
  account,
  chain: tempoLocalnet,
  transport: http(),
})
const token = '0x20c0000000000000000000000000000000000001'

// Calls stay wrapped in uninvoked closures; only inference cost is measured.
test('transfer', () => {
  const res = () => transfer(client, { amount: 1n, to: '0x', token })
  attest.instantiations([15898, 'instantiations'])
  void res
})
