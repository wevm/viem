import { describe, expect, test } from 'vitest'

import { greeterContract } from '~test/src/abis.js'
import { accounts } from '~test/src/constants.js'
import { zkSyncClient } from '~test/src/zksync.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import { simulateContract } from '../../../actions/index.js'
import type { EIP1193RequestFn } from '../../../types/eip1193.js'
import { eip712Actions } from './eip712.js'
import { publicClient } from '~test/src/utils.js'

const zkSyncClient_ = zkSyncClient.extend(eip712Actions)

test('default', async () => {
  expect(eip712Actions(zkSyncClient)).toMatchInlineSnapshot(`
    {
      "prepareTransactionRequest": [Function],
      "sendTransaction": [Function],
      "signTransaction": [Function],
      "writeContract": [Function],
    }
  `)
})

describe('Action tests', () => {
  test('prepareTransactionRequest', async () => {
    const request = await zkSyncClient_.prepareTransactionRequest({
      account: privateKeyToAccount(accounts[0].privateKey),
      to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
      maxFeePerGas: 10000000000n,
      maxPriorityFeePerGas: 10000000000n,
      gas: 158774n,
      value: 10000000000n,
      data: '0x01',
      paymaster: '0xFD9aE5ebB0F6656f4b77a0E99dCbc5138d54b0BA',
      paymasterInput:
        '0x8c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
      type: 'eip712',
      gasPerPubdata: 50000n,
    })
    expect(request).toBeDefined()
  })

  test('sendTransaction', async () => {
    zkSyncClient_.request = (async ({ method, params }) => {
      if (method === 'eth_sendRawTransaction')
        return '0x9afe47f3d95eccfc9210851ba5f877f76d372514a26b48bad848a07f77c33b87'
      return zkSyncClient.request({ method, params } as any)
    }) as EIP1193RequestFn
    const client = zkSyncClient_.extend(eip712Actions)

    const result = await client.sendTransaction({
      account: privateKeyToAccount(accounts[0].privateKey),
      to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
      maxFeePerGas: 10000000000n,
      maxPriorityFeePerGas: 10000000000n,
      gas: 158774n,
      value: 10000000000n,
      data: '0x01',
      paymaster: '0xFD9aE5ebB0F6656f4b77a0E99dCbc5138d54b0BA',
      paymasterInput:
        '0x8c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
      type: 'eip712',
      gasPerPubdata: 50000n,
    })
    expect(result).toBeDefined()
  })

  test('signTransaction', async () => {
    const signature = await zkSyncClient_.signTransaction({
      account: privateKeyToAccount(accounts[0].privateKey),
      to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
      maxFeePerGas: 10000000000n,
      maxPriorityFeePerGas: 10000000000n,
      gas: 158774n,
      value: 10000000000n,
      data: '0x01',
      paymaster: '0xFD9aE5ebB0F6656f4b77a0E99dCbc5138d54b0BA',
      paymasterInput:
        '0x8c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
      type: 'eip712',
      gasPerPubdata: 50000n,
    })
    expect(signature).toBeDefined()
  })

  test('writeContract', async () => {
    zkSyncClient_.request = (async ({ method, params }) => {
      if (method === 'eth_sendRawTransaction')
        return '0x9afe47f3d95eccfc9210851ba5f877f76d372514a26b48bad848a07f77c33b87'
      return zkSyncClient.request({ method, params } as any)
    }) as EIP1193RequestFn
    const client = zkSyncClient_.extend(eip712Actions)

    const { request } = await simulateContract(publicClient, {
      ...greeterContract,
      account: privateKeyToAccount(accounts[0].privateKey),
      functionName: 'setGreeting',
      args: ['Viem ZkSync works!'],
      maxFeePerGas: 250000000n,
      maxPriorityFeePerGas: 0n,
      gas: 158774n,
      paymaster: '0xFD9aE5ebB0F6656f4b77a0E99dCbc5138d54b0BA',
      paymasterInput:
        '0x8c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
      type: 'eip712',
      gasPerPubdata: 50000n,
    })
    const tx = await client.writeContract(request)
    expect(tx).toBeDefined()
  })
})
