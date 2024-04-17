import { expect, test } from 'vitest'

import { getTransactionReceipt } from '../../actions/index.js'
import { http, createClient } from '../../index.js'
import { optimismSepolia } from '../chains.js'
import { extractWithdrawalMessageLogs } from './extractWithdrawalMessageLogs.js'

const client = createClient({
  chain: optimismSepolia,
  transport: http(),
})

test('default', async () => {
  const receipt = await getTransactionReceipt(client, {
    hash: '0x078be3962b143952b4fd8567640b14c3682b8a941000c7d92394faf0e40cb1e8',
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
          "nonce": 1766847064778384329583297500742918515827483896875618958121606201292619957n,
          "sender": "0x1a1E021A302C237453D3D45c7B82B19cEEB7E2e6",
          "target": "0x1a1E021A302C237453D3D45c7B82B19cEEB7E2e6",
          "value": 69n,
          "withdrawalHash": "0x319fb0748049a3cffd0d3dc9ab6eff9d9fe06b38157a7183180e3d190dd2825b",
        },
        "blockHash": "0xd158e5a782a17617b9ca1571ec513ba1f4d49180c91e3eed3f1f44e8ac8182df",
        "blockNumber": 5659782n,
        "data": "0x000000000000000000000000000000000000000000000000000000000000004500000000000000000000000000000000000000000000000000000000000052080000000000000000000000000000000000000000000000000000000000000080319fb0748049a3cffd0d3dc9ab6eff9d9fe06b38157a7183180e3d190dd2825b0000000000000000000000000000000000000000000000000000000000000000",
        "eventName": "MessagePassed",
        "logIndex": 0,
        "removed": false,
        "topics": [
          "0x02a52367d10742d8032712c1bb8e0144ff1ec5ffda1ed7d70bb05a2744955054",
          "0x00010000000000000000000000000000000000000000000000000000000000b5",
          "0x0000000000000000000000001a1e021a302c237453d3d45c7b82b19ceeb7e2e6",
          "0x0000000000000000000000001a1e021a302c237453d3d45c7b82b19ceeb7e2e6",
        ],
        "transactionHash": "0x078be3962b143952b4fd8567640b14c3682b8a941000c7d92394faf0e40cb1e8",
        "transactionIndex": 1,
      },
    ]
  `)
})
