import * as tempo from '~test/tempo.js'
import * as Hash from 'ox/Hash'
import * as Hex from 'ox/Hex'
import { describe, expect, test } from 'vitest'

import { Actions } from 'viem/tempo'

const client = tempo.getClient()

/** Creates a fresh USD token, issuer-granted and funded to account 0. */
async function createToken() {
  const { token } = await Actions.token.createSync(client, {
    currency: 'USD',
    feeToken: tempo.alphaUsd,
    name: 'AMM Test Token',
    symbol: 'AMMT',
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
  return token
}

/** Creates a fee-viable token: its `(token, pathUSD)` pool holds pathUSD liquidity. */
async function createLiquidToken() {
  const token = await createToken()
  const { liquidity } = await Actions.amm.mintSync(client, {
    feeToken: tempo.alphaUsd,
    to: client.account!.address,
    userTokenAddress: token,
    validatorTokenAddress: 0n,
    validatorTokenAmount: 1_000_000_000n,
  } as never)
  return { liquidity, token }
}

/** Accrues user-token reserves in the `(token, pathUSD)` pool via a fee payment. */
async function seedUserTokenReserve(token: `0x${string}`) {
  await Actions.token.transferSync(client, {
    amount: 1_000_000n,
    feeToken: token,
    to: tempo.accounts[1].address,
    token,
  } as never)
}

/** Waits until `done` returns true, polling every 100ms (5s cap). */
async function waitFor(done: () => boolean) {
  for (let i = 0; i < 50 && !done(); i++)
    await new Promise((resolve) => setTimeout(resolve, 100))
}

describe('getPool', () => {
  test('default', async () => {
    await expect(
      Actions.amm.getPool(client, {
        userToken: 1n,
        validatorToken: '0x20c0000000000000000000000000000000000001',
      }),
    ).resolves.toMatchInlineSnapshot(`
      {
        "reserveUserToken": 0n,
        "reserveValidatorToken": 0n,
        "totalSupply": 0n,
      }
    `)
  })
})

describe('getLiquidityBalance', () => {
  test('default', async () => {
    await expect(
      Actions.amm.getLiquidityBalance(client, {
        address: client.account!.address,
        userToken: 1n,
        validatorToken: '0x20c0000000000000000000000000000000000001',
      }),
    ).resolves.toMatchInlineSnapshot('0n')
  })
})

describe('mint', () => {
  test('default', async () => {
    const token = await createToken()

    // Bootstrap the pool with validator-token liquidity.
    await Actions.amm.mintSync(client, {
      feeToken: tempo.alphaUsd,
      to: client.account!.address,
      userTokenAddress: 1n,
      validatorTokenAddress: token,
      validatorTokenAmount: 100_000_000n,
    } as never)

    const poolBefore = await Actions.amm.getPool(client, {
      userToken: 1n,
      validatorToken: token,
    })
    expect(poolBefore).toMatchInlineSnapshot(`
      {
        "reserveUserToken": 0n,
        "reserveValidatorToken": 100000000n,
        "totalSupply": 50000000n,
      }
    `)

    const { receipt, validatorToken, ...result } = await Actions.amm.mintSync(
      client,
      {
        feeToken: tempo.alphaUsd,
        to: client.account!.address,
        userTokenAddress: 1n,
        validatorTokenAddress: token,
        validatorTokenAmount: 50_000_000n,
      } as never,
    )
    expect(receipt.status).toBe('success')
    expect(validatorToken.toLowerCase()).toBe(token.toLowerCase())
    expect(result).toMatchInlineSnapshot(`
      {
        "amountValidatorToken": 50000000n,
        "liquidity": 25000000n,
        "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "to": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "userToken": "0x20C0000000000000000000000000000000000001",
      }
    `)

    const poolAfter = await Actions.amm.getPool(client, {
      userToken: 1n,
      validatorToken: token,
    })
    expect(poolAfter).toMatchInlineSnapshot(`
      {
        "reserveUserToken": 0n,
        "reserveValidatorToken": 150000000n,
        "totalSupply": 75000000n,
      }
    `)
  })
})

describe('burn', () => {
  test('default', async () => {
    const { liquidity, token } = await createLiquidToken()
    await seedUserTokenReserve(token)

    await expect(
      Actions.amm.getLiquidityBalance(client, {
        address: client.account!.address,
        userToken: token,
        validatorToken: tempo.pathUsd,
      }),
    ).resolves.toBe(liquidity)

    // Pool ids are directional: `(userToken, validatorToken)`.
    const poolId = Hash.keccak256(
      Hex.concat(Hex.padLeft(token, 32), Hex.padLeft(tempo.pathUsd, 32)),
    )

    const {
      receipt,
      amountUserToken,
      amountValidatorToken,
      userToken,
      ...result
    } = await Actions.amm.burnSync(client, {
      feeToken: tempo.alphaUsd,
      liquidity: liquidity / 2n,
      to: tempo.accounts[1].address,
      userToken: token,
      validatorToken: 0n,
    } as never)
    expect(receipt.status).toBe('success')
    expect(userToken.toLowerCase()).toBe(token.toLowerCase())
    expect(amountUserToken).toBeGreaterThan(0n)
    expect(amountValidatorToken).toBeGreaterThan(0n)
    expect(result).toMatchInlineSnapshot(`
      {
        "liquidity": 249999500n,
        "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "to": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "validatorToken": "0x20C0000000000000000000000000000000000000",
      }
    `)

    await expect(
      Actions.amm.getLiquidityBalance(client, {
        address: client.account!.address,
        poolId,
      }),
    ).resolves.toBe(liquidity - liquidity / 2n)
  })
})

describe('rebalanceSwap', () => {
  test('default', async () => {
    const { token } = await createLiquidToken()
    await seedUserTokenReserve(token)

    const balanceBefore = await Actions.token.getBalance(client, {
      account: tempo.accounts[1].address,
      token,
    })

    const { receipt, userToken, ...result } =
      await Actions.amm.rebalanceSwapSync(client, {
        amountOut: 100n,
        feeToken: tempo.alphaUsd,
        to: tempo.accounts[1].address,
        userToken: token,
        validatorToken: 0n,
      } as never)
    expect(receipt.status).toBe('success')
    expect(userToken.toLowerCase()).toBe(token.toLowerCase())
    expect(result).toMatchInlineSnapshot(`
      {
        "amountIn": 100n,
        "amountOut": 100n,
        "swapper": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "validatorToken": "0x20C0000000000000000000000000000000000000",
      }
    `)

    const balanceAfter = await Actions.token.getBalance(client, {
      account: tempo.accounts[1].address,
      token,
    })
    expect(balanceAfter.amount).toBe(balanceBefore.amount + 100n)
  })
})

describe('watchMint', () => {
  test('default', async () => {
    const token = await createToken()

    const watcher = Actions.amm.watchMint(client, {
      userToken: token,
      validatorToken: 1n,
    })
    type Log = Parameters<Parameters<(typeof watcher)['onLogs']>[0]>[0][number]
    const logs: Log[] = []
    watcher.onLogs((received) => logs.push(...received))

    try {
      await Actions.amm.mintSync(client, {
        feeToken: tempo.alphaUsd,
        to: client.account!.address,
        userTokenAddress: token,
        validatorTokenAddress: 1n,
        validatorTokenAmount: 100_000_000n,
      } as never)

      await waitFor(() => logs.length > 0)

      expect(logs.length).toBeGreaterThanOrEqual(1)
      const { userToken, ...args } = logs[0]!.args
      expect(userToken.toLowerCase()).toBe(token.toLowerCase())
      expect(args).toMatchInlineSnapshot(`
        {
          "amountValidatorToken": 100000000n,
          "liquidity": 49999000n,
          "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "to": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "validatorToken": "0x20C0000000000000000000000000000000000001",
        }
      `)
    } finally {
      watcher.off()
    }
  })
})

describe('watchBurn', () => {
  test('default', async () => {
    const { liquidity, token } = await createLiquidToken()
    await seedUserTokenReserve(token)

    const watcher = Actions.amm.watchBurn(client, {
      userToken: token,
      validatorToken: 0n,
    })
    type Log = Parameters<Parameters<(typeof watcher)['onLogs']>[0]>[0][number]
    const logs: Log[] = []
    watcher.onLogs((received) => logs.push(...received))

    try {
      await Actions.amm.burnSync(client, {
        feeToken: tempo.alphaUsd,
        liquidity: liquidity / 2n,
        to: client.account!.address,
        userToken: token,
        validatorToken: 0n,
      } as never)

      await waitFor(() => logs.length > 0)

      expect(logs.length).toBeGreaterThanOrEqual(1)
      const { amountUserToken, amountValidatorToken, userToken, ...args } =
        logs[0]!.args
      expect(userToken.toLowerCase()).toBe(token.toLowerCase())
      expect(amountUserToken).toBeGreaterThan(0n)
      expect(amountValidatorToken).toBeGreaterThan(0n)
      expect(args).toMatchInlineSnapshot(`
        {
          "liquidity": 249999500n,
          "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "to": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "validatorToken": "0x20C0000000000000000000000000000000000000",
        }
      `)
    } finally {
      watcher.off()
    }
  })
})

describe('watchRebalanceSwap', () => {
  test('default', async () => {
    const { token } = await createLiquidToken()
    await seedUserTokenReserve(token)

    const watcher = Actions.amm.watchRebalanceSwap(client, {
      userToken: token,
      validatorToken: 0n,
    })
    type Log = Parameters<Parameters<(typeof watcher)['onLogs']>[0]>[0][number]
    const logs: Log[] = []
    watcher.onLogs((received) => logs.push(...received))

    try {
      await Actions.amm.rebalanceSwapSync(client, {
        amountOut: 100n,
        feeToken: tempo.alphaUsd,
        to: tempo.accounts[1].address,
        userToken: token,
        validatorToken: 0n,
      } as never)

      await waitFor(() => logs.length > 0)

      expect(logs.length).toBeGreaterThanOrEqual(1)
      const { userToken, ...args } = logs[0]!.args
      expect(userToken.toLowerCase()).toBe(token.toLowerCase())
      expect(args).toMatchInlineSnapshot(`
        {
          "amountIn": 100n,
          "amountOut": 100n,
          "swapper": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "validatorToken": "0x20C0000000000000000000000000000000000000",
        }
      `)
    } finally {
      watcher.off()
    }
  })
})
