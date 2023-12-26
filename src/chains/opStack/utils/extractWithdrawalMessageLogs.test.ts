import { expect, test } from 'vitest'

import { getTransactionReceipt } from '../../../actions/index.js'
import { http, createClient } from '../../../index.js'
import { baseGoerli } from '../index.js'
import { extractWithdrawalMessageLogs } from './extractWithdrawalMessageLogs.js'

const client = createClient({
  chain: baseGoerli,
  transport: http(),
})

test('default', async () => {
  const receipt = await getTransactionReceipt(client, {
    hash: '0x034c22c449b89e07c788ccbd399775c3653d62a11a988cae28e1248bc6aa2bd6',
  })
  expect(receipt).toBeDefined()

  const logs = extractWithdrawalMessageLogs(receipt)

  expect(logs).toMatchInlineSnapshot(`
    [
      {
        "address": "0x4200000000000000000000000000000000000016",
        "args": {
          "data": "0x",
          "gasLimit": 21000n,
          "nonce": 1766847064778384329583297500742918515827483896875618958121606201293272548n,
          "sender": "0x1a1E021A302C237453D3D45c7B82B19cEEB7E2e6",
          "target": "0x1a1E021A302C237453D3D45c7B82B19cEEB7E2e6",
          "value": 69n,
          "withdrawalHash": "0xc3eeba4bbe8ae9ca9e0dc27c021214057b212f32ff94c2e3f1888fa26159a5d1",
        },
        "blockHash": "0x5521c439378dfe50aaf284e4f6b6fd62c526f8a42abfa947c2875c287ab5b075",
        "blockNumber": 13528451n,
        "data": "0x000000000000000000000000000000000000000000000000000000000000004500000000000000000000000000000000000000000000000000000000000052080000000000000000000000000000000000000000000000000000000000000080c3eeba4bbe8ae9ca9e0dc27c021214057b212f32ff94c2e3f1888fa26159a5d10000000000000000000000000000000000000000000000000000000000000000",
        "eventName": "MessagePassed",
        "logIndex": 1,
        "removed": false,
        "topics": [
          "0x02a52367d10742d8032712c1bb8e0144ff1ec5ffda1ed7d70bb05a2744955054",
          "0x000100000000000000000000000000000000000000000000000000000009f5e4",
          "0x0000000000000000000000001a1e021a302c237453d3d45c7b82b19ceeb7e2e6",
          "0x0000000000000000000000001a1e021a302c237453d3d45c7b82b19ceeb7e2e6",
        ],
        "transactionHash": "0x034c22c449b89e07c788ccbd399775c3653d62a11a988cae28e1248bc6aa2bd6",
        "transactionIndex": 2,
      },
    ]
  `)
})
