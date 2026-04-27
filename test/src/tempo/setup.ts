import { setTimeout } from 'node:timers/promises'
import { afterAll, beforeAll } from 'vitest'
import { faucet } from '../../../src/tempo/actions/index.js'
import { Actions } from '../../../src/tempo/index.js'
import { withRetry } from '../../../src/utils/promise/withRetry.js'
import { withTimeout } from '../../../src/utils/promise/withTimeout.js'
import { accounts, addresses, getClient, nodeEnv } from './config.js'
import * as Prool from './prool.js'

const client = getClient()

beforeAll(async () => {
  if (nodeEnv === 'localnet') {
    await Prool.setup(client)
    return
  }

  await withRetry(
    () =>
      withTimeout(
        async () =>
          faucet.fundSync(client, {
            account: accounts[0].address,
          }),
        {
          errorInstance: new Error('faucet fund timed out'),
          timeout: 20_000,
        },
      ),
    {
      delay: ({ count }) => (count + 1) * 1_000,
      retryCount: 2,
    },
  )
  // TODO: remove once testnet load balancing is fixed.
  await setTimeout(2000)

  if (nodeEnv === 'mainnet') {
    await Actions.fee.setUserTokenSync(client, {
      account: accounts[0],
      token: addresses.DONOTUSE,
    })
    return
  }
})

afterAll(async () => {
  if (nodeEnv !== 'localnet') return
  await fetch(`${Prool.rpcUrl}/stop`)
})
