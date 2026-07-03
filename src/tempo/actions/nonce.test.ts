import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Actions as CoreActions } from 'viem'
import { Actions } from 'viem/tempo'

const client = tempo.getClient()

test('default: reads the nonce for a fresh key', async () => {
  await expect(
    Actions.nonce.getNonce(client, {
      account: tempo.accounts[5].address,
      nonceKey: 1n,
    }),
  ).resolves.toBe(0n)
})

test('behavior: increments after a 2D-nonce transaction', async () => {
  const account = client.account!
  const nonceKey = 42n

  const before = await Actions.nonce.getNonce(client, {
    account: account.address,
    nonceKey,
  })

  await CoreActions.transaction.sendSync(client, {
    feeToken: tempo.alphaUsd,
    nonceKey,
    to: tempo.accounts[7].address,
  } as never)

  await expect(
    Actions.nonce.getNonce(client, { account: account.address, nonceKey }),
  ).resolves.toBe(before + 1n)
})

test('behavior: different nonce keys are independent', async () => {
  const account = client.account!
  const nonceKey = 101n
  const otherKey = 102n

  expect(
    await Actions.nonce.getNonce(client, {
      account: account.address,
      nonceKey,
    }),
  ).toBe(0n)
  expect(
    await Actions.nonce.getNonce(client, {
      account: account.address,
      nonceKey: otherKey,
    }),
  ).toBe(0n)

  await Actions.token.transferSync(client, {
    amount: 1n,
    feeToken: tempo.alphaUsd,
    nonceKey: otherKey,
    to: tempo.accounts[7].address,
    token: 1n,
  } as never)

  expect(
    await Actions.nonce.getNonce(client, {
      account: account.address,
      nonceKey,
    }),
  ).toBe(0n)
  expect(
    await Actions.nonce.getNonce(client, {
      account: account.address,
      nonceKey: otherKey,
    }),
  ).toBe(1n)
})

test('behavior: different accounts are independent', async () => {
  const account = client.account!
  const nonceKey = 201n

  await Actions.token.transferSync(client, {
    amount: 1n,
    feeToken: tempo.alphaUsd,
    nonceKey,
    to: tempo.accounts[7].address,
    token: 1n,
  } as never)

  expect(
    await Actions.nonce.getNonce(client, {
      account: account.address,
      nonceKey,
    }),
  ).toBe(1n)
  expect(
    await Actions.nonce.getNonce(client, {
      account: tempo.accounts[7].address,
      nonceKey,
    }),
  ).toBe(0n)
})

describe('watchIncremented', () => {
  test('default', async () => {
    const account = client.account!
    const nonceKey = 501n

    const watcher = Actions.nonce.watchIncremented(client, {
      args: { account: account.address, nonceKey },
    } as never)
    type Log = Parameters<Parameters<(typeof watcher)['onLogs']>[0]>[0][number]
    const logs: Log[] = []
    watcher.onLogs((received) => logs.push(...received))

    try {
      // Explicit lane nonces: `eth_fillTransaction` does not fill keyed nonces.
      await Actions.token.transferSync(client, {
        amount: 1n,
        feeToken: tempo.alphaUsd,
        nonce: 0,
        nonceKey,
        to: tempo.accounts[7].address,
        token: 1n,
      } as never)
      await Actions.token.transferSync(client, {
        amount: 1n,
        feeToken: tempo.alphaUsd,
        nonce: 1,
        nonceKey,
        to: tempo.accounts[7].address,
        token: 1n,
      } as never)

      for (let i = 0; i < 50 && logs.length < 2; i++)
        await new Promise((resolve) => setTimeout(resolve, 100))

      expect(logs).toHaveLength(2)
      expect(logs[0]!.args.account).toBe(account.address)
      expect(logs[0]!.args.nonceKey).toBe(nonceKey)
      expect(logs[0]!.args.newNonce).toBe(1n)
      expect(logs[1]!.args.newNonce).toBe(2n)
    } finally {
      watcher.off()
    }
  })
})
