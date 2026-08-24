import { setTimeout as sleep } from 'node:timers/promises'
import * as PublicKey from 'ox/PublicKey'
import * as Secp256k1 from 'ox/Secp256k1'
import {
  type Address,
  createClient,
  decodeAbiParameters,
  decodeFunctionData,
  encodeFunctionData,
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
import { Abis, Actions, Addresses } from 'viem/tempo'
import { parseUnits } from 'viem/utils'
import { describe, expect, test } from 'vitest'
import { accounts } from '~test/constants.js'
import { addresses, chain, http, nodeEnv } from '~test/tempo/config.js'
import { deployEarnGateway, deployEarnStack } from '~test/tempo/earn.js'
import { defineZone, zoneAdminKey } from '~test/tempo/prool.js'
import {
  factoryAddress,
  getClient as getZoneClient,
  unredactedRpcUrl,
  http as zoneHttp,
  zoneId,
} from '~test/tempo/zones.js'
import { createHttpServer } from '~test/utils.js'
import * as WithdrawalSenderTag from '../internal/WithdrawalSenderTag.js'
import * as Store from '../Store.js'
import * as tokenActions from './token.js'
import * as zoneActions from './zone.js'

const account = privateKeyToAccount(accounts[0].privateKey)
const portalAdmin = privateKeyToAccount(zoneAdminKey)
const tempoRefundRecipient = accounts[2].address
const portalAddress = Addresses.zonePortal(zoneId)
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
const unredactedZoneClient = getZoneClient({
  account,
  transport: zoneHttp(unredactedRpcUrl),
})
const hardfork = import.meta.env.VITE_TEMPO_HARDFORK
const legacyZoneCallback = hardfork === 'T9'
const parentToken = '0x20c0000000000000000000000000000000000000'
const depositParameters = {
  amount: parseUnits('1', 6),
  portalAddress,
  token: parentToken,
  zoneId,
} as const
const preparedEncryptedDeposit = {
  amount: parseUnits('1', 6),
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
  sender: account.address,
  tempoRefundRecipient: account.address,
  token: '0x20c0000000000000000000000000000000000000',
  zoneId,
} satisfies zoneActions.PreparedEncryptedDeposit
const prepareEncryptedDepositParameters = {
  amount: parseUnits('1', 6),
  recipient: account.address,
  sender: account.address,
  tempoRefundRecipient: account.address,
  token: parentToken,
  zoneId: 7,
} as const

async function ensureZoneBalance(zoneToken: Address, minimumBalance: bigint) {
  const balance = await tokenActions.getBalance(zoneClient, {
    account: account.address,
    token: zoneToken,
  })
  if (balance.amount >= minimumBalance) return

  const parameters = {
    amount: parseUnits('1', 6),
    portalAddress,
    token: parentToken,
    zoneId,
  } as const
  if (legacyZoneCallback)
    await zoneActions.depositSync(mainnetClient, parameters)
  else await zoneActions.encryptedDepositSync(mainnetClient, parameters)

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
          abi: Abis.zoneFactory,
          functionName: 'createZone',
          args: [
            {
              initialToken: parentToken,
              accessMode: false,
              gatewayMode: false,
              allowedAccounts: [],
              zoneGateways: [],
              admin: account.address,
              sequencers: [account.address],
              threshold: 1,
              rpcUrl: 'http://127.0.0.1:0',
            },
          ],
          gas: 30_000_000n,
        })
      : await (async () => {
          const verifier = await readContract(mainnetClient, {
            address: factoryAddress,
            abi: Abis.zoneFactory,
            functionName: 'verifier',
          })
          const genesisTempoBlockNumber = BigInt(
            await mainnetClient.request({ method: 'eth_blockNumber' }),
          )
          return writeContract(mainnetClient, {
            account,
            address: factoryAddress,
            abi: Abis.zoneFactory,
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
            gas: 30_000_000n,
          })
        })()
  const receipt = await waitForTransactionReceipt(mainnetClient, { hash })
  const [event] = parseEventLogs({
    abi: Abis.zoneFactory,
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
  return decodeFunctionData({ abi: Abis.zonePortal, data: call.data })
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
        expect(Addresses.zonePortal(zone_.zoneId)).not.toBe(portalAddress)

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

  test('behavior: custom issuedAt/expiresAt/store', async () => {
    const store = Store.memory()
    const issuedAt = Math.floor(Date.now() / 1000) - 100
    const expiresAt = issuedAt + 300

    const result = await zoneActions.signAuthorizationToken(zoneClient, {
      issuedAt,
      expiresAt,
      store,
      zoneId,
    })

    expect(result.authentication).toBeDefined()
    expect(result.token).toBeDefined()

    const stored = await store.getItem(`auth:token:${zoneClient.chain.id}`)
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

describe('getPortalInfo', () => {
  test.runIf(!hardfork || hardfork === 'Tnext')('default', async () => {
    const info = await zoneActions.getPortalInfo(mainnetClient, {
      portalAddress,
      zoneId,
    })

    expect(isAddressEqual(info.admin, portalAdmin.address)).toBe(true)
    expect(
      info.enabledTokens.some((token) => isAddressEqual(token, parentToken)),
    ).toBe(true)
    expect(info.messenger).toBeDefined()
    expect(info.pauseExpiry).toBeGreaterThanOrEqual(0n)
    expect(typeof info.paused).toBe('boolean')
    expect(info.pendingAdmin).toBeDefined()
    expect(info.sequencers).toHaveLength(1)
    expect(isAddressEqual(info.sequencers[0]!, portalAdmin.address)).toBe(true)
    expect(info.sequencerSetVersion).toBe(0n)
    expect(info.sequencerThreshold).toBe(1)
    expect(info.verifier).toBeDefined()
  })
})

describe('getTokenMetadata', () => {
  test('behavior: supports disabled client multicall', async () => {
    const client = getZoneClient({
      account,
      batch: { multicall: false },
    })
    await zoneActions.signAuthorizationToken(client, { zoneId })
    const info = await zoneActions.getZoneInfo(client)

    const metadata = await tokenActions.getMetadata(client, {
      token: info.zoneTokens[0]!,
    })

    expect(metadata.decimals).toBe(6)
    expect(metadata.name.length).toBeGreaterThan(0)
    expect(metadata.symbol.length).toBeGreaterThan(0)
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
    expect(registryCalls[1].address).toBe(Addresses.zonePortal(7))

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
    const { sender: _, ...parameters } = prepareEncryptedDepositParameters
    const prepared = await zoneActions.encryptedDeposit.prepare(mainnetClient, {
      ...parameters,
      portalAddress,
      zoneId,
    })

    expect(prepared.sender).toBe(mainnetClient.account.address)
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
    expect(prepared.sender).toBe(mainnetClient.account.address)
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

  test('behavior: defaults Tempo refund recipient to account', async () => {
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
  test('behavior: encodes Tempo refund recipient', () => {
    const parameters = {
      amount: 1n,
      portalAddress,
      recipient: account.address,
      tempoRefundRecipient: account.address,
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
      zoneId: 7,
    })
    expect(registryCalls[1].address).toBe(Addresses.zonePortal(7))
  })

  test.runIf(legacyZoneCallback)(
    'behavior: defaults Tempo refund recipient to account',
    async () => {
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
    },
  )

  test.runIf(legacyZoneCallback)(
    'behavior: deposits tokens into zone via parent chain',
    async () => {
      const result = await zoneActions.depositSync(mainnetClient, {
        token: parentToken,
        amount: parseUnits('1', 6),
        portalAddress,
        zoneId,
      })

      expect(result.receipt).toBeDefined()
      expect(result.receipt.status).toBe('success')
    },
  )

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

describe('depositSync', () => {
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
  test('behavior: derives the production sender tag', () => {
    expect(
      WithdrawalSenderTag.from({
        fallbackNonce: 19n,
        sender: '0x0F0896dbf0465E5c07963301dcFEA1101Fa91EaC',
        transactionHash:
          '0xae628bdc4bd24a9f9a917825a208baa16c384ab8a96a40cd5146bd20d9b3f6d9',
      }),
    ).toBe('0xf1acbae45cd689281144042331e3379cf631a8d2db83057ccf38754a0b0108f2')
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
      abi: Abis.zoneOutbox,
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
    if (legacyZoneCallback) return

    await zoneActions.signAuthorizationToken(zoneClient, { zoneId })

    const info = await zoneActions.getZoneInfo(zoneClient)
    const zoneToken = info.zoneTokens[0]!

    const amount = parseUnits('0.01', 6)
    await ensureZoneBalance(zoneToken, amount * 2n)

    const clientAccountResult = await zoneActions.requestWithdrawalSync(
      unredactedZoneClient,
      {
        amount,
        token: zoneToken,
      },
    )
    const clientAccountReceipt = await getTransactionReceipt(
      unredactedZoneClient,
      {
        hash: clientAccountResult.receipt.transactionHash,
      },
    )

    expect(clientAccountResult.receipt).toEqual(clientAccountReceipt)
    expect(clientAccountResult.receipt.status).toBe('success')
    const [clientAccountEvent] = parseEventLogs({
      abi: Abis.zoneOutbox,
      logs: clientAccountResult.receipt.logs,
      eventName: 'WithdrawalRequested',
      strict: true,
    })
    if (!clientAccountEvent)
      throw new Error('`WithdrawalRequested` event not found.')
    expect(clientAccountEvent.args.fallbackNonce).toBeGreaterThan(0n)
    expect(clientAccountResult.senderTag).toBe(
      WithdrawalSenderTag.from({
        fallbackNonce: clientAccountEvent.args.fallbackNonce,
        sender: clientAccountEvent.args.sender,
        transactionHash: clientAccountResult.receipt.transactionHash,
      }),
    )

    const explicitAccountClient = getZoneClient({})
    await zoneActions.signAuthorizationToken(explicitAccountClient, {
      account,
      zoneId,
    })
    const explicitAccountUnredactedClient = getZoneClient({
      transport: zoneHttp(unredactedRpcUrl),
    })
    const explicitAccountResult = await zoneActions.requestWithdrawalSync(
      explicitAccountUnredactedClient,
      {
        account,
        amount,
        token: zoneToken,
      },
    )
    const explicitAccountReceipt = await getTransactionReceipt(
      explicitAccountUnredactedClient,
      { hash: explicitAccountResult.receipt.transactionHash },
    )

    expect(explicitAccountResult.receipt).toEqual(explicitAccountReceipt)
    expect(explicitAccountResult.receipt.status).toBe('success')
    const [explicitAccountEvent] = parseEventLogs({
      abi: Abis.zoneOutbox,
      logs: explicitAccountResult.receipt.logs,
      eventName: 'WithdrawalRequested',
      strict: true,
    })
    if (!explicitAccountEvent)
      throw new Error('`WithdrawalRequested` event not found.')
    expect(explicitAccountEvent.args.fallbackNonce).toBeGreaterThan(0n)
    expect(explicitAccountResult.senderTag).toBe(
      WithdrawalSenderTag.from({
        fallbackNonce: explicitAccountEvent.args.fallbackNonce,
        sender: explicitAccountEvent.args.sender,
        transactionHash: explicitAccountResult.receipt.transactionHash,
      }),
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
  test.runIf(nodeEnv === 'localnet' && !legacyZoneCallback)(
    'behavior: deposits and redeems through a Zone gateway',
    async () => {
      await Actions.zone.signAuthorizationToken(zoneClient, { zoneId })
      await ensureZoneBalance(parentToken, parseUnits('1', 6))

      const stack = await deployEarnStack(mainnetClient, {
        asset: parentToken,
      })
      await Actions.token.transferSync(mainnetClient, {
        amount: parseUnits('100', 6),
        to: portalAdmin.address,
        token: parentToken,
      })
      const { gateway } = await deployEarnGateway(mainnetClient, {
        adapter: stack.adapter,
        privateAsset: addresses.alphaUsd,
        portalClient: portalAdminClient,
        zonePortal: portalAddress,
        zoneId,
      })
      const privatePreparation = {
        gateway,
        portalAddress,
        vault: stack.adapter,
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
      const assetDeposit = await Actions.zone.encryptedDepositSync(
        mainnetClient,
        {
          amount: assetDepositAmount,
          portalAddress,
          token: addresses.alphaUsd,
          zoneId,
        },
      )
      if (assetDeposit.receipt.status === 'pending')
        throw new Error('Expected submitted deposit receipt.')
      await Actions.zone.waitForTempoBlock(zoneClient, {
        pollingInterval: 100,
        tempoBlockNumber: assetDeposit.receipt.blockNumber,
      })

      const swappedDeposit = await Actions.earn.privateDeposit.prepare(
        mainnetClient,
        {
          assetAmount: 1n,
          assetToken: addresses.alphaUsd,
          ...privatePreparation,
          recipient: account.address,
          shareAmountMin: 2n,
          tempoRefundRecipient,
        },
      )
      const [swappedDepositCallback] = decodeAbiParameters(
        Abis.earnRouterCallbackData,
        swappedDeposit.data,
      )
      expect(swappedDepositCallback).toMatchObject({
        flow: 0,
        minEarnShares: 2n,
        minOutputAmount: 0n,
        minVaultAssets: 1n,
      })

      const boundedSwappedDeposit = await Actions.earn.privateDeposit.prepare(
        mainnetClient,
        {
          assetAmount: 1n,
          assetToken: addresses.alphaUsd,
          ...privatePreparation,
          recipient: account.address,
          shareAmountMin: 4n,
          tempoRefundRecipient,
          vaultAssetAmountMin: 3n,
        },
      )
      const [boundedSwappedDepositCallback] = decodeAbiParameters(
        Abis.earnRouterCallbackData,
        boundedSwappedDeposit.data,
      )
      expect(boundedSwappedDepositCallback).toMatchObject({
        flow: 0,
        minEarnShares: 4n,
        minOutputAmount: 0n,
        minVaultAssets: 3n,
      })

      const preparedDeposit = await Actions.earn.privateDeposit.prepare(
        mainnetClient,
        {
          actionId: keccak256('0x01'),
          assetAmount,
          callbackGas: callbackGasOverride,
          fallbackRecipient: accounts[2].address,
          ...privatePreparation,
          recipient: account.address,
          returnMemo: keccak256('0x02'),
          shareAmountMin: 1n,
          tempoRefundRecipient,
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
        minEarnShares: 1n,
        minOutputAmount: 0n,
        minVaultAssets: 2n,
      })
      expect(
        isAddressEqual(
          depositCallback.zoneReturn.refundRecipient,
          tempoRefundRecipient,
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
        unredactedZoneClient,
        preparedDeposit,
      )
      expect(acceptedDeposit.receipt.status).toBe('success')

      const deposit = await Actions.earn.waitForPrivateDeposit(mainnetClient, {
        actionId: preparedDeposit.actionId,
        fromBlock: preparedDeposit.fromBlock,
        gateway,
        pollingInterval: 100,
        vault: stack.adapter,
      })
      expect(deposit.actionId).toBe(preparedDeposit.actionId)
      expect(deposit.inputAmount).toBe(assetAmount)
      expect(isAddressEqual(deposit.inputToken, addresses.alphaUsd)).toBe(true)
      expect(deposit.shares).toBe(assetAmount)
      expect(deposit.vaultAssets).toBe(assetAmount)

      await Actions.zone.waitForTempoBlock(zoneClient, {
        pollingInterval: 100,
        tempoBlockNumber: deposit.tempoBlockNumber,
      })
      const shareBalance = await Actions.token.getBalance(zoneClient, {
        account: account.address,
        token: stack.shareToken,
      })
      expect(shareBalance.amount).toBe(deposit.shares)

      const swappedRedeem = await Actions.earn.privateRedeem.prepare(
        mainnetClient,
        {
          assetAmountMin: 2n,
          assetToken: addresses.alphaUsd,
          ...privatePreparation,
          recipient: account.address,
          shareAmount: 1n,
          tempoRefundRecipient,
        },
      )
      const [swappedRedeemCallback] = decodeAbiParameters(
        Abis.earnRouterCallbackData,
        swappedRedeem.data,
      )
      expect(swappedRedeemCallback).toMatchObject({
        flow: 1,
        minEarnShares: 0n,
        minOutputAmount: 2n,
        minVaultAssets: 2n,
      })

      const preparedRedeem = await Actions.earn.privateRedeem.prepare(
        mainnetClient,
        {
          actionId: keccak256('0x04'),
          callbackGas: callbackGasOverride,
          fallbackRecipient: accounts[2].address,
          ...privatePreparation,
          recipient: account.address,
          returnMemo: keccak256('0x05'),
          shareAmount: shareBalance.amount,
          slippageBps: 0,
          tempoRefundRecipient,
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
        minEarnShares: 0n,
        minOutputAmount: assetAmount,
        minVaultAssets: assetAmount,
      })
      expect(
        isAddressEqual(
          redeemCallback.zoneReturn.refundRecipient,
          tempoRefundRecipient,
        ),
      ).toBe(true)
      const acceptedRedeem = await Actions.earn.privateRedeemSync(
        unredactedZoneClient,
        preparedRedeem,
      )
      expect(acceptedRedeem.receipt.status).toBe('success')

      const redeem = await Actions.earn.waitForPrivateRedeem(mainnetClient, {
        actionId: preparedRedeem.actionId,
        fromBlock: preparedRedeem.fromBlock,
        gateway,
        pollingInterval: 100,
        vault: stack.adapter,
      })
      expect(redeem.actionId).toBe(preparedRedeem.actionId)
      expect(isAddressEqual(redeem.outputToken, addresses.alphaUsd)).toBe(true)
      expect(redeem.outputAmount).toBe(assetAmount)
      expect(redeem.shares).toBe(deposit.shares)
      expect(redeem.vaultAssets).toBe(assetAmount)

      await Actions.zone.waitForTempoBlock(zoneClient, {
        pollingInterval: 100,
        tempoBlockNumber: redeem.tempoBlockNumber,
      })

      const [assetBalance, finalShareBalance] = await Promise.all([
        Actions.token.getBalance(zoneClient, {
          account: account.address,
          token: addresses.alphaUsd,
        }),
        Actions.token.getBalance(zoneClient, {
          account: account.address,
          token: stack.shareToken,
        }),
      ])
      expect(assetBalance.amount).toBeGreaterThanOrEqual(assetAmount)
      expect(finalShareBalance.amount).toBe(0n)
    },
    480_000,
  )
})
