import { describe, expect, test } from 'vitest'

import { accounts, typedData } from '~test/src/constants.js'
import { getAddress } from '../utils/address/getAddress.js'
import { parseEther } from '../utils/unit/parseEther.js'
import { parseGwei } from '../utils/unit/parseGwei.js'

import { mnemonicToAccount } from './mnemonicToAccount.js'

const mnemonic = 'test test test test test test test test test test test junk'

test('default', () => {
  expect(mnemonicToAccount(mnemonic)).toMatchInlineSnapshot(`
    {
      "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      "getHdKey": [Function],
      "nonceManager": undefined,
      "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
      "sign": [Function],
      "signMessage": [Function],
      "signTransaction": [Function],
      "signTypedData": [Function],
      "source": "hd",
      "type": "local",
    }
  `)
})

describe('args: addressIndex', () => {
  Array.from({ length: 10 }).forEach((_, index) => {
    test(`addressIndex: ${index}`, () => {
      const account = mnemonicToAccount(mnemonic, {
        addressIndex: index,
      })
      expect(account.address).toEqual(getAddress(accounts[index].address))
    })
  })
})

describe('args: path', () => {
  Array.from({ length: 10 }).forEach((_, index) => {
    test(`path: m/44'/60'/0'/0/${index}`, () => {
      const account = mnemonicToAccount(mnemonic, {
        path: `m/44'/60'/0'/0/${index}`,
      })
      expect(account.address).toEqual(getAddress(accounts[index].address))
    })
  })
})

test('args: accountIndex', () => {
  expect(
    mnemonicToAccount(mnemonic, { accountIndex: 1 }).address,
  ).toMatchInlineSnapshot('"0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650"')
  expect(
    mnemonicToAccount(mnemonic, { accountIndex: 2 }).address,
  ).toMatchInlineSnapshot('"0x98e503f35D0a019cB0a251aD243a4cCFCF371F46"')
  expect(
    mnemonicToAccount(mnemonic, { accountIndex: 3 }).address,
  ).toMatchInlineSnapshot('"0xCB9fA1eA9b8A3bf422a8639f23Df77ea66020eC2"')
})

test('args: changeIndex', () => {
  expect(
    mnemonicToAccount(mnemonic, { changeIndex: 1 }).address,
  ).toMatchInlineSnapshot('"0x4b39F7b0624b9dB86AD293686bc38B903142dbBc"')
  expect(
    mnemonicToAccount(mnemonic, { changeIndex: 2 }).address,
  ).toMatchInlineSnapshot('"0xe0Ff44FDb999d485DCFe6B0840f0d14EEA8a08A0"')
  expect(
    mnemonicToAccount(mnemonic, { changeIndex: 3 }).address,
  ).toMatchInlineSnapshot('"0x4E0eBc370cAdc5d152505EA4FEbcf839E7E2D3F8"')
})

test('sign message', async () => {
  const account = mnemonicToAccount(mnemonic)
  expect(
    await account.signMessage({ message: 'hello world' }),
  ).toMatchInlineSnapshot(
    '"0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b"',
  )
})

test('sign transaction', async () => {
  const account = mnemonicToAccount(mnemonic)
  expect(
    await account.signTransaction({
      chainId: 1,
      maxFeePerGas: parseGwei('20'),
      gas: 21000n,
      to: accounts[1].address,
      value: parseEther('1'),
    }),
  ).toMatchInlineSnapshot(
    '"0x02f86f0180808504a817c8008252089470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080c001a0f40a2d2ae9638056cafbe9083c7125edc8555e0e715db0984dd859a5c6dfac57a020f36fd0b32bef4d6d75c62f220e59c5fb60c244ca3b361e750985ee5c3a0931"',
  )
})

test('sign typed data', async () => {
  const account = mnemonicToAccount(mnemonic)
  expect(
    await account.signTypedData({ ...typedData.basic, primaryType: 'Mail' }),
  ).toMatchInlineSnapshot(
    '"0x32f3d5975ba38d6c2fba9b95d5cbed1febaa68003d3d588d51f2de522ad54117760cfc249470a75232552e43991f53953a3d74edf6944553c6bef2469bb9e5921b"',
  )
})
