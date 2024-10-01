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
  expect(
    await account.sign({
      hash: '0xd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68',
    }),
  ).toMatchInlineSnapshot(
    `"0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b02de21de49d98cf93ef790a262702dcc711b3f2ce0a971e3b50caea43cfc07cb34eabfd4d39eff886015fb2c42ec4265aeaf5ee34a78c75309fdc1165cb659521c"`,
  )
})

test('sign message', async () => {
  const account = toSmartAccount({
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    sign,
  })
  expect(
    await account.signMessage({ message: 'hello world' }),
  ).toMatchInlineSnapshot(
    `"0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b02de21de49d98cf93ef790a262702dcc711b3f2ce0a971e3b50caea43cfc07cb34eabfd4d39eff886015fb2c42ec4265aeaf5ee34a78c75309fdc1165cb659521c"`,
  )
})

test('sign transaction', async () => {
  const account = toSmartAccount({
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    sign,
  })
  expect(
    await account.signTransaction({
      chainId: 1,
      maxFeePerGas: parseGwei('20'),
      gas: 21000n,
      to: accounts[1].address,
      value: parseEther('1'),
    }),
  ).toMatchInlineSnapshot(
    `"0x71f8cc80808504a817c8008252089470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a7640000000180800194f39fd6e51aad88f6f4ce6ab8827279cfffb9226682c350c0b882f40a2d2ae9638056cafbe9083c7125edc8555e0e715db0984dd859a5c6dfac5720f36fd0b32bef4d6d75c62f220e59c5fb60c244ca3b361e750985ee5c3a09311c4e5f2cafb92b15ff828d4f8fb34cd3058355428586539495fd0075919cb3cd0d0d33b1e617948f2938f0be2895e4eb4a58a4bcd1a57874ed2c2d235424cf03271bc0"`,
  )
})

test('sign typed data', async () => {
  const account = toSmartAccount({
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    sign,
  })
  expect(
    await account.signTypedData({ ...typedData.basic, primaryType: 'Mail' }),
  ).toMatchInlineSnapshot(
    `"0x32f3d5975ba38d6c2fba9b95d5cbed1febaa68003d3d588d51f2de522ad54117760cfc249470a75232552e43991f53953a3d74edf6944553c6bef2469bb9e5921b7f65cd2428f35d93b843da90d299ccabe834c0068b0d4035112ad1345abf962b579854cad5911d725fc1000e6e4ebfb4c41e233f66153857b5c017cb3115879a1c"`,
  )
})
