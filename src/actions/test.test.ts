import { describe, expect, test } from 'vp/test'

import { anvilMainnet } from '../../test/anvil.js'
import { Client, http } from 'viem'
import * as actions from 'viem/actions'

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

  test('behavior: decorates clients with test actions', async () => {
    const client = Client.create({
      chain: anvilMainnet.chain,
      transport: http(anvilMainnet.rpcUrl.http),
    })
      .extend(actions.publicActions())
      .extend(actions.testActions())

    const clientTest = client.test
    await clientTest.setBalance({ address, value: 42n })
    await clientTest.setCode({ address, bytecode: code })
    await clientTest.setNonce({ address, nonce: 42n })
    await clientTest.setStorageAt({ address, slot, value })

    const blockNumber = await client.public.getBlockNumber()
    const snapshot = await clientTest.snapshot()
    await clientTest.mine({ blocks: 1n })
    await clientTest.revert({ id: snapshot })

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
