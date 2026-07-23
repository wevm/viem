import { setTimeout as sleep } from 'node:timers/promises'
import * as PublicKey from 'ox/PublicKey'
import * as Secp256k1 from 'ox/Secp256k1'
import {
  type Address,
  createClient,
  decodeAbiParameters,
  decodeFunctionData,
  encodeFunctionData,
  encodePacked,
  type Hash,
  isAddressEqual,
  keccak256,
  parseEventLogs,
  zeroHash,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import {
  getTransaction,
  getTransactionReceipt,
  readContract,
  waitForTransactionReceipt,
  writeContract,
} from 'viem/actions'
import { tempoModerato } from 'viem/chains'
import { Abis, Actions } from 'viem/tempo'
import { parseUnits } from 'viem/utils'
import { describe, expect, test } from 'vitest'
import { accounts } from '~test/constants.js'
import { addresses, chain, http, nodeEnv } from '~test/tempo/config.js'
import { deployEarnRouter, deployEarnStack } from '~test/tempo/earn.js'
import { defineZone, zoneAdminKey } from '~test/tempo/prool.js'
import {
  factoryAddress,
  getClient as getZoneClient,
  portalAddress,
  zoneId,
} from '~test/tempo/zones.js'
import { createHttpServer } from '~test/utils.js'
import * as WithdrawalSenderTag from '../internal/WithdrawalSenderTag.js'
import * as Storage from '../Storage.js'
import * as ZoneAbis from '../zones/Abis.js'
import { getPortalAddress } from '../zones/zone.js'
import * as tokenActions from './token.js'
import * as zoneActions from './zone.js'

const account = privateKeyToAccount(accounts[0].privateKey)
const portalAdmin = privateKeyToAccount(zoneAdminKey)
const recoveryRecipient = accounts[2].address
const mainnetClient = createClient({
  account,
  chain,
  pollingInterval: 100,
  transport: http(),
})
const portalAdminClient = createClient({
  account: portalAdmin,
  chain,
  pollingInterval: 100,
  transport: http(),
})
const zoneClient = getZoneClient({ account })
// TODO: Remove when T9 launches.
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

  const info = await zoneClient.request<{
    Method: 'zone_getZoneInfo'
    Parameters: []
    ReturnType: zoneActions.getZoneInfo.RpcReturnType
  }>({ method: 'zone_getZoneInfo', params: [] })
  const hash =
    'sequencers' in info
      ? await writeContract(portalAdminClient, {
          account: portalAdmin,
          address: factoryAddress,
          abi: ZoneAbis.zoneFactory,
          functionName: 'createZone',
          args: [
            {
              initialToken: parentToken,
              admin: account.address,
              sequencers: [account.address],
              threshold: 1,
              rpcUrl: 'http://127.0.0.1:0',
            },
          ],
          gas: 20_000_000n,
        })
      : await (async () => {
          const verifier = await readContract(mainnetClient, {
            address: factoryAddress,
            abi: ZoneAbis.zoneFactory,
            functionName: 'verifier',
          })
          const genesisTempoBlockNumber = BigInt(
            await mainnetClient.request({ method: 'eth_blockNumber' }),
          )
          return writeContract(mainnetClient, {
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
        })()
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

      const secondary = defineZone({ factoryAddress })

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
    expect(info.sequencers).toHaveLength(1)
    expect(isAddressEqual(info.sequencers[0]!, portalAdmin.address)).toBe(true)
    expect(info.tempoBlockNumber).toBeGreaterThanOrEqual(0n)
    expect(info.zoneTokens).toBeDefined()
  })

  test('behavior: normalizes a response without a block number', async () => {
    const server = await createHttpServer(async (req, res) => {
      let body = ''
      req.setEncoding('utf8')
      for await (const chunk of req) body += chunk
      const request = JSON.parse(body)
      const result =
        request.method === 'zone_getZoneInfo'
          ? {
              chainId: '0x1922a1a1',
              sequencer: account.address,
              zoneId: '0x1',
              zoneTokens: [parentToken],
            }
          : { zoneProcessedThrough: '0x1' }

      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(
        JSON.stringify({
          id: request.id,
          jsonrpc: '2.0',
          result,
        }),
      )
    })

    try {
      const client = createClient({ transport: http(server.url) })

      const info = await zoneActions.getZoneInfo(client)

      expect(info).toMatchInlineSnapshot(`
        {
          "chainId": 421700001,
          "sequencers": [
            "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          ],
          "tempoBlockNumber": 1n,
          "zoneId": 1,
          "zoneTokens": [
            "0x20c0000000000000000000000000000000000000",
          ],
        }
      `)
    } finally {
      await server.close()
    }
  })
})

describe('waitForTempoBlock', () => {
  test('behavior: returns after the zone imports the block', async () => {
    await zoneActions.signAuthorizationToken(zoneClient, { zoneId })
    const current = await zoneActions.getZoneInfo(zoneClient)

    const info = await zoneActions.waitForTempoBlock(zoneClient, {
      tempoBlockNumber: current.tempoBlockNumber,
    })

    expect(info).toEqual(current)
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
  test('behavior: derives a deterministic Solidity-compatible sender tag', () => {
    expect(
      WithdrawalSenderTag.from({
        sender: '0x0000000000000000000000000000000000000001',
        transactionHash:
          '0x1111111111111111111111111111111111111111111111111111111111111111',
      }),
    ).toMatchInlineSnapshot(
      `"0x7d1d33bbd5371cad19c9200930eb7f1f5374473cdfb76b88a1bcc0d0a2efc5bc"`,
    )
  })

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

  test('behavior: prepares a withdrawal transaction request and maximum fee', async () => {
    await zoneActions.signAuthorizationToken(zoneClient, { zoneId })
    const info = await zoneActions.getZoneInfo(zoneClient)
    const zoneToken = info.zoneTokens[0]!
    await ensureZoneBalance(zoneToken, 1n)

    const prepared = await zoneActions.requestWithdrawal.prepare(zoneClient, {
      amount: 1n,
      callbackGas: 100_000n,
      token: zoneToken,
    })

    expect(prepared).toMatchObject({
      amount: 1n,
      callbackGas: 100_000n,
      data: '0x',
      fallbackRecipient: account.address,
      memo: zeroHash,
      to: account.address,
      token: zoneToken,
    })
    expect(prepared.request.calls).toHaveLength(2)
    expect(prepared.request.type).toBe('tempo')
    expect(prepared.request.gas).toBe(10_000_000n)
    const denominator = 1_000_000_000_000n
    expect(prepared.maxFee).toBe(
      (prepared.request.gas * prepared.request.maxFeePerGas +
        denominator -
        1n) /
        denominator,
    )
    const withdrawalCall = prepared.request.calls?.[1]
    if (!withdrawalCall?.data)
      throw new Error('Prepared withdrawal call is unavailable.')
    const decoded = decodeFunctionData({
      abi: ZoneAbis.zoneOutbox,
      data: withdrawalCall.data,
    })
    expect(decoded.functionName).toBe('requestWithdrawal')
    if (decoded.functionName !== 'requestWithdrawal')
      throw new Error('Unexpected prepared withdrawal call.')
    expect(decoded.args[4]).toBe(100_000n)
    expect(prepared).not.toHaveProperty('totalFee')
    expect(prepared).not.toHaveProperty('transactionFee')
    expect(prepared).not.toHaveProperty('withdrawalFee')
    expect(prepared).not.toHaveProperty('estimatedGas')
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

  test('behavior: returns the receipt and sender tag for client and explicit accounts', async () => {
    await zoneActions.signAuthorizationToken(zoneClient, { zoneId })

    const info = await zoneActions.getZoneInfo(zoneClient)
    const zoneToken = info.zoneTokens[0]!

    const amount = parseUnits('0.01', 6)
    await ensureZoneBalance(zoneToken, amount * 2n)

    const clientAccountResult = await zoneActions.requestWithdrawalSync(
      zoneClient,
      {
        amount,
        token: zoneToken,
      },
    )
    const clientAccountReceipt = await getTransactionReceipt(zoneClient, {
      hash: clientAccountResult.receipt.transactionHash,
    })

    expect(clientAccountResult.receipt).toEqual(clientAccountReceipt)
    expect(clientAccountResult.receipt.status).toBe('success')
    expect(clientAccountResult.senderTag).toBe(
      keccak256(
        encodePacked(
          ['address', 'bytes32'],
          [account.address, clientAccountResult.receipt.transactionHash],
        ),
      ),
    )

    const explicitAccountClient = getZoneClient({})
    await zoneActions.signAuthorizationToken(explicitAccountClient, {
      account,
      zoneId,
    })
    const explicitAccountResult = await zoneActions.requestWithdrawalSync(
      explicitAccountClient,
      {
        account,
        amount,
        token: zoneToken,
      },
    )
    const explicitAccountReceipt = await getTransactionReceipt(
      explicitAccountClient,
      { hash: explicitAccountResult.receipt.transactionHash },
    )

    expect(explicitAccountResult.receipt).toEqual(explicitAccountReceipt)
    expect(explicitAccountResult.receipt.status).toBe('success')
    expect(explicitAccountResult.senderTag).toBe(
      keccak256(
        encodePacked(
          ['address', 'bytes32'],
          [account.address, explicitAccountResult.receipt.transactionHash],
        ),
      ),
    )
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

describe('earn', () => {
  test.runIf(nodeEnv === 'localnet')(
    'behavior: deposits and redeems through a Zone earnRouter',
    async () => {
      await Actions.zone.signAuthorizationToken(zoneClient, { zoneId })

      const stack = await deployEarnStack(mainnetClient, {
        asset: parentToken,
      })
      await Actions.token.transferSync(mainnetClient, {
        amount: parseUnits('100', 6),
        to: portalAdmin.address,
        token: parentToken,
      })
      const { earnRouter } = await deployEarnRouter(mainnetClient, {
        adapter: stack.adapter,
        portalClient: portalAdminClient,
        zonePortal: portalAddress,
      })
      const privateRoute = {
        adapter: stack.adapter,
        earnRouter,
        portalAddress,
        zoneId,
      } as const

      const callbackGas = 10_000_000n
      // Exercise a non-default value below the Zone callback gas ceiling.
      const callbackGasOverride = callbackGas - 1n
      const withdrawalFee = await Actions.zone.getWithdrawalFee(zoneClient, {
        callbackGas,
      })
      const assetAmount = parseUnits('10', 6)
      const assetDepositAmount =
        assetAmount + withdrawalFee * 2n + parseUnits('10', 6)
      const assetDeposit = await Actions.zone.depositSync(mainnetClient, {
        amount: assetDepositAmount,
        portalAddress,
        token: stack.asset,
        zoneId,
      })
      await Actions.zone.waitForTempoBlock(zoneClient, {
        pollingInterval: 100,
        tempoBlockNumber: assetDeposit.receipt.blockNumber,
      })

      const swappedDeposit = await Actions.earn.privateDeposit.prepare(
        mainnetClient,
        {
          ...privateRoute,
          assetAmount: 1n,
          assetToken: addresses.alphaUsd,
          recipient: account.address,
          recoveryRecipient,
          earnAmountMin: 2n,
        },
      )
      const [swappedDepositCallback] = decodeAbiParameters(
        Abis.earnRouterCallbackData,
        swappedDeposit.data,
      )
      expect(swappedDepositCallback).toMatchObject({
        flow: 0,
        minOutputAmount: 0n,
        minVaultAssets: 0n,
        minEarnAmount: 2n,
      })
      expect(
        isAddressEqual(swappedDepositCallback.outputToken, stack.earnToken),
      ).toBe(true)

      const boundedSwappedDeposit = await Actions.earn.privateDeposit.prepare(
        mainnetClient,
        {
          ...privateRoute,
          assetAmount: 1n,
          assetToken: addresses.alphaUsd,
          recipient: account.address,
          recoveryRecipient,
          earnAmountMin: 4n,
          vaultAssetAmountMin: 3n,
        },
      )
      const [boundedSwappedDepositCallback] = decodeAbiParameters(
        Abis.earnRouterCallbackData,
        boundedSwappedDeposit.data,
      )
      expect(boundedSwappedDepositCallback).toMatchObject({
        flow: 0,
        minOutputAmount: 0n,
        minVaultAssets: 3n,
        minEarnAmount: 4n,
      })

      const preparedDeposit = await Actions.earn.privateDeposit.prepare(
        mainnetClient,
        {
          ...privateRoute,
          actionId: keccak256('0x01'),
          assetAmount,
          callbackGas: callbackGasOverride,
          fallbackRecipient: accounts[2].address,
          recipient: account.address,
          recoveryRecipient,
          returnMemo: keccak256('0x02'),
          earnAmountMin: 1n,
          vaultAssetAmountMin: 2n,
          withdrawalMemo: keccak256('0x03'),
        },
      )
      expect(preparedDeposit).toMatchObject({
        actionId: keccak256('0x01'),
        callbackGas: callbackGasOverride,
        chainId: chain.id,
        fallbackRecipient: accounts[2].address,
        memo: keccak256('0x03'),
        zoneId,
      })
      const [depositCallback] = decodeAbiParameters(
        Abis.earnRouterCallbackData,
        preparedDeposit.data,
      )
      expect(depositCallback).toMatchObject({
        actionId: keccak256('0x01'),
        flow: 0,
        minOutputAmount: 0n,
        minVaultAssets: assetAmount,
        minEarnAmount: 1n,
      })
      expect(isAddressEqual(depositCallback.outputToken, stack.earnToken)).toBe(
        true,
      )
      expect(
        isAddressEqual(
          decodeAbiParameters(
            Abis.earnRouterZoneReturn,
            depositCallback.destinationData,
          )[0].refundRecipient,
          recoveryRecipient,
        ),
      ).toBe(true)
      await expect(
        Actions.earn.privateDeposit(zoneClient, {
          ...preparedDeposit,
          zoneId: preparedDeposit.zoneId + 1,
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: Prepared Zone request Zone ID does not match client chain.]`,
      )
      const acceptedDeposit = await Actions.earn.privateDepositSync(
        zoneClient,
        preparedDeposit,
      )
      expect(acceptedDeposit.receipt.status).toBe('success')

      const deposit = await Actions.earn.waitForPrivateDeposit(mainnetClient, {
        actionId: preparedDeposit.actionId,
        fromBlock: preparedDeposit.fromBlock,
        earnRouter,
        pollingInterval: 100,
      })
      expect(deposit.actionId).toBe(preparedDeposit.actionId)
      expect(deposit.inputAmount).toBe(assetAmount)
      expect(isAddressEqual(deposit.inputToken, stack.asset)).toBe(true)
      expect(deposit.earnAmount).toBe(assetAmount)
      expect(deposit.vaultAssets).toBe(assetAmount)

      await Actions.zone.waitForTempoBlock(zoneClient, {
        pollingInterval: 100,
        tempoBlockNumber: deposit.tempoBlockNumber,
      })
      const earnBalance = await Actions.token.getBalance(zoneClient, {
        account: account.address,
        token: stack.earnToken,
      })
      expect(earnBalance.amount).toBe(deposit.earnAmount)

      const swappedRedeem = await Actions.earn.privateRedeem.prepare(
        mainnetClient,
        {
          ...privateRoute,
          assetAmountMin: 2n,
          assetToken: addresses.alphaUsd,
          recipient: account.address,
          recoveryRecipient,
          earnAmount: 1n,
        },
      )
      const [swappedRedeemCallback] = decodeAbiParameters(
        Abis.earnRouterCallbackData,
        swappedRedeem.data,
      )
      expect(swappedRedeemCallback).toMatchObject({
        flow: 1,
        minOutputAmount: 2n,
        minVaultAssets: 1n,
        minEarnAmount: 0n,
      })
      expect(
        isAddressEqual(swappedRedeemCallback.outputToken, addresses.alphaUsd),
      ).toBe(true)

      const preparedRedeem = await Actions.earn.privateRedeem.prepare(
        mainnetClient,
        {
          ...privateRoute,
          actionId: keccak256('0x04'),
          callbackGas: callbackGasOverride,
          fallbackRecipient: accounts[2].address,
          recipient: account.address,
          recoveryRecipient,
          returnMemo: keccak256('0x05'),
          earnAmount: earnBalance.amount,
          slippageBps: 0,
          withdrawalMemo: keccak256('0x06'),
        },
      )
      expect(preparedRedeem).toMatchObject({
        actionId: keccak256('0x04'),
        callbackGas: callbackGasOverride,
        chainId: chain.id,
        fallbackRecipient: accounts[2].address,
        memo: keccak256('0x06'),
        zoneId,
      })
      const [redeemCallback] = decodeAbiParameters(
        Abis.earnRouterCallbackData,
        preparedRedeem.data,
      )
      expect(redeemCallback).toMatchObject({
        actionId: keccak256('0x04'),
        flow: 1,
        minOutputAmount: 0n,
        minVaultAssets: assetAmount,
        minEarnAmount: 0n,
      })
      expect(isAddressEqual(redeemCallback.outputToken, stack.asset)).toBe(true)
      expect(
        isAddressEqual(
          decodeAbiParameters(
            Abis.earnRouterZoneReturn,
            redeemCallback.destinationData,
          )[0].refundRecipient,
          recoveryRecipient,
        ),
      ).toBe(true)
      const acceptedRedeem = await Actions.earn.privateRedeemSync(
        zoneClient,
        preparedRedeem,
      )
      expect(acceptedRedeem.receipt.status).toBe('success')

      const redeem = await Actions.earn.waitForPrivateRedeem(mainnetClient, {
        actionId: preparedRedeem.actionId,
        fromBlock: preparedRedeem.fromBlock,
        earnRouter,
        pollingInterval: 100,
      })
      expect(redeem.actionId).toBe(preparedRedeem.actionId)
      expect(isAddressEqual(redeem.outputToken, stack.asset)).toBe(true)
      expect(redeem.outputAmount).toBe(assetAmount)
      expect(redeem.earnAmount).toBe(deposit.earnAmount)
      expect(redeem.vaultAssets).toBe(assetAmount)

      await Actions.zone.waitForTempoBlock(zoneClient, {
        pollingInterval: 100,
        tempoBlockNumber: redeem.tempoBlockNumber,
      })

      const [assetBalance, finalEarnBalance] = await Promise.all([
        Actions.token.getBalance(zoneClient, {
          account: account.address,
          token: stack.asset,
        }),
        Actions.token.getBalance(zoneClient, {
          account: account.address,
          token: stack.earnToken,
        }),
      ])
      expect(assetBalance.amount).toBeGreaterThanOrEqual(assetAmount)
      expect(finalEarnBalance.amount).toBe(0n)
    },
    480_000,
  )
})
