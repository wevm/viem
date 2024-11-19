import { expect, test } from 'vitest'

import { accounts, typedData } from '~test/src/constants.js'

import { sign as sign_ } from '../../accounts/index.js'
import type { Hex } from '../../types/misc.js'
import { concatHex, parseEther, parseGwei } from '../../utils/index.js'
import { toSmartAccount } from './toSmartAccount.js'

async function sign({ hash }: { hash: Hex }) {
  const privateKeys = [accounts[0].privateKey, accounts[1].privateKey]
  return concatHex(
    await Promise.all(
      privateKeys.map((privateKey) => sign_({ hash, privateKey, to: 'hex' })),
    ),
  )
}

test('default', () => {
  expect(
    toSmartAccount({
      address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      sign,
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
  const account = toSmartAccount({
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    sign,
  })
  const signature = await account.sign({
    hash: '0xd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68',
  })
  expect(signature).toBeDefined()
})

test('sign message', async () => {
  const account = toSmartAccount({
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    sign,
  })
  const signature = await account.signMessage({ message: 'hello world' })
  expect(signature).toBeDefined()
})

test('sign transaction', async () => {
  const account = toSmartAccount({
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    sign,
  })
  const signature = await account.signTransaction({
    chainId: 1,
    maxFeePerGas: parseGwei('20'),
    gas: 21000n,
    to: accounts[1].address,
    value: parseEther('1'),
  })
  expect(signature).toBeDefined()
})

test('sign typed data', async () => {
  const account = toSmartAccount({
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    sign,
  })
  const signature = await account.signTypedData({
    ...typedData.basic,
    primaryType: 'Mail',
  })
  expect(signature).toBeDefined()
})
