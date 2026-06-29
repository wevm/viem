import { describe, expect, test } from 'vitest'

import { baycContractConfig, wagmiContractConfig } from '~test/abis.js'
import { anvilMainnet } from '~test/anvil.js'
import { accounts, address } from '~test/constants.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { impersonateAccount } from '../../actions/test/impersonateAccount.js'
import { mine } from '../../actions/test/mine.js'
import { setBalance } from '../../actions/test/setBalance.js'
import { avalanche } from '../../chains/index.js'
import { usdc as usdcToken } from '../../tokens/definitions/usdc.js'
import { getAddress } from '../../utils/address/getAddress.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { wait } from '../../utils/wait.js'
import { publicActions } from './public.js'
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
      "fillTransaction": [Function],
      "getAddresses": [Function],
      "getCallsStatus": [Function],
      "getCapabilities": [Function],
      "getChainId": [Function],
      "getPermissions": [Function],
      "prepareAuthorization": [Function],
      "prepareTransactionRequest": [Function],
      "requestAddresses": [Function],
      "requestPermissions": [Function],
      "sendCalls": [Function],
      "sendCallsSync": [Function],
      "sendRawTransaction": [Function],
      "sendRawTransactionSync": [Function],
      "sendTransaction": [Function],
      "sendTransactionSync": [Function],
      "showCallsStatus": [Function],
      "signAuthorization": [Function],
      "signMessage": [Function],
      "signTransaction": [Function],
      "signTypedData": [Function],
      "switchChain": [Function],
      "token": {
        "approve": [Function],
        "approveSync": [Function],
        "transfer": [Function],
        "transferSync": [Function],
      },
      "waitForCallsStatus": [Function],
      "watchAsset": [Function],
      "writeContract": [Function],
      "writeContractSync": [Function],
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

  test('sendRawTransactionSync', async () => {
    const request = await walletClient.prepareTransactionRequest({
      account: privateKeyToAccount(accounts[0].privateKey),
      to: accounts[1].address,
      value: parseEther('1'),
    })
    const serializedTransaction = await walletClient.signTransaction(request)
    const [receipt] = await Promise.all([
      walletClient.sendRawTransactionSync({
        serializedTransaction,
      }),
      (async () => {
        await wait(100)
        await mine(walletClient, { blocks: 1 })
      })(),
    ])
    expect(receipt).toBeDefined()
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

describe('token', () => {
  const client = anvilMainnet
    .getClient({ tokens: [usdcToken] })
    .extend(publicActions)
    .extend(walletActions)

  const usdc = usdcToken.addresses[anvilMainnet.chain.id]
  const holder = address.usdcHolder
  const to = accounts[1].address

  /** Mines blocks until a `*Sync` action resolves (anvil runs with `noMining`). */
  async function mined<value>(action: Promise<value>): Promise<value> {
    let settled = false
    const result = action.finally(() => {
      settled = true
    })
    while (!settled) {
      await mine(client, { blocks: 1 })
      await wait(100)
    }
    return result
  }

  test('attaches write token actions', () => {
    expect(typeof client.token.transfer).toBe('function')
    expect(typeof client.token.approve).toBe('function')
  })

  describe('token selector', () => {
    test('resolves address + decimals from a `token` name', () => {
      const call = client.token.transfer.call({
        token: 'usdc',
        to,
        amount: { formatted: '10.5' },
      })
      expect({ data: call.data, to: call.to }).toMatchInlineSnapshot(`
        {
          "data": "0xa9059cbb00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c80000000000000000000000000000000000000000000000000000000000a037a0",
          "to": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        }
      `)
    })

    test('resolves address + decimals from a `token` address', () => {
      const call = client.token.transfer.call({
        token: usdc,
        to,
        amount: { formatted: '10.5' },
      })
      expect({ data: call.data, to: call.to }).toMatchInlineSnapshot(`
        {
          "data": "0xa9059cbb00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c80000000000000000000000000000000000000000000000000000000000a037a0",
          "to": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        }
      `)
    })

    test('accepts a `token` address + explicit amount decimals', () => {
      const call = client.token.transfer.call({
        token: usdc,
        to,
        amount: { decimals: 6, formatted: '10.5' },
      })
      expect(getAddress(call.to)).toBe(usdc)
    })

    test('throws for an unknown `token` name', () => {
      expect(() =>
        client.token.transfer.call({
          // @ts-expect-error - 'dai' is not declared on mainnet
          token: 'dai',
          to,
          amount: { formatted: '1' },
        }),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: Token "dai" is not a declared ERC-20 token on the client's \`tokens\` array (with an address for the client's chain), and is not a valid address.]`,
      )
    })

    test('throws when formatted amount decimals cannot be inferred', () => {
      expect(() =>
        client.token.transfer.call({
          token: '0x0000000000000000000000000000000000000abc',
          to,
          amount: { formatted: '1' },
        }),
      ).toThrowErrorMatchingInlineSnapshot(
        `[Error: Token decimals are required. Pass \`amount.decimals\` or select a declared token.]`,
      )
    })
  })

  describe('transferSync', () => {
    test('default: transfers and returns receipt + event', async () => {
      await impersonateAccount(client, { address: holder })
      await setBalance(client, { address: holder, value: 10n ** 20n })

      const before = await client.token.getBalance({
        token: 'usdc',
        account: to,
      })
      const { receipt, value } = await mined(
        client.token.transferSync({
          account: holder,
          token: 'usdc',
          to,
          amount: { formatted: '100' },
        }),
      )

      expect(receipt.status).toMatchInlineSnapshot(`"success"`)
      expect(value).toMatchInlineSnapshot(`100000000n`)
      const after = await client.token.getBalance({
        token: 'usdc',
        account: to,
      })
      expect(after.amount - before.amount).toMatchInlineSnapshot(`100000000n`)
    })
  })

  describe('call composition', () => {
    test('.extractEvent present on write actions', () => {
      expect(typeof client.token.transfer.extractEvent).toBe('function')
      expect(typeof client.token.approve.extractEvent).toBe('function')
    })

    test('.estimateGas resolves token from chain', async () => {
      await impersonateAccount(client, { address: holder })
      await setBalance(client, { address: holder, value: 10n ** 20n })
      const gas = await client.token.transfer.estimateGas({
        account: holder,
        amount: { formatted: '1' },
        to,
        token: 'usdc',
      })
      expect(gas).toBeTypeOf('bigint')
      expect(gas).toBeGreaterThan(0n)
    })

    test('.simulate resolves token from chain', async () => {
      await impersonateAccount(client, { address: holder })
      await setBalance(client, { address: holder, value: 10n ** 20n })
      const { result, request } = await client.token.transfer.simulate({
        account: holder,
        amount: { formatted: '1' },
        to,
        token: 'usdc',
      })
      expect(result).toBe(true)
      expect(request.functionName).toBe('transfer')
    })
  })
})
