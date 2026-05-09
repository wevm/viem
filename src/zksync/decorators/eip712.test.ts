import { expect, test } from 'vitest'

import { greeterContract } from '~test/abis.js'
import { anvilZksync } from '~test/anvil.js'
import { accounts } from '~test/constants.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { simulateContract } from '../../actions/index.js'
import type { EIP1193RequestFn } from '../../types/eip1193.js'
import { eip712WalletActions } from './eip712.js'

const client = anvilZksync.getClient()
const zksyncClient = client.extend(eip712WalletActions())

const clientWithAccount = anvilZksync.getClient({ account: true })
const zksyncClientWithAccount = clientWithAccount.extend(eip712WalletActions())

test('default', async () => {
  expect(eip712WalletActions()(client)).toMatchInlineSnapshot(`
    {
      "deployContract": [Function],
      "sendTransaction": [Function],
      "signTransaction": [Function],
      "writeContract": [Function],
    }
  `)
})

test('sendTransaction', async () => {
  zksyncClient.request = (async ({ method, params }) => {
    if (method === 'eth_sendRawTransaction')
      return '0x9afe47f3d95eccfc9210851ba5f877f76d372514a26b48bad848a07f77c33b87'
    return anvilZksync.getClient().request({ method, params } as any)
  }) as EIP1193RequestFn
  const client = zksyncClient.extend(eip712WalletActions())

  const result = await client.sendTransaction({
    account: privateKeyToAccount(accounts[0].privateKey),
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    maxFeePerGas: 10000000000n,
    maxPriorityFeePerGas: 10000000000n,
    gas: 158774n,
    value: 10000000000n,
    data: '0x0',
    paymaster: '0xFD9aE5ebB0F6656f4b77a0E99dCbc5138d54b0BA',
    paymasterInput:
      '0x8c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
    type: 'eip712',
    gasPerPubdata: 50000n,
  })
  expect(result).toBeDefined()
})

test('sendTransaction with account hoisting', async () => {
  zksyncClientWithAccount.request = (async ({ method, params }) => {
    if (method === 'eth_sendRawTransaction')
      return '0x9afe47f3d95eccfc9210851ba5f877f76d372514a26b48bad848a07f77c33b87'
    if (method === 'eth_signTypedData_v4')
      return '0x71f8da808502540be4008502540be40083026c369470997970c51812dc3a010c7d01b50e0d17dc79c88502540be4000082014480808201448082c350c0b841cee039b6d00ff61277ac416a0c98d23d9bfc64e024cd3d3f946ab33cdfe4576b5e4d3bed2c0a2383a1a13f0777b46ca2c19edefb67d8d8584af7d963f5284ca81bf85b94fd9ae5ebb0f6656f4b77a0e99dcbc5138d54b0bab8448c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000'
    return anvilZksync.getClient().request({ method, params } as any)
  }) as EIP1193RequestFn
  const client = zksyncClientWithAccount.extend(eip712WalletActions())

  const result = await client.sendTransaction({
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    maxFeePerGas: 10000000000n,
    maxPriorityFeePerGas: 10000000000n,
    gas: 158774n,
    value: 10000000000n,
    data: '0x0',
    paymaster: '0xFD9aE5ebB0F6656f4b77a0E99dCbc5138d54b0BA',
    paymasterInput:
      '0x8c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
    type: 'eip712',
    gasPerPubdata: 50000n,
  })
  expect(result).toBeDefined()
})

test('signTransaction', async () => {
  const signature = await zksyncClient.signTransaction({
    account: privateKeyToAccount(accounts[0].privateKey),
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    maxFeePerGas: 10000000000n,
    maxPriorityFeePerGas: 10000000000n,
    gas: 158774n,
    value: 10000000000n,
    data: '0x0',
    paymaster: '0xFD9aE5ebB0F6656f4b77a0E99dCbc5138d54b0BA',
    paymasterInput:
      '0x8c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
    type: 'eip712',
    gasPerPubdata: 50000n,
  })
  expect(signature).toBeDefined()
})

test('signTransaction with account hoisting', async () => {
  zksyncClientWithAccount.request = (async ({ method, params }) => {
    if (method === 'eth_signTypedData_v4')
      return '0x71f8da808502540be4008502540be40083026c369470997970c51812dc3a010c7d01b50e0d17dc79c88502540be4000082014480808201448082c350c0b841cee039b6d00ff61277ac416a0c98d23d9bfc64e024cd3d3f946ab33cdfe4576b5e4d3bed2c0a2383a1a13f0777b46ca2c19edefb67d8d8584af7d963f5284ca81bf85b94fd9ae5ebb0f6656f4b77a0e99dcbc5138d54b0bab8448c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000'
    return anvilZksync
      .getClient({ account: true })
      .request({ method, params } as any)
  }) as EIP1193RequestFn
  const client = zksyncClientWithAccount.extend(eip712WalletActions())

  const signature = await client.signTransaction({
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    maxFeePerGas: 10000000000n,
    maxPriorityFeePerGas: 10000000000n,
    gas: 158774n,
    value: 10000000000n,
    data: '0x0',
    paymaster: '0xFD9aE5ebB0F6656f4b77a0E99dCbc5138d54b0BA',
    paymasterInput:
      '0x8c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
    type: 'eip712',
    gasPerPubdata: 50000n,
  })
  expect(signature).toBeDefined()
})

test('writeContract', async () => {
  zksyncClient.request = (async ({ method, params }) => {
    if (method === 'eth_sendRawTransaction')
      return '0x9afe47f3d95eccfc9210851ba5f877f76d372514a26b48bad848a07f77c33b87'
    if (method === 'eth_call') return undefined
    return anvilZksync.getClient().request({ method, params } as any)
  }) as EIP1193RequestFn
  const client = zksyncClient.extend(eip712WalletActions())

  const { request } = await simulateContract(client, {
    ...greeterContract,
    account: privateKeyToAccount(accounts[0].privateKey),
    functionName: 'setGreeting',
    args: ['Viem Zksync works!'],
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
