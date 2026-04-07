import { Secp256k1 } from 'ox'
import { privateKeyToAccount } from 'viem/accounts'
import { Actions } from 'viem/tempo'
import { describe, expect, test } from 'vitest'
import { getClient } from '~test/tempo/zones.js'
import { zoneModerato } from '../zones/zone.js'

const credentials = import.meta.env.VITE_TEMPO_CREDENTIALS
const account = privateKeyToAccount(Secp256k1.randomPrivateKey())
const zone = zoneModerato(7)

describe('signAuthorizationToken', () => {
  test.skipIf(!credentials)('behavior: signs and stores token', async () => {
    const client = getClient({ account })

    const result = await Actions.zone.signAuthorizationToken(client)

    expect(result.authentication).toBeDefined()
    expect(result.token).toBeDefined()
    expect(typeof result.token).toBe('string')
    expect(result.token.length).toBeGreaterThan(0)

    const blockNumber = await client.request({ method: 'eth_blockNumber' })
    expect(BigInt(blockNumber)).toBeGreaterThanOrEqual(0n)
  })
})

describe('getZoneInfo', () => {
  test('behavior: returns zone metadata', async () => {
    const client = getClient({ account })
    await Actions.zone.signAuthorizationToken(client)

    const info = await Actions.zone.getZoneInfo(client)

    expect(info.zoneId).toBe(7)
    expect(info.chainId).toBe(zone.id)
    expect(info.sequencer).toBeDefined()
    expect(info.zoneTokens).toBeDefined()
  })

})

describe('getAuthorizationTokenInfo', () => {
  test('behavior: returns account and expiry', async () => {
    const client = getClient({ account })
    await Actions.zone.signAuthorizationToken(client)

    const info = await Actions.zone.getAuthorizationTokenInfo(client)

    expect(info.account.toLowerCase()).toBe(account.address.toLowerCase())
    expect(info.expiresAt).toBeGreaterThan(0n)
  })
})

describe('getDepositStatus', () => {
  test('behavior: returns deposit status for block', async () => {
    const client = getClient({ account })
    await Actions.zone.signAuthorizationToken(client)

    const status = await Actions.zone.getDepositStatus(client, {
      tempoBlockNumber: 1n,
    })

    expect(typeof status.processed).toBe('boolean')
    expect(typeof status.tempoBlockNumber).toBe('bigint')
    expect(typeof status.zoneProcessedThrough).toBe('bigint')
    expect(Array.isArray(status.deposits)).toBe(true)
  })

})
