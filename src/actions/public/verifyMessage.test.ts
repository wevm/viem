import { describe, expect, test } from 'vitest'

import { smartAccountConfig } from '~test/src/abis.js'
import { accounts, address } from '~test/src/constants.js'
import { mainnetClient } from '~test/src/utils.js'
import { verifyMessage } from './verifyMessage.js'

describe('verifyMessage', () => {
  test('valid signature', async () => {
    expect(
      await verifyMessage(mainnetClient, {
        address: smartAccountConfig.address,
        message: 'This is a test message for viem!',
        signature:
          '0xefd5fb29a274ea6682673d8b3caa9263e936d48d486e5df68893003e0a76496439594d12245008c6fba1c8e3ef28241cffe1bef27ff6bca487b167f261f329251c',
      }),
    ).toBe(true)
  })

  test('invalid signature', async () => {
    expect(
      await verifyMessage(mainnetClient, {
        address: smartAccountConfig.address,
        message: 'This is a test message for viem!',
        signature: '0xdead',
      }),
    ).toBe(false)
  })

  test('account not deployed', async () => {
    expect(
      await verifyMessage(mainnetClient, {
        address: address.notDeployed,
        message: 'This is a test message for viem!',
        signature:
          '0xefd5fb29a274ea6682673d8b3caa9263e936d48d486e5df68893003e0a76496439594d12245008c6fba1c8e3ef28241cffe1bef27ff6bca487b167f261f329251c',
      }),
    ).toBe(false)
  })

  test('raw message', async () => {
    expect(
      await verifyMessage(mainnetClient, {
        address: accounts[0].address,
        message: { raw: '0x68656c6c6f20776f726c64' },
        signature:
          '0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b',
      }),
    ).toBe(true)
  })
})
