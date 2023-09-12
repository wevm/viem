import { expect, test } from 'vitest'

import { accounts, typedData } from '~test/src/constants.js'

import { signTypedData } from './signTypedData.js'

test('default', async () => {
  expect(
    await signTypedData({
      ...typedData.basic,
      primaryType: 'Mail',
      privateKey: accounts[0].privateKey,
    }),
  ).toMatchInlineSnapshot(
    '"0x32f3d5975ba38d6c2fba9b95d5cbed1febaa68003d3d588d51f2de522ad54117760cfc249470a75232552e43991f53953a3d74edf6944553c6bef2469bb9e5921b"',
  )
})

test('minimal', async () => {
  expect(
    await signTypedData({
      types: {
        EIP712Domain: [],
      },
      primaryType: 'EIP712Domain',
      domain: {},
      privateKey: accounts[0].privateKey,
    }),
  ).toEqual(
    '0xda87197eb020923476a6d0149ca90bc1c894251cc30b38e0dd2cdd48567e12386d3ed40a509397410a4fd2d66e1300a39ac42f828f8a5a2cb948b35c22cf29e81c',
  )
})

test('complex', async () => {
  expect(
    await signTypedData({
      ...typedData.complex,
      primaryType: 'Mail',
      privateKey: accounts[0].privateKey,
    }),
  ).toEqual(
    '0xc4d8bcda762d35ea79d9542b23200f46c2c1899db15bf929bbacaf609581db0831538374a01206517edd934e474212a0f1e2d62e9a01cd64f1cf94ea2e0988491c',
  )
})

test('domain: empty', async () => {
  expect(
    await signTypedData({
      ...typedData.complex,
      domain: undefined,
      primaryType: 'Mail',
      privateKey: accounts[0].privateKey,
    }),
  ).toMatchInlineSnapshot(
    '"0x47d36c0110609e0c61169b221edfcd988455a67a0af965285c9c32bcc5df791f180b8e9a539e6a12e7af164f1de5879b09e4c1ef3032980bc7aea167198255eb1c"',
  )

  expect(
    await signTypedData({
      ...typedData.complex,
      domain: {},
      primaryType: 'Mail',
      privateKey: accounts[0].privateKey,
    }),
  ).toMatchInlineSnapshot(
    '"0x47d36c0110609e0c61169b221edfcd988455a67a0af965285c9c32bcc5df791f180b8e9a539e6a12e7af164f1de5879b09e4c1ef3032980bc7aea167198255eb1c"',
  )
})

test('domain: chainId', async () => {
  expect(
    await signTypedData({
      ...typedData.complex,
      domain: {
        chainId: 1,
      },
      primaryType: 'Mail',
      privateKey: accounts[0].privateKey,
    }),
  ).toMatchInlineSnapshot(
    '"0x6e100a352ec6ad1b70802290e18aeed190704973570f3b8ed42cb9808e2ea6bf4a90a229a244495b41890987806fcbd2d5d23fc0dbe5f5256c2613c039d76db81c"',
  )
})

test('domain: name', async () => {
  expect(
    await signTypedData({
      ...typedData.complex,
      domain: {
        name: 'Ether!',
      },
      primaryType: 'Mail',
      privateKey: accounts[0].privateKey,
    }),
  ).toMatchInlineSnapshot(
    '"0xb2b9704a23b0e5a5e728623113ab57e93a9de055b53c15d5d0f1a6485932efc503d77c0cfc2eca82cd9b4ecd2b39355457e4dd390ccb6d5c4457a2631b53baa21b"',
  )
})

test('domain: verifyingContract', async () => {
  expect(
    await signTypedData({
      ...typedData.complex,
      domain: {
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      },
      primaryType: 'Mail',
      privateKey: accounts[0].privateKey,
    }),
  ).toMatchInlineSnapshot(
    '"0xa74d8aa1ff14231fedeaf7a929e86ac55d80256bee24e1f8ebba9bd092a9351651b6669da7f5d0a7209243f8dee1026b018ed03dd5ce01b7ecb75a8880deeeb01b"',
  )
})

test('domain: salt', async () => {
  expect(
    await signTypedData({
      ...typedData.complex,
      domain: {
        salt: '0x123512315aaaa1231313b1231b23b13b123aa12312211b1b1b111bbbb1affafa',
      },
      primaryType: 'Mail',
      privateKey: accounts[0].privateKey,
    }),
  ).toMatchInlineSnapshot(
    '"0x4b193383278fd3dcaa084952ea282cb9c8889c26c6caaa3f48aca7bde78c6e72028bd98c0328e40d067dbbab53733f99f241d8cf91a32580883f65264c2b72581b"',
  )
})
