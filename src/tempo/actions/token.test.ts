import * as tempo from '~test/tempo.js'
import type * as Address from 'ox/Address'
import * as Hex from 'ox/Hex'
import * as Value from 'ox/Value'
import * as TokenId from 'ox/tempo/TokenId'
import * as TokenRole from 'ox/tempo/TokenRole'
import { describe, expect, test } from 'vitest'

import { Account, Actions as CoreActions, Client, Token, http } from 'viem'
import { tempoLocalnet } from 'viem/chains'
import { Actions } from 'viem/tempo'

const client = tempo.getClient()
const client2 = tempo.getClient({
  account: Account.fromPrivateKey(tempo.accounts[1].privateKey),
})
const client3 = tempo.getClient({
  account: Account.fromPrivateKey(tempo.accounts[2].privateKey),
})

/** Genesis tokens declared for the localnet chain. */
const declaredTokens = [
  Token.from({
    addresses: { [tempoLocalnet.id]: tempo.alphaUsd },
    currency: 'USD',
    decimals: 6,
    symbol: 'alphaUSD',
  }),
  Token.from({
    addresses: { [tempoLocalnet.id]: tempo.pathUsd },
    currency: 'USD',
    decimals: 6,
    symbol: 'pathUSD',
  }),
] as const satisfies Token.Tokens

/** Client with genesis tokens declared for the localnet chain. */
const declaredClient = Client.create({
  account: Account.fromPrivateKey(tempo.accounts[0].privateKey),
  chain: tempoLocalnet,
  pollingInterval: 100,
  tokens: declaredTokens,
  transport: http(tempo.rpcUrl),
})

/** Address that is not declared on any client and has no token deployed. */
const undeclaredToken = '0x20c000000000000000000000000000000000dead'

/** Creates a fresh USD token administered by account 0. */
async function createToken(
  options: {
    name?: string | undefined
    roles?: readonly TokenRole.TokenRole[] | undefined
    symbol?: string | undefined
  } = {},
) {
  const { name = 'Test Token', roles = [], symbol = 'TEST' } = options
  const { token } = await Actions.token.createSync(client, {
    currency: 'USD',
    feeToken: tempo.alphaUsd,
    name,
    symbol,
  } as never)
  // The node allows a single role mutation per transaction.
  for (const role of roles)
    await Actions.token.grantRolesSync(client, {
      feeToken: tempo.alphaUsd,
      roles: [role],
      to: client.account!.address,
      token,
    } as never)
  return token
}

/** Funds an account with alphaUSD for fee payment. */
async function fund(address: Address.Address) {
  await Actions.token.transferSync(client, {
    amount: 50_000_000n,
    feeToken: tempo.alphaUsd,
    to: address,
    token: tempo.alphaUsd,
  } as never)
}

/** Waits until `done` returns true, polling every 100ms (5s cap). */
async function waitFor(done: () => boolean) {
  for (let i = 0; i < 50 && !done(); i++)
    await new Promise((resolve) => setTimeout(resolve, 100))
}

describe('approve', () => {
  test('decimals: requires decimals for an undeclared formatted amount', async () => {
    await expect(
      Actions.token.approve(client, {
        amount: { formatted: '1' },
        spender: client2.account!.address,
        token: undeclaredToken,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: Token decimals are required. Pass \`amount.decimals\` or select a declared token.]`,
    )
  })

  test('decimals: omits formatting for an undeclared base-unit amount', async () => {
    const token = await createToken()
    const { receipt, ...result } = await Actions.token.approveSync(client, {
      amount: 1n,
      feeToken: tempo.alphaUsd,
      spender: client2.account!.address,
      token,
    } as never)
    expect(receipt.status).toBe('success')
    expect(result).toMatchInlineSnapshot(`
      {
        "amount": 1n,
        "owner": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "spender": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      }
    `)
  })

  test('default', async () => {
    const receiver = Hex.random(20)

    {
      // approve
      const { receipt, ...result } = await Actions.token.approveSync(client, {
        amount: 100_000_000n,
        feeToken: tempo.alphaUsd,
        spender: client2.account!.address,
        token: tempo.alphaUsd,
      } as never)
      expect(receipt).toBeDefined()
      expect(result).toMatchInlineSnapshot(`
        {
          "amount": 100000000n,
          "owner": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "spender": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        }
      `)
    }

    {
      // check allowance
      const allowance = await Actions.token.getAllowance(client, {
        account: client.account!.address,
        spender: client2.account!.address,
        token: tempo.alphaUsd,
      })
      expect(allowance.amount).toBe(100_000_000n)
    }

    // fund the spender for fee payment
    await fund(client2.account!.address)

    // transfer tokens from the approved account
    await Actions.token.transferSync(client2, {
      amount: { decimals: 6, formatted: '50' },
      feeToken: tempo.alphaUsd,
      from: client.account!.address,
      to: receiver,
      token: tempo.alphaUsd,
    } as never)

    {
      // verify updated allowance
      const allowance = await Actions.token.getAllowance(client, {
        account: client.account!.address,
        spender: client2.account!.address,
        token: tempo.alphaUsd,
      })
      expect(allowance.amount).toBe(50_000_000n)
    }

    // verify balance
    const balance = await Actions.token.getBalance(client, {
      account: receiver,
      token: tempo.alphaUsd,
    })
    expect(balance.amount).toBe(50_000_000n)
  })

  test('behavior: formatted amount', async () => {
    const { receipt, ...result } = await Actions.token.approveSync(client, {
      amount: { decimals: 6, formatted: '100' },
      feeToken: tempo.alphaUsd,
      spender: client2.account!.address,
      token: tempo.alphaUsd,
    } as never)
    expect(receipt.status).toBe('success')
    expect(result).toMatchInlineSnapshot(`
      {
        "amount": 100000000n,
        "decimals": 6,
        "formatted": "100",
        "owner": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "spender": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      }
    `)

    const allowance = await Actions.token.getAllowance(client, {
      account: client.account!.address,
      spender: client2.account!.address,
      token: tempo.alphaUsd,
    })
    expect(allowance.amount).toBe(100_000_000n)
  })
})

describe('create', () => {
  test('default', async () => {
    const { receipt, salt, token, tokenId, ...result } =
      await Actions.token.createSync(client, {
        currency: 'USD',
        feeToken: tempo.alphaUsd,
        name: 'Test USD',
        symbol: 'TUSD',
      } as never)

    expect(result).toMatchInlineSnapshot(`
      {
        "admin": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "currency": "USD",
        "name": "Test USD",
        "quoteToken": "0x20C0000000000000000000000000000000000000",
        "symbol": "TUSD",
      }
    `)
    expect(salt).toBeDefined()
    expect(token).toBeDefined()
    expect(tokenId).toBeDefined()
    expect(receipt).toBeDefined()

    const code = await CoreActions.address.getCode(client, { address: token })
    expect(code).toBe('0xef')
  })
})

describe('getAllowance', () => {
  test('default', async () => {
    await Actions.token.approveSync(client, {
      amount: 50_000_000n,
      feeToken: tempo.alphaUsd,
      spender: client2.account!.address,
      token: tempo.alphaUsd,
    } as never)

    {
      // with token address
      const allowance = await Actions.token.getAllowance(client, {
        account: client.account!.address,
        spender: client2.account!.address,
        token: tempo.alphaUsd,
      })
      expect(allowance.amount).toBe(50_000_000n)
    }

    {
      // with token ID
      const allowance = await Actions.token.getAllowance(client, {
        account: client.account!.address,
        spender: client2.account!.address,
        token: 1n,
      })
      expect(allowance.amount).toBe(50_000_000n)
    }
  })
})

describe('getBalance', () => {
  test('default', async () => {
    {
      // explicit account matches the defaulted account
      const balance = await Actions.token.getBalance(client, {
        account: client.account!.address,
        token: tempo.alphaUsd,
      })
      const defaultedBalance = await Actions.token.getBalance(client, {
        token: tempo.alphaUsd,
      })

      expect(balance.amount).toBeGreaterThan(0n)
      expect(balance.decimals).toBe(6)
      expect(balance.formatted).toBe(Value.format(balance.amount, 6))
      expect(defaultedBalance.amount).toBeGreaterThan(0n)
    }

    {
      // unfunded account
      const balance = await Actions.token.getBalance(client, {
        account: Hex.random(20),
        token: tempo.alphaUsd,
      })
      expect(balance.amount).toBe(0n)
    }
  })
})

describe('getTotalSupply', () => {
  test('default', async () => {
    const totalSupply = await Actions.token.getTotalSupply(client, {
      token: tempo.alphaUsd,
    })

    expect(totalSupply.amount).toBeGreaterThan(0n)
    expect(totalSupply.decimals).toBe(6)
    expect(totalSupply.formatted).toBe(Value.format(totalSupply.amount, 6))
  })

  test('behavior: custom token', async () => {
    const token = await createToken({ roles: ['issuer'] })

    await Actions.token.mintSync(client, {
      amount: 1_000_000_000n,
      feeToken: tempo.alphaUsd,
      to: client.account!.address,
      token,
    } as never)

    const totalSupply = await Actions.token.getTotalSupply(client, {
      decimals: 6,
      token,
    })

    expect(totalSupply.amount).toBe(1_000_000_000n)
    expect(totalSupply.formatted).toBe('1000')
  })
})

describe('getMetadata', () => {
  test('default', async () => {
    const metadata = await Actions.token.getMetadata(client, {
      token: tempo.alphaUsd,
    })

    expect(metadata).toMatchInlineSnapshot(`
      {
        "currency": "USD",
        "decimals": 6,
        "logoURI": "",
        "name": "AlphaUSD",
        "paused": false,
        "quoteToken": "0x20C0000000000000000000000000000000000000",
        "supplyCap": 340282366920938463463374607431768211455n,
        "symbol": "AlphaUSD",
        "totalSupply": 202914184810805067765n,
        "transferPolicyId": 1n,
      }
    `)
  })

  test('behavior: custom token (address)', async () => {
    const token = await createToken({ name: 'Test USD', symbol: 'TUSD' })

    const metadata = await Actions.token.getMetadata(client, { token })

    expect(metadata).toMatchInlineSnapshot(`
      {
        "currency": "USD",
        "decimals": 6,
        "logoURI": "",
        "name": "Test USD",
        "paused": false,
        "quoteToken": "0x20C0000000000000000000000000000000000000",
        "supplyCap": 340282366920938463463374607431768211455n,
        "symbol": "TUSD",
        "totalSupply": 0n,
        "transferPolicyId": 1n,
      }
    `)
  })

  test('behavior: quote token', async () => {
    {
      const metadata = await Actions.token.getMetadata(client, { token: 0n })

      expect(metadata).toMatchInlineSnapshot(`
        {
          "currency": "USD",
          "decimals": 6,
          "logoURI": "",
          "name": "pathUSD",
          "symbol": "pathUSD",
          "totalSupply": 184467440737095516150n,
        }
      `)
    }

    {
      const metadata = await Actions.token.getMetadata(client, {
        token: tempo.pathUsd,
      })

      expect(metadata).toMatchInlineSnapshot(`
        {
          "currency": "USD",
          "decimals": 6,
          "logoURI": "",
          "name": "pathUSD",
          "symbol": "pathUSD",
          "totalSupply": 184467440737095516150n,
        }
      `)
    }
  })

  test('behavior: custom token (id)', async () => {
    const { tokenId } = await Actions.token.createSync(client, {
      currency: 'USD',
      feeToken: tempo.alphaUsd,
      name: 'Test USD',
      symbol: 'TUSD',
    } as never)

    const metadata = await Actions.token.getMetadata(client, {
      token: tokenId,
    })

    expect(metadata).toMatchInlineSnapshot(`
      {
        "currency": "USD",
        "decimals": 6,
        "logoURI": "",
        "name": "Test USD",
        "paused": false,
        "quoteToken": "0x20C0000000000000000000000000000000000000",
        "supplyCap": 340282366920938463463374607431768211455n,
        "symbol": "TUSD",
        "totalSupply": 0n,
        "transferPolicyId": 1n,
      }
    `)
  })

  test('behavior: custom token with logo URI', async () => {
    const logoURI = 'https://example.com/test-usd.svg'
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      feeToken: tempo.alphaUsd,
      logoURI,
      name: 'Logo USD',
      symbol: 'LUSD',
    } as never)

    const metadata = await Actions.token.getMetadata(client, { token })

    expect(metadata.logoURI).toBe(logoURI)
  })
})

describe('mint', () => {
  test('amount: supports formatted amounts', () => {
    const amount = 1_250_000n

    expect(
      Actions.token.mint.call(declaredClient, {
        amount: { formatted: '1.25' },
        to: client2.account!.address,
        token: tempo.alphaUsd,
      }).args,
    ).toEqual([client2.account!.address, amount])

    expect(
      Actions.token.burn.call(declaredClient, {
        amount: { formatted: '1.25' },
        token: tempo.alphaUsd,
      }).args,
    ).toEqual([amount])

    expect(
      Actions.token.burnBlocked.call(declaredClient, {
        amount: { formatted: '1.25' },
        from: client2.account!.address,
        token: tempo.alphaUsd,
      }).args,
    ).toEqual([client2.account!.address, amount])
  })

  test('decimals: requires decimals for undeclared formatted amounts', () => {
    expect(() =>
      Actions.token.mint.call(client, {
        amount: { formatted: '1' },
        to: client2.account!.address,
        token: undeclaredToken,
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Token decimals are required. Pass \`amount.decimals\` or select a declared token.]`,
    )

    expect(() =>
      Actions.token.burn.call(client, {
        amount: { formatted: '1' },
        token: undeclaredToken,
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Token decimals are required. Pass \`amount.decimals\` or select a declared token.]`,
    )

    expect(() =>
      Actions.token.burnBlocked.call(client, {
        amount: { formatted: '1' },
        from: client2.account!.address,
        token: undeclaredToken,
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Token decimals are required. Pass \`amount.decimals\` or select a declared token.]`,
    )
  })

  test('default', async () => {
    const token = await createToken({ roles: ['issuer'] })

    // Check initial balance
    const balanceBefore = await Actions.token.getBalance(client, {
      account: client2.account!.address,
      token,
    })
    expect(balanceBefore.amount).toBe(0n)

    // Mint tokens
    const { receipt, ...result } = await Actions.token.mintSync(client, {
      amount: 1_000_000_000n,
      feeToken: tempo.alphaUsd,
      to: client2.account!.address,
      token,
    } as never)
    expect(receipt).toBeDefined()
    expect(result).toMatchInlineSnapshot(`
      {
        "amount": 1000000000n,
        "to": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      }
    `)

    // Check balance after mint
    const balanceAfter = await Actions.token.getBalance(client, {
      account: client2.account!.address,
      token,
    })
    expect(balanceAfter.amount).toBe(1_000_000_000n)

    // Check total supply
    const metadata = await Actions.token.getMetadata(client, { token })
    expect(metadata.totalSupply).toBe(1_000_000_000n)
  })

  test('behavior: with memo', async () => {
    const token = await createToken({ roles: ['issuer'] })

    const { receipt, ...result } = await Actions.token.mintSync(client, {
      amount: 500_000_000n,
      feeToken: tempo.alphaUsd,
      memo: Hex.fromString('test'),
      to: client2.account!.address,
      token,
    } as never)
    expect(receipt.status).toBe('success')
    expect(result).toMatchInlineSnapshot(`
      {
        "amount": 500000000n,
        "to": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      }
    `)

    const balance = await Actions.token.getBalance(client, {
      account: client2.account!.address,
      token,
    })
    expect(balance.amount).toBe(500_000_000n)
  })
})

describe('transfer', () => {
  test('decimals: requires decimals for an undeclared formatted amount', async () => {
    await expect(
      Actions.token.transfer(client, {
        amount: { formatted: '1' },
        to: client2.account!.address,
        token: undeclaredToken,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: Token decimals are required. Pass \`amount.decimals\` or select a declared token.]`,
    )
  })

  test('amount: uses a base-unit amount for an undeclared token', async () => {
    const token = await createToken({ roles: ['issuer'] })
    await Actions.token.mintSync(client, {
      amount: 1_000_000n,
      feeToken: tempo.alphaUsd,
      to: client.account!.address,
      token,
    } as never)

    const { receipt, ...result } = await Actions.token.transferSync(client, {
      amount: 1_000_000n,
      feeToken: tempo.alphaUsd,
      to: client2.account!.address,
      token,
    } as never)
    expect(receipt.status).toBe('success')
    expect(result).toMatchInlineSnapshot(`
      {
        "amount": 1000000n,
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "to": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      }
    `)
  })

  test('default', async () => {
    const receiver = Hex.random(20)

    // Get initial balance
    const senderBalanceBefore = await Actions.token.getBalance(client, {
      token: tempo.alphaUsd,
    })

    // Transfer tokens
    const { receipt, to, ...result } = await Actions.token.transferSync(
      client,
      {
        amount: { decimals: 6, formatted: '10' },
        feeToken: tempo.alphaUsd,
        to: receiver,
        token: tempo.alphaUsd,
      } as never,
    )
    expect(receipt).toBeDefined()
    expect(to.toLowerCase()).toBe(receiver)
    expect(result).toEqual({
      amount: 10_000_000n,
      decimals: 6,
      formatted: '10',
      from: client.account!.address,
    })

    // Verify balances
    const senderBalanceAfter = await Actions.token.getBalance(client, {
      token: tempo.alphaUsd,
    })
    const receiverBalance = await Actions.token.getBalance(client, {
      account: receiver,
      token: tempo.alphaUsd,
    })

    expect(
      senderBalanceBefore.amount - senderBalanceAfter.amount,
    ).toBeGreaterThanOrEqual(10_000_000n)
    expect(receiverBalance.amount).toBe(10_000_000n)
  })

  test('behavior: with custom token', async () => {
    const receiver = Hex.random(20)
    const token = await createToken({ roles: ['issuer'] })

    await Actions.token.mintSync(client, {
      amount: 1_000_000_000n,
      feeToken: tempo.alphaUsd,
      to: client.account!.address,
      token,
    } as never)

    // Transfer custom tokens
    await Actions.token.transferSync(client, {
      amount: { decimals: 6, formatted: '100' },
      feeToken: tempo.alphaUsd,
      to: receiver,
      token,
    } as never)

    // Verify balance
    const balance = await Actions.token.getBalance(client, {
      account: receiver,
      token,
    })
    expect(balance.amount).toBe(100_000_000n)
  })

  test.each([
    ['symbol', 'pathusd'],
    ['mixed-case symbol', 'pathUsd'],
    ['token id', 0n],
    ['address', tempo.pathUsd],
  ])('behavior: pathUSD with formatted amount (%s)', async (_, token) => {
    const receiver = Hex.random(20)

    const { receipt, to, ...result } = await Actions.token.transferSync(
      declaredClient,
      {
        amount: { formatted: '1.25' },
        feeToken: tempo.alphaUsd,
        to: receiver,
        token: token as never,
      } as never,
    )

    expect(receipt.status).toBe('success')
    expect(to.toLowerCase()).toBe(receiver)
    expect(result).toEqual({
      amount: 1_250_000n,
      decimals: 6,
      formatted: '1.25',
      from: client.account!.address,
    })

    const balance = await Actions.token.getBalance(client, {
      account: receiver,
      token: tempo.pathUsd,
    })
    expect(balance.amount).toBe(1_250_000n)
  })

  test('behavior: with memo', async () => {
    const memo = Hex.fromString('Payment for services')

    const { receipt, ...result } = await Actions.token.transferSync(client, {
      amount: { decimals: 6, formatted: '5' },
      feeToken: tempo.alphaUsd,
      memo,
      to: client2.account!.address,
      token: tempo.alphaUsd,
    } as never)

    expect(receipt.status).toBe('success')
    expect(result).toMatchInlineSnapshot(`
      {
        "amount": 5000000n,
        "decimals": 6,
        "formatted": "5",
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "to": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      }
    `)
  })

  test('behavior: from another account (transferFrom)', async () => {
    const receiver = Hex.random(20)

    // First approve the spender
    await Actions.token.approveSync(client, {
      amount: { decimals: 6, formatted: '50' },
      feeToken: tempo.alphaUsd,
      spender: client2.account!.address,
      token: tempo.alphaUsd,
    } as never)

    // Fund the spender for fee payment
    await fund(client2.account!.address)

    // The spender transfers from account 0 to the receiver
    await Actions.token.transferSync(client2, {
      amount: { decimals: 6, formatted: '25' },
      feeToken: tempo.alphaUsd,
      from: client.account!.address,
      to: receiver,
      token: tempo.alphaUsd,
    } as never)

    // Verify balance
    const balance = await Actions.token.getBalance(client, {
      account: receiver,
      token: tempo.alphaUsd,
    })
    expect(balance.amount).toBe(25_000_000n)

    // Verify allowance was reduced
    const allowance = await Actions.token.getAllowance(client, {
      account: client.account!.address,
      spender: client2.account!.address,
      token: tempo.alphaUsd,
    })
    expect(allowance.amount).toBe(25_000_000n)
  })
})

describe('burn', () => {
  test('default', async () => {
    const token = await createToken({ roles: ['issuer'] })

    await Actions.token.mintSync(client, {
      amount: 1_000_000_000n,
      feeToken: tempo.alphaUsd,
      to: client.account!.address,
      token,
    } as never)

    // Check balance before burn
    const balanceBefore = await Actions.token.getBalance(client, { token })
    expect(balanceBefore.amount).toBe(1_000_000_000n)

    // Check total supply before
    const metadataBefore = await Actions.token.getMetadata(client, { token })
    expect(metadataBefore.totalSupply).toBe(1_000_000_000n)

    // Burn tokens
    const { receipt, ...result } = await Actions.token.burnSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      token,
    } as never)
    expect(receipt).toBeDefined()
    expect(result).toMatchInlineSnapshot(`
      {
        "amount": 100000000n,
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    // Check balance after burn
    const balanceAfter = await Actions.token.getBalance(client, { token })
    expect(balanceAfter.amount).toBe(900_000_000n)

    // Check total supply after
    const metadataAfter = await Actions.token.getMetadata(client, { token })
    expect(metadataAfter.totalSupply).toBe(900_000_000n)
  })

  test('behavior: requires issuer role', async () => {
    const token = await createToken()

    // Grant issuer role to account 1 only
    await Actions.token.grantRolesSync(client, {
      feeToken: tempo.alphaUsd,
      roles: ['issuer'],
      to: client2.account!.address,
      token,
    } as never)

    await fund(client2.account!.address)

    await Actions.token.mintSync(client2, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      to: client.account!.address,
      token,
    } as never)

    // Burning without the issuer role fails
    await expect(
      Actions.token.burnSync(client, {
        amount: 10_000_000n,
        feeToken: tempo.alphaUsd,
        token,
      } as never),
    ).rejects.toThrow()
  })
})

describe.todo('burnBlocked')

describe.todo('changeTransferPolicy')

describe('pause', () => {
  test('default', async () => {
    const receiver = Hex.random(20)
    const token = await createToken({ roles: ['issuer', 'pause'] })

    await Actions.token.mintSync(client, {
      amount: 1_000_000_000n,
      feeToken: tempo.alphaUsd,
      to: client2.account!.address,
      token,
    } as never)

    // Verify token is not paused
    {
      const metadata = await Actions.token.getMetadata(client, { token })
      expect(metadata.paused).toBe(false)
    }

    await fund(client2.account!.address)

    await Actions.token.transferSync(client2, {
      amount: { decimals: 6, formatted: '100' },
      feeToken: tempo.alphaUsd,
      to: receiver,
      token,
    } as never)

    // Pause the token
    const { receipt, ...result } = await Actions.token.pauseSync(client, {
      feeToken: tempo.alphaUsd,
      token,
    } as never)
    expect(receipt).toBeDefined()
    expect(result).toMatchInlineSnapshot(`
      {
        "isPaused": true,
        "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    // Verify token is paused
    {
      const metadata = await Actions.token.getMetadata(client, { token })
      expect(metadata.paused).toBe(true)
    }

    // Transfers now fail
    await expect(
      Actions.token.transferSync(client2, {
        amount: { decimals: 6, formatted: '100' },
        feeToken: tempo.alphaUsd,
        to: receiver,
        token,
      } as never),
    ).rejects.toThrow()
  })

  test('behavior: requires pause role', async () => {
    const token = await createToken()

    // Pausing without the pause role fails
    await expect(
      Actions.token.pauseSync(client, {
        feeToken: tempo.alphaUsd,
        token,
      } as never),
    ).rejects.toThrow()

    // Grant pause role to account 1
    await Actions.token.grantRolesSync(client, {
      feeToken: tempo.alphaUsd,
      roles: ['pause'],
      to: client2.account!.address,
      token,
    } as never)

    await fund(client2.account!.address)

    await Actions.token.pauseSync(client2, {
      feeToken: tempo.alphaUsd,
      token,
    } as never)

    // Verify token is paused
    const metadata = await Actions.token.getMetadata(client, { token })
    expect(metadata.paused).toBe(true)
  })

  test('behavior: cannot pause already paused token', async () => {
    const token = await createToken({ roles: ['pause'] })

    // Pause the token
    await Actions.token.pauseSync(client, {
      feeToken: tempo.alphaUsd,
      token,
    } as never)

    // Pausing again succeeds without error
    const { receipt, ...result } = await Actions.token.pauseSync(client, {
      feeToken: tempo.alphaUsd,
      token,
    } as never)
    expect(receipt.status).toBe('success')
    expect(result).toMatchInlineSnapshot(`
      {
        "isPaused": true,
        "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)
  })
})

describe('unpause', () => {
  test('default', async () => {
    const receiver = Hex.random(20)
    const token = await createToken({ roles: ['issuer', 'pause', 'unpause'] })

    await Actions.token.mintSync(client, {
      amount: 1_000_000_000n,
      feeToken: tempo.alphaUsd,
      to: client2.account!.address,
      token,
    } as never)

    // First pause the token
    await Actions.token.pauseSync(client, {
      feeToken: tempo.alphaUsd,
      token,
    } as never)

    // Verify token is paused
    {
      const metadata = await Actions.token.getMetadata(client, { token })
      expect(metadata.paused).toBe(true)
    }

    await fund(client2.account!.address)

    // Verify transfers fail when paused
    await expect(
      Actions.token.transferSync(client2, {
        amount: { decimals: 6, formatted: '100' },
        feeToken: tempo.alphaUsd,
        to: receiver,
        token,
      } as never),
    ).rejects.toThrow()

    // Unpause the token
    const { receipt, ...result } = await Actions.token.unpauseSync(client, {
      feeToken: tempo.alphaUsd,
      token,
    } as never)
    expect(receipt).toBeDefined()
    expect(result).toMatchInlineSnapshot(`
      {
        "isPaused": false,
        "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    // Verify token is unpaused
    {
      const metadata = await Actions.token.getMetadata(client, { token })
      expect(metadata.paused).toBe(false)
    }

    // Transfers work again
    await Actions.token.transferSync(client2, {
      amount: { decimals: 6, formatted: '100' },
      feeToken: tempo.alphaUsd,
      to: receiver,
      token,
    } as never)

    const balance = await Actions.token.getBalance(client, {
      account: receiver,
      token,
    })
    expect(balance.amount).toBe(100_000_000n)
  })

  test('behavior: requires unpause role', async () => {
    const token = await createToken({ roles: ['pause'] })

    await Actions.token.pauseSync(client, {
      feeToken: tempo.alphaUsd,
      token,
    } as never)

    // Unpausing without the unpause role fails
    await expect(
      Actions.token.unpauseSync(client, {
        feeToken: tempo.alphaUsd,
        token,
      } as never),
    ).rejects.toThrow()

    // Grant unpause role to account 1
    await Actions.token.grantRolesSync(client, {
      feeToken: tempo.alphaUsd,
      roles: ['unpause'],
      to: client2.account!.address,
      token,
    } as never)

    await fund(client2.account!.address)

    // Account 1 can unpause
    await Actions.token.unpauseSync(client2, {
      feeToken: tempo.alphaUsd,
      token,
    } as never)

    // Verify token is unpaused
    const metadata = await Actions.token.getMetadata(client, { token })
    expect(metadata.paused).toBe(false)
  })

  test('behavior: different roles for pause and unpause', async () => {
    const token = await createToken()

    // Grant pause role to account 1
    await Actions.token.grantRolesSync(client, {
      feeToken: tempo.alphaUsd,
      roles: ['pause'],
      to: client2.account!.address,
      token,
    } as never)

    // Grant unpause role to account 2
    await Actions.token.grantRolesSync(client, {
      feeToken: tempo.alphaUsd,
      roles: ['unpause'],
      to: client3.account!.address,
      token,
    } as never)

    await fund(client2.account!.address)
    await fund(client3.account!.address)

    // Account 1 can pause
    await Actions.token.pauseSync(client2, {
      feeToken: tempo.alphaUsd,
      token,
    } as never)

    // Account 1 cannot unpause
    await expect(
      Actions.token.unpauseSync(client2, {
        feeToken: tempo.alphaUsd,
        token,
      } as never),
    ).rejects.toThrow()

    // Account 2 can unpause
    await Actions.token.unpauseSync(client3, {
      feeToken: tempo.alphaUsd,
      token,
    } as never)

    // Verify token is unpaused
    const metadata = await Actions.token.getMetadata(client, { token })
    expect(metadata.paused).toBe(false)
  })
})

describe('prepareUpdateQuoteToken', () => {
  test('default', async () => {
    const quoteToken = await createToken({ name: 'Quote Token', symbol: 'QT' })
    const token = await createToken({ name: 'Main Token', symbol: 'MAIN' })

    const { receipt, nextQuoteToken, ...result } =
      await Actions.token.prepareUpdateQuoteTokenSync(client, {
        feeToken: tempo.alphaUsd,
        quoteToken,
        token,
      } as never)

    expect(receipt).toBeDefined()
    expect(result).toMatchInlineSnapshot(`
      {
        "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)
    expect(nextQuoteToken).toBe(quoteToken)
  })

  test('behavior: requires admin role', async () => {
    const quoteToken = await createToken({ name: 'Quote Token', symbol: 'QT' })
    const token = await createToken({ name: 'Main Token', symbol: 'MAIN' })

    await fund(client2.account!.address)

    // Proposing a quote token update from a non-admin fails
    await expect(
      Actions.token.prepareUpdateQuoteTokenSync(client2, {
        feeToken: tempo.alphaUsd,
        quoteToken,
        token,
      } as never),
    ).rejects.toThrow()
  })

  test('behavior: with token ID', async () => {
    const quoteToken = await createToken({ name: 'Quote Token', symbol: 'QT' })
    const { tokenId } = await Actions.token.createSync(client, {
      currency: 'USD',
      feeToken: tempo.alphaUsd,
      name: 'Main Token',
      symbol: 'MAIN',
    } as never)

    const { receipt, nextQuoteToken, ...result } =
      await Actions.token.prepareUpdateQuoteTokenSync(client, {
        feeToken: tempo.alphaUsd,
        quoteToken,
        token: tokenId,
      } as never)

    expect(result).toMatchInlineSnapshot(`
      {
        "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)
    expect(nextQuoteToken).toBe(quoteToken)
    expect(receipt.status).toBe('success')
  })
})

describe('updateQuoteToken', () => {
  test('default', async () => {
    const quoteToken = await createToken({ name: 'Quote Token', symbol: 'QT' })
    const token = await createToken({ name: 'Main Token', symbol: 'MAIN' })

    // Propose the quote token update
    await Actions.token.prepareUpdateQuoteTokenSync(client, {
      feeToken: tempo.alphaUsd,
      quoteToken,
      token,
    } as never)

    // Complete the update
    const { receipt, newQuoteToken, ...result } =
      await Actions.token.updateQuoteTokenSync(client, {
        feeToken: tempo.alphaUsd,
        token,
      } as never)

    expect(receipt).toBeDefined()
    expect(result).toMatchInlineSnapshot(`
      {
        "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)
    expect(newQuoteToken).toBe(quoteToken)

    // Verify the update is reflected in metadata
    const metadata = await Actions.token.getMetadata(client, { token })
    expect(metadata.quoteToken).toBe(quoteToken)
  })

  test('behavior: requires admin role', async () => {
    const quoteToken = await createToken({ name: 'Quote Token', symbol: 'QT' })
    const token = await createToken({ name: 'Main Token', symbol: 'MAIN' })

    await Actions.token.prepareUpdateQuoteTokenSync(client, {
      feeToken: tempo.alphaUsd,
      quoteToken,
      token,
    } as never)

    await fund(client2.account!.address)

    // Completing the update from a non-admin fails
    await expect(
      Actions.token.updateQuoteTokenSync(client2, {
        feeToken: tempo.alphaUsd,
        token,
      } as never),
    ).rejects.toThrow()
  })

  test('behavior: prevents circular references', async () => {
    const tokenB = await createToken({ name: 'Token B', symbol: 'TKB' })

    // Token A is quoted in token B
    const { token: tokenA } = await Actions.token.createSync(client, {
      currency: 'USD',
      feeToken: tempo.alphaUsd,
      name: 'Token A',
      quoteToken: tokenB,
      symbol: 'TKA',
    } as never)

    // Proposing token B to be quoted in token A creates an A -> B -> A loop
    await Actions.token.prepareUpdateQuoteTokenSync(client, {
      feeToken: tempo.alphaUsd,
      quoteToken: tokenA,
      token: tokenB,
    } as never)

    // Completing the update fails
    await expect(
      Actions.token.updateQuoteTokenSync(client, {
        feeToken: tempo.alphaUsd,
        token: tokenB,
      } as never),
    ).rejects.toThrow()
  })
})

describe.todo('setSupplyCap')

describe('hasRole', () => {
  test('default', async () => {
    const token = await createToken()

    // The creator holds the defaultAdmin role
    await expect(
      Actions.token.hasRole(client, { role: 'defaultAdmin', token }),
    ).resolves.toBe(true)

    // The creator does not hold the issuer role initially
    await expect(
      Actions.token.hasRole(client, { role: 'issuer', token }),
    ).resolves.toBe(false)

    // Grant issuer role
    await Actions.token.grantRolesSync(client, {
      feeToken: tempo.alphaUsd,
      roles: ['issuer'],
      to: client.account!.address,
      token,
    } as never)

    await expect(
      Actions.token.hasRole(client, { role: 'issuer', token }),
    ).resolves.toBe(true)
  })

  test('behavior: check other account', async () => {
    const token = await createToken()

    await expect(
      Actions.token.hasRole(client, {
        account: client2.account!.address,
        role: 'issuer',
        token,
      }),
    ).resolves.toBe(false)

    await Actions.token.grantRolesSync(client, {
      feeToken: tempo.alphaUsd,
      roles: ['issuer'],
      to: client2.account!.address,
      token,
    } as never)

    await expect(
      Actions.token.hasRole(client, {
        account: client2.account!.address,
        role: 'issuer',
        token,
      }),
    ).resolves.toBe(true)

    await expect(
      Actions.token.hasRole(client, {
        account: client3.account!.address,
        role: 'issuer',
        token,
      }),
    ).resolves.toBe(false)
  })

  test('behavior: multiple roles', async () => {
    const token = await createToken()

    // The node allows a single role mutation per transaction.
    for (const role of ['issuer', 'pause'] as const)
      await Actions.token.grantRolesSync(client, {
        feeToken: tempo.alphaUsd,
        roles: [role],
        to: client2.account!.address,
        token,
      } as never)

    await expect(
      Actions.token.hasRole(client, {
        account: client2.account!.address,
        role: 'issuer',
        token,
      }),
    ).resolves.toBe(true)

    await expect(
      Actions.token.hasRole(client, {
        account: client2.account!.address,
        role: 'pause',
        token,
      }),
    ).resolves.toBe(true)

    await expect(
      Actions.token.hasRole(client, {
        account: client2.account!.address,
        role: 'unpause',
        token,
      }),
    ).resolves.toBe(false)
  })

  test('behavior: after revoke', async () => {
    const token = await createToken()

    await Actions.token.grantRolesSync(client, {
      feeToken: tempo.alphaUsd,
      roles: ['issuer'],
      to: client2.account!.address,
      token,
    } as never)

    await expect(
      Actions.token.hasRole(client, {
        account: client2.account!.address,
        role: 'issuer',
        token,
      }),
    ).resolves.toBe(true)

    await Actions.token.revokeRolesSync(client, {
      feeToken: tempo.alphaUsd,
      from: client2.account!.address,
      roles: ['issuer'],
      token,
    } as never)

    await expect(
      Actions.token.hasRole(client, {
        account: client2.account!.address,
        role: 'issuer',
        token,
      }),
    ).resolves.toBe(false)
  })

  test('behavior: with token ID', async () => {
    const { token, tokenId } = await Actions.token.createSync(client, {
      currency: 'USD',
      feeToken: tempo.alphaUsd,
      name: 'Test Token',
      symbol: 'TEST',
    } as never)

    await Actions.token.grantRolesSync(client, {
      feeToken: tempo.alphaUsd,
      roles: ['issuer'],
      to: client2.account!.address,
      token: tokenId,
    } as never)

    // Check using the token ID
    await expect(
      Actions.token.hasRole(client, {
        account: client2.account!.address,
        role: 'issuer',
        token: tokenId,
      }),
    ).resolves.toBe(true)

    // Same result with the address
    await expect(
      Actions.token.hasRole(client, {
        account: client2.account!.address,
        role: 'issuer',
        token,
      }),
    ).resolves.toBe(true)
  })
})

describe('getRoleAdmin', () => {
  test('default', async () => {
    const token = await createToken()

    // The defaultAdmin role administers issuer, pause and unpause
    await expect(
      Actions.token.getRoleAdmin(client, { role: 'issuer', token }),
    ).resolves.toBe(
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    )

    await expect(
      Actions.token.getRoleAdmin(client, { role: 'pause', token }),
    ).resolves.toBe(
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    )

    await expect(
      Actions.token.getRoleAdmin(client, { role: 'unpause', token }),
    ).resolves.toBe(
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    )
  })

  test('behavior: after setting role admin', async () => {
    const token = await createToken()

    await expect(
      Actions.token.getRoleAdmin(client, { role: 'issuer', token }),
    ).resolves.toBe(
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    )

    // Set pause as the admin role for issuer
    await Actions.token.setRoleAdminSync(client, {
      adminRole: 'pause',
      feeToken: tempo.alphaUsd,
      role: 'issuer',
      token,
    } as never)

    await expect(
      Actions.token.getRoleAdmin(client, { role: 'issuer', token }),
    ).resolves.toBe(TokenRole.serialize('pause'))
  })

  test('behavior: with token ID', async () => {
    const { token, tokenId } = await Actions.token.createSync(client, {
      currency: 'USD',
      feeToken: tempo.alphaUsd,
      name: 'Test Token',
      symbol: 'TEST',
    } as never)

    const adminRoleWithId = await Actions.token.getRoleAdmin(client, {
      role: 'issuer',
      token: tokenId,
    })
    expect(adminRoleWithId).toBe(
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    )

    const adminRoleWithAddress = await Actions.token.getRoleAdmin(client, {
      role: 'issuer',
      token,
    })
    expect(adminRoleWithAddress).toBe(adminRoleWithId)
  })

  test('behavior: defaultAdmin role admin', async () => {
    const token = await createToken()

    // The defaultAdmin role administers itself
    await expect(
      Actions.token.getRoleAdmin(client, { role: 'defaultAdmin', token }),
    ).resolves.toBe(
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    )
  })
})

describe('grantRoles', () => {
  test('default', async () => {
    const token = await createToken()

    const { receipt, value } = await Actions.token.grantRolesSync(client, {
      feeToken: tempo.alphaUsd,
      roles: ['issuer'],
      to: client2.account!.address,
      token,
    } as never)

    expect(receipt.status).toBe('success')
    expect(value).toHaveLength(1)
    const { role, ...rest } = value[0]!
    expect(rest).toMatchInlineSnapshot(`
      {
        "account": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "hasRole": true,
        "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)
    expect(role).toBe(TokenRole.serialize('issuer'))
  })
})

describe('revokeRoles', () => {
  test('default', async () => {
    const token = await createToken()

    await Actions.token.grantRolesSync(client, {
      feeToken: tempo.alphaUsd,
      roles: ['issuer'],
      to: client2.account!.address,
      token,
    } as never)

    const { receipt, value } = await Actions.token.revokeRolesSync(client, {
      feeToken: tempo.alphaUsd,
      from: client2.account!.address,
      roles: ['issuer'],
      token,
    } as never)

    expect(receipt.status).toBe('success')
    expect(value).toHaveLength(1)
    const { role, ...rest } = value[0]!
    expect(rest).toMatchInlineSnapshot(`
      {
        "account": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "hasRole": false,
        "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)
    expect(role).toBe(TokenRole.serialize('issuer'))
  })
})

describe('renounceRoles', () => {
  test('default', async () => {
    const token = await createToken()

    const { receipt: grantReceipt } = await Actions.token.grantRolesSync(
      client,
      {
        feeToken: tempo.alphaUsd,
        roles: ['issuer'],
        to: client.account!.address,
        token,
      } as never,
    )
    expect(grantReceipt.status).toBe('success')

    const { receipt, value } = await Actions.token.renounceRolesSync(client, {
      feeToken: tempo.alphaUsd,
      roles: ['issuer'],
      token,
    } as never)

    expect(receipt.status).toBe('success')
    expect(value).toHaveLength(1)
    const { role, ...rest } = value[0]!
    expect(rest).toMatchInlineSnapshot(`
      {
        "account": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "hasRole": false,
        "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)
    expect(role).toBe(TokenRole.serialize('issuer'))
  })
})

describe('watchCreate', () => {
  test('default', async () => {
    const watcher = Actions.token.watchCreate(client)
    type Log = Parameters<Parameters<(typeof watcher)['onLogs']>[0]>[0][number]
    const logs: Log[] = []
    watcher.onLogs((received) => logs.push(...received))

    try {
      await createToken({ name: 'Watch Test Token 1', symbol: 'WATCH1' })
      await createToken({ name: 'Watch Test Token 2', symbol: 'WATCH2' })

      await waitFor(() => logs.length >= 2)

      expect(logs.length).toBeGreaterThanOrEqual(2)
    } finally {
      watcher.off()
    }
  })

  test('behavior: filter by token', async () => {
    const salt = Hex.random(32)
    const tokenId = TokenId.compute({
      salt,
      sender: client.account!.address,
    })
    const token = TokenId.toAddress(tokenId)

    const watcher = Actions.token.watchCreate(client, { args: { token } })
    type Log = Parameters<Parameters<(typeof watcher)['onLogs']>[0]>[0][number]
    const logs: Log[] = []
    watcher.onLogs((received) => logs.push(...received))

    try {
      // Create first token (not captured)
      await createToken({ name: 'Filtered Watch Token 1', symbol: 'FWATCH1' })

      // Create second token (captured)
      const result = await Actions.token.createSync(client, {
        currency: 'USD',
        feeToken: tempo.alphaUsd,
        name: 'Filtered Watch Token 2',
        salt,
        symbol: 'FWATCH2',
      } as never)
      expect(result.token.toLowerCase()).toBe(token.toLowerCase())

      // Create third token (not captured)
      await createToken({ name: 'Filtered Watch Token 3', symbol: 'FWATCH3' })

      await waitFor(() => logs.length >= 1)

      // Only the token matching the filter is received
      expect(logs).toHaveLength(1)

      const { token: tokenAddress, salt: tokenSalt, ...rest } = logs[0]!.args
      expect(rest).toMatchInlineSnapshot(`
        {
          "admin": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "currency": "USD",
          "name": "Filtered Watch Token 2",
          "quoteToken": "0x20C0000000000000000000000000000000000000",
          "symbol": "FWATCH2",
        }
      `)
      expect(tokenSalt).toBe(salt)
      expect(tokenAddress.toLowerCase()).toBe(token.toLowerCase())
    } finally {
      watcher.off()
    }
  })
})

describe('watchMint', () => {
  test('default', async () => {
    const token = await createToken({ roles: ['issuer'] })

    const watcher = Actions.token.watchMint(client, { token })
    type Log = Parameters<Parameters<(typeof watcher)['onLogs']>[0]>[0][number]
    const logs: Log[] = []
    watcher.onLogs((received) => logs.push(...received))

    try {
      await Actions.token.mintSync(client, {
        amount: 100_000_000n,
        feeToken: tempo.alphaUsd,
        to: client2.account!.address,
        token,
      } as never)

      await Actions.token.mintSync(client, {
        amount: 50_000_000n,
        feeToken: tempo.alphaUsd,
        to: client3.account!.address,
        token,
      } as never)

      await waitFor(() => logs.length >= 2)

      expect(logs).toHaveLength(2)
      expect(logs[0]!.args).toMatchInlineSnapshot(`
        {
          "amount": 100000000n,
          "to": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        }
      `)
      expect(logs[1]!.args).toMatchInlineSnapshot(`
        {
          "amount": 50000000n,
          "to": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        }
      `)
    } finally {
      watcher.off()
    }
  })

  test('behavior: filter by to address', async () => {
    const token = await createToken({ roles: ['issuer'] })

    const watcher = Actions.token.watchMint(client, {
      args: { to: client2.account!.address },
      token,
    })
    type Log = Parameters<Parameters<(typeof watcher)['onLogs']>[0]>[0][number]
    const logs: Log[] = []
    watcher.onLogs((received) => logs.push(...received))

    try {
      // Mint to account 1 (captured)
      await Actions.token.mintSync(client, {
        amount: 100_000_000n,
        feeToken: tempo.alphaUsd,
        to: client2.account!.address,
        token,
      } as never)

      // Mint to account 2 (not captured)
      await Actions.token.mintSync(client, {
        amount: 50_000_000n,
        feeToken: tempo.alphaUsd,
        to: client3.account!.address,
        token,
      } as never)

      // Mint to account 1 again (captured)
      await Actions.token.mintSync(client, {
        amount: 75_000_000n,
        feeToken: tempo.alphaUsd,
        to: client2.account!.address,
        token,
      } as never)

      await waitFor(() => logs.length >= 2)

      // Only mints to account 1 are received
      expect(logs).toHaveLength(2)
      expect(logs[0]!.args).toMatchInlineSnapshot(`
        {
          "amount": 100000000n,
          "to": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        }
      `)
      expect(logs[1]!.args).toMatchInlineSnapshot(`
        {
          "amount": 75000000n,
          "to": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        }
      `)

      for (const log of logs) expect(log.args.to).toBe(client2.account!.address)
    } finally {
      watcher.off()
    }
  })
})

describe('watchApprove', () => {
  test('default', async () => {
    const token = await createToken()

    const watcher = Actions.token.watchApprove(client, { token })
    type Log = Parameters<Parameters<(typeof watcher)['onLogs']>[0]>[0][number]
    const logs: Log[] = []
    watcher.onLogs((received) => logs.push(...received))

    try {
      await Actions.token.approveSync(client, {
        amount: { decimals: 6, formatted: '100' },
        feeToken: tempo.alphaUsd,
        spender: client2.account!.address,
        token,
      } as never)

      await Actions.token.approveSync(client, {
        amount: { decimals: 6, formatted: '50' },
        feeToken: tempo.alphaUsd,
        spender: client3.account!.address,
        token,
      } as never)

      await waitFor(() => logs.length >= 2)

      expect(logs).toHaveLength(2)
      expect(logs[0]!.args).toMatchInlineSnapshot(`
        {
          "amount": 100000000n,
          "owner": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "spender": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        }
      `)
      expect(logs[1]!.args).toMatchInlineSnapshot(`
        {
          "amount": 50000000n,
          "owner": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "spender": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        }
      `)
    } finally {
      watcher.off()
    }
  })

  test('behavior: filter by spender address', async () => {
    const token = await createToken()

    const watcher = Actions.token.watchApprove(client, {
      args: { spender: client2.account!.address },
      token,
    })
    type Log = Parameters<Parameters<(typeof watcher)['onLogs']>[0]>[0][number]
    const logs: Log[] = []
    watcher.onLogs((received) => logs.push(...received))

    try {
      // Approve account 1 (captured)
      await Actions.token.approveSync(client, {
        amount: { decimals: 6, formatted: '100' },
        feeToken: tempo.alphaUsd,
        spender: client2.account!.address,
        token,
      } as never)

      // Approve account 2 (not captured)
      await Actions.token.approveSync(client, {
        amount: { decimals: 6, formatted: '50' },
        feeToken: tempo.alphaUsd,
        spender: client3.account!.address,
        token,
      } as never)

      // Approve account 1 again (captured)
      await Actions.token.approveSync(client, {
        amount: { decimals: 6, formatted: '75' },
        feeToken: tempo.alphaUsd,
        spender: client2.account!.address,
        token,
      } as never)

      await waitFor(() => logs.length >= 2)

      // Only approvals for account 1 are received
      expect(logs).toHaveLength(2)
      expect(logs[0]!.args).toMatchInlineSnapshot(`
        {
          "amount": 100000000n,
          "owner": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "spender": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        }
      `)
      expect(logs[1]!.args).toMatchInlineSnapshot(`
        {
          "amount": 75000000n,
          "owner": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "spender": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        }
      `)

      for (const log of logs)
        expect(log.args.spender).toBe(client2.account!.address)
    } finally {
      watcher.off()
    }
  })
})

describe('watchBurn', () => {
  test('default', async () => {
    const token = await createToken({ roles: ['issuer'] })

    await Actions.token.grantRolesSync(client, {
      feeToken: tempo.alphaUsd,
      roles: ['issuer'],
      to: client2.account!.address,
      token,
    } as never)

    await Actions.token.mintSync(client, {
      amount: 200_000_000n,
      feeToken: tempo.alphaUsd,
      to: client.account!.address,
      token,
    } as never)

    await Actions.token.mintSync(client, {
      amount: 100_000_000n,
      feeToken: tempo.alphaUsd,
      to: client2.account!.address,
      token,
    } as never)

    await fund(client2.account!.address)

    const watcher = Actions.token.watchBurn(client, { token })
    type Log = Parameters<Parameters<(typeof watcher)['onLogs']>[0]>[0][number]
    const logs: Log[] = []
    watcher.onLogs((received) => logs.push(...received))

    try {
      await Actions.token.burnSync(client, {
        amount: 50_000_000n,
        feeToken: tempo.alphaUsd,
        token,
      } as never)

      await Actions.token.burnSync(client2, {
        amount: 25_000_000n,
        feeToken: tempo.alphaUsd,
        token,
      } as never)

      await waitFor(() => logs.length >= 2)

      expect(logs).toHaveLength(2)
      expect(logs[0]!.args).toMatchInlineSnapshot(`
        {
          "amount": 50000000n,
          "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        }
      `)
      expect(logs[1]!.args).toMatchInlineSnapshot(`
        {
          "amount": 25000000n,
          "from": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        }
      `)
    } finally {
      watcher.off()
    }
  })

  test('behavior: filter by from address', async () => {
    const token = await createToken({ roles: ['issuer'] })

    await Actions.token.grantRolesSync(client, {
      feeToken: tempo.alphaUsd,
      roles: ['issuer'],
      to: client2.account!.address,
      token,
    } as never)

    await Actions.token.mintSync(client, {
      amount: 200_000_000n,
      feeToken: tempo.alphaUsd,
      to: client.account!.address,
      token,
    } as never)

    await Actions.token.mintSync(client, {
      amount: 200_000_000n,
      feeToken: tempo.alphaUsd,
      to: client2.account!.address,
      token,
    } as never)

    await fund(client2.account!.address)

    const watcher = Actions.token.watchBurn(client, {
      args: { from: client.account!.address },
      token,
    })
    type Log = Parameters<Parameters<(typeof watcher)['onLogs']>[0]>[0][number]
    const logs: Log[] = []
    watcher.onLogs((received) => logs.push(...received))

    try {
      // Burn from account 0 (captured)
      await Actions.token.burnSync(client, {
        amount: 50_000_000n,
        feeToken: tempo.alphaUsd,
        token,
      } as never)

      // Burn from account 1 (not captured)
      await Actions.token.burnSync(client2, {
        amount: 25_000_000n,
        feeToken: tempo.alphaUsd,
        token,
      } as never)

      // Burn from account 0 again (captured)
      await Actions.token.burnSync(client, {
        amount: 75_000_000n,
        feeToken: tempo.alphaUsd,
        token,
      } as never)

      await waitFor(() => logs.length >= 2)

      // Only burns from account 0 are received
      expect(logs).toHaveLength(2)
      expect(logs[0]!.args).toMatchInlineSnapshot(`
        {
          "amount": 50000000n,
          "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        }
      `)
      expect(logs[1]!.args).toMatchInlineSnapshot(`
        {
          "amount": 75000000n,
          "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        }
      `)

      for (const log of logs)
        expect(log.args.from).toBe(client.account!.address)
    } finally {
      watcher.off()
    }
  })
})

describe('watchAdminRole', () => {
  test('default', async () => {
    const token = await createToken()

    const watcher = Actions.token.watchAdminRole(client, { token })
    type Log = Parameters<Parameters<(typeof watcher)['onLogs']>[0]>[0][number]
    const logs: Log[] = []
    watcher.onLogs((received) => logs.push(...received))

    try {
      // Set the admin role for the issuer role
      const { receipt, role, newAdminRole, ...result } =
        await Actions.token.setRoleAdminSync(client, {
          adminRole: 'pause',
          feeToken: tempo.alphaUsd,
          role: 'issuer',
          token,
        } as never)
      expect(receipt).toBeDefined()
      expect(result).toMatchInlineSnapshot(`
        {
          "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        }
      `)
      expect(role).toBe(TokenRole.serialize('issuer'))
      expect(newAdminRole).toBe(TokenRole.serialize('pause'))

      // Set the admin role for the pause role
      await Actions.token.setRoleAdminSync(client, {
        adminRole: 'unpause',
        feeToken: tempo.alphaUsd,
        role: 'pause',
        token,
      } as never)

      await waitFor(() => logs.length >= 2)

      expect(logs).toHaveLength(2)
      expect(logs[0]!.args.sender).toBe(client.account!.address)
      expect(logs[1]!.args.sender).toBe(client.account!.address)
    } finally {
      watcher.off()
    }
  })
})

describe('watchRole', () => {
  test('default', async () => {
    const token = await createToken()

    const watcher = Actions.token.watchRole(client, { token })
    type Log = Parameters<Parameters<(typeof watcher)['onLogs']>[0]>[0][number]
    const logs: Log[] = []
    watcher.onLogs((received) => logs.push(...received))

    try {
      // Grant issuer role to account 1
      await Actions.token.grantRolesSync(client, {
        feeToken: tempo.alphaUsd,
        roles: ['issuer'],
        to: client2.account!.address,
        token,
      } as never)

      // Grant pause role to account 2
      await Actions.token.grantRolesSync(client, {
        feeToken: tempo.alphaUsd,
        roles: ['pause'],
        to: client3.account!.address,
        token,
      } as never)

      // Revoke issuer role from account 1
      await Actions.token.revokeRolesSync(client, {
        feeToken: tempo.alphaUsd,
        from: client2.account!.address,
        roles: ['issuer'],
        token,
      } as never)

      await waitFor(() => logs.length >= 3)

      expect(logs).toHaveLength(3)

      // First event: grant issuer
      expect(logs[0]!.args.account).toBe(client2.account!.address)
      expect(logs[0]!.args.hasRole).toBe(true)

      // Second event: grant pause
      expect(logs[1]!.args.account).toBe(client3.account!.address)
      expect(logs[1]!.args.hasRole).toBe(true)

      // Third event: revoke issuer
      expect(logs[2]!.args.account).toBe(client2.account!.address)
      expect(logs[2]!.args.hasRole).toBe(false)
    } finally {
      watcher.off()
    }
  })

  test('behavior: filter by account address', async () => {
    const token = await createToken()

    const watcher = Actions.token.watchRole(client, {
      args: { account: client2.account!.address },
      token,
    })
    type Log = Parameters<Parameters<(typeof watcher)['onLogs']>[0]>[0][number]
    const logs: Log[] = []
    watcher.onLogs((received) => logs.push(...received))

    try {
      // Grant issuer role to account 1 (captured)
      await Actions.token.grantRolesSync(client, {
        feeToken: tempo.alphaUsd,
        roles: ['issuer'],
        to: client2.account!.address,
        token,
      } as never)

      // Grant pause role to account 2 (not captured)
      await Actions.token.grantRolesSync(client, {
        feeToken: tempo.alphaUsd,
        roles: ['pause'],
        to: client3.account!.address,
        token,
      } as never)

      // Revoke issuer role from account 1 (captured)
      await Actions.token.revokeRolesSync(client, {
        feeToken: tempo.alphaUsd,
        from: client2.account!.address,
        roles: ['issuer'],
        token,
      } as never)

      await waitFor(() => logs.length >= 2)

      // Only account 1 events are received
      expect(logs).toHaveLength(2)

      expect(logs[0]!.args.account).toBe(client2.account!.address)
      expect(logs[0]!.args.hasRole).toBe(true)

      expect(logs[1]!.args.account).toBe(client2.account!.address)
      expect(logs[1]!.args.hasRole).toBe(false)
    } finally {
      watcher.off()
    }
  })
})

describe('watchTransfer', () => {
  test('default', async () => {
    const token = await createToken({ roles: ['issuer'] })

    await Actions.token.mintSync(client, {
      amount: 500_000_000n,
      feeToken: tempo.alphaUsd,
      to: client.account!.address,
      token,
    } as never)

    const watcher = Actions.token.watchTransfer(client, { token })
    type Log = Parameters<Parameters<(typeof watcher)['onLogs']>[0]>[0][number]
    const logs: Log[] = []
    watcher.onLogs((received) => logs.push(...received))

    try {
      await Actions.token.transferSync(client, {
        amount: { decimals: 6, formatted: '100' },
        feeToken: tempo.alphaUsd,
        to: client2.account!.address,
        token,
      } as never)

      await Actions.token.transferSync(client, {
        amount: { decimals: 6, formatted: '50' },
        feeToken: tempo.alphaUsd,
        to: client3.account!.address,
        token,
      } as never)

      await waitFor(() => logs.length >= 2)

      expect(logs.length).toBeGreaterThanOrEqual(2)
    } finally {
      watcher.off()
    }
  })

  test('behavior: filter by to address', async () => {
    const token = await createToken({ roles: ['issuer'] })

    await Actions.token.mintSync(client, {
      amount: 500_000_000n,
      feeToken: tempo.alphaUsd,
      to: client.account!.address,
      token,
    } as never)

    const watcher = Actions.token.watchTransfer(client, {
      args: { to: client2.account!.address },
      token,
    })
    type Log = Parameters<Parameters<(typeof watcher)['onLogs']>[0]>[0][number]
    const logs: Log[] = []
    watcher.onLogs((received) => logs.push(...received))

    try {
      // Transfer to account 1 (captured)
      await Actions.token.transferSync(client, {
        amount: { decimals: 6, formatted: '100' },
        feeToken: tempo.alphaUsd,
        to: client2.account!.address,
        token,
      } as never)

      // Transfer to account 2 (not captured)
      await Actions.token.transferSync(client, {
        amount: { decimals: 6, formatted: '50' },
        feeToken: tempo.alphaUsd,
        to: client3.account!.address,
        token,
      } as never)

      // Transfer to account 1 again (captured)
      await Actions.token.transferSync(client, {
        amount: { decimals: 6, formatted: '75' },
        feeToken: tempo.alphaUsd,
        to: client2.account!.address,
        token,
      } as never)

      await waitFor(() => logs.length >= 2)

      // Only transfers to account 1 are received
      expect(logs).toHaveLength(2)
      expect(logs[0]!.args).toMatchInlineSnapshot(`
        {
          "amount": 100000000n,
          "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "to": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        }
      `)
      expect(logs[1]!.args).toMatchInlineSnapshot(`
        {
          "amount": 75000000n,
          "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "to": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        }
      `)

      for (const log of logs) expect(log.args.to).toBe(client2.account!.address)
    } finally {
      watcher.off()
    }
  })
})

describe('watchUpdateQuoteToken', () => {
  test('default', async () => {
    const quoteToken = await createToken({ name: 'Quote Token', symbol: 'QT' })
    const token = await createToken({ name: 'Main Token', symbol: 'MAIN' })

    const watcher = Actions.token.watchUpdateQuoteToken(client, { token })
    type Log = Parameters<Parameters<(typeof watcher)['onLogs']>[0]>[0][number]
    const logs: Log[] = []
    watcher.onLogs((received) => logs.push(...received))

    try {
      // Propose the quote token update (emits NextQuoteTokenSet)
      await Actions.token.prepareUpdateQuoteTokenSync(client, {
        feeToken: tempo.alphaUsd,
        quoteToken,
        token,
      } as never)

      // Complete the update (emits QuoteTokenUpdate)
      await Actions.token.updateQuoteTokenSync(client, {
        feeToken: tempo.alphaUsd,
        token,
      } as never)

      await waitFor(() => logs.length >= 2)

      expect(logs).toHaveLength(2)

      expect(logs[0]!.eventName).toBe('NextQuoteTokenSet')
      expect(logs[0]!.args).toEqual({
        nextQuoteToken: quoteToken,
        updater: client.account!.address,
      })

      expect(logs[1]!.eventName).toBe('QuoteTokenUpdate')
      expect(logs[1]!.args).toEqual({
        newQuoteToken: quoteToken,
        updater: client.account!.address,
      })
    } finally {
      watcher.off()
    }
  })

  test('behavior: only proposed updates', async () => {
    const quoteToken = await createToken({ name: 'Quote Token', symbol: 'QT' })
    const token = await createToken({ name: 'Main Token', symbol: 'MAIN' })

    const watcher = Actions.token.watchUpdateQuoteToken(client, { token })
    type Log = Parameters<Parameters<(typeof watcher)['onLogs']>[0]>[0][number]
    const logs: Log[] = []
    watcher.onLogs((received) => logs.push(...received))

    try {
      // Only propose (do not complete)
      await Actions.token.prepareUpdateQuoteTokenSync(client, {
        feeToken: tempo.alphaUsd,
        quoteToken,
        token,
      } as never)

      await waitFor(() => logs.length >= 1)

      expect(logs).toHaveLength(1)
      expect(logs[0]!.eventName).toBe('NextQuoteTokenSet')
      expect(logs[0]!.args).toEqual({
        nextQuoteToken: quoteToken,
        updater: client.account!.address,
      })
    } finally {
      watcher.off()
    }
  })
})
