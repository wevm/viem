import { describe, expect, test, vi } from 'vitest'

import {
  accounts,
  publicClient,
  testClient,
  walletClient,
} from '../../_test/index.js'
import {
  getBlock,
  mine,
  setBalance,
  setNextBlockBaseFeePerGas,
} from '../../actions/index.js'
import { parseEther, parseGwei } from '../index.js'
import * as publicActions from '../../actions/public/index.js'

import { defaultTip, prepareRequest } from './prepareRequest.js'
import { privateKeyToAccount } from '../../accounts/index.js'

const sourceAccount = accounts[0]
const targetAccount = accounts[1]

async function setup() {
  await setBalance(testClient, {
    address: sourceAccount.address,
    value: sourceAccount.balance,
  })
  await setBalance(testClient, {
    address: targetAccount.address,
    value: targetAccount.balance,
  })
  await setNextBlockBaseFeePerGas(testClient, {
    baseFeePerGas: parseGwei('10'),
  })
  await mine(testClient, { blocks: 1 })
}

test('defaultTip', () => expect(defaultTip).toBe(parseGwei('1.5')))

describe('prepareRequest', () => {
  test('default', async () => {
    await setup()

    const block = await getBlock(publicClient)
    const {
      maxFeePerGas,
      nonce: _nonce,
      ...rest
    } = await prepareRequest(walletClient, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      to: targetAccount.address,
      value: parseEther('1'),
    })
    expect(maxFeePerGas).toEqual(
      // 1.2x base fee + tip
      (block.baseFeePerGas! * 120n) / 100n + parseGwei('1.5'),
    )
    expect(rest).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gas": 21000n,
        "maxPriorityFeePerGas": 1500000000n,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "value": 1000000000000000000n,
      }
    `)
  })

  test('legacy fees', async () => {
    await setup()

    vi.spyOn(publicActions, 'getBlock').mockResolvedValueOnce({
      baseFeePerGas: undefined,
    } as any)

    const { nonce: _nonce, ...request } = await prepareRequest(walletClient, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      to: targetAccount.address,
      value: parseEther('1'),
    })
    expect(request).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gas": 21000n,
        "gasPrice": 11700000000n,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "value": 1000000000000000000n,
      }
    `)
  })

  test('args: chain', async () => {
    await setup()

    const {
      maxFeePerGas: _maxFeePerGas,
      nonce: _nonce,
      ...rest
    } = await prepareRequest(walletClient, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      to: targetAccount.address,
      value: parseEther('1'),
    })
    expect(rest).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gas": 21000n,
        "maxPriorityFeePerGas": 1500000000n,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "value": 1000000000000000000n,
      }
    `)
  })

  test('args: nonce', async () => {
    await setup()

    const { maxFeePerGas: _maxFeePerGas, ...rest } = await prepareRequest(
      walletClient,
      {
        account: privateKeyToAccount(sourceAccount.privateKey),
        to: targetAccount.address,
        nonce: 5,
        value: parseEther('1'),
      },
    )
    expect(rest).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gas": 21000n,
        "maxPriorityFeePerGas": 1500000000n,
        "nonce": 5,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "value": 1000000000000000000n,
      }
    `)
  })

  test('args: gasPrice', async () => {
    await setup()

    vi.spyOn(publicActions, 'getBlock').mockResolvedValueOnce({} as any)

    const { nonce: _nonce, ...request } = await prepareRequest(walletClient, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      to: targetAccount.address,
      gasPrice: parseGwei('10'),
      value: parseEther('1'),
    })
    expect(request).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gas": 21000n,
        "gasPrice": 10000000000n,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "value": 1000000000000000000n,
      }
    `)
  })

  test('args: gasPrice (on eip1559 chain)', async () => {
    await setup()

    await expect(() =>
      prepareRequest(walletClient, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        to: targetAccount.address,
        gasPrice: parseGwei('10'),
        value: parseEther('1'),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "Chain does not support legacy \`gasPrice\`.

      Version: viem@1.0.2"
    `)
  })

  test('args: maxFeePerGas', async () => {
    await setup()

    const { nonce: _nonce, ...rest } = await prepareRequest(walletClient, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      to: targetAccount.address,
      maxFeePerGas: parseGwei('10'),
      value: parseEther('1'),
    })
    expect(rest).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gas": 21000n,
        "maxFeePerGas": 10000000000n,
        "maxPriorityFeePerGas": 1500000000n,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "value": 1000000000000000000n,
      }
    `)
  })

  test('args: maxFeePerGas (under default tip)', async () => {
    await setup()

    await expect(() =>
      prepareRequest(walletClient, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        to: targetAccount.address,
        maxFeePerGas: parseGwei('1'),
        value: parseEther('1'),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "\`maxFeePerGas\` cannot be less than the default \`maxPriorityFeePerGas\` (1.5 gwei).

      Version: viem@1.0.2"
    `)
  })

  test('args: maxFeePerGas (on legacy)', async () => {
    await setup()

    vi.spyOn(publicActions, 'getBlock').mockResolvedValueOnce({
      baseFeePerGas: undefined,
    } as any)

    await expect(() =>
      prepareRequest(walletClient, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        to: targetAccount.address,
        maxFeePerGas: parseGwei('10'),
        value: parseEther('1'),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "Chain does not support EIP-1559 fees.

      Version: viem@1.0.2"
    `)
  })

  test('args: maxPriorityFeePerGas', async () => {
    await setup()

    const { nonce: _nonce, ...rest } = await prepareRequest(walletClient, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      to: targetAccount.address,
      maxPriorityFeePerGas: parseGwei('5'),
      value: parseEther('1'),
    })
    expect(rest).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gas": 21000n,
        "maxFeePerGas": 17000000000n,
        "maxPriorityFeePerGas": 5000000000n,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "value": 1000000000000000000n,
      }
    `)
  })

  test('args: maxPriorityFeePerGas (on legacy)', async () => {
    await setup()

    vi.spyOn(publicActions, 'getBlock').mockResolvedValueOnce({
      baseFeePerGas: undefined,
    } as any)

    await expect(() =>
      prepareRequest(walletClient, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        to: targetAccount.address,
        maxFeePerGas: parseGwei('5'),
        value: parseEther('1'),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "Chain does not support EIP-1559 fees.

      Version: viem@1.0.2"
    `)
  })

  test('args: maxFeePerGas + maxPriorityFeePerGas', async () => {
    await setup()

    const { nonce: _nonce, ...rest } = await prepareRequest(walletClient, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      to: targetAccount.address,
      maxFeePerGas: parseGwei('10'),
      maxPriorityFeePerGas: parseGwei('5'),
      value: parseEther('1'),
    })
    expect(rest).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gas": 21000n,
        "maxFeePerGas": 10000000000n,
        "maxPriorityFeePerGas": 5000000000n,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "value": 1000000000000000000n,
      }
    `)
  })

  test('no account', async () => {
    await setup()

    await expect(() =>
      prepareRequest(walletClient, {
        // @ts-expect-error
        to: targetAccount.address,
        value: parseEther('1'),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "Could not find an Account to execute with this Action.
      Please provide an Account with the \`account\` argument on the Action, or by supplying an \`account\` to the WalletClient.

      Version: viem@1.0.2"
    `)
  })
})
