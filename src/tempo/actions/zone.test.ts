import { setTimeout as sleep } from 'node:timers/promises'
import * as PublicKey from 'ox/PublicKey'
import * as Secp256k1 from 'ox/Secp256k1'
import {
  type Address,
  createClient,
  decodeFunctionData,
  encodeFunctionData,
  type Hash,
  parseEventLogs,
  zeroHash,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import {
  getTransaction,
  readContract,
  waitForTransactionReceipt,
  writeContract,
} from 'viem/actions'
import { tempoModerato } from 'viem/chains'
import { parseUnits } from 'viem/utils'
import { describe, expect, test } from 'vitest'
import { accounts } from '~test/constants.js'
import { chain, http, nodeEnv } from '~test/tempo/config.js'
import { defineZone } from '~test/tempo/prool.js'
import {
  factoryAddress,
  getClient as getZoneClient,
  portalAddress,
  http as zoneHttp,
  zoneId,
} from '~test/tempo/zones.js'
import { WaitForDepositStatusTimeoutError } from '../errors.js'
import * as Storage from '../Storage.js'
import * as ZoneAbis from '../zones/Abis.js'
import { getPortalAddress } from '../zones/zone.js'
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
const depositParameters = {
  amount: parseUnits('1', 6),
  portalAddress,
  token: parentToken,
  zoneId,
} as const
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
const prepareEncryptedDepositParameters = {
  amount: parseUnits('1', 6),
  bouncebackRecipient: account.address,
  recipient: account.address,
  token: parentToken,
  zoneId: 7,
} as const

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

  for (let attempt = 0; attempt < 150; attempt++) {
    const nextBalance = await tokenActions.getBalance(zoneClient, {
      account: account.address,
      token: zoneToken,
    })
    if (nextBalance.amount >= minimumBalance) return
    await sleep(100)
  }

  throw new Error('Timed out waiting for the zone balance.')
}

async function createUnconfiguredZone() {
  if (!factoryAddress) throw new Error('ZoneFactory is unavailable.')

  const verifier = await readContract(mainnetClient, {
    address: factoryAddress,
    abi: ZoneAbis.zoneFactory,
    functionName: 'verifier',
  })
  const genesisTempoBlockNumber = BigInt(
    await mainnetClient.request({ method: 'eth_blockNumber' }),
  )
  const hash = await writeContract(mainnetClient, {
    account,
    address: factoryAddress,
    abi: ZoneAbis.zoneFactory,
    functionName: 'createZone',
    args: [
      {
        initialToken: parentToken,
        admin: account.address,
        sequencer: account.address,
        verifier,
        zoneParams: {
          genesisBlockHash: zeroHash,
          genesisTempoBlockHash: zeroHash,
          genesisTempoBlockNumber,
        },
        rpcUrl: 'http://127.0.0.1:0',
      },
    ],
    gas: 20_000_000n,
  })
  const receipt = await waitForTransactionReceipt(mainnetClient, { hash })
  const [event] = parseEventLogs({
    abi: ZoneAbis.zoneFactory,
    eventName: 'ZoneCreated',
    logs: receipt.logs,
    strict: true,
  })
  if (!event) throw new Error('ZoneCreated event is unavailable.')

  return {
    portalAddress: event.args.portal,
    zoneId: event.args.zoneId,
  }
}

async function getPortalCall(hash: Hash) {
  const transaction = await getTransaction(mainnetClient, { hash })
  const call = transaction.calls?.[1]
  if (!call?.data) throw new Error('Portal call is unavailable.')
  return decodeFunctionData({ abi: ZoneAbis.zonePortal, data: call.data })
}

describe('zone instance', () => {
  test.runIf(nodeEnv === 'localnet')(
    'behavior: provisions independent zones',
    async () => {
      if (!factoryAddress) throw new Error('ZoneFactory is unavailable.')

      const secondary = defineZone({
        factoryAddress,
        key: accounts[2].privateKey,
      })

      try {
        const [zone_, sameZone] = await Promise.all([
          secondary.start(),
          secondary.start(),
        ])

        expect(sameZone).toBe(zone_)
        expect(zone_.zoneId).not.toBe(zoneId)
        expect(zone_.chainId).not.toBe(zoneClient.chain.id)
        expect(zone_.portalAddress).not.toBe(portalAddress)

        const response = await fetch(zone_.rpcUrl, {
          body: JSON.stringify({
            id: 1,
            jsonrpc: '2.0',
            method: 'eth_chainId',
          }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        })
        const result = (await response.json()) as { result: `0x${string}` }
        expect(BigInt(result.result)).toBe(BigInt(zone_.chainId))

        await Promise.all([secondary.stop(), secondary.stop()])

        await zoneActions.signAuthorizationToken(zoneClient, { zoneId })
        const info = await zoneActions.getZoneInfo(zoneClient)
        expect(info.zoneId).toBe(zoneId)
      } finally {
        await secondary.stop()
      }
    },
    150_000,
  )
})

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

describe('waitForDepositStatus', () => {
  test('behavior: waits for deposit processing', async () => {
    await zoneActions.signAuthorizationToken(zoneClient, { zoneId })
    const { receipt } = await zoneActions.depositSync(
      mainnetClient,
      depositParameters,
    )

    const [result, concurrentResult] = await Promise.all([
      zoneActions.waitForDepositStatus(zoneClient, {
        pollingInterval: 100,
        tempoBlockNumber: receipt.blockNumber,
        timeout: 0,
      }),
      zoneActions.waitForDepositStatus(zoneClient, {
        pollingInterval: 100,
        tempoBlockNumber: receipt.blockNumber,
        timeout: 30_000,
      }),
    ])

    expect(result.processed).toBe(true)
    expect(result.tempoBlockNumber).toBe(receipt.blockNumber)
    expect(result.zoneProcessedThrough).toBeGreaterThanOrEqual(
      receipt.blockNumber,
    )
    expect(result.deposits[0]).toMatchObject({
      amount: parseUnits('1', 6),
      kind: 'regular',
      recipient: account.address.toLowerCase(),
      sender: account.address.toLowerCase(),
      status: 'processed',
    })
    expect(concurrentResult).toEqual(result)

    await expect(
      zoneActions.waitForDepositStatus(zoneClient, {
        pollingInterval: 100,
        tempoBlockNumber: receipt.blockNumber,
        timeout: 2_000,
      }),
    ).resolves.toMatchObject({
      deposits: result.deposits,
      processed: true,
      tempoBlockNumber: receipt.blockNumber,
    })
  }, 40_000)

  test('error: unprocessed block times out', async () => {
    await zoneActions.signAuthorizationToken(zoneClient, { zoneId })
    const tempoBlockNumber = BigInt(
      await mainnetClient.request({ method: 'eth_blockNumber' }),
    )

    await expect(
      zoneActions.getDepositStatus(zoneClient, { tempoBlockNumber }),
    ).resolves.toMatchObject({ processed: false, tempoBlockNumber })

    await expect(
      zoneActions.waitForDepositStatus(zoneClient, {
        pollingInterval: 10,
        tempoBlockNumber,
        timeout: 100,
      }),
    ).rejects.toBeInstanceOf(WaitForDepositStatusTimeoutError)
  })

  test('error: propagates zone RPC errors', async () => {
    const client = getZoneClient({
      transport: zoneHttp(undefined, { storage: Storage.memory() }),
    })

    await expect(
      zoneActions.waitForDepositStatus(client, {
        tempoBlockNumber: 1n,
      }),
    ).rejects.toThrow('HTTP request failed')
  })
})

describe('getWithdrawalFee', () => {
  test('behavior: returns withdrawal fee', async () => {
    await zoneActions.signAuthorizationToken(zoneClient, { zoneId })

    const fee = await zoneActions.getWithdrawalFee(zoneClient)

    expect(typeof fee).toBe('bigint')
    expect(fee).toBeGreaterThanOrEqual(0n)
  })

  test('behavior: accepts custom callback gas limit', async () => {
    await zoneActions.signAuthorizationToken(zoneClient, { zoneId })

    const fee = await zoneActions.getWithdrawalFee(zoneClient, {
      callbackGas: 100_000n,
    })

    expect(typeof fee).toBe('bigint')
    expect(fee).toBeGreaterThanOrEqual(0n)
  })
})

describe('getEncryptionKey', () => {
  test('behavior: returns the active encryption key', async () => {
    const result = await zoneActions.getEncryptionKey(mainnetClient, {
      portalAddress,
      zoneId,
    })

    expect(result.keyIndex).toBeGreaterThanOrEqual(0n)
    expect(result.publicKey.x).toMatch(/^0x[\da-f]{64}$/)
    expect([2, 3]).toContain(result.publicKey.prefix)
  })

  test('error: no chain', async () => {
    const client = createClient({ transport: http() })

    await expect(
      zoneActions.getEncryptionKey(client, { zoneId: 7 }),
    ).rejects.toThrow('`chain` is required.')
  })

  test.runIf(nodeEnv === 'localnet')(
    'error: portal without an encryption key',
    async () => {
      const unconfiguredZone = await createUnconfiguredZone()

      await expect(
        zoneActions.getEncryptionKey(mainnetClient, {
          portalAddress: unconfiguredZone.portalAddress,
          zoneId: unconfiguredZone.zoneId,
        }),
      ).rejects.toThrow('No sequencer encryption key configured.')
    },
    20_000,
  )

  test.runIf(nodeEnv === 'localnet')(
    'error: registered portal is absent from the local chain',
    async () => {
      const client = createClient({ chain: tempoModerato, transport: http() })

      await expect(
        zoneActions.getEncryptionKey(client, {
          zoneId: 7,
        }),
      ).rejects.toThrow('returned no data')
    },
  )
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

  test('error: no chain', async () => {
    const noChainClient = createClient({
      account,
      transport: http(),
    })

    await expect(
      zoneActions.encryptedDeposit(noChainClient, {
        ...depositParameters,
        chain: null,
      }),
    ).rejects.toThrow('`chain` is required.')
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

    const { portalAddress: _, ...registryParameters } = preparedEncryptedDeposit
    const registryCalls = zoneActions.encryptedDeposit.calls({
      ...registryParameters,
      chainId: tempoModerato.id,
      recipient: account.address,
      zoneId: 7,
    })
    expect(registryCalls[1].address).toBe(getPortalAddress(tempoModerato.id, 7))

    await expect(
      zoneActions.encryptedDeposit(mainnetClient, {
        ...preparedEncryptedDeposit,
        chainId: preparedEncryptedDeposit.chainId + 1,
      }),
    ).rejects.toThrow(
      'Prepared encrypted deposit chain ID does not match client chain.',
    )
  })

  test('behavior: sends a prepared encrypted deposit', async () => {
    const prepared = await zoneActions.encryptedDeposit.prepare(mainnetClient, {
      ...prepareEncryptedDepositParameters,
      portalAddress,
      zoneId,
    })

    const hash = await zoneActions.encryptedDeposit(mainnetClient, prepared)
    const receipt = await waitForTransactionReceipt(mainnetClient, { hash })

    expect(receipt.status).toBe('success')
  })

  test('behavior: prepares an encrypted recipient without a deposit', async () => {
    const prepared = await zoneActions.encryptedDeposit.prepareRecipient(
      mainnetClient,
      {
        portalAddress,
        recipient: account.address,
        zoneId,
      },
    )

    expect(prepared.chainId).toBe(chain.id)
    expect(prepared.portalAddress).toBe(portalAddress)
    expect(prepared.zoneId).toBe(zoneId)
    expect(prepared.keyIndex).toBeGreaterThanOrEqual(0n)
    expect(prepared.encrypted.ciphertext).toBeDefined()
  })

  test('error: prepare without chain', async () => {
    const noChainClient = createClient({ transport: http() })

    await expect(
      zoneActions.encryptedDeposit.prepare(
        noChainClient,
        prepareEncryptedDepositParameters,
      ),
    ).rejects.toThrow('`chain` is required.')
  })

  test('behavior: defaults bounceback recipient to account', async () => {
    const hash = await zoneActions.encryptedDeposit(
      mainnetClient,
      depositParameters,
    )
    const receipt = await waitForTransactionReceipt(mainnetClient, { hash })
    const call = await getPortalCall(hash)

    expect(receipt.status).toBe('success')
    expect(call.functionName).toBe('depositEncrypted')
    expect(call.args[4]).toBe(account.address)
  })
})

describe('encryptedDepositSync', () => {
  test('behavior: sends a prepared encrypted deposit', async () => {
    const prepared = await zoneActions.encryptedDeposit.prepare(mainnetClient, {
      ...prepareEncryptedDepositParameters,
      portalAddress,
      zoneId,
    })

    const result = await zoneActions.encryptedDepositSync(
      mainnetClient,
      prepared,
    )

    expect(result.receipt.status).toBe('success')
  })

  test('error: prepared deposit chain mismatch', async () => {
    await expect(
      zoneActions.encryptedDepositSync(mainnetClient, {
        ...preparedEncryptedDeposit,
        chainId: preparedEncryptedDeposit.chainId + 1,
      }),
    ).rejects.toThrow(
      'Prepared encrypted deposit chain ID does not match client chain.',
    )
  })

  test('error: no chain', async () => {
    const noChainClient = createClient({
      account,
      transport: http(),
    })

    await expect(
      zoneActions.encryptedDepositSync(noChainClient, {
        ...depositParameters,
        chain: null,
      }),
    ).rejects.toThrow('`chain` is required.')
  })

  test('error: no account', async () => {
    const noAccountClient = createClient({
      chain,
      transport: http(),
    })

    await expect(
      // @ts-expect-error
      zoneActions.encryptedDepositSync(noAccountClient, depositParameters),
    ).rejects.toThrow('`account` is required.')
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

    const { portalAddress: _, ...registryParameters } = parameters
    const registryCalls = zoneActions.deposit.calls({
      ...registryParameters,
      chainId: tempoModerato.id,
      zoneId: 7,
    })
    expect(registryCalls[1].address).toBe(getPortalAddress(tempoModerato.id, 7))
  })

  test('behavior: defaults bounceback recipient to account', async () => {
    const client = createClient({
      chain,
      pollingInterval: 100,
      transport: http(),
    })

    const hash = await zoneActions.deposit(client, {
      ...depositParameters,
      account,
    })
    const receipt = await waitForTransactionReceipt(client, { hash })
    const call = await getPortalCall(hash)

    expect(receipt.status).toBe('success')
    expect(call.functionName).toBe('deposit')
    expect(call.args[4]).toBe(account.address)
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

  test('error: no chain', async () => {
    const noChainClient = createClient({
      account,
      transport: http(),
    })

    await expect(
      zoneActions.deposit(noChainClient, {
        ...depositParameters,
        chain: null,
      }),
    ).rejects.toThrow('`chain` is required.')
  })
})

describe('depositSync', () => {
  test('error: no chain', async () => {
    const noChainClient = createClient({
      account,
      transport: http(),
    })

    await expect(
      zoneActions.depositSync(noChainClient, {
        ...depositParameters,
        chain: null,
      }),
    ).rejects.toThrow('`chain` is required.')
  })

  test('error: no account', async () => {
    const noAccountClient = createClient({
      chain,
      transport: http(),
    })

    await expect(
      // @ts-expect-error
      zoneActions.depositSync(noAccountClient, depositParameters),
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
    expect(call.args[4]).toBe(0n)
    expect(call.args[6]).toBe('0x')
    expect(call.args[7]).toBe('0x')
  })

  test('behavior: keeps callback gas separate from transaction gas', () => {
    const [, call] = zoneActions.requestWithdrawal.calls({
      amount: 1n,
      callbackGas: 10_000_000n,
      to: account.address,
      token: '0x20c0000000000000000000000000000000000001',
    })

    expect(call.args[4]).toBe(10_000_000n)
  })

  test('behavior: prepares a withdrawal without broadcasting', async () => {
    await zoneActions.signAuthorizationToken(zoneClient, { zoneId })
    const info = await zoneActions.getZoneInfo(zoneClient)
    const zoneToken = info.zoneTokens[0]!

    const prepared = await zoneActions.requestWithdrawal.prepare(zoneClient, {
      amount: 1n,
      callbackGas: 100_000n,
      token: zoneToken,
    })

    expect(prepared.calls).toHaveLength(2)
    expect(prepared.callbackGas).toBe(100_000n)
    expect(prepared.totalFee).toBe(prepared.withdrawalFee)
  })

  test('behavior: requests withdrawal without waiting', async () => {
    await zoneActions.signAuthorizationToken(zoneClient, { zoneId })
    const info = await zoneActions.getZoneInfo(zoneClient)
    const zoneToken = info.zoneTokens[0]!
    const amount = parseUnits('0.01', 6)
    await ensureZoneBalance(zoneToken, amount * 2n)

    const hash = await zoneActions.requestWithdrawal(zoneClient, {
      amount,
      token: zoneToken,
    })
    const receipt = await waitForTransactionReceipt(zoneClient, {
      hash,
    })

    expect(receipt.status).toBe('success')
  }, 20_000)

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

    await expect(
      // @ts-expect-error
      zoneActions.requestWithdrawalSync(noAccountClient, {
        token: parentToken,
        amount: 1n,
      }),
    ).rejects.toThrow('`account` is required.')
  })

  test('error: account without address', async () => {
    const parameters = {
      account: {} as never,
      amount: 1n,
      token: parentToken,
    } as const

    await expect(
      zoneActions.requestWithdrawal(zoneClient, parameters),
    ).rejects.toThrow('`to` is required.')
    await expect(
      zoneActions.requestWithdrawalSync(zoneClient, parameters),
    ).rejects.toThrow('`to` is required.')
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

  test('behavior: requests verifiable withdrawal without waiting', async () => {
    await zoneActions.signAuthorizationToken(zoneClient, { zoneId })
    const info = await zoneActions.getZoneInfo(zoneClient)
    const zoneToken = info.zoneTokens[0]!
    const amount = parseUnits('0.01', 6)
    await ensureZoneBalance(zoneToken, amount * 2n)
    const { publicKey } = Secp256k1.createKeyPair()
    const revealTo = PublicKey.toHex(PublicKey.compress(publicKey))
    const parameters = {
      amount,
      revealTo,
      token: zoneToken,
    }

    const hash = await zoneActions.requestVerifiableWithdrawal(
      zoneClient,
      parameters,
    )
    const receipt = await waitForTransactionReceipt(zoneClient, {
      hash,
    })

    expect(receipt.status).toBe('success')
  }, 20_000)

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

    await expect(
      // @ts-expect-error
      zoneActions.requestVerifiableWithdrawalSync(noAccountClient, {
        token: parentToken,
        amount: 1n,
        revealTo: '0x02abc',
      }),
    ).rejects.toThrow('`account` is required.')
  })

  test('error: account without address', async () => {
    const parameters = {
      account: {} as never,
      amount: 1n,
      revealTo: '0x02abc' as const,
      token: parentToken,
    } as const

    await expect(
      zoneActions.requestVerifiableWithdrawal(zoneClient, parameters),
    ).rejects.toThrow('`to` is required.')
    await expect(
      zoneActions.requestVerifiableWithdrawalSync(zoneClient, parameters),
    ).rejects.toThrow('`to` is required.')
  })
})
