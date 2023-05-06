import { describe, expect, test } from 'vitest'

import {
  address,
  publicMainnetClient,
  smartAccountConfig,
  ensPublicResolverConfig,
  accounts,
} from '../../_test/index.js'
import { verifyMessage, verifyMessageHashOnChain } from './verifyMessage.js'
import type { Hex } from '../../types/index.js'
import { hashMessage, toBytes } from '../../utils/index.js'

describe('verifyMessageHashOnChain', async () => {
  test.each([
    {
      _name: 'deployed, supports ERC1271, valid signature, plaintext',
      address: smartAccountConfig.address,
      messageHash: hashMessage('This is a test message for viem!'),
      signature:
        '0xefd5fb29a274ea6682673d8b3caa9263e936d48d486e5df68893003e0a76496439594d12245008c6fba1c8e3ef28241cffe1bef27ff6bca487b167f261f329251c',
      expectedResult: true,
    },
    {
      _name: 'deployed, supports ERC1271, valid signature, hex message',
      address: smartAccountConfig.address,
      messageHash: hashMessage(
        '0x5468697320697320612074657374206d65737361676520666f72207669656d21',
      ),
      signature:
        '0xefd5fb29a274ea6682673d8b3caa9263e936d48d486e5df68893003e0a76496439594d12245008c6fba1c8e3ef28241cffe1bef27ff6bca487b167f261f329251c',
      expectedResult: true,
    },
    {
      _name: 'deployed, supports ERC1271, invalid signature',
      address: smartAccountConfig.address,
      messageHash: hashMessage(
        '0x5468697320697320612074657374206d65737361676520666f72207669656d21',
      ),
      signature: '0xdead',
      expectedResult: false,
    },
    {
      _name: 'deployed, does not support ERC1271',
      address: ensPublicResolverConfig.address,
      messageHash: hashMessage('0xdead'),
      signature: '0xdead',
      expectedResult: false,
    },
    {
      _name: 'undeployed, with correct signature',
      address: accounts[0].address,
      messageHash: hashMessage('hello world'),
      signature:
        '0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b',
      expectedResult: true,
    },
    {
      _name: 'undeployed, with wrong signature',
      address: address.notDeployed,
      messageHash: hashMessage('0xdead'),
      signature: '0xdead',
      expectedResult: false,
    },
  ] as {
    _name: string
    address: Hex
    messageHash: Hex
    signature: Hex
    expectedResult: boolean
  }[])(
    '$_name',
    async ({ address, messageHash, signature, expectedResult }) => {
      expect(
        await verifyMessageHashOnChain(publicMainnetClient, {
          address,
          messageHash,
          signature,
        }),
      ).toBe(expectedResult)
    },
  )

  test('unexpected errors still get thrown', async () => {
    await expect(
      verifyMessageHashOnChain(publicMainnetClient, {
        address: '0x0', // invalid address
        messageHash: hashMessage('0xdead'),
        signature: '0xdead',
      }),
    ).rejects.toThrow()
  })

  test('accept signature as byte array', async () => {
    expect(
      await verifyMessageHashOnChain(publicMainnetClient, {
        address: smartAccountConfig.address,
        messageHash: hashMessage(
          '0x5468697320697320612074657374206d65737361676520666f72207669656d21',
        ),
        signature: toBytes(
          '0xefd5fb29a274ea6682673d8b3caa9263e936d48d486e5df68893003e0a76496439594d12245008c6fba1c8e3ef28241cffe1bef27ff6bca487b167f261f329251c',
        ),
      }),
    ).toBe(true)
  })
})

describe('verifyMessage', async () => {
  test('valid signature', async () => {
    expect(
      await verifyMessage(publicMainnetClient, {
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
      await verifyMessage(publicMainnetClient, {
        address: smartAccountConfig.address,
        message:
          '0x5468697320697320612074657374206d65737361676520666f72207669656d21',
        signature: '0xdead',
      }),
    ).toBe(false)
  })

  test('account not deployed', async () => {
    expect(
      await verifyMessage(publicMainnetClient, {
        address: address.notDeployed,
        message:
          '0x5468697320697320612074657374206d65737361676520666f72207669656d21',
        signature:
          '0xefd5fb29a274ea6682673d8b3caa9263e936d48d486e5df68893003e0a76496439594d12245008c6fba1c8e3ef28241cffe1bef27ff6bca487b167f261f329251c',
      }),
    ).toBe(false)
  })
})
