import { expect, test } from 'vitest'

import { accounts, typedData } from '~test/src/constants.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { parseGwei } from '../../utils/unit/parseGwei.js'

import type { Hex } from '~viem/types/misc.js'
import { toSmartAccount } from './toSmartAccount.js'

test('default', () => {
  expect(
    toSmartAccount({
      address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      sign: async (payload: Hex) => {
        return payload
      },
    }),
  ).toMatchInlineSnapshot(`
    {
      "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      "signMessage": [Function],
      "signTransaction": [Function],
      "signTypedData": [Function],
      "source": "zkSyncSmartAccount",
      "type": "local",
      "walletAccount": undefined,
    }
  `)
})

test('default with wallet account', () => {
  expect(
    toSmartAccount({
      address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      account: accounts[0].address,
      sign: async (payload: Hex) => {
        return payload
      },
    }),
  ).toMatchInlineSnapshot(`
      {
        "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "signMessage": [Function],
        "signTransaction": [Function],
        "signTypedData": [Function],
        "source": "zkSyncSmartAccount",
        "type": "local",
        "walletAccount": {
          "address": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
          "type": "json-rpc",
        },
      }
    `)
})

test('sign message', async () => {
  const account = toSmartAccount({
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    sign: async (payload: Hex) => {
      return payload
    },
  })
  expect(
    await account.signMessage({ message: 'hello world' }),
  ).toMatchInlineSnapshot(
    '"0xd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68"',
  )
})

test('sign transaction', async () => {
  const account = toSmartAccount({
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    sign: async (payload: Hex) => {
      return payload
    },
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
    '"0x08059bbab056b980ba0348cfea57f26cf5f75ac9d3a503dd148620511a80b482"',
  )
})

test('sign typed data', async () => {
  const account = toSmartAccount({
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    sign: async (payload: Hex) => {
      return payload
    },
  })
  expect(
    await account.signTypedData({ ...typedData.basic, primaryType: 'Mail' }),
  ).toMatchInlineSnapshot(
    '"0x448f54762ef8ecccdc4d19bb7d467161383cd4b271617a8cee05c790eb745d74"',
  )
})
