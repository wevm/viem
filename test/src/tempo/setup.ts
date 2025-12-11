import { setTimeout } from 'node:timers/promises'
import { afterAll, beforeAll } from 'vitest'
import { faucet } from '../../../src/tempo/Actions/index.js'
import { accounts, client, nodeEnv } from './config.js'
import { rpcUrl } from './prool.js'

beforeAll(async () => {
  if (nodeEnv === 'localnet') return
  await faucet.fundSync(client, {
    account: accounts[0].address,
  })
  // TODO: remove once testnet load balancing is fixed.
  await setTimeout(2000)
})

afterAll(async () => {
  if (nodeEnv !== 'localnet') return
  await fetch(`${rpcUrl}/stop`)
})
