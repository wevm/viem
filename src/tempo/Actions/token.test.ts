import { setTimeout } from 'node:timers/promises'
import { Hex } from 'ox'
import { TokenRole } from 'ox/tempo'
import { parseUnits } from 'viem'
import { getCode, writeContractSync } from 'viem/actions'
import { Abis, Addresses, TokenIds } from 'viem/tempo'
import { beforeAll, describe, expect, test } from 'vitest'
import { accounts, addresses, getClient } from '~test/tempo/config.js'
import { rpcUrl } from '~test/tempo/prool.js'
import * as actions from './index.js'

const account = accounts[0]
const account2 = accounts[1]
const account3 = accounts[2]

const client = getClient({
  account,
})

describe('approve', () => {
  test('default', async () => {
    {
      // approve
      const { receipt, ...result } = await actions.token.approveSync(client, {
        spender: account2.address,
        amount: parseUnits('100', 6),
        token: addresses.alphaUsd,
      })
      expect(receipt).toBeDefined()
      expect(result).toMatchInlineSnapshot(`
        {
          "amount": 100000000n,
          "owner": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "spender": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
        }
      `)
    }

    {
      // check allowance
      const allowance = await actions.token.getAllowance(client, {
        spender: account2.address,
        token: addresses.alphaUsd,
      })
      expect(allowance).toBe(parseUnits('100', 6))
    }

    // transfer tokens for gas
    await writeContractSync(client, {
      abi: Abis.tip20,
      address: addresses.alphaUsd,
      functionName: 'transfer',
      args: [account2.address, parseUnits('1', 6)],
    })

    // transfer tokens from approved account
    await actions.token.transferSync(client, {
      amount: parseUnits('50', 6),
      account: account2,
      from: account.address,
      to: '0x0000000000000000000000000000000000000001',
      token: addresses.alphaUsd,
    })

    {
      // verify updated allowance
      const allowance = await actions.token.getAllowance(client, {
        spender: account2.address,
        token: addresses.alphaUsd,
      })
      expect(allowance).toBe(parseUnits('50', 6))
    }

    // verify balance
    const balance = await actions.token.getBalance(client, {
      account: '0x0000000000000000000000000000000000000001',
      token: addresses.alphaUsd,
    })
    expect(balance).toBe(parseUnits('50', 6))
  })

  test('behavior: token address', async () => {
    const balanceBefore = await actions.token.getBalance(client, {
      account: '0x0000000000000000000000000000000000000001',
      token: addresses.alphaUsd,
    })

    {
      // approve
      const { receipt, ...result } = await actions.token.approveSync(client, {
        amount: parseUnits('100', 6),
        token: addresses.alphaUsd,
        spender: account2.address,
      })
      expect(receipt).toBeDefined()
      expect(result).toMatchInlineSnapshot(`
        {
          "amount": 100000000n,
          "owner": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "spender": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
        }
      `)
    }

    {
      // check allowance
      const allowance = await actions.token.getAllowance(client, {
        token: addresses.alphaUsd,
        spender: account2.address,
      })
      expect(allowance).toBe(parseUnits('100', 6))
    }

    // transfer tokens for gas
    await writeContractSync(client, {
      abi: Abis.tip20,
      address: addresses.alphaUsd,
      functionName: 'transfer',
      args: [account2.address, parseUnits('1', 6)],
    })

    // transfer tokens from approved account
    await actions.token.transferSync(client, {
      amount: parseUnits('50', 6),
      account: account2,
      from: account.address,
      to: '0x0000000000000000000000000000000000000001',
      token: addresses.alphaUsd,
    })

    {
      // verify updated allowance
      const allowance = await actions.token.getAllowance(client, {
        spender: account2.address,
        token: addresses.alphaUsd,
      })
      expect(allowance).toBe(parseUnits('50', 6))
    }

    // verify balance
    const balance = await actions.token.getBalance(client, {
      account: '0x0000000000000000000000000000000000000001',
      token: addresses.alphaUsd,
    })
    expect(balance).toBe(balanceBefore + parseUnits('50', 6))
  })

  test('behavior: token address', async () => {
    const balanceBefore = await actions.token.getBalance(client, {
      account: '0x0000000000000000000000000000000000000001',
      token: addresses.alphaUsd,
    })

    {
      // approve
      const { receipt, ...result } = await actions.token.approveSync(client, {
        amount: parseUnits('100', 6),
        token: addresses.alphaUsd,
        spender: account2.address,
      })
      expect(receipt).toBeDefined()
      expect(result).toMatchInlineSnapshot(`
        {
          "amount": 100000000n,
          "owner": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "spender": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
        }
      `)
    }

    {
      // check allowance
      const allowance = await actions.token.getAllowance(client, {
        token: addresses.alphaUsd,
        spender: account2.address,
      })
      expect(allowance).toBe(parseUnits('100', 6))
    }

    // transfer tokens for gas
    await writeContractSync(client, {
      abi: Abis.tip20,
      address: addresses.alphaUsd,
      functionName: 'transfer',
      args: [account2.address, parseUnits('1', 6)],
    })

    // transfer tokens from approved account
    await actions.token.transferSync(client, {
      amount: parseUnits('50', 6),
      account: account2,
      from: account.address,
      to: '0x0000000000000000000000000000000000000001',
      token: addresses.alphaUsd,
    })

    {
      // verify updated allowance
      const allowance = await actions.token.getAllowance(client, {
        spender: account2.address,
        token: addresses.alphaUsd,
      })
      expect(allowance).toBe(parseUnits('50', 6))
    }

    // verify balance
    const balance = await actions.token.getBalance(client, {
      account: '0x0000000000000000000000000000000000000001',
      token: addresses.alphaUsd,
    })
    expect(balance).toBe(balanceBefore + parseUnits('50', 6))
  })
})

describe('create', () => {
  test('default', async () => {
    const { receipt, token, tokenId, ...result } =
      await actions.token.createSync(client, {
        currency: 'USD',
        name: 'Test USD',
        symbol: 'TUSD',
      })

    expect(result).toMatchInlineSnapshot(`
      {
        "admin": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "currency": "USD",
        "name": "Test USD",
        "quoteToken": "0x20C0000000000000000000000000000000000000",
        "symbol": "TUSD",
      }
    `)
    expect(token).toBeDefined()
    expect(tokenId).toBeDefined()
    expect(receipt).toBeDefined()

    const code = await getCode(client, {
      address: token,
    })
    expect(code).toBe('0xef')
  })
})

describe('getAllowance', () => {
  test('default', async () => {
    // First, approve some allowance
    await writeContractSync(client, {
      abi: Abis.tip20,
      address: addresses.alphaUsd,
      functionName: 'approve',
      args: [account2.address, parseUnits('50', 6)],
    })

    {
      // Test with default token
      const allowance = await actions.token.getAllowance(client, {
        spender: account2.address,
        token: addresses.alphaUsd,
      })
      expect(allowance).toBe(parseUnits('50', 6))
    }

    {
      // Test with token address
      const allowance = await actions.token.getAllowance(client, {
        token: addresses.alphaUsd,
        spender: account2.address,
      })

      expect(allowance).toBe(parseUnits('50', 6))
    }

    {
      // Test with token ID
      const allowance = await actions.token.getAllowance(client, {
        token: addresses.alphaUsd,
        spender: account2.address,
      })

      expect(allowance).toBe(parseUnits('50', 6))
    }
  })
})

describe('getBalance', () => {
  test('default', async () => {
    {
      // Test with token address
      const balance = await actions.token.getBalance(client, {
        token: addresses.alphaUsd,
      })

      expect(balance).toBeGreaterThan(0n)
    }

    {
      // Test with token ID & different account
      const balance = await actions.token.getBalance(client, {
        token: addresses.alphaUsd,
        account: Hex.random(20),
      })

      expect(balance).toBe(0n)
    }
  })
})

describe('getMetadata', () => {
  test('default', async () => {
    const metadata = await actions.token.getMetadata(client, {
      token: addresses.alphaUsd,
    })

    expect(metadata).toMatchInlineSnapshot(`
      {
        "currency": "USD",
        "decimals": 6,
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
    const { token } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'Test USD',
      symbol: 'TUSD',
    })

    const metadata = await actions.token.getMetadata(client, {
      token,
    })

    expect(metadata).toMatchInlineSnapshot(`
      {
        "currency": "USD",
        "decimals": 6,
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
      const metadata = await actions.token.getMetadata(client, {
        token: TokenIds.pathUsd,
      })

      expect(metadata).toMatchInlineSnapshot(`
        {
          "currency": "USD",
          "decimals": 6,
          "name": "pathUSD",
          "symbol": "pathUSD",
          "totalSupply": 184467440737095516150n,
        }
      `)
    }

    {
      const metadata = await actions.token.getMetadata(client, {
        token: Addresses.pathUsd,
      })

      expect(metadata).toMatchInlineSnapshot(`
        {
          "currency": "USD",
          "decimals": 6,
          "name": "pathUSD",
          "symbol": "pathUSD",
          "totalSupply": 184467440737095516150n,
        }
      `)
    }
  })

  test('behavior: custom token (id)', async () => {
    const token = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'Test USD',
      symbol: 'TUSD',
    })

    const metadata = await actions.token.getMetadata(client, {
      token: token.tokenId,
    })

    expect(metadata).toMatchInlineSnapshot(`
      {
        "currency": "USD",
        "decimals": 6,
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
})

describe('mint', () => {
  test('default', async () => {
    // Create a new token where we're the admin
    const { token } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'Mintable Token',
      symbol: 'MINT',
    })

    // Grant issuer role
    await actions.token.grantRolesSync(client, {
      token,
      roles: ['issuer'],
      to: client.account.address,
    })

    // Check initial balance
    const balanceBefore = await actions.token.getBalance(client, {
      token,
      account: account2.address,
    })
    expect(balanceBefore).toBe(0n)

    // Mint tokens
    const { receipt: mintReceipt, ...mintResult } =
      await actions.token.mintSync(client, {
        token,
        to: account2.address,
        amount: parseUnits('1000', 6),
      })
    expect(mintReceipt).toBeDefined()
    expect(mintResult).toMatchInlineSnapshot(`
      {
        "amount": 1000000000n,
        "to": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
      }
    `)

    // Check balance after mint
    const balanceAfter = await actions.token.getBalance(client, {
      token,
      account: account2.address,
    })
    expect(balanceAfter).toBe(parseUnits('1000', 6))

    // Check total supply
    const metadata = await actions.token.getMetadata(client, {
      token,
    })
    expect(metadata.totalSupply).toBe(parseUnits('1000', 6))
  })

  // TODO: fix
  test.skip('with memo', async () => {
    // Create a new token
    const { token } = await actions.token.createSync(client, {
      admin: client.account,
      currency: 'USD',
      name: 'Mintable Token 2',
      symbol: 'MINT2',
    })

    // Grant issuer role
    await actions.token.grantRolesSync(client, {
      token,
      roles: ['issuer'],
      to: client.account.address,
    })

    // Mint tokens with memo
    const { receipt: mintMemoReceipt, ...mintMemoResult } =
      await actions.token.mintSync(client, {
        token,
        to: account2.address,
        amount: parseUnits('500', 6),
        memo: Hex.fromString('test'),
      })
    expect(mintMemoReceipt.status).toBe('success')
    expect(mintMemoResult).toMatchInlineSnapshot(`
      {
        "amount": 500000000000000000000n,
        "to": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
      }
    `)

    // Verify balance
    const balance = await actions.token.getBalance(client, {
      token,
      account: account2.address,
    })
    expect(balance).toBe(parseUnits('500', 6))
  })
})

describe('transfer', () => {
  test('default', async () => {
    // Get initial balances
    const senderBalanceBefore = await actions.token.getBalance(client, {
      account: account.address,
      token: addresses.alphaUsd,
    })
    const receiverBalanceBefore = await actions.token.getBalance(client, {
      account: account2.address,
      token: addresses.alphaUsd,
    })

    // Transfer tokens
    const { receipt: transferReceipt, ...transferResult } =
      await actions.token.transferSync(client, {
        to: account2.address,
        amount: parseUnits('10', 6),
        token: addresses.alphaUsd,
      })
    expect(transferReceipt).toBeDefined()
    expect(transferResult).toMatchInlineSnapshot(`
      {
        "amount": 10000000n,
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "to": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
      }
    `)

    // Verify balances
    const senderBalanceAfter = await actions.token.getBalance(client, {
      account: account.address,
      token: addresses.alphaUsd,
    })
    const receiverBalanceAfter = await actions.token.getBalance(client, {
      account: account2.address,
      token: addresses.alphaUsd,
    })

    expect(senderBalanceAfter - senderBalanceBefore).toBeLessThan(
      parseUnits('10', 6),
    )
    expect(receiverBalanceAfter - receiverBalanceBefore).toBe(
      parseUnits('10', 6),
    )
  })

  test('behavior: with custom token', async () => {
    // Create a new token
    const { token } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'Transfer Token',
      symbol: 'XFER',
    })

    // Grant issuer role and mint tokens
    await actions.token.grantRolesSync(client, {
      token,
      roles: ['issuer'],
      to: client.account.address,
    })

    await actions.token.mintSync(client, {
      token,
      to: client.account.address,
      amount: parseUnits('1000', 6),
    })

    // Transfer custom tokens
    await actions.token.transferSync(client, {
      token,
      to: account2.address,
      amount: parseUnits('100', 6),
    })

    // Verify balance
    const balance = await actions.token.getBalance(client, {
      token,
      account: account2.address,
    })
    expect(balance).toBe(parseUnits('100', 6))
  })

  test('behavior: with memo', async () => {
    const memo = Hex.fromString('Payment for services')

    const { receipt: transferMemoReceipt, ...transferMemoResult } =
      await actions.token.transferSync(client, {
        to: account2.address,
        amount: parseUnits('5', 6),
        memo,
        token: addresses.alphaUsd,
      })

    expect(transferMemoReceipt.status).toBe('success')
    expect(transferMemoResult).toMatchInlineSnapshot(`
      {
        "amount": 5000000n,
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "to": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
      }
    `)
  })

  test('behavior: from another account (transferFrom)', async () => {
    // First approve account2 to spend tokens
    await actions.token.approveSync(client, {
      spender: account2.address,
      amount: parseUnits('50', 6),
      token: addresses.alphaUsd,
    })

    // Transfer tokens for gas
    await writeContractSync(client, {
      abi: Abis.tip20,
      address: addresses.alphaUsd,
      functionName: 'transfer',
      args: [account2.address, parseUnits('1', 6)],
    })

    // Get initial balance
    const balanceBefore = await actions.token.getBalance(client, {
      account: account3.address,
      token: addresses.alphaUsd,
    })

    // Account2 transfers from account to account3
    await actions.token.transferSync(client, {
      account: account2,
      from: account.address,
      to: account3.address,
      amount: parseUnits('25', 6),
      token: addresses.alphaUsd,
    })

    // Verify balance
    const balanceAfter = await actions.token.getBalance(client, {
      account: account3.address,
      token: addresses.alphaUsd,
    })
    expect(balanceAfter - balanceBefore).toBe(parseUnits('25', 6))

    // Verify allowance was reduced
    const allowance = await actions.token.getAllowance(client, {
      spender: account2.address,
      token: addresses.alphaUsd,
    })
    expect(allowance).toBe(parseUnits('25', 6))
  })
})

describe('burn', () => {
  test('default', async () => {
    // Create a new token where we have issuer role
    const { token } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'Burnable Token',
      symbol: 'BURN',
    })

    // Grant issuer role
    await actions.token.grantRolesSync(client, {
      token,
      roles: ['issuer'],
      to: client.account.address,
    })

    // Mint some tokens
    await actions.token.mintSync(client, {
      token,
      to: client.account.address,
      amount: parseUnits('1000', 6),
    })

    // Check balance before burn
    const balanceBefore = await actions.token.getBalance(client, {
      token,
    })
    expect(balanceBefore).toBe(parseUnits('1000', 6))

    // Check total supply before
    const metadataBefore = await actions.token.getMetadata(client, {
      token,
    })
    expect(metadataBefore.totalSupply).toBe(parseUnits('1000', 6))

    // Burn tokens
    const { receipt, ...result } = await actions.token.burnSync(client, {
      token,
      amount: parseUnits('100', 6),
    })
    expect(receipt).toBeDefined()
    expect(result).toMatchInlineSnapshot(`
      {
        "amount": 100000000n,
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    // Check balance after burn
    const balanceAfter = await actions.token.getBalance(client, {
      token,
    })
    expect(balanceAfter).toBe(parseUnits('900', 6))

    // Check total supply after
    const metadataAfter = await actions.token.getMetadata(client, {
      token,
    })
    expect(metadataAfter.totalSupply).toBe(parseUnits('900', 6))
  })

  test('behavior: requires issuer role', async () => {
    // Create a new token
    const { token } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'Restricted Burn Token',
      symbol: 'RBURN',
    })

    // Grant issuer role to account2 (not us)
    await actions.token.grantRolesSync(client, {
      token,
      roles: ['issuer'],
      to: account2.address,
    })

    // Transfer gas to account2
    await writeContractSync(client, {
      abi: Abis.tip20,
      address: addresses.alphaUsd,
      functionName: 'transfer',
      args: [account2.address, parseUnits('1', 6)],
    })

    await actions.token.mintSync(client, {
      account: account2,
      feeToken: addresses.alphaUsd,
      token,
      to: client.account.address,
      amount: parseUnits('100', 6),
    })

    // Try to burn without issuer role - should fail
    await expect(
      actions.token.burnSync(client, {
        token,
        amount: parseUnits('10', 6),
      }),
    ).rejects.toThrow()
  })
})

describe.todo('burnBlockedToken')

describe.todo('changeTokenTransferPolicy')

describe('pause', () => {
  test('default', async () => {
    // Create a new token
    const { token } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'Pausable Token',
      symbol: 'PAUSE',
    })

    // Grant pause role
    await actions.token.grantRolesSync(client, {
      token,
      roles: ['pause'],
      to: client.account.address,
    })

    // Grant issuer role and mint tokens
    await actions.token.grantRolesSync(client, {
      token,
      roles: ['issuer'],
      to: client.account.address,
    })

    await actions.token.mintSync(client, {
      token,
      to: account2.address,
      amount: parseUnits('1000', 6),
    })

    // Verify token is not paused
    let metadata = await actions.token.getMetadata(client, {
      token,
    })
    expect(metadata.paused).toBe(false)

    // Transfer gas
    await writeContractSync(client, {
      abi: Abis.tip20,
      address: addresses.alphaUsd,
      functionName: 'transfer',
      args: [account2.address, parseUnits('1', 6)],
    })

    await actions.token.transferSync(client, {
      account: account2,
      token,
      to: account3.address,
      amount: parseUnits('100', 6),
    })

    // Pause the token
    const { receipt: pauseReceipt, ...pauseResult } =
      await actions.token.pauseSync(client, {
        token,
      })
    expect(pauseReceipt).toBeDefined()
    expect(pauseResult).toMatchInlineSnapshot(`
      {
        "isPaused": true,
        "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    // Verify token is paused
    metadata = await actions.token.getMetadata(client, {
      token,
    })
    expect(metadata.paused).toBe(true)

    // Transfers should now fail
    await expect(
      actions.token.transferSync(client, {
        account: account2,
        token,
        to: account3.address,
        amount: parseUnits('100', 6),
      }),
    ).rejects.toThrow()
  })

  test('behavior: requires pause role', async () => {
    // Create a new token
    const { token } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'Restricted Pause Token',
      symbol: 'RPAUSE',
    })

    // Try to pause without pause role - should fail
    await expect(
      actions.token.pauseSync(client, {
        token,
      }),
    ).rejects.toThrow()

    // Grant pause role to account2
    await actions.token.grantRolesSync(client, {
      token,
      roles: ['pause'],
      to: account2.address,
    })

    // Transfer gas to account2
    await writeContractSync(client, {
      abi: Abis.tip20,
      address: addresses.alphaUsd,
      functionName: 'transfer',
      args: [account2.address, parseUnits('1', 6)],
    })

    await actions.token.pauseSync(client, {
      account: account2,
      feeToken: addresses.alphaUsd,
      token,
    })

    // Verify token is paused
    const metadata = await actions.token.getMetadata(client, {
      token,
    })
    expect(metadata.paused).toBe(true)
  })

  test('behavior: cannot pause already paused token', async () => {
    // Create a new token
    const { token: address } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'Double Pause Token',
      symbol: 'DPAUSE',
    })

    // Grant pause role
    await actions.token.grantRolesSync(client, {
      token: address,
      roles: ['pause'],
      to: client.account.address,
    })

    // Pause the token
    await actions.token.pauseSync(client, {
      token: address,
    })

    // Try to pause again - implementation may vary, but typically this succeeds without error
    const { receipt: doublePauseReceipt, ...doublePauseResult } =
      await actions.token.pauseSync(client, {
        token: address,
      })
    expect(doublePauseReceipt.status).toBe('success')
    expect(doublePauseResult).toMatchInlineSnapshot(`
      {
        "isPaused": true,
        "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)
  })
})

describe('unpause', () => {
  test('default', async () => {
    // Create a new token
    const { token: address } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'Unpausable Token',
      symbol: 'UNPAUSE',
    })

    // Grant pause and unpause roles
    await actions.token.grantRolesSync(client, {
      token: address,
      roles: ['pause'],
      to: client.account.address,
    })

    await actions.token.grantRolesSync(client, {
      token: address,
      roles: ['unpause'],
      to: client.account.address,
    })

    // Grant issuer role and mint tokens
    await actions.token.grantRolesSync(client, {
      token: address,
      roles: ['issuer'],
      to: client.account.address,
    })

    await actions.token.mintSync(client, {
      token: address,
      to: account2.address,
      amount: parseUnits('1000', 6),
    })

    // First pause the token
    await actions.token.pauseSync(client, {
      token: address,
    })

    // Verify token is paused
    let metadata = await actions.token.getMetadata(client, {
      token: address,
    })
    expect(metadata.paused).toBe(true)

    // Transfer gas to account2
    await writeContractSync(client, {
      abi: Abis.tip20,
      address: addresses.alphaUsd,
      functionName: 'transfer',
      args: [account2.address, parseUnits('1', 6)],
    })

    // Verify transfers fail when paused
    await expect(
      actions.token.transferSync(client, {
        account: account2,
        token: address,
        to: account3.address,
        amount: parseUnits('100', 6),
      }),
    ).rejects.toThrow()

    // Unpause the token
    const { receipt: unpauseReceipt, ...unpauseResult } =
      await actions.token.unpauseSync(client, {
        token: address,
      })
    expect(unpauseReceipt).toBeDefined()
    expect(unpauseResult).toMatchInlineSnapshot(`
      {
        "isPaused": false,
        "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    // Verify token is unpaused
    metadata = await actions.token.getMetadata(client, {
      token: address,
    })
    expect(metadata.paused).toBe(false)

    // Transfers should work again
    await actions.token.transferSync(client, {
      account: account2,
      token: address,
      to: account3.address,
      amount: parseUnits('100', 6),
    })

    const balance = await actions.token.getBalance(client, {
      token: address,
      account: account3.address,
    })
    expect(balance).toBe(parseUnits('100', 6))
  })

  test('behavior: requires unpause role', async () => {
    // Create a new token
    const { token: address } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'Restricted Unpause Token',
      symbol: 'RUNPAUSE',
    })

    // Grant pause role and pause the token
    await actions.token.grantRolesSync(client, {
      token: address,
      roles: ['pause'],
      to: client.account.address,
    })

    await actions.token.pauseSync(client, {
      token: address,
    })

    // Try to unpause without unpause role - should fail
    await expect(
      actions.token.unpauseSync(client, {
        token: address,
      }),
    ).rejects.toThrow()

    // Grant unpause role to account2
    await actions.token.grantRolesSync(client, {
      token: address,
      roles: ['unpause'],
      to: account2.address,
    })

    // Transfer gas to account2
    await writeContractSync(client, {
      abi: Abis.tip20,
      address: addresses.alphaUsd,
      functionName: 'transfer',
      args: [account2.address, parseUnits('1', 6)],
    })

    // Now account2 should be able to unpause
    await actions.token.unpauseSync(client, {
      account: account2,
      feeToken: addresses.alphaUsd,
      token: address,
    })

    // Verify token is unpaused
    const metadata = await actions.token.getMetadata(client, {
      token: address,
    })
    expect(metadata.paused).toBe(false)
  })

  test('behavior: different roles for pause and unpause', async () => {
    // Create a new token
    const { token: address } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'Split Role Token',
      symbol: 'SPLIT',
    })

    // Grant pause role to account2
    await actions.token.grantRolesSync(client, {
      token: address,
      roles: ['pause'],
      to: account2.address,
    })

    // Grant unpause role to account3
    await actions.token.grantRolesSync(client, {
      token: address,
      roles: ['unpause'],
      to: account3.address,
    })

    // Transfer gas to both accounts
    await writeContractSync(client, {
      abi: Abis.tip20,
      address: addresses.alphaUsd,
      functionName: 'transfer',
      args: [account2.address, parseUnits('1', 6)],
    })

    await writeContractSync(client, {
      abi: Abis.tip20,
      address: addresses.alphaUsd,
      functionName: 'transfer',
      args: [account3.address, parseUnits('1', 6)],
    })

    // Account2 can pause
    await actions.token.pauseSync(client, {
      account: account2,
      feeToken: addresses.alphaUsd,
      token: address,
    })

    // Account2 cannot unpause
    await expect(
      actions.token.unpauseSync(client, {
        account: account2,
        token: address,
      }),
    ).rejects.toThrow()

    // Account3 can unpause
    await actions.token.unpauseSync(client, {
      account: account3,
      feeToken: addresses.alphaUsd,
      token: address,
    })

    // Verify token is unpaused
    const metadata = await actions.token.getMetadata(client, {
      token: address,
    })
    expect(metadata.paused).toBe(false)
  })
})

describe('prepareUpdateQuoteToken', () => {
  test('default', async () => {
    // Create two tokens - one to be the new quote token
    const { token: quoteTokenAddress } = await actions.token.createSync(
      client,
      {
        currency: 'USD',
        name: 'Quote Token',
        symbol: 'LINK',
      },
    )

    const { token: address } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'Main Token',
      symbol: 'MAIN',
    })

    // Update quote token
    const {
      receipt: updateReceipt,
      nextQuoteToken,
      ...updateResult
    } = await actions.token.prepareUpdateQuoteTokenSync(client, {
      token: address,
      quoteToken: quoteTokenAddress,
    })

    expect(updateReceipt).toBeDefined()
    expect(updateResult).toMatchInlineSnapshot(`
      {
        "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    // Verify the event was emitted with correct quote token
    expect(nextQuoteToken).toBe(quoteTokenAddress)
  })

  test('behavior: requires admin role', async () => {
    // Create quote token
    const { token: quoteTokenAddress } = await actions.token.createSync(
      client,
      {
        currency: 'USD',
        name: 'Quote Token 2',
        symbol: 'LINK2',
      },
    )

    // Create main token where client.account is admin
    const { token: address } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'Restricted Token',
      symbol: 'RESTR',
    })

    // Transfer gas to account2
    await writeContractSync(client, {
      abi: Abis.tip20,
      address: addresses.alphaUsd,
      functionName: 'transfer',
      args: [account2.address, parseUnits('1', 6)],
    })

    // Try to update quote token from account2 (not admin) - should fail
    await expect(
      actions.token.prepareUpdateQuoteTokenSync(client, {
        account: account2,
        token: address,
        quoteToken: quoteTokenAddress,
      }),
    ).rejects.toThrow()
  })

  test('behavior: with token ID', async () => {
    // Create quote token
    const { token: quoteTokenAddress } = await actions.token.createSync(
      client,
      {
        currency: 'USD',
        name: 'Quote Token 3',
        symbol: 'LINK3',
      },
    )

    // Create main token using token ID
    const { tokenId: mainTokenId } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'Main Token ID',
      symbol: 'MAINID',
    })

    // Update quote token using token ID for main token, address for quote token
    const {
      receipt: updateReceipt,
      nextQuoteToken,
      ...updateResult
    } = await actions.token.prepareUpdateQuoteTokenSync(client, {
      token: mainTokenId,
      quoteToken: quoteTokenAddress,
    })

    expect(updateResult).toMatchInlineSnapshot(`
      {
        "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)
    expect(nextQuoteToken).toBe(quoteTokenAddress)
    expect(updateReceipt.status).toBe('success')
  })
})

describe('finalizeUpdateQuoteToken', () => {
  test('default', async () => {
    // Create quote token
    const { token: quoteTokenAddress } = await actions.token.createSync(
      client,
      {
        currency: 'USD',
        name: 'Quote Token',
        symbol: 'LINK',
      },
    )

    // Create main token
    const { token: address } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'Main Token',
      symbol: 'MAIN',
    })

    // Prepare update quote token (step 1)
    await actions.token.prepareUpdateQuoteTokenSync(client, {
      token: address,
      quoteToken: quoteTokenAddress,
    })

    // Finalize the update (step 2)
    const {
      receipt: finalizeReceipt,
      newQuoteToken,
      ...finalizeResult
    } = await actions.token.updateQuoteTokenSync(client, {
      token: address,
    })

    expect(finalizeReceipt).toBeDefined()
    expect(finalizeResult).toMatchInlineSnapshot(`
      {
        "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    // Verify the quote token was updated
    expect(newQuoteToken).toBe(quoteTokenAddress)

    // Verify it's reflected in metadata
    const metadata = await actions.token.getMetadata(client, {
      token: address,
    })
    expect(metadata.quoteToken).toBe(quoteTokenAddress)
  })

  test('behavior: requires admin role', async () => {
    // Create quote token
    const { token: quoteTokenAddress } = await actions.token.createSync(
      client,
      {
        currency: 'USD',
        name: 'Quote Token 2',
        symbol: 'LINK2',
      },
    )

    // Create main token
    const { token: address } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'Restricted Token',
      symbol: 'RESTR',
    })

    // Update quote token as admin
    await actions.token.prepareUpdateQuoteTokenSync(client, {
      token: address,
      quoteToken: quoteTokenAddress,
    })

    // Transfer gas to account2
    await writeContractSync(client, {
      abi: Abis.tip20,
      address: addresses.alphaUsd,
      functionName: 'transfer',
      args: [account2.address, parseUnits('1', 6)],
    })

    // Try to finalize as non-admin - should fail
    await expect(
      actions.token.updateQuoteTokenSync(client, {
        account: account2,
        token: address,
      }),
    ).rejects.toThrow()
  })

  test('behavior: prevents circular references', async () => {
    // Create token B
    const { token: tokenBAddress } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'Token B',
      symbol: 'TKB',
    })

    // Create token A that links to token B
    const { token: tokenAAddress } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'Token A',
      symbol: 'TKA',
      quoteToken: tokenBAddress,
    })

    // Try to make token B link to token A (would create A -> B -> A loop)
    await actions.token.prepareUpdateQuoteTokenSync(client, {
      token: tokenBAddress,
      quoteToken: tokenAAddress,
    })

    // Finalize should fail due to circular reference detection
    await expect(
      actions.token.updateQuoteTokenSync(client, {
        token: tokenBAddress,
      }),
    ).rejects.toThrow()
  })
})

describe.todo('setTokenSupplyCap')

describe('hasRole', () => {
  test('default', async () => {
    // Create a new token where we're the admin
    const { token: address } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'HasRole Test Token',
      symbol: 'HRTEST',
    })

    // Client account should have defaultAdmin role on the new token
    const hasDefaultAdminRole = await actions.token.hasRole(client, {
      token: address,
      role: 'defaultAdmin',
    })
    expect(hasDefaultAdminRole).toBe(true)

    // Client account should not have issuer role initially on the new token
    const hasIssuerRole = await actions.token.hasRole(client, {
      token: address,
      role: 'issuer',
    })
    expect(hasIssuerRole).toBe(false)

    // Grant issuer role
    await actions.token.grantRolesSync(client, {
      token: address,
      roles: ['issuer'],
      to: client.account.address,
    })

    // Now should have issuer role
    const hasIssuerRoleAfterGrant = await actions.token.hasRole(client, {
      token: address,
      role: 'issuer',
    })
    expect(hasIssuerRoleAfterGrant).toBe(true)
  })

  test('behavior: check other account', async () => {
    // Create a new token
    const { token: address } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'HasRole Other Account',
      symbol: 'HROAC',
    })

    // Account2 should not have issuer role
    const hasIssuerBefore = await actions.token.hasRole(client, {
      token: address,
      account: account2.address,
      role: 'issuer',
    })
    expect(hasIssuerBefore).toBe(false)

    // Grant issuer role to account2
    await actions.token.grantRolesSync(client, {
      token: address,
      roles: ['issuer'],
      to: account2.address,
    })

    // Account2 should now have issuer role
    const hasIssuerAfter = await actions.token.hasRole(client, {
      token: address,
      account: account2.address,
      role: 'issuer',
    })
    expect(hasIssuerAfter).toBe(true)

    // Account3 should still not have issuer role
    const account3HasIssuer = await actions.token.hasRole(client, {
      token: address,
      account: account3.address,
      role: 'issuer',
    })
    expect(account3HasIssuer).toBe(false)
  })

  test('behavior: multiple roles', async () => {
    // Create a new token
    const { token: address } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'HasRole Multiple',
      symbol: 'HRMULTI',
    })

    // Grant multiple roles to account2
    await actions.token.grantRolesSync(client, {
      token: address,
      roles: ['issuer', 'pause'],
      to: account2.address,
    })

    // Check issuer role
    const hasIssuer = await actions.token.hasRole(client, {
      token: address,
      account: account2.address,
      role: 'issuer',
    })
    expect(hasIssuer).toBe(true)

    // Check pause role
    const hasPause = await actions.token.hasRole(client, {
      token: address,
      account: account2.address,
      role: 'pause',
    })
    expect(hasPause).toBe(true)

    // Check unpause role (not granted)
    const hasUnpause = await actions.token.hasRole(client, {
      token: address,
      account: account2.address,
      role: 'unpause',
    })
    expect(hasUnpause).toBe(false)
  })

  test('behavior: after revoke', async () => {
    // Create a new token
    const { token: address } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'HasRole Revoke',
      symbol: 'HRREV',
    })

    // Grant issuer role to account2
    await actions.token.grantRolesSync(client, {
      token: address,
      roles: ['issuer'],
      to: account2.address,
    })

    // Verify has role
    const hasRoleBefore = await actions.token.hasRole(client, {
      token: address,
      account: account2.address,
      role: 'issuer',
    })
    expect(hasRoleBefore).toBe(true)

    // Revoke the role
    await actions.token.revokeRolesSync(client, {
      token: address,
      roles: ['issuer'],
      from: account2.address,
    })

    // Verify no longer has role
    const hasRoleAfter = await actions.token.hasRole(client, {
      token: address,
      account: account2.address,
      role: 'issuer',
    })
    expect(hasRoleAfter).toBe(false)
  })

  test('behavior: with token ID', async () => {
    // Create a new token
    const { token: address, tokenId } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'HasRole Token ID',
      symbol: 'HRTID',
    })

    // Grant issuer role
    await actions.token.grantRolesSync(client, {
      token: tokenId,
      roles: ['issuer'],
      to: account2.address,
    })

    // Check using token ID
    const hasRole = await actions.token.hasRole(client, {
      token: tokenId,
      account: account2.address,
      role: 'issuer',
    })
    expect(hasRole).toBe(true)

    // Verify same result with address
    const hasRoleWithAddress = await actions.token.hasRole(client, {
      token: address,
      account: account2.address,
      role: 'issuer',
    })
    expect(hasRoleWithAddress).toBe(true)
  })
})

describe('getRoleAdmin', () => {
  test('default', async () => {
    // Create a new token where we're the admin
    const { token: address } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'GetRoleAdmin Test Token',
      symbol: 'GRATEST',
    })

    // Get admin role for issuer role (should be defaultAdmin)
    const issuerAdminRole = await actions.token.getRoleAdmin(client, {
      token: address,
      role: 'issuer',
    })
    expect(issuerAdminRole).toBe(
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    )

    // Get admin role for pause role (should be defaultAdmin)
    const pauseAdminRole = await actions.token.getRoleAdmin(client, {
      token: address,
      role: 'pause',
    })
    expect(pauseAdminRole).toBe(
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    )

    // Get admin role for unpause role (should be defaultAdmin)
    const unpauseAdminRole = await actions.token.getRoleAdmin(client, {
      token: address,
      role: 'unpause',
    })
    expect(unpauseAdminRole).toBe(
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    )
  })

  test('behavior: after setting role admin', async () => {
    // Create a new token
    const { token: address } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'GetRoleAdmin After Set',
      symbol: 'GRASET',
    })

    // Get initial admin role for issuer
    const initialAdminRole = await actions.token.getRoleAdmin(client, {
      token: address,
      role: 'issuer',
    })
    expect(initialAdminRole).toBe(
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    )

    // Set pause as admin role for issuer
    await actions.token.setRoleAdminSync(client, {
      token: address,
      role: 'issuer',
      adminRole: 'pause',
    })

    // Get updated admin role for issuer
    const updatedAdminRole = await actions.token.getRoleAdmin(client, {
      token: address,
      role: 'issuer',
    })
    expect(updatedAdminRole).toBe(TokenRole.serialize('pause'))
  })

  test('behavior: with token ID', async () => {
    // Create a new token
    const { token: address, tokenId } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'GetRoleAdmin Token ID',
      symbol: 'GRATID',
    })

    // Get admin role using token ID
    const adminRoleWithId = await actions.token.getRoleAdmin(client, {
      token: tokenId,
      role: 'issuer',
    })
    expect(adminRoleWithId).toBe(
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    )

    // Get admin role using address
    const adminRoleWithAddress = await actions.token.getRoleAdmin(client, {
      token: address,
      role: 'issuer',
    })
    expect(adminRoleWithAddress).toBe(adminRoleWithId)
  })

  test('behavior: defaultAdmin role admin', async () => {
    // Create a new token
    const { token: address } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'GetRoleAdmin DefaultAdmin',
      symbol: 'GRADMIN',
    })

    // Get admin role for defaultAdmin role (should be itself - 0x00)
    const defaultAdminAdminRole = await actions.token.getRoleAdmin(client, {
      token: address,
      role: 'defaultAdmin',
    })
    expect(defaultAdminAdminRole).toBe(
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    )
  })
})

describe('grantRoles', () => {
  test('default', async () => {
    // Create a new token where we're the admin
    const { token: address } = await actions.token.createSync(client, {
      admin: client.account,
      currency: 'USD',
      name: 'Test Token',
      symbol: 'TEST',
    })

    // Grant issuer role to account2
    const { receipt: grantReceipt, value: grantValue } =
      await actions.token.grantRolesSync(client, {
        token: address,
        roles: ['issuer'],
        to: account2.address,
      })

    expect(grantReceipt.status).toBe('success')
    expect(grantValue).toHaveLength(1)
    const { role, ...restGrant } = grantValue[0]!
    expect(restGrant).toMatchInlineSnapshot(`
      {
        "account": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
        "hasRole": true,
        "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)
    expect(role).toBeDefined()
  })
})

describe('revokeTokenRole', async () => {
  test('default', async () => {
    const { token: address } = await actions.token.createSync(client, {
      admin: client.account,
      currency: 'USD',
      name: 'Test Token 2',
      symbol: 'TEST2',
    })

    await actions.token.grantRolesSync(client, {
      token: address,
      roles: ['issuer'],
      to: account2.address,
    })

    const { receipt: revokeReceipt, value: revokeValue } =
      await actions.token.revokeRolesSync(client, {
        from: account2.address,
        token: address,
        roles: ['issuer'],
      })

    expect(revokeReceipt.status).toBe('success')
    expect(revokeValue).toHaveLength(1)
    const { role, ...restRevoke } = revokeValue[0]!
    expect(restRevoke).toMatchInlineSnapshot(`
      {
        "account": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
        "hasRole": false,
        "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)
    expect(role).toBeDefined()
  })
})

describe('renounceTokenRole', async () => {
  test('default', async () => {
    const { token: address } = await actions.token.createSync(client, {
      admin: client.account,
      currency: 'USD',
      name: 'Test Token 3',
      symbol: 'TEST3',
    })

    const { receipt: grantReceipt } = await actions.token.grantRolesSync(
      client,
      {
        token: address,
        roles: ['issuer'],
        to: client.account.address,
      },
    )
    expect(grantReceipt.status).toBe('success')

    const { receipt: renounceReceipt, value: renounceValue } =
      await actions.token.renounceRolesSync(client, {
        token: address,
        roles: ['issuer'],
      })

    expect(renounceReceipt.status).toBe('success')
    expect(renounceValue).toHaveLength(1)
    const { role, ...restRenounce } = renounceValue[0]!
    expect(restRenounce).toMatchInlineSnapshot(`
      {
        "account": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "hasRole": false,
        "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)
    expect(role).toBeDefined()
  })
})

describe.todo('setRoleAdmin')

describe('watchCreate', () => {
  test('default', async () => {
    const receivedTokens: Array<{
      args: actions.token.watchCreate.Args
      log: actions.token.watchCreate.Log
    }> = []

    const unwatch = actions.token.watchCreate(client, {
      onTokenCreated: (args, log) => {
        receivedTokens.push({ args, log })
      },
    })

    try {
      await actions.token.createSync(client, {
        currency: 'USD',
        name: 'Watch Test Token 1',
        symbol: 'WATCH1',
      })

      await actions.token.createSync(client, {
        currency: 'USD',
        name: 'Watch Test Token 2',
        symbol: 'WATCH2',
      })

      await setTimeout(500)

      expect(receivedTokens).toHaveLength(2)
    } finally {
      // Clean up watcher
      if (unwatch) unwatch()
    }
  })

  test('behavior: filter by tokenId', async () => {
    // First, create a token to know what ID we're at
    const { tokenId: firstId } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'Setup Token',
      symbol: 'SETUP',
    })

    // We want to watch for the token with ID = firstId + 2
    const targetTokenId = firstId + 2n

    const receivedTokens: Array<{
      args: actions.token.watchCreate.Args
      log: actions.token.watchCreate.Log
    }> = []

    // Start watching for token creation events only for targetTokenId
    const unwatch = actions.token.watchCreate(client, {
      args: {
        tokenId: targetTokenId,
      },
      onTokenCreated: (args, log) => {
        receivedTokens.push({ args, log })
      },
    })

    try {
      // Create first token (should NOT be captured - ID will be firstId + 1)
      await actions.token.createSync(client, {
        currency: 'USD',
        name: 'Filtered Watch Token 1',
        symbol: 'FWATCH1',
      })

      // Create second token (should be captured - ID will be firstId + 2 = targetTokenId)
      const { tokenId: id2 } = await actions.token.createSync(client, {
        currency: 'USD',
        name: 'Filtered Watch Token 2',
        symbol: 'FWATCH2',
      })

      // Create third token (should NOT be captured - ID will be firstId + 3)
      await actions.token.createSync(client, {
        currency: 'USD',
        name: 'Filtered Watch Token 3',
        symbol: 'FWATCH3',
      })

      await setTimeout(500)

      // Should only receive 1 event (for targetTokenId)
      expect(receivedTokens).toHaveLength(1)

      expect(receivedTokens.at(0)!.args.tokenId).toBe(targetTokenId)
      expect(receivedTokens.at(0)!.args.tokenId).toBe(id2)

      const { token, tokenId, ...rest } = receivedTokens.at(0)!.args
      expect(rest).toMatchInlineSnapshot(`
        {
          "admin": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "currency": "USD",
          "name": "Filtered Watch Token 2",
          "quoteToken": "0x20C0000000000000000000000000000000000000",
          "symbol": "FWATCH2",
        }
      `)
      expect(token).toBeDefined()
      expect(tokenId).toBe(targetTokenId)
    } finally {
      if (unwatch) unwatch()
    }
  })
})

describe('watchMint', () => {
  test('default', async () => {
    // Create a new token for testing
    const { token: address } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'Mint Watch Token',
      symbol: 'MINT',
    })

    // Grant issuer role
    await actions.token.grantRolesSync(client, {
      token: address,
      roles: ['issuer'],
      to: client.account.address,
    })

    const receivedMints: Array<{
      args: actions.token.watchMint.Args
      log: actions.token.watchMint.Log
    }> = []

    // Start watching for mint events
    const unwatch = actions.token.watchMint(client, {
      token: address,
      onMint: (args, log) => {
        receivedMints.push({ args, log })
      },
    })

    try {
      // Mint first batch
      await actions.token.mintSync(client, {
        token: address,
        to: account2.address,
        amount: parseUnits('100', 6),
      })

      // Mint second batch
      await actions.token.mintSync(client, {
        token: address,
        to: account3.address,
        amount: parseUnits('50', 6),
      })

      await setTimeout(500)

      expect(receivedMints).toHaveLength(2)

      expect(receivedMints.at(0)!.args).toMatchInlineSnapshot(`
        {
          "amount": 100000000n,
          "to": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
        }
      `)
      expect(receivedMints.at(1)!.args).toMatchInlineSnapshot(`
        {
          "amount": 50000000n,
          "to": "0x98e503f35D0a019cB0a251aD243a4cCFCF371F46",
        }
      `)
    } finally {
      if (unwatch) unwatch()
    }
  })

  test('behavior: filter by to address', async () => {
    // Create a new token for testing
    const { token: address } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'Filtered Mint Token',
      symbol: 'FMINT',
    })

    // Grant issuer role
    await actions.token.grantRolesSync(client, {
      token: address,
      roles: ['issuer'],
      to: client.account.address,
    })

    const receivedMints: Array<{
      args: actions.token.watchMint.Args
      log: actions.token.watchMint.Log
    }> = []

    // Start watching for mint events only to account2
    const unwatch = actions.token.watchMint(client, {
      token: address,
      args: {
        to: account2.address,
      },
      onMint: (args, log) => {
        receivedMints.push({ args, log })
      },
    })

    try {
      // Mint to account2 (should be captured)
      await actions.token.mintSync(client, {
        token: address,
        to: account2.address,
        amount: parseUnits('100', 6),
      })

      // Mint to account3 (should NOT be captured)
      await actions.token.mintSync(client, {
        token: address,
        to: account3.address,
        amount: parseUnits('50', 6),
      })

      // Mint to account2 again (should be captured)
      await actions.token.mintSync(client, {
        token: address,
        to: account2.address,
        amount: parseUnits('75', 6),
      })

      await setTimeout(500)

      // Should only receive 2 events (for account2)
      expect(receivedMints).toHaveLength(2)

      expect(receivedMints.at(0)!.args).toMatchInlineSnapshot(`
        {
          "amount": 100000000n,
          "to": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
        }
      `)
      expect(receivedMints.at(1)!.args).toMatchInlineSnapshot(`
        {
          "amount": 75000000n,
          "to": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
        }
      `)

      // Verify all received mints are to account2
      for (const mint of receivedMints) {
        expect(mint.args.to).toBe(account2.address)
      }
    } finally {
      if (unwatch) unwatch()
    }
  })
})

describe('watchApprove', () => {
  test('default', async () => {
    // Create a new token for testing
    const { token: address } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'Approval Watch Token',
      symbol: 'APPR',
    })

    const receivedApprovals: Array<{
      args: actions.token.watchApprove.Args
      log: actions.token.watchApprove.Log
    }> = []

    // Start watching for approval events
    const unwatch = actions.token.watchApprove(client, {
      token: address,
      onApproval: (args, log) => {
        receivedApprovals.push({ args, log })
      },
    })

    try {
      // Approve account2
      await actions.token.approveSync(client, {
        token: address,
        spender: account2.address,
        amount: parseUnits('100', 6),
      })

      // Approve account3
      await actions.token.approveSync(client, {
        token: address,
        spender: account3.address,
        amount: parseUnits('50', 6),
      })

      await setTimeout(500)

      expect(receivedApprovals).toHaveLength(2)

      expect(receivedApprovals.at(0)!.args).toMatchInlineSnapshot(`
        {
          "amount": 100000000n,
          "owner": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "spender": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
        }
      `)
      expect(receivedApprovals.at(1)!.args).toMatchInlineSnapshot(`
        {
          "amount": 50000000n,
          "owner": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "spender": "0x98e503f35D0a019cB0a251aD243a4cCFCF371F46",
        }
      `)
    } finally {
      if (unwatch) unwatch()
    }
  })

  test('behavior: filter by spender address', async () => {
    // Create a new token for testing
    const { token: address } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'Filtered Approval Token',
      symbol: 'FAPPR',
    })

    const receivedApprovals: Array<{
      args: actions.token.watchApprove.Args
      log: actions.token.watchApprove.Log
    }> = []

    // Start watching for approval events only to account2
    const unwatch = actions.token.watchApprove(client, {
      token: address,
      args: {
        spender: account2.address,
      },
      onApproval: (args, log) => {
        receivedApprovals.push({ args, log })
      },
    })

    try {
      // Approve account2 (should be captured)
      await actions.token.approveSync(client, {
        token: address,
        spender: account2.address,
        amount: parseUnits('100', 6),
      })

      // Approve account3 (should NOT be captured)
      await actions.token.approveSync(client, {
        token: address,
        spender: account3.address,
        amount: parseUnits('50', 6),
      })

      // Approve account2 again (should be captured)
      await actions.token.approveSync(client, {
        token: address,
        spender: account2.address,
        amount: parseUnits('75', 6),
      })

      await setTimeout(500)

      // Should only receive 2 events (for account2)
      expect(receivedApprovals).toHaveLength(2)

      expect(receivedApprovals.at(0)!.args).toMatchInlineSnapshot(`
        {
          "amount": 100000000n,
          "owner": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "spender": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
        }
      `)
      expect(receivedApprovals.at(1)!.args).toMatchInlineSnapshot(`
        {
          "amount": 75000000n,
          "owner": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "spender": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
        }
      `)

      // Verify all received approvals are for account2
      for (const approval of receivedApprovals) {
        expect(approval.args.spender).toBe(account2.address)
      }
    } finally {
      if (unwatch) unwatch()
    }
  })
})

describe('watchBurn', () => {
  test('default', async () => {
    // Create a new token for testing
    const { token: address } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'Burn Watch Token',
      symbol: 'BURN',
    })

    // Grant issuer role to mint/burn tokens
    await actions.token.grantRolesSync(client, {
      token: address,
      roles: ['issuer'],
      to: client.account.address,
    })

    // Grant issuer role to mint/burn tokens
    await actions.token.grantRolesSync(client, {
      token: address,
      roles: ['issuer'],
      to: account2.address,
    })

    // Mint tokens to burn later
    await actions.token.mintSync(client, {
      token: address,
      to: client.account.address,
      amount: parseUnits('200', 6),
    })

    await actions.token.mintSync(client, {
      token: address,
      to: account2.address,
      amount: parseUnits('100', 6),
    })

    const receivedBurns: Array<{
      args: actions.token.watchBurn.Args
      log: actions.token.watchBurn.Log
    }> = []

    // Start watching for burn events
    const unwatch = actions.token.watchBurn(client, {
      token: address,
      onBurn: (args, log) => {
        receivedBurns.push({ args, log })
      },
    })

    try {
      // Burn first batch
      await actions.token.burnSync(client, {
        token: address,
        amount: parseUnits('50', 6),
      })

      // Transfer gas to account2
      await writeContractSync(client, {
        abi: Abis.tip20,
        address: addresses.alphaUsd,
        functionName: 'transfer',
        args: [account2.address, parseUnits('1', 6)],
      })

      // Burn second batch from account2
      await actions.token.burnSync(client, {
        account: account2,
        token: address,
        amount: parseUnits('25', 6),
      })

      await setTimeout(500)

      expect(receivedBurns).toHaveLength(2)

      expect(receivedBurns.at(0)!.args).toMatchInlineSnapshot(`
        {
          "amount": 50000000n,
          "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        }
      `)
      expect(receivedBurns.at(1)!.args).toMatchInlineSnapshot(`
        {
          "amount": 25000000n,
          "from": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
        }
      `)
    } finally {
      if (unwatch) unwatch()
    }
  })

  test('behavior: filter by from address', async () => {
    // Create a new token for testing
    const { token: address } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'Filtered Burn Token',
      symbol: 'FBURN',
    })

    // Grant issuer role
    await actions.token.grantRolesSync(client, {
      token: address,
      roles: ['issuer'],
      to: client.account.address,
    })

    // Grant issuer role
    await actions.token.grantRolesSync(client, {
      token: address,
      roles: ['issuer'],
      to: account2.address,
    })

    // Mint tokens to multiple accounts
    await actions.token.mintSync(client, {
      token: address,
      to: client.account.address,
      amount: parseUnits('200', 6),
    })

    await actions.token.mintSync(client, {
      token: address,
      to: account2.address,
      amount: parseUnits('200', 6),
    })

    const receivedBurns: Array<{
      args: actions.token.watchBurn.Args
      log: actions.token.watchBurn.Log
    }> = []

    // Start watching for burn events only from client.account
    const unwatch = actions.token.watchBurn(client, {
      token: address,
      args: {
        from: client.account.address,
      },
      onBurn: (args, log) => {
        receivedBurns.push({ args, log })
      },
    })

    try {
      // Burn from client.account (should be captured)
      await actions.token.burnSync(client, {
        token: address,
        amount: parseUnits('50', 6),
      })

      // Transfer gas to account2
      await writeContractSync(client, {
        abi: Abis.tip20,
        address: addresses.alphaUsd,
        functionName: 'transfer',
        args: [account2.address, parseUnits('1', 6)],
      })

      // Burn from account2 (should NOT be captured)
      await actions.token.burnSync(client, {
        account: account2,
        token: address,
        amount: parseUnits('25', 6),
      })

      // Burn from client.account again (should be captured)
      await actions.token.burnSync(client, {
        token: address,
        amount: parseUnits('75', 6),
      })

      await setTimeout(500)

      // Should only receive 2 events (from client.account)
      expect(receivedBurns).toHaveLength(2)

      expect(receivedBurns.at(0)!.args).toMatchInlineSnapshot(`
        {
          "amount": 50000000n,
          "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        }
      `)
      expect(receivedBurns.at(1)!.args).toMatchInlineSnapshot(`
        {
          "amount": 75000000n,
          "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        }
      `)

      // Verify all received burns are from client.account
      for (const burn of receivedBurns) {
        expect(burn.args.from).toBe(client.account.address)
      }
    } finally {
      if (unwatch) unwatch()
    }
  })
})

describe('watchAdminRole', () => {
  test('default', async () => {
    // Create a new token for testing
    const { token: address } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'Admin Role Watch Token',
      symbol: 'ADMIN',
    })

    const receivedAdminUpdates: Array<{
      args: actions.token.watchAdminRole.Args
      log: actions.token.watchAdminRole.Log
    }> = []

    // Start watching for role admin updates
    const unwatch = actions.token.watchAdminRole(client, {
      token: address,
      onRoleAdminUpdated: (args, log) => {
        receivedAdminUpdates.push({ args, log })
      },
    })

    try {
      // Set role admin for issuer role
      const {
        receipt: setRoleAdmin1Receipt,
        role,
        newAdminRole,
        ...setRoleAdmin1Result
      } = await actions.token.setRoleAdminSync(client, {
        token: address,
        role: 'issuer',
        adminRole: 'pause',
      })
      expect(setRoleAdmin1Receipt).toBeDefined()
      expect(setRoleAdmin1Result).toMatchInlineSnapshot(`
        {
          "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        }
      `)
      expect(role).toBeDefined()
      expect(newAdminRole).toBeDefined()

      // Set role admin for pause role
      await actions.token.setRoleAdminSync(client, {
        token: address,
        role: 'pause',
        adminRole: 'unpause',
      })

      await setTimeout(500)

      expect(receivedAdminUpdates).toHaveLength(2)

      expect(receivedAdminUpdates.at(0)!.args.sender).toBe(
        client.account.address,
      )
      expect(receivedAdminUpdates.at(1)!.args.sender).toBe(
        client.account.address,
      )
    } finally {
      if (unwatch) unwatch()
    }
  })
})

describe('watchRole', () => {
  test('default', async () => {
    // Create a new token for testing
    const { token: address } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'Role Watch Token',
      symbol: 'ROLE',
    })

    const receivedRoleUpdates: Array<{
      args: actions.token.watchRole.Args
      log: actions.token.watchRole.Log
    }> = []

    // Start watching for role membership updates
    const unwatch = actions.token.watchRole(client, {
      token: address,
      onRoleUpdated: (args, log) => {
        receivedRoleUpdates.push({ args, log })
      },
    })

    try {
      // Grant issuer role to account2
      await actions.token.grantRolesSync(client, {
        token: address,
        roles: ['issuer'],
        to: account2.address,
      })

      // Grant pause role to account3
      await actions.token.grantRolesSync(client, {
        token: address,
        roles: ['pause'],
        to: account3.address,
      })

      // Revoke issuer role from account2
      await actions.token.revokeRolesSync(client, {
        token: address,
        roles: ['issuer'],
        from: account2.address,
      })

      await setTimeout(500)

      expect(receivedRoleUpdates).toHaveLength(3)

      // First event: grant issuer
      expect(receivedRoleUpdates.at(0)!.args.type).toBe('granted')
      expect(receivedRoleUpdates.at(0)!.args.account).toBe(account2.address)
      expect(receivedRoleUpdates.at(0)!.args.hasRole).toBe(true)

      // Second event: grant pause
      expect(receivedRoleUpdates.at(1)!.args.type).toBe('granted')
      expect(receivedRoleUpdates.at(1)!.args.account).toBe(account3.address)
      expect(receivedRoleUpdates.at(1)!.args.hasRole).toBe(true)

      // Third event: revoke issuer
      expect(receivedRoleUpdates.at(2)!.args.type).toBe('revoked')
      expect(receivedRoleUpdates.at(2)!.args.account).toBe(account2.address)
      expect(receivedRoleUpdates.at(2)!.args.hasRole).toBe(false)
    } finally {
      if (unwatch) unwatch()
    }
  })

  test('behavior: filter by account address', async () => {
    // Create a new token for testing
    const { token: address } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'Filtered Role Token',
      symbol: 'FROLE',
    })

    const receivedRoleUpdates: Array<{
      args: actions.token.watchRole.Args
      log: actions.token.watchRole.Log
    }> = []

    // Start watching for role updates only for account2
    const unwatch = actions.token.watchRole(client, {
      token: address,
      args: {
        account: account2.address,
      },
      onRoleUpdated: (args, log) => {
        receivedRoleUpdates.push({ args, log })
      },
    })

    try {
      // Grant issuer role to account2 (should be captured)
      await actions.token.grantRolesSync(client, {
        token: address,
        roles: ['issuer'],
        to: account2.address,
      })

      // Grant pause role to account3 (should NOT be captured)
      await actions.token.grantRolesSync(client, {
        token: address,
        roles: ['pause'],
        to: account3.address,
      })

      // Revoke issuer role from account2 (should be captured)
      await actions.token.revokeRolesSync(client, {
        token: address,
        roles: ['issuer'],
        from: account2.address,
      })

      await setTimeout(500)

      // Should only receive 2 events (for account2)
      expect(receivedRoleUpdates).toHaveLength(2)

      // First: grant to account2
      expect(receivedRoleUpdates.at(0)!.args.type).toBe('granted')
      expect(receivedRoleUpdates.at(0)!.args.account).toBe(account2.address)
      expect(receivedRoleUpdates.at(0)!.args.hasRole).toBe(true)

      // Second: revoke from account2
      expect(receivedRoleUpdates.at(1)!.args.type).toBe('revoked')
      expect(receivedRoleUpdates.at(1)!.args.account).toBe(account2.address)
      expect(receivedRoleUpdates.at(1)!.args.hasRole).toBe(false)

      // Verify all received events are for account2
      for (const update of receivedRoleUpdates) {
        expect(update.args.account).toBe(account2.address)
      }
    } finally {
      if (unwatch) unwatch()
    }
  })
})

describe('watchTransfer', () => {
  beforeAll(async () => {
    await fetch(`${rpcUrl}/restart`)
  })

  test('default', async () => {
    // Create a new token for testing
    const { token: address } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'Transfer Watch Token',
      symbol: 'XFER',
    })

    // Grant issuer role to mint tokens
    await actions.token.grantRolesSync(client, {
      token: address,
      roles: ['issuer'],
      to: client.account.address,
    })

    // Mint tokens to transfer
    await actions.token.mintSync(client, {
      token: address,
      to: client.account.address,
      amount: parseUnits('500', 6),
    })

    const receivedTransfers: Array<{
      args: actions.token.watchTransfer.Args
      log: actions.token.watchTransfer.Log
    }> = []

    // Start watching for transfer events
    const unwatch = actions.token.watchTransfer(client, {
      token: address,
      onTransfer: (args, log) => {
        receivedTransfers.push({ args, log })
      },
    })

    try {
      // Transfer to account2
      await actions.token.transferSync(client, {
        token: address,
        to: account2.address,
        amount: parseUnits('100', 6),
      })

      // Transfer to account3
      await actions.token.transferSync(client, {
        token: address,
        to: account3.address,
        amount: parseUnits('50', 6),
      })

      await setTimeout(200)

      expect(receivedTransfers.length).toBeGreaterThanOrEqual(2)

      expect(receivedTransfers.at(0)!.args).toMatchInlineSnapshot(`
        {
          "amount": 100000000n,
          "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "to": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
        }
      `)
      expect(receivedTransfers.at(1)!.args).toMatchInlineSnapshot(`
        {
          "amount": 50000000n,
          "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "to": "0x98e503f35D0a019cB0a251aD243a4cCFCF371F46",
        }
      `)
    } finally {
      if (unwatch) unwatch()
    }
  })

  test('behavior: filter by to address', async () => {
    // Create a new token for testing
    const { token: address } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'Filtered Transfer Token',
      symbol: 'FXFER',
    })

    // Grant issuer role
    await actions.token.grantRolesSync(client, {
      token: address,
      roles: ['issuer'],
      to: client.account.address,
    })

    // Mint tokens
    await actions.token.mintSync(client, {
      token: address,
      to: client.account.address,
      amount: parseUnits('500', 6),
    })

    const receivedTransfers: Array<{
      args: actions.token.watchTransfer.Args
      log: actions.token.watchTransfer.Log
    }> = []

    // Start watching for transfer events only to account2
    const unwatch = actions.token.watchTransfer(client, {
      token: address,
      args: {
        to: account2.address,
      },
      onTransfer: (args, log) => {
        receivedTransfers.push({ args, log })
      },
    })

    try {
      // Transfer to account2 (should be captured)
      await actions.token.transferSync(client, {
        token: address,
        to: account2.address,
        amount: parseUnits('100', 6),
      })

      // Transfer to account3 (should NOT be captured)
      await actions.token.transferSync(client, {
        token: address,
        to: account3.address,
        amount: parseUnits('50', 6),
      })

      // Transfer to account2 again (should be captured)
      await actions.token.transferSync(client, {
        token: address,
        to: account2.address,
        amount: parseUnits('75', 6),
      })

      await setTimeout(500)

      // Should only receive 2 events (to account2)
      expect(receivedTransfers).toHaveLength(2)

      expect(receivedTransfers.at(0)!.args).toMatchInlineSnapshot(`
        {
          "amount": 100000000n,
          "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "to": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
        }
      `)
      expect(receivedTransfers.at(1)!.args).toMatchInlineSnapshot(`
        {
          "amount": 75000000n,
          "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "to": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
        }
      `)

      // Verify all received transfers are to account2
      for (const transfer of receivedTransfers) {
        expect(transfer.args.to).toBe(account2.address)
      }
    } finally {
      if (unwatch) unwatch()
    }
  })
})

describe('watchUpdateQuoteToken', () => {
  test('default', async () => {
    // Create quote token
    const { token: quoteTokenAddress } = await actions.token.createSync(
      client,
      {
        currency: 'USD',
        name: 'Watch Quote Token',
        symbol: 'WLINK',
      },
    )

    // Create main token
    const { token: address } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'Watch Main Token',
      symbol: 'WMAIN',
    })

    const receivedUpdates: Array<{
      args: actions.token.watchUpdateQuoteToken.Args
      log: actions.token.watchUpdateQuoteToken.Log
    }> = []

    // Start watching for quote token update events
    const unwatch = actions.token.watchUpdateQuoteToken(client, {
      token: address,
      onUpdateQuoteToken: (args, log) => {
        receivedUpdates.push({ args, log })
      },
    })

    try {
      // Step 1: Prepare update quote token (should emit NextQuoteTokenSet)
      await actions.token.prepareUpdateQuoteTokenSync(client, {
        token: address,
        quoteToken: quoteTokenAddress,
      })

      // Step 2: Finalize the update (should emit QuoteTokenUpdateFinalized)
      await actions.token.updateQuoteTokenSync(client, {
        token: address,
      })

      await setTimeout(500)

      // Should receive 2 events: one for update, one for finalized
      expect(receivedUpdates).toHaveLength(2)

      // First event: update proposed (not finalized)
      expect(receivedUpdates.at(0)!.args.completed).toBe(false)
      expect(receivedUpdates.at(0)!.args.nextQuoteToken).toBe(quoteTokenAddress)
      expect(receivedUpdates.at(0)!.args.updater).toBe(client.account.address)

      // Second event: update finalized
      expect(receivedUpdates.at(1)!.args.completed).toBe(true)
      expect(receivedUpdates.at(1)!.args.newQuoteToken).toBe(quoteTokenAddress)
      expect(receivedUpdates.at(1)!.args.updater).toBe(client.account.address)
    } finally {
      if (unwatch) unwatch()
    }
  })

  test('behavior: only proposed updates', async () => {
    // Create quote token
    const { token: quoteTokenAddress } = await actions.token.createSync(
      client,
      {
        currency: 'USD',
        name: 'Proposed Quote Token',
        symbol: 'PLINK',
      },
    )

    // Create main token
    const { token: address } = await actions.token.createSync(client, {
      currency: 'USD',
      name: 'Proposed Main Token',
      symbol: 'PMAIN',
    })

    const receivedUpdates: Array<{
      args: actions.token.watchUpdateQuoteToken.Args
      log: actions.token.watchUpdateQuoteToken.Log
    }> = []

    // Start watching
    const unwatch = actions.token.watchUpdateQuoteToken(client, {
      token: address,
      onUpdateQuoteToken: (args, log) => {
        receivedUpdates.push({ args, log })
      },
    })

    try {
      // Only update (don't finalize)
      await actions.token.prepareUpdateQuoteTokenSync(client, {
        token: address,
        quoteToken: quoteTokenAddress,
      })

      await setTimeout(500)

      // Should only receive 1 event (not finalized)
      expect(receivedUpdates).toHaveLength(1)
      expect(receivedUpdates.at(0)!.args.completed).toBe(false)
      expect(receivedUpdates.at(0)!.args.nextQuoteToken).toBe(quoteTokenAddress)
    } finally {
      if (unwatch) unwatch()
    }
  })
})
