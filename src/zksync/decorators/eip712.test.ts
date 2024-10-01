import { expect, test } from 'vitest'

import { greeterContract } from '~test/src/abis.js'
import { accounts } from '~test/src/constants.js'
import { anvilZksync } from '../../../test/src/anvil.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { simulateContract } from '../../actions/index.js'
import type { EIP1193RequestFn } from '../../types/eip1193.js'
import { eip712WalletActions } from './eip712.js'

const client = anvilZksync.getClient()
const zksyncClient = client.extend(eip712WalletActions())

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
