import { describe, expect, test } from 'vitest'

import { baycContractConfig, wagmiContractConfig } from '~test/src/abis.js'
import { accounts } from '~test/src/constants.js'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { avalanche } from '../../chains/index.js'
import { parseEther } from '../../utils/unit/parseEther.js'

import { walletActions } from './wallet.js'

const walletClient = anvilMainnet.getClient().extend(walletActions)
const walletClientWithAccount = anvilMainnet
  .getClient({ account: true })
  .extend(walletActions)

test('default', async () => {
  expect(walletActions(walletClient as any)).toMatchInlineSnapshot(`
    {
      "addChain": [Function],
      "deployContract": [Function],
      "getAddresses": [Function],
      "getChainId": [Function],
      "getPermissions": [Function],
      "prepareTransactionRequest": [Function],
      "requestAddresses": [Function],
      "requestPermissions": [Function],
      "sendRawTransaction": [Function],
      "sendTransaction": [Function],
      "signMessage": [Function],
      "signTransaction": [Function],
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
        account: accounts[0].address,
      }),
    ).toBeDefined()
  })

  test('deployContract (inferred account)', async () => {
    expect(
      await walletClientWithAccount.deployContract({
        ...baycContractConfig,
        args: ['Bored Ape Wagmi Club', 'BAYC', 69420n, 0n],
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

  test('prepareTransactionRequest', async () => {
    expect(
      await walletClient.prepareTransactionRequest({
        account: accounts[6].address,
        to: accounts[7].address,
        value: parseEther('1'),
      }),
    ).toBeDefined()
  })

  test('prepareTransactionRequest (inferred account)', async () => {
    expect(
      await walletClientWithAccount.prepareTransactionRequest({
        to: accounts[7].address,
        value: parseEther('1'),
      }),
    ).toBeDefined()
  })

  test('sendRawTransaction', async () => {
    const request = await walletClient.prepareTransactionRequest({
      account: privateKeyToAccount(accounts[0].privateKey),
      to: accounts[1].address,
      value: parseEther('1'),
    })
    const serializedTransaction = await walletClient.signTransaction(request)
    expect(
      await walletClient.sendRawTransaction({
        serializedTransaction,
      }),
    ).toBeDefined()
  })

  test('sendTransaction', async () => {
    expect(
      await walletClient.sendTransaction({
        account: accounts[6].address,
        to: accounts[7].address,
        value: parseEther('1'),
      }),
    ).toBeDefined()
  })

  test('sendTransaction (inferred account)', async () => {
    expect(
      await walletClientWithAccount.sendTransaction({
        to: accounts[7].address,
        value: parseEther('1'),
      }),
    ).toBeDefined()
  })

  test('signMessage', async () => {
    expect(
      await walletClient.signMessage({
        account: accounts[0].address,
        message: '0xdeadbeaf',
      }),
    ).toBeDefined()
  })

  test('signMessage (inferred account)', async () => {
    expect(
      await walletClientWithAccount.signMessage({
        message: '0xdeadbeaf',
      }),
    ).toBeDefined()
  })

  test('signTransaction', async () => {
    const request = await walletClient.prepareTransactionRequest({
      account: privateKeyToAccount(accounts[0].privateKey),
      to: accounts[1].address,
      value: parseEther('1'),
    })
    expect(await walletClient.signTransaction(request)).toBeDefined()
  })

  test('signTypedData', async () => {
    expect(
      await walletClient.signTypedData({
        account: accounts[0].address,
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

  test('signTypedData (inferred account)', async () => {
    expect(
      await walletClientWithAccount.signTypedData({
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
        account: accounts[0].address,
        functionName: 'mint',
      }),
    ).toBeTruthy()
  })

  test('writeContract (inferred account)', async () => {
    expect(
      await walletClientWithAccount.writeContract({
        ...wagmiContractConfig,
        functionName: 'mint',
      }),
    ).toBeTruthy()
  })
})
