import { describe, expect, test } from 'vitest'

import { ensPublicResolverConfig, smartAccountConfig } from '~test/src/abis.js'
import { accounts, address } from '~test/src/constants.js'
import { anvilMainnet } from '../../../test/src/anvil.js'

import type { Hex } from '../../types/misc.js'
import { hashMessage, toBytes } from '../../utils/index.js'
import { verifyHash } from './verifyHash.js'

const client = anvilMainnet.getClient()

describe('verifyHash', async () => {
  test.each([
    {
      _name: 'deployed, supports ERC1271, valid signature, plaintext',
      address: smartAccountConfig.address,
      hash: hashMessage('This is a test message for viem!'),
      signature:
        '0xefd5fb29a274ea6682673d8b3caa9263e936d48d486e5df68893003e0a76496439594d12245008c6fba1c8e3ef28241cffe1bef27ff6bca487b167f261f329251c',
      expectedResult: true,
    },
    {
      _name: 'deployed, supports ERC1271, invalid signature',
      address: smartAccountConfig.address,
      hash: hashMessage('This is a test message for viem!'),
      signature: '0xdead',
      expectedResult: false,
    },
    {
      _name: 'deployed, does not support ERC1271',
      address: ensPublicResolverConfig.address,
      hash: hashMessage('0xdead'),
      signature: '0xdead',
      expectedResult: false,
    },
    {
      _name: 'undeployed, with correct signature',
      address: accounts[0].address,
      hash: hashMessage('hello world'),
      signature:
        '0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b',
      expectedResult: true,
    },
    {
      _name: 'undeployed, with wrong signature',
      address: address.notDeployed,
      hash: hashMessage('0xdead'),
      signature: '0xdead',
      expectedResult: false,
    },
  ] as {
    _name: string
    address: Hex
    hash: Hex
    signature: Hex
    expectedResult: boolean
  }[])('$_name', async ({ address, hash, signature, expectedResult }) => {
    expect(
      await verifyHash(client, {
        address,
        hash,
        signature,
      }),
    ).toBe(expectedResult)
  })

  test('unexpected errors still get thrown', async () => {
    await expect(
      verifyHash(client, {
        address: '0x0', // invalid address
        hash: hashMessage('0xdead'),
        signature: '0xdead',
      }),
    ).rejects.toThrow()
  })

  test('accept signature as byte array', async () => {
    expect(
      await verifyHash(client, {
        address: smartAccountConfig.address,
        hash: hashMessage('This is a test message for viem!'),
        signature: toBytes(
          '0xefd5fb29a274ea6682673d8b3caa9263e936d48d486e5df68893003e0a76496439594d12245008c6fba1c8e3ef28241cffe1bef27ff6bca487b167f261f329251c',
        ),
      }),
    ).toBe(true)
  })
})
