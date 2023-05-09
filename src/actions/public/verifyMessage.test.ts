import { describe, expect, test } from 'vitest'

import { smartAccountConfig } from '../../_test/abis.js'
import { address } from '../../_test/constants.js'
import { publicClientMainnet } from '../../_test/utils.js'
import { verifyMessage } from './verifyMessage.js'

describe('verifyMessage', async () => {
  test('valid signature', async () => {
    expect(
      await verifyMessage(publicClientMainnet, {
        address: smartAccountConfig.address,
        message:
          '0x5468697320697320612074657374206d65737361676520666f72207669656d21',
        signature:
          '0xefd5fb29a274ea6682673d8b3caa9263e936d48d486e5df68893003e0a76496439594d12245008c6fba1c8e3ef28241cffe1bef27ff6bca487b167f261f329251c',
      }),
    ).toBe(true)
  })

  test('invalid signature', async () => {
    expect(
      await verifyMessage(publicClientMainnet, {
        address: smartAccountConfig.address,
        message:
          '0x5468697320697320612074657374206d65737361676520666f72207669656d21',
        signature: '0xdead',
      }),
    ).toBe(false)
  })

  test('account not deployed', async () => {
    expect(
      await verifyMessage(publicClientMainnet, {
        address: address.notDeployed,
        message:
          '0x5468697320697320612074657374206d65737361676520666f72207669656d21',
        signature:
          '0xefd5fb29a274ea6682673d8b3caa9263e936d48d486e5df68893003e0a76496439594d12245008c6fba1c8e3ef28241cffe1bef27ff6bca487b167f261f329251c',
      }),
    ).toBe(false)
  })
})
