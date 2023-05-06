import { describe, expect, test } from 'vitest'
import { verifyTypedData } from './verifyTypedData.js'
import {
  address,
  publicMainnetClient,
  smartAccountConfig,
  typedData,
} from '../../_test/index.js'

describe('verifyTypedData', async () => {
  test('valid signature', async () => {
    expect(
      await verifyTypedData(publicMainnetClient, {
        ...typedData.basic,
        primaryType: 'Mail',
        address: smartAccountConfig.address,
        signature:
          '0x79d756d805073dc97b7bc885b0d56ddf319a2599530fe1e178c2a7de5be88980068d24f20a79b318ea0a84d33ae06f93db77e4235e5d9eeb8b1d7a63922ada3e1c',
      }),
    ).toBe(true)
  })

  test('invalid signature', async () => {
    expect(
      await verifyTypedData(publicMainnetClient, {
        ...typedData.basic,
        primaryType: 'Mail',
        address: smartAccountConfig.address,
        signature: '0xdead',
      }),
    ).toBe(false)
  })

  test('account not deployed', async () => {
    expect(
      await verifyTypedData(publicMainnetClient, {
        ...typedData.basic,
        primaryType: 'Mail',
        address: address.notDeployed,
        signature:
          '0x79d756d805073dc97b7bc885b0d56ddf319a2599530fe1e178c2a7de5be88980068d24f20a79b318ea0a84d33ae06f93db77e4235e5d9eeb8b1d7a63922ada3e1c',
      }),
    ).toBe(false)
  })
})
