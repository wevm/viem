import { describe, expect, test } from 'vp/test'

import { anvilMainnet } from '../../test/anvil.js'
import { actions, Client, custom, http, testActions } from 'viem'

const address = '0x0000000000000000000000000000000000000101'
const code = '0x6001600055'
const slot = '0x0'
const value =
  '0x000000000000000000000000000000000000000000000000000000000000002a'

describe('test', () => {
  test('behavior: exposes action functions', () => {
    expect({
      getAutomine: typeof actions.getAutomine,
      increaseTime: typeof actions.increaseTime,
      mine: typeof actions.mine,
      removeBlockTimestampInterval: typeof actions.removeBlockTimestampInterval,
      revert: typeof actions.revert,
      setAutomine: typeof actions.setAutomine,
      setBalance: typeof actions.setBalance,
      setBlockTimestampInterval: typeof actions.setBlockTimestampInterval,
      setCode: typeof actions.setCode,
      setIntervalMining: typeof actions.setIntervalMining,
      setNextBlockTimestamp: typeof actions.setNextBlockTimestamp,
      setNonce: typeof actions.setNonce,
      setStorageAt: typeof actions.setStorageAt,
      snapshot: typeof actions.snapshot,
      testActions: typeof actions.testActions,
    }).toMatchInlineSnapshot(`
      {
        "getAutomine": "function",
        "increaseTime": "function",
        "mine": "function",
        "removeBlockTimestampInterval": "function",
        "revert": "function",
        "setAutomine": "function",
        "setBalance": "function",
        "setBlockTimestampInterval": "function",
        "setCode": "function",
        "setIntervalMining": "function",
        "setNextBlockTimestamp": "function",
        "setNonce": "function",
        "setStorageAt": "function",
        "snapshot": "function",
        "testActions": "function",
      }
    `)
  })

  test('behavior: decorator forwards every action to the configured mode', async () => {
    const requests: { method: string; params?: unknown | undefined }[] = []
    const client = Client.create({
      transport: custom({
        async request(options) {
          requests.push(options)
          if (options.method === 'evm_increaseTime') return '0x1'
          if (options.method === 'hardhat_getAutomine') return true
          if (options.method === 'evm_snapshot') return '0x1'
          return undefined
        },
      }),
    }).extend(testActions({ mode: 'hardhat' }))
    const decorAddress = '0x0000000000000000000000000000000000000301'

    await client.test.getAutomine()
    await client.test.increaseTime({ seconds: 1n })
    await client.test.mine({ blocks: 1n })
    await client.test.removeBlockTimestampInterval()
    await client.test.revert({ id: '0x1' })
    await client.test.setAutomine(true)
    await client.test.setBalance({ address: decorAddress, value: 2n })
    await client.test.setBlockTimestampInterval({ interval: 4 })
    await client.test.setCode({ address: decorAddress, bytecode: '0x60' })
    await client.test.setIntervalMining({ interval: 5 })
    await client.test.setNextBlockTimestamp({ timestamp: 6n })
    await client.test.setNonce({ address: decorAddress, nonce: 7n })
    await client.test.setStorageAt({
      address: decorAddress,
      slot: 0n,
      value:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
    })
    await client.test.snapshot()

    expect(requests).toMatchInlineSnapshot(`
      [
        {
          "method": "hardhat_getAutomine",
        },
        {
          "method": "evm_increaseTime",
          "params": [
            "0x1",
          ],
        },
        {
          "method": "hardhat_mine",
          "params": [
            "0x1",
            "0x0",
          ],
        },
        {
          "method": "hardhat_removeBlockTimestampInterval",
        },
        {
          "method": "evm_revert",
          "params": [
            "0x1",
          ],
        },
        {
          "method": "evm_setAutomine",
          "params": [
            true,
          ],
        },
        {
          "method": "hardhat_setBalance",
          "params": [
            "0x0000000000000000000000000000000000000301",
            "0x2",
          ],
        },
        {
          "method": "hardhat_setBlockTimestampInterval",
          "params": [
            4000,
          ],
        },
        {
          "method": "hardhat_setCode",
          "params": [
            "0x0000000000000000000000000000000000000301",
            "0x60",
          ],
        },
        {
          "method": "evm_setIntervalMining",
          "params": [
            5000,
          ],
        },
        {
          "method": "evm_setNextBlockTimestamp",
          "params": [
            "0x6",
          ],
        },
        {
          "method": "hardhat_setNonce",
          "params": [
            "0x0000000000000000000000000000000000000301",
            "0x7",
          ],
        },
        {
          "method": "hardhat_setStorageAt",
          "params": [
            "0x0000000000000000000000000000000000000301",
            "0x0",
            "0x0000000000000000000000000000000000000000000000000000000000000000",
          ],
        },
        {
          "method": "evm_snapshot",
        },
      ]
    `)
  })

  test('behavior: decorates clients with test actions', async () => {
    const client = Client.create({
      chain: anvilMainnet.chain,
      transport: http(anvilMainnet.rpcUrl.http),
    })
      .extend(actions.publicActions())
      .extend(actions.testActions())

    await client.test.setBalance({ address, value: 42n })
    await client.test.setCode({ address, bytecode: code })
    await client.test.setNonce({ address, nonce: 42n })
    await client.test.setStorageAt({ address, slot, value })

    const blockNumber = await client.public.getBlockNumber()
    const snapshot = await client.test.snapshot()
    await client.test.mine({ blocks: 1n })
    await client.test.revert({ id: snapshot })

    expect({
      balance: await client.public.getBalance({ address }),
      blockNumber: typeof blockNumber,
      code: await client.public.getCode({ address }),
      storage: await client.public.getStorageAt({ address, slot }),
      transactionCount: await client.public.getTransactionCount({ address }),
      snapshot: typeof snapshot,
    }).toMatchInlineSnapshot(`
      {
        "balance": 42n,
        "blockNumber": "bigint",
        "code": "0x6001600055",
        "snapshot": "string",
        "storage": "0x000000000000000000000000000000000000000000000000000000000000002a",
        "transactionCount": 42n,
      }
    `)
  })
})
