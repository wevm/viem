import { setTimeout } from 'node:timers/promises'
import { afterEach, describe, expect, test } from 'vitest'
import {
  accounts,
  feeToken,
  getClient,
  setupFeeToken,
} from '~test/tempo/config.js'
import * as Prool from '~test/tempo/prool.js'
import * as actions from './index.js'

const account = accounts[0]
const account2 = accounts[1]
const account3 = accounts[2]

const client = getClient({
  account: account,
})

afterEach(async () => {
  await Prool.restart(client)
})

describe('getUserToken', () => {
  test('default', async () => {
    // Fund accounts
    await setupFeeToken(client, { account: account2 })
    await setupFeeToken(client, { account: account3 })

    // Set token (address)
    await actions.fee.setUserTokenSync(client, {
      account: account2,
      feeToken,
      token: '0x20c0000000000000000000000000000000000001',
    })

    // Set another token (id)
    await actions.fee.setUserTokenSync(client, {
      account: account3,
      feeToken,
      token: 2n,
    })

    expect(
      await actions.fee.getUserToken(client, { account: account2 }),
    ).toMatchInlineSnapshot(`
      {
        "address": "0x20C0000000000000000000000000000000000001",
        "id": 1n,
      }
    `)
    expect(
      await actions.fee.getUserToken(client, { account: account3 }),
    ).toMatchInlineSnapshot(`
      {
        "address": "0x20C0000000000000000000000000000000000002",
        "id": 2n,
      }
    `)
  })
})

describe('setUserToken', () => {
  test('default', async () => {
    expect(await actions.fee.getUserToken(client)).toMatchInlineSnapshot(
      `
      {
        "address": "0x20C0000000000000000000000000000000000001",
        "id": 1n,
      }
    `,
    )

    const { receipt: setReceipt, ...setResult } =
      await actions.fee.setUserTokenSync(client, {
        feeToken,
        token: 2n,
      })
    expect(setReceipt).toBeDefined()
    expect(setResult).toMatchInlineSnapshot(`
      {
        "token": "0x20C0000000000000000000000000000000000002",
        "user": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    expect(await actions.fee.getUserToken(client, {})).toMatchInlineSnapshot(
      `
        {
          "address": "0x20C0000000000000000000000000000000000002",
          "id": 2n,
        }
      `,
    )

    const { receipt: resetReceipt, ...resetResult } =
      await actions.fee.setUserTokenSync(client, {
        feeToken,
        token: 1n,
      })
    expect(resetReceipt).toBeDefined()
    expect(resetResult).toMatchInlineSnapshot(`
      {
        "token": "0x20C0000000000000000000000000000000000001",
        "user": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    expect(await actions.fee.getUserToken(client, {})).toMatchInlineSnapshot(
      `
      {
        "address": "0x20C0000000000000000000000000000000000001",
        "id": 1n,
      }
    `,
    )
  })
})

describe('watchSetUserToken', async () => {
  test('default', async () => {
    const receivedSets: Array<{
      args: actions.fee.watchSetUserToken.Args
      log: actions.fee.watchSetUserToken.Log
    }> = []

    // Start watching for user token set events
    const unwatch = actions.fee.watchSetUserToken(client, {
      onUserTokenSet: (args, log) => {
        receivedSets.push({ args, log })
      },
    })

    try {
      // Fund accounts
      await setupFeeToken(client, { account: account2 })
      await setupFeeToken(client, { account: account3 })

      await actions.fee.setUserTokenSync(client, {
        account: account2,
        feeToken,
        token: '0x20c0000000000000000000000000000000000001',
      })
      await actions.fee.setUserTokenSync(client, {
        account: account3,
        feeToken,
        token: '0x20c0000000000000000000000000000000000002',
      })

      await setTimeout(500)

      expect(receivedSets).toHaveLength(2)

      expect(receivedSets.at(0)!.args).toMatchInlineSnapshot(`
        {
          "token": "0x20C0000000000000000000000000000000000001",
          "user": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
        }
      `)
      expect(receivedSets.at(1)!.args).toMatchInlineSnapshot(`
        {
          "token": "0x20C0000000000000000000000000000000000002",
          "user": "0x98e503f35D0a019cB0a251aD243a4cCFCF371F46",
        }
      `)
    } finally {
      if (unwatch) unwatch()
    }
  })

  test('behavior: filter by user address', async () => {
    const receivedSets: Array<{
      args: actions.fee.watchSetUserToken.Args
      log: actions.fee.watchSetUserToken.Log
    }> = []

    // Start watching for user token set events only for account2
    const unwatch = actions.fee.watchSetUserToken(client, {
      args: {
        user: account2.address,
      },
      onUserTokenSet: (args, log) => {
        receivedSets.push({ args, log })
      },
    })

    try {
      await setupFeeToken(client, { account: account2 })
      await setupFeeToken(client, { account: account3 })

      // Set token for account2 (should be captured)
      await actions.fee.setUserTokenSync(client, {
        account: account2,
        token: feeToken,
      })

      // Set token for account3 (should NOT be captured)
      await actions.fee.setUserTokenSync(client, {
        account: account3,
        feeToken,
        token: '0x20c0000000000000000000000000000000000002',
      })

      // Set token for account2 again (should be captured)
      await actions.fee.setUserTokenSync(client, {
        account: account2,
        feeToken,
        token: 2n,
      })

      await setTimeout(500)

      // Should only receive 2 events (for account2)
      expect(receivedSets).toHaveLength(2)

      expect(receivedSets.at(0)!.args).toMatchInlineSnapshot(`
        {
          "token": "0x20C0000000000000000000000000000000000000",
          "user": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
        }
      `)
      expect(receivedSets.at(1)!.args).toMatchInlineSnapshot(`
        {
          "token": "0x20C0000000000000000000000000000000000002",
          "user": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
        }
      `)

      // Verify all received events are for account2
      for (const set of receivedSets) {
        expect(set.args.user).toBe(account2.address)
      }
    } finally {
      if (unwatch) unwatch()
    }
  })
})
