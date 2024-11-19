import { expect, test } from 'vitest'

import { accounts, typedData } from '~test/src/constants.js'
import { parseEther } from '../utils/unit/parseEther.js'
import { parseGwei } from '../utils/unit/parseGwei.js'

import { wagmiContractConfig } from '../../test/src/abis.js'
import { getAddress, verifyTypedData } from '../utils/index.js'
import { verifyMessage } from '../utils/index.js'
import { recoverTransactionAddress } from '../utils/signature/recoverTransactionAddress.js'
import { privateKeyToAccount } from './privateKeyToAccount.js'

test('default', () => {
  expect(privateKeyToAccount(accounts[0].privateKey)).toMatchInlineSnapshot(`
    {
      "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      "experimental_signAuthorization": [Function],
      "nonceManager": undefined,
      "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
      "sign": [Function],
      "signMessage": [Function],
      "signTransaction": [Function],
      "signTypedData": [Function],
      "source": "privateKey",
      "type": "local",
    }
  `)
})

test('sign', async () => {
  const account = privateKeyToAccount(accounts[0].privateKey)
  const signature = await account.sign({
    hash: '0xd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68',
  })
  expect(
    await verifyMessage({
      address: account.address,
      message: 'hello world',
      signature,
    }),
  ).toBe(true)
})

test('sign authorization', async () => {
  const account = privateKeyToAccount(accounts[0].privateKey)
  const signedAuthorization = await account.experimental_signAuthorization({
    contractAddress: wagmiContractConfig.address,
    chainId: 1,
    nonce: 0,
  })
  expect(signedAuthorization.r).toBeDefined()
  expect(signedAuthorization.s).toBeDefined()
  expect(signedAuthorization.yParity).toBeDefined()
})

test('sign message', async () => {
  const account = privateKeyToAccount(accounts[0].privateKey)
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
  const account = privateKeyToAccount(accounts[0].privateKey)
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
  const account = privateKeyToAccount(accounts[0].privateKey)
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
