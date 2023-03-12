import { describe, expect, test, vi } from 'vitest'

import { accounts, publicClient, testClient, walletClient } from '../../_test'
import {
  getBlock,
  mine,
  setBalance,
  setNextBlockBaseFeePerGas,
} from '../../actions'
import { parseEther, parseGwei } from '../../utils'
import * as publicActions from '../../actions/public'

import { defaultTip, prepareRequest } from './prepareRequest'
import { getLocalAccount } from '../../_test/utils'

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
      account: getLocalAccount(sourceAccount.privateKey),
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
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
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
      account: getLocalAccount(sourceAccount.privateKey),
      to: targetAccount.address,
      value: parseEther('1'),
    })
    expect(request).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
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
      account: getLocalAccount(sourceAccount.privateKey),
      to: targetAccount.address,
      value: parseEther('1'),
    })
    expect(rest).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
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
        account: getLocalAccount(sourceAccount.privateKey),
        to: targetAccount.address,
        nonce: 5,
        value: parseEther('1'),
      },
    )
    expect(rest).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
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
      account: getLocalAccount(sourceAccount.privateKey),
      to: targetAccount.address,
      gasPrice: parseGwei('10'),
      value: parseEther('1'),
    })
    expect(request).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
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
        account: getLocalAccount(sourceAccount.privateKey),
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
      account: getLocalAccount(sourceAccount.privateKey),
      to: targetAccount.address,
      maxFeePerGas: parseGwei('10'),
      value: parseEther('1'),
    })
    expect(rest).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
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
        account: getLocalAccount(sourceAccount.privateKey),
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
        account: getLocalAccount(sourceAccount.privateKey),
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
      account: getLocalAccount(sourceAccount.privateKey),
      to: targetAccount.address,
      maxPriorityFeePerGas: parseGwei('5'),
      value: parseEther('1'),
    })
    expect(rest).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
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
        account: getLocalAccount(sourceAccount.privateKey),
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
      account: getLocalAccount(sourceAccount.privateKey),
      to: targetAccount.address,
      maxFeePerGas: parseGwei('10'),
      maxPriorityFeePerGas: parseGwei('5'),
      value: parseEther('1'),
    })
    expect(rest).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
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
})
