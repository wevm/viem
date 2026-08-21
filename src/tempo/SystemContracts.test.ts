import { describe, expect, test } from 'vitest'
import * as Addresses from './Addresses.js'
import * as SystemContracts from './SystemContracts.js'

describe('SystemContracts', () => {
  test('includes fixed Tempo and Zone contracts', () => {
    expect(SystemContracts.addresses).toContain(Addresses.signatureVerifier)
    expect(SystemContracts.addresses).toContain(Addresses.blockHashHistory)
    expect(SystemContracts.addresses).toContain(Addresses.zoneFactory)
    expect(SystemContracts.addresses).toContain(
      Addresses.zonePortalImplementation,
    )
    expect(SystemContracts.addresses).toContain(Addresses.zoneMessenger)
  })

  test('recognizes deterministic Zone Portal proxies', () => {
    expect(
      SystemContracts.isSystemContract(
        '0x5Ad0000000000000000000000000000000000003',
      ),
    ).toBe(true)
  })

  test('rejects regular addresses', () => {
    expect(
      SystemContracts.isSystemContract(
        '0x0000000000000000000000000000000000000001',
      ),
    ).toBe(false)
  })
})
