import { describe, expect, test } from 'vitest'
import { accounts } from '~test/src/constants.js'

import { http } from '../../../clients/transports/http.js'
import { privateKeyToAccount } from '~viem/accounts/privateKeyToAccount.js'
import { createWalletClient } from '~viem/index.js'
import { zkSyncTestnet } from '../chains.js'
import { eip712Actions } from './eip712.js'
import { greeterContract } from '~test/src/abis.js'
import { simulateContract } from '~viem/actions/index.js'
import { publicClient } from '~test/src/utils.js'

const zkSyncClient = createWalletClient({
  chain: zkSyncTestnet,
  transport: http(zkSyncTestnet.rpcUrls.default.http), //does not work on anvil
}).extend(eip712Actions())

test('default', async () => {
  expect(eip712Actions()(zkSyncClient)).toMatchInlineSnapshot(`
  {
    "prepareEip712TransactionRequest": [Function],
    "sendEip712Transaction": [Function],
    "signEip712Transaction": [Function],
    "writeEip712Contract": [Function],
  }
  `)
})

const base = {
  chain: zkSyncTestnet,
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
}

describe('smoke test', () => {
  test('prepareEip712TransactionRequest', async () => {
    const request = await zkSyncClient.prepareEip712TransactionRequest(base)
    expect(request).toBeDefined()
  }),
  test('sendEip712Transaction', async () => {
    const request = await zkSyncClient.sendEip712Transaction(base)
    expect(request).toBeDefined()
  }),
  test('signEip712Transaction', async () => {
    const signature = await zkSyncClient.signEip712Transaction({
        from: accounts[0].address,
        ...base
    })
    expect(signature).toBeDefined()
  }),
  test('writeEip712Contract', async () => {
    const { request } = await simulateContract(publicClient, {
      ...greeterContract,
      account: privateKeyToAccount(accounts[0].privateKey),
      functionName: 'setGreeting',
      args: ['Viem ZkSync works!'],
      maxFeePerGas: 250000000n,
      maxPriorityFeePerGas: 0n,
      paymaster: '0xFD9aE5ebB0F6656f4b77a0E99dCbc5138d54b0BA',
      paymasterInput:
        '0x8c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
      type: 'eip712',
      gasPerPubdata: 50000,
    })
    expect(await zkSyncClient.writeEip712Contract(request)).toBeDefined()
  })
})
