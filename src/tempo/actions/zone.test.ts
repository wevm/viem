import * as PublicKey from 'ox/PublicKey'
import * as Secp256k1 from 'ox/Secp256k1'
import { type Address, createClient, encodeFunctionData, zeroHash } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { parseUnits } from 'viem/utils'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { accounts } from '~test/constants.js'
import { chain, http } from '~test/tempo/config.js'
import {
  getClient as getZoneClient,
  portalAddress,
  zoneId,
} from '~test/tempo/zones.js'
import * as sendTransactionAction from '../../actions/wallet/sendTransaction.js'
import * as Storage from '../Storage.js'
import * as tokenActions from './token.js'
import * as zoneActions from './zone.js'

const account = privateKeyToAccount(accounts[0].privateKey)
const mainnetClient = createClient({
  account,
  chain,
  pollingInterval: 100,
  transport: http(),
})
const zoneClient = getZoneClient({ account })
const parentToken = '0x20c0000000000000000000000000000000000000'
const preparedEncryptedDeposit = {
  amount: parseUnits('1', 6),
  bouncebackRecipient: account.address,
  chainId: chain.id,
  encrypted: {
    ciphertext: '0x1234',
    ephemeralPubkeyX:
      '0x0000000000000000000000000000000000000000000000000000000000000001',
    ephemeralPubkeyYParity: 0,
    nonce: '0x000000000000000000000000',
    tag: '0x00000000000000000000000000000000',
  },
  keyIndex: 0n,
  portalAddress,
  token: '0x20c0000000000000000000000000000000000000',
  zoneId,
} satisfies zoneActions.PreparedEncryptedDeposit

async function ensureZoneBalance(zoneToken: Address, minimumBalance: bigint) {
  const balance = await tokenActions.getBalance(zoneClient, {
    account: account.address,
    token: zoneToken,
  })
  if (balance.amount >= minimumBalance) return

  await zoneActions.depositSync(mainnetClient, {
    amount: parseUnits('1', 6),
    portalAddress,
    token: parentToken,
    zoneId,
  })

  await vi.waitFor(
    async () => {
      const nextBalance = await tokenActions.getBalance(zoneClient, {
        account: account.address,
        token: zoneToken,
      })
      expect(nextBalance.amount).toBeGreaterThanOrEqual(minimumBalance)
    },
    { interval: 100, timeout: 15_000 },
  )
}

afterEach(() => vi.restoreAllMocks())

describe('signAuthorizationToken', () => {
  test('behavior: signs and stores token', async () => {
    const result = await zoneActions.signAuthorizationToken(zoneClient, {
      zoneId,
    })

    expect(result.authentication).toBeDefined()
    expect(result.token).toBeDefined()
    expect(typeof result.token).toBe('string')
    expect(result.token.length).toBeGreaterThan(0)

    const blockNumber = await zoneClient.request({ method: 'eth_blockNumber' })
    expect(BigInt(blockNumber)).toBeGreaterThanOrEqual(0n)
  })

  test('behavior: custom issuedAt/expiresAt/storage', async () => {
    const storage = Storage.memory()
    const issuedAt = Math.floor(Date.now() / 1000) - 100
    const expiresAt = issuedAt + 300

    const result = await zoneActions.signAuthorizationToken(zoneClient, {
      issuedAt,
      expiresAt,
      storage,
      zoneId,
    })

    expect(result.authentication).toBeDefined()
    expect(result.token).toBeDefined()

    const stored = await storage.getItem(`auth:token:${zoneClient.chain.id}`)
    expect(stored).toBe(result.token)
  })

  test('error: no chain', async () => {
    const noChainClient = createClient({
      account,
      transport: http(),
    })

    await expect(
      zoneActions.signAuthorizationToken(noChainClient),
    ).rejects.toThrow('`signAuthorizationToken` requires a chain.')
  })

  test('error: no account', async () => {
    const noAccountClient = getZoneClient({})

    await expect(
      zoneActions.signAuthorizationToken(noAccountClient),
    ).rejects.toThrow('`account` with `sign` is required.')
  })
})

describe('getZoneInfo', () => {
  test('behavior: returns zone metadata', async () => {
    await zoneActions.signAuthorizationToken(zoneClient, { zoneId })

    const info = await zoneActions.getZoneInfo(zoneClient)

    expect(info.zoneId).toBe(zoneId)
    expect(info.chainId).toBe(zoneClient.chain.id)
    expect(info.sequencer).toBeDefined()
    expect(info.zoneTokens).toBeDefined()
  })
})

describe('getAuthorizationTokenInfo', () => {
  test('behavior: returns account and expiry', async () => {
    await zoneActions.signAuthorizationToken(zoneClient, { zoneId })

    const info = await zoneActions.getAuthorizationTokenInfo(zoneClient)

    expect(info.account.toLowerCase()).toBe(account.address.toLowerCase())
    expect(info.expiresAt).toBeGreaterThan(0n)
  })
})

describe('getDepositStatus', () => {
  test('behavior: returns deposit status for block', async () => {
    await zoneActions.signAuthorizationToken(zoneClient, { zoneId })

    const status = await zoneActions.getDepositStatus(zoneClient, {
      tempoBlockNumber: 1n,
    })

    expect(typeof status.processed).toBe('boolean')
    expect(typeof status.tempoBlockNumber).toBe('bigint')
    expect(typeof status.zoneProcessedThrough).toBe('bigint')
    expect(Array.isArray(status.deposits)).toBe(true)
  })
})

describe('getWithdrawalFee', () => {
  test('behavior: returns withdrawal fee', async () => {
    await zoneActions.signAuthorizationToken(zoneClient, { zoneId })

    const fee = await zoneActions.getWithdrawalFee(zoneClient)

    expect(typeof fee).toBe('bigint')
    expect(fee).toBeGreaterThanOrEqual(0n)
  })

  test('behavior: accepts custom gas limit', async () => {
    await zoneActions.signAuthorizationToken(zoneClient, { zoneId })

    const fee = await zoneActions.getWithdrawalFee(zoneClient, {
      gas: 100_000n,
    })

    expect(typeof fee).toBe('bigint')
    expect(fee).toBeGreaterThanOrEqual(0n)
  })
})

describe('encryptedDeposit', () => {
  test('behavior: deposits tokens into zone with encrypted recipient', async () => {
    const result = await zoneActions.encryptedDepositSync(mainnetClient, {
      token: parentToken,
      amount: parseUnits('1', 6),
      portalAddress,
      zoneId,
    })

    expect(result.receipt).toBeDefined()
    expect(result.receipt.status).toBe('success')
  })

  test('error: no account', async () => {
    const noAccountClient = createClient({
      chain,
      pollingInterval: 100,
      transport: http(),
    })

    await expect(
      // @ts-expect-error
      zoneActions.encryptedDeposit(noAccountClient, {
        token: '0x20c0000000000000000000000000000000000000',
        amount: 1n,
        zoneId,
      }),
    ).rejects.toThrow('`account` is required.')
  })

  test('behavior: prepared encrypted deposit payload', async () => {
    const calls = zoneActions.encryptedDeposit.calls(preparedEncryptedDeposit)

    expect(calls[0].args).toEqual([
      preparedEncryptedDeposit.portalAddress,
      parseUnits('1', 6),
    ])
    expect(calls[1].address).toBe(preparedEncryptedDeposit.portalAddress)
    expect(calls[1].functionName).toBe('depositEncrypted')
    expect(calls[1].args).toHaveLength(5)
    expect(calls[1].args[2]).toBe(preparedEncryptedDeposit.keyIndex)
    expect(calls[1].args[3]).toEqual(preparedEncryptedDeposit.encrypted)
    expect(calls[1].args[4]).toBe(account.address)
    expect(encodeFunctionData(calls[1] as never).slice(0, 10)).toBe(
      '0xb01f22e4',
    )

    await expect(
      zoneActions.encryptedDeposit(mainnetClient, {
        ...preparedEncryptedDeposit,
        chainId: preparedEncryptedDeposit.chainId + 1,
      }),
    ).rejects.toThrow(
      'Prepared encrypted deposit chain ID does not match client chain.',
    )
  })

  test('behavior: defaults bounceback recipient to account', async () => {
    const client = createClient({ chain, transport: http() })
    const prepare = vi
      .spyOn(zoneActions.encryptedDeposit, 'prepare')
      .mockResolvedValue(preparedEncryptedDeposit)
    const sendTransaction = vi
      .spyOn(sendTransactionAction, 'sendTransaction')
      .mockResolvedValue(zeroHash)

    await zoneActions.encryptedDeposit(client, {
      account,
      amount: 1n,
      portalAddress,
      token: preparedEncryptedDeposit.token,
      zoneId,
    })

    expect(prepare).toHaveBeenCalledWith(
      client,
      expect.objectContaining({ bouncebackRecipient: account.address }),
    )
    const transaction = sendTransaction.mock.calls[0]![1] as unknown as {
      account: typeof account
      calls: ReturnType<typeof zoneActions.encryptedDeposit.calls>
    }
    expect(transaction.account).toBe(account)
    expect(transaction.calls[1].args[4]).toBe(account.address)
  })
})

describe('deposit', () => {
  test('behavior: encodes bounceback recipient', () => {
    const parameters = {
      amount: 1n,
      bouncebackRecipient: account.address,
      chainId: chain.id,
      portalAddress,
      recipient: account.address,
      token: '0x20c0000000000000000000000000000000000000',
      zoneId,
    } satisfies zoneActions.deposit.Args

    const calls = zoneActions.deposit.calls(parameters)
    expect(calls[1].args).toHaveLength(5)
    expect(calls[1].args[4]).toBe(account.address)
    expect(encodeFunctionData(calls[1] as never).slice(0, 10)).toBe(
      '0x09a0a234',
    )
  })

  test('behavior: defaults bounceback recipient to account', async () => {
    const client = createClient({ chain, transport: http() })
    const sendTransaction = vi
      .spyOn(sendTransactionAction, 'sendTransaction')
      .mockResolvedValue(zeroHash)
    const parameters = {
      amount: 1n,
      portalAddress,
      token: parentToken,
      zoneId,
    } as const

    await zoneActions.deposit(client, { ...parameters, account })
    const transaction = sendTransaction.mock.calls[0]![1] as unknown as {
      account: typeof account
      calls: ReturnType<typeof zoneActions.deposit.calls>
    }
    expect(transaction.account).toBe(account)
    expect(transaction.calls[1].args).toHaveLength(5)
    expect(transaction.calls[1].args[4]).toBe(account.address)
  })

  test('behavior: deposits tokens into zone via parent chain', async () => {
    const result = await zoneActions.depositSync(mainnetClient, {
      token: parentToken,
      amount: parseUnits('1', 6),
      portalAddress,
      zoneId,
    })

    expect(result.receipt).toBeDefined()
    expect(result.receipt.status).toBe('success')
  })

  test('error: no account', async () => {
    const noAccountClient = createClient({
      chain,
      pollingInterval: 100,
      transport: http(),
    })

    await expect(
      // @ts-expect-error
      zoneActions.deposit(noAccountClient, {
        token: '0x20c0000000000000000000000000000000000000',
        amount: 1n,
        zoneId,
      }),
    ).rejects.toThrow('`account` is required.')
  })
})

describe('requestWithdrawal', () => {
  test('behavior: encodes the 8-argument outbox requestWithdrawal call', () => {
    const [, call] = zoneActions.requestWithdrawal.calls({
      amount: 1n,
      to: account.address,
      token: '0x20c0000000000000000000000000000000000001',
    })

    expect(call.functionName).toBe('requestWithdrawal')
    expect(call.args).toHaveLength(8)
    expect(call.args[6]).toBe('0x')
    expect(call.args[7]).toBe('0x')
  })

  test('behavior: requests withdrawal from zone to parent chain', async () => {
    await zoneActions.signAuthorizationToken(zoneClient, { zoneId })

    const info = await zoneActions.getZoneInfo(zoneClient)
    const zoneToken = info.zoneTokens[0]!

    const amount = parseUnits('0.01', 6)
    await ensureZoneBalance(zoneToken, amount)

    const result = await zoneActions.requestWithdrawalSync(zoneClient, {
      token: zoneToken,
      amount,
    })

    expect(result.receipt).toBeDefined()
    expect(result.receipt.status).toBe('success')
  }, 20_000)

  test('error: no account', async () => {
    const noAccountClient = getZoneClient({})
    await zoneActions.signAuthorizationToken(noAccountClient, {
      account,
      zoneId,
    })

    await expect(
      // @ts-expect-error
      zoneActions.requestWithdrawal(noAccountClient, {
        token: '0x20c0000000000000000000000000000000000000',
        amount: 1n,
      }),
    ).rejects.toThrow('`account` is required.')
  })
})

describe('requestVerifiableWithdrawal', () => {
  test('behavior: encodes the same outbox requestWithdrawal call with revealTo', () => {
    const revealTo = '0x02abc'
    const [, call] = zoneActions.requestVerifiableWithdrawal.calls({
      amount: 1n,
      revealTo,
      to: account.address,
      token: '0x20c0000000000000000000000000000000000001',
    })

    expect(call.functionName).toBe('requestWithdrawal')
    expect(call.args).toHaveLength(8)
    expect(call.args[7]).toBe(revealTo)
  })

  test('behavior: requests verifiable withdrawal from zone', async () => {
    await zoneActions.signAuthorizationToken(zoneClient, { zoneId })

    const info = await zoneActions.getZoneInfo(zoneClient)
    const zoneToken = info.zoneTokens[0]!

    const { publicKey: revealToKey } = Secp256k1.createKeyPair()
    const compressed = PublicKey.compress(revealToKey)
    const revealTo = PublicKey.toHex(compressed)

    const amount = parseUnits('0.01', 6)
    await ensureZoneBalance(zoneToken, amount)

    const result = await zoneActions.requestVerifiableWithdrawalSync(
      zoneClient,
      {
        token: zoneToken,
        amount,
        revealTo,
      },
    )

    expect(result.receipt).toBeDefined()
    expect(result.receipt.status).toBe('success')
  }, 20_000)

  test('error: no account', async () => {
    const noAccountClient = getZoneClient({})
    await zoneActions.signAuthorizationToken(noAccountClient, {
      account,
      zoneId,
    })

    await expect(
      // @ts-expect-error
      zoneActions.requestVerifiableWithdrawal(noAccountClient, {
        token: '0x20c0000000000000000000000000000000000000',
        amount: 1n,
        revealTo: '0x02abc',
      }),
    ).rejects.toThrow('`account` is required.')
  })
})
