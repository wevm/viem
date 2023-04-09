import { describe, expect, test } from 'vitest'

import {
  publicClient,
  smartAccountConfig,
  ensPublicResolverConfig,
  address,
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
      expectedResult: null,
    },
    {
      _name: 'undeployed',
      address: address.notDeployed,
      messageHash: hashMessage('0xdead'),
      signature: '0xdead',
      expectedResult: null,
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
        await verifyMessageHashOnChain(publicClient, {
          address,
          messageHash,
          signature,
        }),
      ).toBe(expectedResult)
    },
  )

  test('unexpected errors still get thrown', async () => {
    await expect(
      verifyMessageHashOnChain(publicClient, {
        address: '0x0', // invalid address
        messageHash: hashMessage('0xdead'),
        signature: '0xdead',
      }),
    ).rejects.toThrow()
  })

  test('accept signature as byte array', async () => {
    expect(
      await verifyMessageHashOnChain(publicClient, {
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
      await verifyMessage(publicClient, {
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
      await verifyMessage(publicClient, {
        address: smartAccountConfig.address,
        message:
          '0x5468697320697320612074657374206d65737361676520666f72207669656d21',
        signature: '0xdead',
      }),
    ).toBe(false)
  })

  test('account not deployed', async () => {
    expect(
      await verifyMessage(publicClient, {
        address: address.notDeployed,
        message:
          '0x5468697320697320612074657374206d65737361676520666f72207669656d21',
        signature:
          '0xefd5fb29a274ea6682673d8b3caa9263e936d48d486e5df68893003e0a76496439594d12245008c6fba1c8e3ef28241cffe1bef27ff6bca487b167f261f329251c',
      }),
    ).toBe(false)
  })
})
