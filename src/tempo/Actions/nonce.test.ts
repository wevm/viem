import { setTimeout } from 'node:timers/promises'
import { afterEach, describe, expect, test } from 'vitest'
import { accounts, getClient } from '~test/tempo/config.js'
import { rpcUrl } from '~test/tempo/prool.js'
import * as actions from './index.js'

const account = accounts[0]
const account2 = accounts[1]

const client = getClient({
  account,
})

afterEach(async () => {
  await fetch(`${rpcUrl}/restart`)
})

describe('getNonce', () => {
  test('default', async () => {
    // Get nonce for an account with previously unused noncekey
    const nonce = await actions.nonce.getNonce(client, {
      account: account.address,
      nonceKey: 1n,
    })

    expect(nonce).toBe(1n)
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

    expect(nonce1).toBe(1n)
    expect(nonce2).toBe(1n)

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
    expect(nonce1).toBe(1n)
    expect(nonce2).toBe(2n)
  })

  test('behavior: different accounts are independent', async () => {
    const nonce1 = await actions.nonce.getNonce(client, {
      account: account.address,
      nonceKey: 1n,
    })
    const nonce2 = await actions.nonce.getNonce(client, {
      account: account2.address,
      nonceKey: 1n,
    })

    // Both should return bigint values
    expect(nonce1).toBe(1n)
    expect(nonce2).toBe(1n)
  })
})

describe('getNonceKeyCount', () => {
  test('default', async () => {
    // Get active nonce key count for a fresh account
    const count = await actions.nonce.getNonceKeyCount(client, {
      account: account.address,
    })

    // Fresh account should have 0 active nonce keys
    expect(count).toBe(0n)
  })

  test('behavior: different accounts are independent', async () => {
    const count1 = await actions.nonce.getNonceKeyCount(client, {
      account: account.address,
    })
    const count2 = await actions.nonce.getNonceKeyCount(client, {
      account: account2.address,
    })

    // Both should be 0 for fresh accounts
    expect(count1).toBe(0n)
    expect(count2).toBe(0n)
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

describe('watchActiveKeyCountChanged', () => {
  test('default', async () => {
    const events: Array<{
      args: actions.nonce.watchActiveKeyCountChanged.Args
      log: actions.nonce.watchActiveKeyCountChanged.Log
    }> = []

    const unwatch = actions.nonce.watchActiveKeyCountChanged(client, {
      onActiveKeyCountChanged: (args, log) => {
        events.push({ args, log })
      },
    })

    try {
      // First use of nonceKey 10 should increment active key count
      await actions.token.transferSync(client, {
        to: account2.address,
        amount: 1n,
        token: 1n,
        nonceKey: 10n,
        nonce: 0,
      })

      // First use of nonceKey 11 should increment again
      await actions.token.transferSync(client, {
        to: account2.address,
        amount: 1n,
        token: 1n,
        nonceKey: 11n,
        nonce: 0,
      })

      await setTimeout(1000)

      expect(events).toHaveLength(2)
      expect(events[0]!.args.account).toBe(account.address)
      expect(events[0]!.args.newCount).toBe(1n)
      expect(events[1]!.args.newCount).toBe(2n)
    } finally {
      unwatch()
    }
  })
})
