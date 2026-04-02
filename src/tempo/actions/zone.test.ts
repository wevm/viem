import { Secp256k1 } from 'ox'
import { createWalletClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { tempoModerato } from 'viem/chains'
import { Actions } from 'viem/tempo'
import { describe, expect, test } from 'vitest'
import { getClient, http } from '~test/tempo/zones.js'
import { zone006 } from '../zones/zone006.js'

const credentials = import.meta.env.VITE_TEMPO_CREDENTIALS
const account = privateKeyToAccount(Secp256k1.randomPrivateKey())

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

  test('behavior: throws without zone chain properties', async () => {
    const client = createWalletClient({
      account,
      chain: tempoModerato,
      transport: http(),
    })

    await expect(Actions.zone.signAuthorizationToken(client)).rejects.toThrow(
      'does not support contract "zonePortal"',
    )
  })
})

// TODO: unskip
describe.skip('getZoneInfo', () => {
  test.skipIf(!credentials)('behavior: returns zone metadata', async () => {
    const client = getClient({ account })
    await Actions.zone.signAuthorizationToken(client)

    const info = await Actions.zone.getZoneInfo(client)

    expect(info.zoneId).toBe(zone006.id)
    expect(info.chainId).toBe(zone006.id)
    expect(info.sequencer).toBeDefined()
    expect(info.zoneTokens).toBeDefined()
  })

  test.skipIf(!credentials)('behavior: works via decorator', async () => {
    const client = getClient({ account })
    await Actions.zone.signAuthorizationToken(client)

    const info = await Actions.zone.getZoneInfo(client)

    expect(info.zoneId).toBe(zone006.id)
  })
})

// TODO: unskip
describe.skip('getAuthorizationTokenInfo', () => {
  test.skipIf(!credentials)(
    'behavior: returns account and expiry',
    async () => {
      const client = getClient({ account })
      await Actions.zone.signAuthorizationToken(client)

      const info = await Actions.zone.getAuthorizationTokenInfo(client)

      expect(info.account.toLowerCase()).toBe(account.address.toLowerCase())
      expect(info.expiresAt).toBeGreaterThan(0n)
    },
  )
})

// TODO: unskip
describe.skip('getDepositStatus', () => {
  test.skipIf(!credentials)(
    'behavior: returns deposit status for block',
    async () => {
      const client = getClient({ account })
      await Actions.zone.signAuthorizationToken(client)

      const status = await Actions.zone.getDepositStatus(client, {
        tempoBlockNumber: 1n,
      })

      expect(typeof status.processed).toBe('boolean')
      expect(typeof status.tempoBlockNumber).toBe('bigint')
      expect(typeof status.zoneProcessedThrough).toBe('bigint')
      expect(Array.isArray(status.deposits)).toBe(true)
    },
  )

  test.skipIf(!credentials)('behavior: works via decorator', async () => {
    const client = getClient({ account })
    await Actions.zone.signAuthorizationToken(client)

    const status = await Actions.zone.getDepositStatus(client, {
      tempoBlockNumber: 1n,
    })

    expect(typeof status.processed).toBe('boolean')
  })
})
