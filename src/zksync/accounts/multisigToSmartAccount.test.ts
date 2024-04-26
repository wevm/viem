import { expect, test } from 'vitest'

import { accounts, typedData } from '~test/src/constants.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { parseGwei } from '../../utils/unit/parseGwei.js'
import { multisigToSmartAccount } from './multisigToSmartAccount.js'

test('default', () => {
  expect(
    multisigToSmartAccount({
      address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      secrets: [
        accounts[0].privateKey,
        '0xac1e735be8536c6534bb4f17f06f6afc73b2b5ba84ac2cfb12f7461b20c0bbe3',
      ],
    }),
  ).toMatchInlineSnapshot(`
    {
      "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      "signMessage": [Function],
      "signTransaction": [Function],
      "signTypedData": [Function],
      "source": "zkSyncSmartAccount",
      "type": "local",
    }
  `)
})

test('sign message', async () => {
  const account = multisigToSmartAccount({
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    secrets: [
      accounts[0].privateKey,
      '0xac1e735be8536c6534bb4f17f06f6afc73b2b5ba84ac2cfb12f7461b20c0bbe3',
    ],
  })
  expect(
    await account.signMessage({ message: 'hello world' }),
  ).toMatchInlineSnapshot(
    '"0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b5c090fa33eac2eb9a8a5ce42f8dce3bc694dc777e091b56bc31853e516b47b953b37448f779a459b4ed2e33fb0bb455fc7f8dc2538e1cb0f9ac9690a7c7681861c"',
  )
})

test('sign transaction', async () => {
  const account = multisigToSmartAccount({
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    secrets: [
      accounts[0].privateKey,
      '0xac1e735be8536c6534bb4f17f06f6afc73b2b5ba84ac2cfb12f7461b20c0bbe3',
    ],
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
    '"0xf40a2d2ae9638056cafbe9083c7125edc8555e0e715db0984dd859a5c6dfac5720f36fd0b32bef4d6d75c62f220e59c5fb60c244ca3b361e750985ee5c3a09311c21aa462197bb0a36f3d3dd6ccc45b600a0b22fc24ae9c06b34f67a3591314899399de0253c96daee4cf42853cf9f2f1eabf57199db02659a63809cc66279b2c91c"',
  )
})

test('sign typed data', async () => {
  const account = multisigToSmartAccount({
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    secrets: [
      accounts[0].privateKey,
      '0xac1e735be8536c6534bb4f17f06f6afc73b2b5ba84ac2cfb12f7461b20c0bbe3',
    ],
  })
  expect(
    await account.signTypedData({ ...typedData.basic, primaryType: 'Mail' }),
  ).toMatchInlineSnapshot(
    '"0x32f3d5975ba38d6c2fba9b95d5cbed1febaa68003d3d588d51f2de522ad54117760cfc249470a75232552e43991f53953a3d74edf6944553c6bef2469bb9e5921b9bbae5e2a569e14abe4200e6555ec236526a6307193532e01b153201e4ccbeb2121fdf31df995a7454225619a5a976eec403d111f69479acb43b5a3013ebab231c"',
  )
})
