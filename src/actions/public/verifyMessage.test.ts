import { describe, expect, test } from 'vitest'

import {
  accounts,
  address,
  ensPublicResolverConfig,
  publicClient,
  publicMainnetClient,
  smartAccountConfig,
} from '../../_test/index.js'
import type { Hex } from '../../types/index.js'
import { hashMessage, toBytes } from '../../utils/index.js'
import { verifyMessage, verifyMessageHashOnChain } from './verifyMessage.js'

/**
 * When forking mainnet to anvil, it seems like the deployless contract always returns `0x0`.
 * It does not fail/error, but just always returns `0x0`.
 * This test indicates if that is still the case, or if this issue was fixed in an anvil update,
 * in which case this test should fail, and we should switch from using the ethereum public client
 * to using the anvil public client everywhere.
 */
describe.only('ERC6492 Anvil issue (read comment in code)', () => {
  const validSignedEOAMessage = {
    address: accounts[0].address,
    messageHash: hashMessage('hello world'),
    signature:
      '0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b',
  } as const
  const validSignedErc1271Message = {
    address: smartAccountConfig.address,
    messageHash: hashMessage('This is a test message for viem!'),
    signature:
      '0xefd5fb29a274ea6682673d8b3caa9263e936d48d486e5df68893003e0a76496439594d12245008c6fba1c8e3ef28241cffe1bef27ff6bca487b167f261f329251c',
  } as const

  test('valid test with anvil should fail', async () => {
    expect(
      await verifyMessageHashOnChain(publicClient, validSignedEOAMessage),
    ).toBe(false)
    expect(
      await verifyMessageHashOnChain(publicClient, validSignedErc1271Message),
    ).toBe(false)
  })

  test('valid test with mainnet will pass', async () => {
    expect(
      await verifyMessageHashOnChain(
        publicMainnetClient,
        validSignedEOAMessage,
      ),
    ).toBe(true)
    expect(
      await verifyMessageHashOnChain(
        publicMainnetClient,
        validSignedErc1271Message,
      ),
    ).toBe(true)
  })
})

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
