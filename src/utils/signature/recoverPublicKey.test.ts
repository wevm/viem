import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { toBytes } from '../encoding/toBytes.js'

import { hashMessage } from './hashMessage.js'
import { parseSignature } from './parseSignature.js'
import { recoverPublicKey } from './recoverPublicKey.js'

test('default', async () => {
  expect(
    await recoverPublicKey({
      hash: hashMessage('hello world'),
      signature:
        '0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b',
    }),
  ).toEqual(privateKeyToAccount(accounts[0].privateKey).publicKey)

  expect(
    await recoverPublicKey({
      hash: hashMessage('hello world'),
      signature: parseSignature(
        '0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b',
      ),
    }),
  ).toEqual(privateKeyToAccount(accounts[0].privateKey).publicKey)

  expect(
    await recoverPublicKey({
      hash: hashMessage('🥵'),
      signature:
        '0x05c99bbbe9fac3ad61721a815d19d6771ad39f3e8dffa7ae7561358f20431d8e7f9e1d487c77355790c79c6eb0b0d63690f690615ef99ee3e4f25eef0317d0701b',
    }),
  ).toEqual(privateKeyToAccount(accounts[0].privateKey).publicKey)

  expect(
    await recoverPublicKey({
      hash: hashMessage('🥵'),
      signature: parseSignature(
        '0x05c99bbbe9fac3ad61721a815d19d6771ad39f3e8dffa7ae7561358f20431d8e7f9e1d487c77355790c79c6eb0b0d63690f690615ef99ee3e4f25eef0317d0701b',
      ),
    }),
  ).toEqual(privateKeyToAccount(accounts[0].privateKey).publicKey)

  expect(
    await recoverPublicKey({
      hash: hashMessage('hello world', 'bytes'),
      signature:
        '0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b',
    }),
  ).toEqual(privateKeyToAccount(accounts[0].privateKey).publicKey)

  expect(
    await recoverPublicKey({
      hash: hashMessage('hello world', 'bytes'),
      signature: parseSignature(
        '0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b',
      ),
    }),
  ).toEqual(privateKeyToAccount(accounts[0].privateKey).publicKey)

  expect(
    await recoverPublicKey({
      hash: hashMessage('🥵', 'bytes'),
      signature:
        '0x05c99bbbe9fac3ad61721a815d19d6771ad39f3e8dffa7ae7561358f20431d8e7f9e1d487c77355790c79c6eb0b0d63690f690615ef99ee3e4f25eef0317d0701b',
    }),
  ).toEqual(privateKeyToAccount(accounts[0].privateKey).publicKey)

  expect(
    await recoverPublicKey({
      hash: hashMessage('🥵', 'bytes'),
      signature: parseSignature(
        '0x05c99bbbe9fac3ad61721a815d19d6771ad39f3e8dffa7ae7561358f20431d8e7f9e1d487c77355790c79c6eb0b0d63690f690615ef99ee3e4f25eef0317d0701b',
      ),
    }),
  ).toEqual(privateKeyToAccount(accounts[0].privateKey).publicKey)

  expect(
    await recoverPublicKey({
      hash: hashMessage('hello world', 'bytes'),
      signature: toBytes(
        '0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b',
      ),
    }),
  ).toEqual(privateKeyToAccount(accounts[0].privateKey).publicKey)

  expect(
    await recoverPublicKey({
      hash: hashMessage('hello world'),
      signature:
        '0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b00',
    }),
  ).toEqual(privateKeyToAccount(accounts[0].privateKey).publicKey)

  expect(
    await recoverPublicKey({
      hash: hashMessage('hello world'),
      signature: parseSignature(
        '0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b00',
      ),
    }),
  ).toEqual(privateKeyToAccount(accounts[0].privateKey).publicKey)

  expect(
    await recoverPublicKey({
      hash: '0x9a74cb859ad30835ffb2da406423233c212cf6dd78e6c2c98b0c9289568954ae',
      signature:
        '0xc4d8bcda762d35ea79d9542b23200f46c2c1899db15bf929bbacaf609581db0831538374a01206517edd934e474212a0f1e2d62e9a01cd64f1cf94ea2e09884901',
    }),
  ).toEqual(privateKeyToAccount(accounts[0].privateKey).publicKey)

  expect(
    await recoverPublicKey({
      hash: '0x9a74cb859ad30835ffb2da406423233c212cf6dd78e6c2c98b0c9289568954ae',
      signature: parseSignature(
        '0xc4d8bcda762d35ea79d9542b23200f46c2c1899db15bf929bbacaf609581db0831538374a01206517edd934e474212a0f1e2d62e9a01cd64f1cf94ea2e09884901',
      ),
    }),
  ).toEqual(privateKeyToAccount(accounts[0].privateKey).publicKey)
})

test('invalid yParityOrV value', async () => {
  await expect(() =>
    recoverPublicKey({
      hash: hashMessage('hello world'),
      signature:
        '0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1d',
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    '[Error: Invalid yParityOrV value]',
  )
  await expect(() =>
    recoverPublicKey({
      hash: hashMessage('hello world'),
      signature:
        '0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b02',
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    '[Error: Invalid yParityOrV value]',
  )
})
