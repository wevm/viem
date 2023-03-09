import { Wallet } from 'ethers@6'
import { expect, test } from 'vitest'
import { getAccount } from '../../utils'
import { getAccount as getEthersAccount } from '../../ethers'
import { accounts, walletClient } from '../../_test'

import { signTypedData } from './signTypedData'

test('default', async () => {
  expect(
    await signTypedData(walletClient, {
      account: getAccount(accounts[0].address),
      domain: {
        name: 'Ether Mail',
        version: '1',
        chainId: 1,
        verifyingContract: '0x0000000000000000000000000000000000000000',
      },
      types: {
        Name: [
          { name: 'first', type: 'string' },
          { name: 'last', type: 'string' },
        ],
        Person: [
          { name: 'name', type: 'Name' },
          { name: 'wallet', type: 'address' },
          { name: 'favoriteColors', type: 'string[3]' },
          { name: 'age', type: 'uint8' },
          { name: 'isCool', type: 'bool' },
        ],
        Mail: [
          { name: 'timestamp', type: 'uint256' },
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person' },
          { name: 'contents', type: 'string' },
          { name: 'hash', type: 'bytes' },
        ],
      },
      primaryType: 'Mail',
      message: {
        timestamp: 1234567890n,
        contents: 'Hello, Bob! 🖤',
        hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        from: {
          name: {
            first: 'Cow',
            last: 'Burns',
          },
          wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
          age: 69,
          favoriteColors: ['red', 'green', 'blue'],
          isCool: false,
        },
        to: {
          name: { first: 'Bob', last: 'Builder' },
          wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
          age: 70,
          favoriteColors: ['orange', 'yellow', 'green'],
          isCool: true,
        },
      },
    }),
  ).toMatchInlineSnapshot(
    '"0x263274fc42837c45e9f6f82f5a448bfa08cef5b1a3922446146fd9028246333416d0d46f31a9003c09dc9333a63f1f788016ce4321099493b248112d2938d23f1b"',
  )
})

test('args: without domain', async () => {
  expect(
    await signTypedData(walletClient, {
      account: getAccount(accounts[0].address),
      types: {
        Name: [
          { name: 'first', type: 'string' },
          { name: 'last', type: 'string' },
        ],
        Person: [
          { name: 'name', type: 'Name' },
          { name: 'wallet', type: 'address' },
          { name: 'favoriteColors', type: 'string[3]' },
          { name: 'age', type: 'uint8' },
          { name: 'isCool', type: 'bool' },
        ],
        Mail: [
          { name: 'timestamp', type: 'uint256' },
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person' },
          { name: 'contents', type: 'string' },
          { name: 'hash', type: 'bytes' },
        ],
      },
      primaryType: 'Mail',
      message: {
        timestamp: 1234567890n,
        contents: 'Hello, Bob!',
        hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        from: {
          name: {
            first: 'Cow',
            last: 'Burns',
          },
          wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
          age: 69,
          favoriteColors: ['red', 'green', 'blue'],
          isCool: false,
        },
        to: {
          name: { first: 'Bob', last: 'Builder' },
          wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
          age: 70,
          favoriteColors: ['orange', 'yellow', 'green'],
          isCool: true,
        },
      },
    }),
  ).toMatchInlineSnapshot(
    '"0x69d04f4b8fcec9e4fee45a3dee818eeb8f5c40eddca7463d1bc503a151043b0b1f2166c324a010d44b4da753cc61ad07be3f0d126854aba880e9d3ba1305b4ed1b"',
  )
})

test('local account', async () => {
  const wallet = new Wallet(accounts[0].privateKey)
  const account = getEthersAccount(wallet)
  expect(
    await signTypedData(walletClient, {
      account,
      domain: {
        name: 'Ether Mail',
        version: '1',
        chainId: 1,
        verifyingContract: '0x0000000000000000000000000000000000000000',
      },
      types: {
        Name: [
          { name: 'first', type: 'string' },
          { name: 'last', type: 'string' },
        ],
        Person: [
          { name: 'name', type: 'Name' },
          { name: 'wallet', type: 'address' },
          { name: 'favoriteColors', type: 'string[3]' },
          { name: 'age', type: 'uint8' },
          { name: 'isCool', type: 'bool' },
        ],
        Mail: [
          { name: 'timestamp', type: 'uint256' },
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person' },
          { name: 'contents', type: 'string' },
          { name: 'hash', type: 'bytes' },
        ],
      },
      primaryType: 'Mail',
      message: {
        timestamp: 1234567890n,
        contents: 'Hello, Bob! 🖤',
        hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        from: {
          name: {
            first: 'Cow',
            last: 'Burns',
          },
          wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
          age: 69,
          favoriteColors: ['red', 'green', 'blue'],
          isCool: false,
        },
        to: {
          name: { first: 'Bob', last: 'Builder' },
          wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
          age: 70,
          favoriteColors: ['orange', 'yellow', 'green'],
          isCool: true,
        },
      },
    }),
  ).toMatchInlineSnapshot(
    '"0x263274fc42837c45e9f6f82f5a448bfa08cef5b1a3922446146fd9028246333416d0d46f31a9003c09dc9333a63f1f788016ce4321099493b248112d2938d23f1b"',
  )
})
