import { describe, expect, test } from 'vitest'
import { avalanche } from '../../chains'
import { getAccount, parseEther } from '../../utils'
import { accounts, walletClient } from '../../_test'
import { baycContractConfig, wagmiContractConfig } from '../../_test/abis'
import { walletActions } from './wallet'

test('default', async () => {
  expect(walletActions(walletClient as any)).toMatchInlineSnapshot(`
    {
      "addChain": [Function],
      "deployContract": [Function],
      "getAddresses": [Function],
      "getChainId": [Function],
      "getPermissions": [Function],
      "requestAddresses": [Function],
      "requestPermissions": [Function],
      "sendTransaction": [Function],
      "signMessage": [Function],
      "signTypedData": [Function],
      "switchChain": [Function],
      "watchAsset": [Function],
      "writeContract": [Function],
    }
  `)
})

describe('smoke test', () => {
  test('addChain', async () => {
    await walletClient.addChain({ chain: avalanche })
  })

  test('deployContract', async () => {
    expect(
      await walletClient.deployContract({
        ...baycContractConfig,
        args: ['Bored Ape Wagmi Club', 'BAYC', 69420n, 0n],
        account: getAccount(accounts[0].address),
      }),
    ).toBeDefined()
  })

  test('getAddresses', async () => {
    expect(await walletClient.getAddresses()).toBeDefined()
  })

  test('getPermissions', async () => {
    expect(await walletClient.getPermissions()).toBeDefined()
  })

  test('requestAddresses', async () => {
    expect(await walletClient.requestAddresses()).toBeDefined()
  })

  test('requestPermissions', async () => {
    expect(
      await walletClient.requestPermissions({ eth_accounts: {} }),
    ).toBeDefined()
  })

  test('sendTransaction', async () => {
    expect(
      await walletClient.sendTransaction({
        account: getAccount(accounts[6].address),
        to: accounts[7].address,
        value: parseEther('1'),
      }),
    ).toBeDefined()
  })

  test('signMessage', async () => {
    expect(
      await walletClient.signMessage({
        account: getAccount(accounts[0].address),
        data: '0xdeadbeaf',
      }),
    ).toBeDefined()
  })

  test('signTypedData', async () => {
    expect(
      await walletClient.signTypedData({
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
    ).toBeDefined()
  })

  test('switchChain', async () => {
    await walletClient.switchChain({ id: avalanche.id })
  })

  test('watchAsset', async () => {
    expect(
      await walletClient.watchAsset({
        type: 'ERC20',
        options: {
          address: '0xb60e8dd61c5d32be8058bb8eb970870f07233155',
          symbol: 'FOO',
          decimals: 18,
          image: 'https://foo.io/token-image.svg',
        },
      }),
    ).toBeTruthy()
  })

  test('writeContract', async () => {
    expect(
      await walletClient.writeContract({
        ...wagmiContractConfig,
        account: getAccount(accounts[0].address),
        functionName: 'mint',
      }),
    ).toBeTruthy()
  })
})
