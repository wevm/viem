import { Secp256k1 } from 'ox'
import { createWalletClient, defineChain } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { getBlockNumber } from 'viem/actions'
import { tempoModerato } from 'viem/chains'
import { describe, expect, test } from 'vitest'
import { decorator } from '../Decorator.js'
import * as Storage from '../Storage.js'
import { http } from '../zones/transport.js'
import { zone006 } from '../zones/zone006.js'
import {
  getAuthorizationTokenInfo,
  getDepositStatus,
  getZoneInfo,
  signAuthorizationToken,
} from './zones.js'

const credentials = import.meta.env.VITE_TEMPO_CREDENTIALS

function getClient() {
  const storage = Storage.memory()
  const account = privateKeyToAccount(Secp256k1.randomPrivateKey())

  const chain = defineChain({
    ...zone006,
    rpcUrls: {
      default: {
        http: [`https://${credentials}@rpc-zone-006-private.tempoxyz.dev`],
      },
    },
  })

  const client = createWalletClient({
    account,
    chain,
    transport: http(undefined, { storage, timeout: 10_000 }),
  }).extend(decorator())

  return { client, storage, account }
}

describe('signAuthorizationToken', () => {
  test.skipIf(!credentials)('behavior: signs and stores token', async () => {
    const { client, storage, account } = getClient()

    const result = await signAuthorizationToken(client, { storage })

    expect(result.authentication).toBeDefined()
    expect(result.token).toBeDefined()
    expect(typeof result.token).toBe('string')
    expect(result.token.length).toBeGreaterThan(0)

    const storageKey = `auth:${account.address.toLowerCase()}:${zone006.id}`
    const storedToken = await storage.getItem(storageKey)
    expect(storedToken).toBe(result.token)

    const blockNumber = await getBlockNumber(client)
    expect(blockNumber).toBeGreaterThanOrEqual(0n)
  })

  test('behavior: throws without zone chain properties', async () => {
    const account = privateKeyToAccount(Secp256k1.randomPrivateKey())
    const client = createWalletClient({
      account,
      chain: tempoModerato,
      transport: http(),
    })

    await expect(
      signAuthorizationToken(client, { storage: Storage.memory() }),
    ).rejects.toThrow('does not support contract "zonePortal"')
  })
})

describe('getZoneInfo', () => {
  test.skipIf(!credentials)('behavior: returns zone metadata', async () => {
    const { client, storage } = getClient()
    await client.zone.signAuthorizationToken({ storage })

    const info = await getZoneInfo(client)

    expect(info.zoneId).toBe(zone006.id)
    expect(info.chainId).toBe(zone006.id)
    expect(info.sequencer).toBeDefined()
    expect(info.zoneTokens).toBeDefined()
  })

  test.skipIf(!credentials)('behavior: works via decorator', async () => {
    const { client, storage } = getClient()
    await client.zone.signAuthorizationToken({ storage })

    const info = await client.zone.getZoneInfo()

    expect(info.zoneId).toBe(zone006.id)
  })
})

describe('getAuthorizationTokenInfo', () => {
  test.skipIf(!credentials)(
    'behavior: returns account and expiry',
    async () => {
      const { client, storage, account } = getClient()
      await client.zone.signAuthorizationToken({ storage })

      const info = await getAuthorizationTokenInfo(client)

      expect(info.account.toLowerCase()).toBe(account.address.toLowerCase())
      expect(info.expiresAt).toBeGreaterThan(0n)
    },
  )
})

describe('getDepositStatus', () => {
  test.skipIf(!credentials)(
    'behavior: returns deposit status for block',
    async () => {
      const { client, storage } = getClient()
      await client.zone.signAuthorizationToken({ storage })

      const status = await getDepositStatus(client, {
        tempoBlockNumber: 1n,
      })

      expect(typeof status.processed).toBe('boolean')
      expect(typeof status.tempoBlockNumber).toBe('bigint')
      expect(typeof status.zoneProcessedThrough).toBe('bigint')
      expect(Array.isArray(status.deposits)).toBe(true)
    },
  )

  test.skipIf(!credentials)('behavior: works via decorator', async () => {
    const { client, storage } = getClient()
    await client.zone.signAuthorizationToken({ storage })

    const status = await client.zone.getDepositStatus({
      tempoBlockNumber: 1n,
    })

    expect(typeof status.processed).toBe('boolean')
  })
})
