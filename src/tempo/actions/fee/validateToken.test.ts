import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import {
  Account,
  Actions,
  FeeTokenNotTip20Error,
  FeeTokenNotUsdError,
  FeeTokenPausedError,
} from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

describe('validateToken', () => {
  test('default', async () => {
    await expect(
      Actions.fee.validateToken(client, {
        token: tempo.pathUsd,
      }),
    ).resolves.toMatchInlineSnapshot(`
      {
        "address": "0x20c0000000000000000000000000000000000000",
        "metadata": {
          "currency": "USD",
          "decimals": 6,
          "logoURI": "",
          "name": "pathUSD",
          "symbol": "pathUSD",
          "totalSupply": 184467440737095516150n,
        },
      }
    `)
  })

  test('behavior: validates token addresses', async () => {
    await expect(
      Actions.fee.validateToken(client, {
        token: '0x20c0000000000000000000000000000000000001',
      }),
    ).resolves.toMatchObject({
      address: '0x20c0000000000000000000000000000000000001',
      metadata: {
        currency: 'USD',
        paused: false,
      },
    })
  })

  test('behavior: rejects non TIP20-prefixed addresses', async () => {
    await expect(
      Actions.fee.validateToken(client, {
        token: '0x0000000000000000000000000000000000000000',
      }),
    ).rejects.toThrow(FeeTokenNotTip20Error)
  })

  test('behavior: rejects unregistered TIP20-prefixed addresses', async () => {
    await expect(
      Actions.fee.validateToken(client, {
        token: '0x20c000000000000000000000000000000000dead',
      }),
    ).rejects.toThrow(FeeTokenNotTip20Error)
  })

  test('behavior: rejects non-USD tokens', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'EUR',
      name: 'Euro Token',
      symbol: 'EURT',
    })

    await expect(
      Actions.fee.validateToken(client, {
        token,
      }),
    ).rejects.toThrow(FeeTokenNotUsdError)
  })

  test('behavior: rejects paused tokens', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Paused Fee Token',
      symbol: 'PFT',
    })

    await Actions.token.grantRolesSync(client, {
      roles: ['pause'],
      to: account.address,
      token,
    })
    await Actions.token.pauseSync(client, {
      token,
    })

    await expect(
      Actions.fee.validateToken(client, {
        token,
      }),
    ).rejects.toThrow(FeeTokenPausedError)
  })
})
