import { describe, expect, test } from 'vp/test'

import * as Log from './Log.js'

const rpcLog = {
  address: '0x15d4c048f83bd7e37d49ea4c83a07267ec4203da',
  blockHash:
    '0x89644bbd5c8d682a2e9611170e6c1f02573d866d286f006cbf517eec7254ec2d',
  blockNumber: '0xe6e55f',
  blockTimestamp: '0x67fc559f',
  data: '0x0000000000000000000000000000000000000000000000000000002b3b6fb3d0',
  logIndex: '0x6c',
  removed: false,
  topics: [
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    '0x000000000000000000000000a00f99bc38b1ecda1fd70eaa1cd31d576a9f46b0',
    '0x000000000000000000000000f16e9b0d03470827a95cdfd0cb8a8a3b46969b91',
  ],
  transactionHash:
    '0xa4b1f606b66105fa45cb5db23d2f6597075701e7f0e2367f4e6a39d17a8cf98b',
  transactionIndex: '0x45',
} as const satisfies Log.Rpc

describe('Log.fromRpc', () => {
  test('behavior: formats RPC quantities', () => {
    expect(Log.fromRpc(rpcLog)).toMatchInlineSnapshot(`
      {
        "address": "0x15d4c048f83bd7e37d49ea4c83a07267ec4203da",
        "blockHash": "0x89644bbd5c8d682a2e9611170e6c1f02573d866d286f006cbf517eec7254ec2d",
        "blockNumber": 15131999n,
        "blockTimestamp": 1744590239n,
        "data": "0x0000000000000000000000000000000000000000000000000000002b3b6fb3d0",
        "logIndex": 108,
        "removed": false,
        "topics": [
          "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
          "0x000000000000000000000000a00f99bc38b1ecda1fd70eaa1cd31d576a9f46b0",
          "0x000000000000000000000000f16e9b0d03470827a95cdfd0cb8a8a3b46969b91",
        ],
        "transactionHash": "0xa4b1f606b66105fa45cb5db23d2f6597075701e7f0e2367f4e6a39d17a8cf98b",
        "transactionIndex": 69,
      }
    `)
  })

  test('behavior: keeps null block timestamp', () => {
    const log = Log.fromRpc({
      ...rpcLog,
      blockTimestamp: null,
    } as unknown as Log.Rpc<true>)

    expect(log.blockTimestamp).toBe(null)
  })

  test('behavior: keeps undefined block timestamp', () => {
    const log = Log.fromRpc({
      ...rpcLog,
      blockTimestamp: undefined,
    })

    expect(log.blockTimestamp).toBe(undefined)
  })
})

describe('Log.toRpc', () => {
  test('behavior: formats domain quantities', () => {
    expect(Log.toRpc(Log.fromRpc(rpcLog))).toMatchInlineSnapshot(`
      {
        "address": "0x15d4c048f83bd7e37d49ea4c83a07267ec4203da",
        "blockHash": "0x89644bbd5c8d682a2e9611170e6c1f02573d866d286f006cbf517eec7254ec2d",
        "blockNumber": "0xe6e55f",
        "blockTimestamp": "0x67fc559f",
        "data": "0x0000000000000000000000000000000000000000000000000000002b3b6fb3d0",
        "logIndex": "0x6c",
        "removed": false,
        "topics": [
          "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
          "0x000000000000000000000000a00f99bc38b1ecda1fd70eaa1cd31d576a9f46b0",
          "0x000000000000000000000000f16e9b0d03470827a95cdfd0cb8a8a3b46969b91",
        ],
        "transactionHash": "0xa4b1f606b66105fa45cb5db23d2f6597075701e7f0e2367f4e6a39d17a8cf98b",
        "transactionIndex": "0x45",
      }
    `)
  })

  test('behavior: keeps null block timestamp', () => {
    const log = Log.toRpc({
      ...Log.fromRpc(rpcLog),
      blockTimestamp: null,
    } as Log.Log<true>)

    expect(log.blockTimestamp).toBe(null)
  })

  test('behavior: keeps undefined block timestamp', () => {
    const log = Log.toRpc({
      ...Log.fromRpc(rpcLog),
      blockTimestamp: undefined,
    })

    expect(log.blockTimestamp).toBe(undefined)
  })
})
