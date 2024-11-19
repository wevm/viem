import { describe, expect, test } from 'vitest'

import { accounts, typedData } from '~test/src/constants.js'
import { getAddress } from '../utils/address/getAddress.js'
import { parseEther } from '../utils/unit/parseEther.js'
import { parseGwei } from '../utils/unit/parseGwei.js'

import { verifyMessage, verifyTypedData } from '../utils/index.js'
import { recoverTransactionAddress } from '../utils/signature/recoverTransactionAddress.js'
import { mnemonicToAccount } from './mnemonicToAccount.js'

const mnemonic = 'test test test test test test test test test test test junk'

test('default', () => {
  expect(mnemonicToAccount(mnemonic)).toMatchInlineSnapshot(`
    {
      "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      "experimental_signAuthorization": [Function],
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
  const signature = await account.signMessage({ message: 'hello world' })
  expect(
    await verifyMessage({
      address: account.address,
      message: 'hello world',
      signature,
    }),
  ).toBe(true)
})

test('sign transaction', async () => {
  const account = mnemonicToAccount(mnemonic)
  const signature = await account.signTransaction({
    chainId: 1,
    maxFeePerGas: parseGwei('20'),
    gas: 21000n,
    to: accounts[1].address,
    value: parseEther('1'),
  })
  expect(
    await recoverTransactionAddress({ serializedTransaction: signature }),
  ).toEqual(getAddress(account.address))
})

test('sign typed data', async () => {
  const account = mnemonicToAccount(mnemonic)
  const signature = await account.signTypedData({
    ...typedData.basic,
    primaryType: 'Mail',
  })
  expect(
    await verifyTypedData({
      ...typedData.basic,
      address: account.address,
      primaryType: 'Mail',
      signature,
    }),
  ).toBe(true)
})
