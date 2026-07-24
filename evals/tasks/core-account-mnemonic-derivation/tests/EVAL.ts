import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import {
  deriveAddress,
  deriveAddressAtPath,
  deriveAddressWithPassphrase,
} from '../src/index.ts'

const mnemonic = 'test test test test test test test test test test test junk'

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
}, 60_000)

test('derives the dev addresses at indexes 0-2', () => {
  expect(deriveAddress({ addressIndex: 0, mnemonic }).toLowerCase()).toBe(
    '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  )
  expect(deriveAddress({ addressIndex: 1, mnemonic }).toLowerCase()).toBe(
    '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  )
  expect(deriveAddress({ addressIndex: 2, mnemonic }).toLowerCase()).toBe(
    '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc',
  )
}, 60_000)

test('derives at a full custom path', () => {
  expect(
    deriveAddressAtPath({
      mnemonic,
      path: "m/44'/60'/0'/0/1",
    }).toLowerCase(),
  ).toBe('0x70997970c51812dc3a010c7d01b50e0d17dc79c8')
  expect(
    deriveAddressAtPath({
      mnemonic,
      path: "m/44'/60'/1'/0/0",
    }).toLowerCase(),
  ).toBe('0x8c8d35429f74ec245f8ef2f4fd1e551cff97d650')
}, 60_000)

test('passphrase changes the derivation deterministically', () => {
  const options = { mnemonic, passphrase: 'passphrase' }
  const address = deriveAddressWithPassphrase(options)
  expect(address.toLowerCase()).toBe(
    '0xd12896f31c1208de9cf8e7aad11c079fe97c43b0',
  )
  expect(deriveAddressWithPassphrase(options)).toBe(address)
  expect(address.toLowerCase()).not.toBe(
    deriveAddress({ addressIndex: 0, mnemonic }).toLowerCase(),
  )
}, 60_000)
