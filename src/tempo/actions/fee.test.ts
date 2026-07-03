import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account } from 'viem'
import { Actions } from 'viem/tempo'
import { Address } from 'viem/utils'

import {
  FeeTokenNotTip20Error,
  FeeTokenNotUsdError,
  FeeTokenPausedError,
} from '../errors.js'

const client = tempo.getClient()

/** Creates a liquid, self-funded USD fee token. */
async function createFeeToken() {
  const { token } = await Actions.token.createSync(client, {
    currency: 'USD',
    feeToken: tempo.alphaUsd,
    name: 'Fee Test Token',
    symbol: 'FTT',
  } as never)
  await Actions.token.grantRolesSync(client, {
    feeToken: tempo.alphaUsd,
    roles: ['issuer'],
    to: client.account!.address,
    token,
  } as never)
  await Actions.token.mintSync(client, {
    amount: 1_000_000_000n,
    feeToken: tempo.alphaUsd,
    to: client.account!.address,
    token,
  } as never)
  await tempo.mintLiquidity(client, { token })
  return token
}

/** Funds `to` with fee tokens. */
async function fund(to: `0x${string}`, token: `0x${string}` = tempo.alphaUsd) {
  await Actions.token.transferSync(client, {
    amount: 10_000_000n,
    feeToken: tempo.alphaUsd,
    to,
    token,
  } as never)
}

describe('validateToken', () => {
  test('default', async () => {
    await expect(
      Actions.fee.validateToken(client, {
        token: '0x20c0000000000000000000000000000000000000',
      }),
    ).resolves.toMatchInlineSnapshot(`
      {
        "address": "0x20c0000000000000000000000000000000000000",
        "id": 0n,
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

  test('behavior: validates token IDs', async () => {
    await expect(
      Actions.fee.validateToken(client, { token: 1n }),
    ).resolves.toMatchObject({
      address: '0x20c0000000000000000000000000000000000001',
      id: 1n,
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
      feeToken: tempo.alphaUsd,
      name: 'Euro Token',
      symbol: 'EURT',
    } as never)

    await expect(Actions.fee.validateToken(client, { token })).rejects.toThrow(
      FeeTokenNotUsdError,
    )
  })

  test('behavior: rejects paused tokens', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      feeToken: tempo.alphaUsd,
      name: 'Paused Fee Token',
      symbol: 'PFT',
    } as never)
    await Actions.token.grantRolesSync(client, {
      feeToken: tempo.alphaUsd,
      roles: ['pause'],
      to: client.account!.address,
      token,
    } as never)
    await Actions.token.pauseSync(client, {
      feeToken: tempo.alphaUsd,
      token,
    } as never)

    await expect(Actions.fee.validateToken(client, { token })).rejects.toThrow(
      FeeTokenPausedError,
    )
  })
})

describe('getUserToken', () => {
  test('behavior: reads other accounts', async () => {
    const other = tempo.accounts[2]
    const otherClient = tempo.getClient({
      account: Account.fromPrivateKey(other.privateKey),
    })
    await fund(other.address, tempo.pathUsd)

    // A change from the genesis default (alphaUSD).
    await Actions.fee.setUserTokenSync(otherClient, {
      feeToken: tempo.pathUsd,
      token: tempo.pathUsd,
    } as never)

    await expect(Actions.fee.getUserToken(client, { account: other.address }))
      .resolves.toMatchInlineSnapshot(`
      {
        "address": "0x20C0000000000000000000000000000000000000",
        "id": 0n,
      }
    `)
  })
})

describe('setUserToken', () => {
  test('default', async () => {
    const token = await createFeeToken()

    // Setting a fee token requires paying the transaction's fee with it.
    const { receipt, ...result } = await Actions.fee.setUserTokenSync(client, {
      feeToken: token,
      token,
    } as never)
    expect(receipt).toBeDefined()
    expect(result).toEqual({
      token,
      user: client.account!.address,
    })

    await expect(Actions.fee.getUserToken(client)).resolves.toEqual({
      address: token,
      id: expect.any(BigInt),
    })

    // Restore the genesis default.
    await Actions.fee.setUserTokenSync(client, {
      feeToken: 1n,
      token: 1n,
    } as never)
  })
})

describe('watchSetUserToken', () => {
  test('default', async () => {
    const token = await createFeeToken()

    const watcher = Actions.fee.watchSetUserToken(client)
    type Log = Parameters<Parameters<(typeof watcher)['onLogs']>[0]>[0][number]
    const logs: Log[] = []
    watcher.onLogs((received) => logs.push(...received))

    try {
      // Setting a fee token requires paying the transaction's fee with it.
      await Actions.fee.setUserTokenSync(client, {
        feeToken: token,
        token,
      } as never)

      for (let i = 0; i < 50 && logs.length === 0; i++)
        await new Promise((resolve) => setTimeout(resolve, 100))

      expect(logs.length).toBeGreaterThanOrEqual(1)
      expect(logs[0]!.args).toEqual({
        token,
        user: client.account!.address,
      })

      // Restore the genesis default.
      await Actions.fee.setUserTokenSync(client, {
        feeToken: 1n,
        token: 1n,
      } as never)
    } finally {
      watcher.off()
    }
  })

  test('behavior: filters by user address', async () => {
    const other = tempo.accounts[3]
    const otherClient = tempo.getClient({
      account: Account.fromPrivateKey(other.privateKey),
    })
    await fund(other.address, tempo.pathUsd)

    const watcher = Actions.fee.watchSetUserToken(client, {
      args: { user: Address.checksum(other.address) },
    } as never)
    type Log = Parameters<Parameters<(typeof watcher)['onLogs']>[0]>[0][number]
    const logs: Log[] = []
    watcher.onLogs((received) => logs.push(...received))

    try {
      // Captured: matches the filter (a change from the genesis default).
      await Actions.fee.setUserTokenSync(otherClient, {
        feeToken: tempo.pathUsd,
        token: tempo.pathUsd,
      } as never)
      // Not captured: different user.
      await Actions.fee.setUserTokenSync(client, {
        feeToken: tempo.pathUsd,
        token: tempo.pathUsd,
      } as never)

      for (let i = 0; i < 50 && logs.length === 0; i++)
        await new Promise((resolve) => setTimeout(resolve, 100))

      expect(logs).toHaveLength(1)
      expect(logs[0]!.args).toEqual({
        token: '0x20C0000000000000000000000000000000000000',
        user: Address.checksum(other.address),
      })

      // Restore the genesis default for the main account.
      await Actions.fee.setUserTokenSync(client, {
        feeToken: 1n,
        token: 1n,
      } as never)
    } finally {
      watcher.off()
    }
  })
})

describe('setValidatorToken', () => {
  test('default', async () => {
    const validator = tempo.accounts[8]
    const validatorClient = tempo.getClient({
      account: Account.fromPrivateKey(validator.privateKey),
    })
    await fund(validator.address)

    const { receipt, ...result } = await Actions.fee.setValidatorTokenSync(
      validatorClient,
      {
        feeToken: tempo.alphaUsd,
        token: tempo.alphaUsd,
      } as never,
    )
    expect(receipt).toBeDefined()
    expect(result).toEqual({
      token: '0x20C0000000000000000000000000000000000001',
      validator: Address.checksum(validator.address),
    })

    await expect(
      Actions.fee.getValidatorToken(client, {
        validator: validator.address,
      }),
    ).resolves.toMatchInlineSnapshot(`
      {
        "address": "0x20C0000000000000000000000000000000000001",
        "id": 1n,
      }
    `)
  })
})

describe('watchSetValidatorToken', () => {
  test('default', async () => {
    const validator = tempo.accounts[9]
    const validatorClient = tempo.getClient({
      account: Account.fromPrivateKey(validator.privateKey),
    })
    await fund(validator.address)

    const watcher = Actions.fee.watchSetValidatorToken(client)
    type Log = Parameters<Parameters<(typeof watcher)['onLogs']>[0]>[0][number]
    const logs: Log[] = []
    watcher.onLogs((received) => logs.push(...received))

    try {
      await Actions.fee.setValidatorTokenSync(validatorClient, {
        feeToken: tempo.alphaUsd,
        token: tempo.alphaUsd,
      } as never)

      for (let i = 0; i < 50 && logs.length === 0; i++)
        await new Promise((resolve) => setTimeout(resolve, 100))

      expect(logs.length).toBeGreaterThanOrEqual(1)
      expect(logs[0]!.args).toEqual({
        token: '0x20C0000000000000000000000000000000000001',
        validator: Address.checksum(validator.address),
      })
    } finally {
      watcher.off()
    }
  })
})

describe('getValidatorToken', () => {
  test('default', async () => {
    // Validators without a preference resolve to the protocol default.
    await expect(
      Actions.fee.getValidatorToken(client, {
        validator: '0x00000000000000000000000000000000000000be',
      }),
    ).resolves.toMatchInlineSnapshot(`
      {
        "address": "0x20C0000000000000000000000000000000000000",
        "id": 0n,
      }
    `)
  })
})
