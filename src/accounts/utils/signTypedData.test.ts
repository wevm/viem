import { expect, test } from 'vitest'

import { accounts, typedData } from '~test/src/constants.js'

import { verifyTypedData } from '../../utils/index.js'
import { signTypedData } from './signTypedData.js'

test('default', async () => {
  const signature = await signTypedData({
    ...typedData.basic,
    primaryType: 'Mail',
    privateKey: accounts[0].privateKey,
  })
  expect(
    await verifyTypedData({
      ...typedData.basic,
      address: accounts[0].address,
      primaryType: 'Mail',
      signature,
    }),
  ).toBe(true)
})

test('minimal', async () => {
  const signature = await signTypedData({
    types: {
      EIP712Domain: [],
    },
    primaryType: 'EIP712Domain',
    domain: {},
    privateKey: accounts[0].privateKey,
  })
  expect(
    await verifyTypedData({
      types: {
        EIP712Domain: [],
      },
      primaryType: 'EIP712Domain',
      domain: {},
      address: accounts[0].address,
      signature,
    }),
  ).toBe(true)
})

test('complex', async () => {
  const signature = await signTypedData({
    ...typedData.complex,
    primaryType: 'Mail',
    privateKey: accounts[0].privateKey,
  })
  expect(
    await verifyTypedData({
      ...typedData.complex,
      address: accounts[0].address,
      primaryType: 'Mail',
      signature,
    }),
  ).toBe(true)
})

test('domain: empty', async () => {
  {
    const signature = await signTypedData({
      ...typedData.complex,
      domain: undefined,
      primaryType: 'Mail',
      privateKey: accounts[0].privateKey,
    })
    expect(
      await verifyTypedData({
        ...typedData.complex,
        domain: undefined,
        address: accounts[0].address,
        primaryType: 'Mail',
        signature,
      }),
    ).toBe(true)
  }

  {
    const signature = await signTypedData({
      ...typedData.complex,
      domain: {},
      primaryType: 'Mail',
      privateKey: accounts[0].privateKey,
    })
    expect(
      await verifyTypedData({
        ...typedData.complex,
        domain: {},
        primaryType: 'Mail',
        address: accounts[0].address,
        signature,
      }),
    ).toBe(true)
  }
})

test('domain: chainId', async () => {
  const signature = await signTypedData({
    ...typedData.complex,
    domain: {
      chainId: 1,
    },
    primaryType: 'Mail',
    privateKey: accounts[0].privateKey,
  })
  expect(
    await verifyTypedData({
      ...typedData.complex,
      domain: {
        chainId: 1,
      },
      address: accounts[0].address,
      primaryType: 'Mail',
      signature,
    }),
  ).toBe(true)
})

test('domain: name', async () => {
  const signature = await signTypedData({
    ...typedData.complex,
    domain: {
      name: 'Ether!',
    },
    primaryType: 'Mail',
    privateKey: accounts[0].privateKey,
  })
  expect(
    await verifyTypedData({
      ...typedData.complex,
      domain: {
        name: 'Ether!',
      },
      address: accounts[0].address,
      primaryType: 'Mail',
      signature,
    }),
  ).toBe(true)
})

test('domain: verifyingContract', async () => {
  const signature = await signTypedData({
    ...typedData.complex,
    domain: {
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
    },
    primaryType: 'Mail',
    privateKey: accounts[0].privateKey,
  })
  expect(
    await verifyTypedData({
      ...typedData.complex,
      domain: {
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      },
      address: accounts[0].address,
      primaryType: 'Mail',
      signature,
    }),
  ).toBe(true)
})

test('domain: salt', async () => {
  const signature = await signTypedData({
    ...typedData.complex,
    domain: {
      salt: '0x123512315aaaa1231313b1231b23b13b123aa12312211b1b1b111bbbb1affafa',
    },
    primaryType: 'Mail',
    privateKey: accounts[0].privateKey,
  })
  expect(
    await verifyTypedData({
      ...typedData.complex,
      domain: {
        salt: '0x123512315aaaa1231313b1231b23b13b123aa12312211b1b1b111bbbb1affafa',
      },
      primaryType: 'Mail',
      address: accounts[0].address,
      signature,
    }),
  ).toBe(true)
})
