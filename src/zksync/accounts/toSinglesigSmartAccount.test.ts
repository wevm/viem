import { expect, test } from 'vitest'

import { accounts, typedData } from '~test/src/constants.js'

import {
  parseEther,
  parseGwei,
  verifyHash,
  verifyMessage,
  verifyTypedData,
} from '../../utils/index.js'
import { toSinglesigSmartAccount } from './toSinglesigSmartAccount.js'

test('default', () => {
  expect(
    toSinglesigSmartAccount({
      address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      privateKey: accounts[0].privateKey,
    }),
  ).toMatchInlineSnapshot(`
    {
      "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      "experimental_signAuthorization": undefined,
      "nonceManager": undefined,
      "sign": [Function],
      "signMessage": [Function],
      "signTransaction": [Function],
      "signTypedData": [Function],
      "source": "smartAccountZksync",
      "type": "local",
    }
  `)
})

test('sign', async () => {
  const account = toSinglesigSmartAccount({
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    privateKey: accounts[0].privateKey,
  })
  const signature = await account.sign({
    hash: '0xd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68',
  })
  expect(
    await verifyHash({
      address: account.address,
      hash: '0xd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68',
      signature,
    }),
  ).toBe(true)
})

test('sign message', async () => {
  const account = toSinglesigSmartAccount({
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    privateKey: accounts[0].privateKey,
  })
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
  const account = toSinglesigSmartAccount({
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    privateKey: accounts[0].privateKey,
  })
  const signature = await account.signTransaction({
    chainId: 1,
    maxFeePerGas: parseGwei('20'),
    gas: 21000n,
    to: accounts[1].address,
    value: parseEther('1'),
  })
  expect(signature).toBeDefined()
  expect(signature.length).toBe(286)
})

test('sign typed data', async () => {
  const account = toSinglesigSmartAccount({
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    privateKey: accounts[0].privateKey,
  })
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
