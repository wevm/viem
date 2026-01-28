import { setTimeout } from 'node:timers/promises'
import { beforeEach, describe, expect, test } from 'vitest'
import { accounts, getClient } from '~test/tempo/config.js'
import * as Prool from '~test/tempo/prool.js'
import * as actions from './index.js'

const account = accounts[0]
const account2 = accounts[1]

const client = getClient({
  account,
})

beforeEach(async () => {
  await Prool.restart(client)
})

describe('getNonce', () => {
  test('default', async () => {
    // Get nonce for an account with previously unused noncekey
    const nonce = await actions.nonce.getNonce(client, {
      account: account.address,
      nonceKey: 1n,
    })

    expect(nonce).toBe(0n)
  })

  test('behavior: different nonce keys are independent', async () => {
    let nonce1 = await actions.nonce.getNonce(client, {
      account: account.address,
      nonceKey: 1n,
    })
    let nonce2 = await actions.nonce.getNonce(client, {
      account: account.address,
      nonceKey: 2n,
    })

    expect(nonce1).toBe(0n)
    expect(nonce2).toBe(0n)

    await actions.token.transferSync(client, {
      to: account2.address,
      amount: 1n,
      token: 1n,
      nonceKey: 2n,
    })

    nonce1 = await actions.nonce.getNonce(client, {
      account: account.address,
      nonceKey: 1n,
    })
    nonce2 = await actions.nonce.getNonce(client, {
      account: account.address,
      nonceKey: 2n,
    })

    // nonceKey 2 should be incremented to 2
    expect(nonce1).toBe(0n)
    expect(nonce2).toBe(1n)
  })

  test('behavior: different accounts are independent', async () => {
    await actions.token.transferSync(client, {
      to: account2.address,
      amount: 1n,
      token: 1n,
      nonceKey: 1n,
    })
    const nonce1 = await actions.nonce.getNonce(client, {
      account: account.address,
      nonceKey: 1n,
    })
    const nonce2 = await actions.nonce.getNonce(client, {
      account: account2.address,
      nonceKey: 1n,
    })

    expect(nonce1).toBe(1n)
    expect(nonce2).toBe(0n)
  })
})

describe('watchNonceIncremented', () => {
  test('default', async () => {
    const events: Array<{
      args: actions.nonce.watchNonceIncremented.Args
      log: actions.nonce.watchNonceIncremented.Log
    }> = []

    const unwatch = actions.nonce.watchNonceIncremented(client, {
      onNonceIncremented: (args, log) => {
        events.push({ args, log })
      },
      args: {
        account: account.address,
        nonceKey: 5n,
      },
    })

    try {
      // Have to manually set nonce because eth_FillTransaction does not support nonce keys
      await actions.token.transferSync(client, {
        to: account2.address,
        amount: 1n,
        token: 1n,
        nonceKey: 5n,
        nonce: 0,
      })

      await actions.token.transferSync(client, {
        to: account2.address,
        amount: 1n,
        token: 1n,
        nonceKey: 5n,
        nonce: 1,
      })

      await setTimeout(1000)

      expect(events).toHaveLength(2)
      expect(events[0]!.args.account).toBe(account.address)
      expect(events[0]!.args.nonceKey).toBe(5n)
      expect(events[0]!.args.newNonce).toBe(1n)
      expect(events[1]!.args.newNonce).toBe(2n)
    } finally {
      unwatch()
    }
  })
})
