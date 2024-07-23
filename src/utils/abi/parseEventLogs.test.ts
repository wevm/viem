import { expect, test } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { getLogs } from '../../actions/public/getLogs.js'

import { parseEventLogs } from './parseEventLogs.js'

const client = anvilMainnet.getClient()

const abi = [
  {
    name: 'Transfer',
    type: 'event',
    inputs: [
      {
        indexed: true,
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
  },
  {
    type: 'event',
    name: 'Approval',
    inputs: [
      {
        indexed: true,
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
  },
] as const

test('default', async () => {
  const logs = await getLogs(client, {
    fromBlock: anvilMainnet.forkBlockNumber - 5n,
    toBlock: anvilMainnet.forkBlockNumber,
  })

  const parsedLogs = parseEventLogs({
    abi,
    logs,
  })
  expect(parsedLogs.length).toBe(1135)
  expect(parsedLogs[0]).toMatchInlineSnapshot(`
    {
      "address": "0xc56c7a0eaa804f854b536a5f3d5f49d2ec4b12b8",
      "args": {
        "from": "0x9F1fdAb6458c5fc642fa0F4C5af7473C46837357",
        "to": "0x2aEEe741fa1e21120a21E57Db9ee545428E683C9",
        "value": 17991444454902871n,
      },
      "blockHash": "0xc350d807505fb835650f0013632c5515592987ba169bbc6626d9fc54d91f0f0b",
      "blockNumber": 19868015n,
      "data": "0x000000000000000000000000000000000000000000000000003feb1f97bb0c57",
      "eventName": "Transfer",
      "logIndex": 1,
      "removed": false,
      "topics": [
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
        "0x0000000000000000000000009f1fdab6458c5fc642fa0f4c5af7473c46837357",
        "0x0000000000000000000000002aeee741fa1e21120a21e57db9ee545428e683c9",
      ],
      "transactionHash": "0xcdd096880f66c302c214338b8f860f39757aa10bc5f14561b21a42be88ef3f6a",
      "transactionIndex": 0,
    }
  `)
})

test('args: eventName', async () => {
  const logs = await getLogs(client, {
    fromBlock: anvilMainnet.forkBlockNumber - 5n,
    toBlock: anvilMainnet.forkBlockNumber,
  })

  const transferLogs = parseEventLogs({
    abi,
    eventName: 'Transfer',
    logs,
  })
  expect(transferLogs.length).toBe(958)
  expect(transferLogs[0]).toMatchInlineSnapshot(`
    {
      "address": "0xc56c7a0eaa804f854b536a5f3d5f49d2ec4b12b8",
      "args": {
        "from": "0x9F1fdAb6458c5fc642fa0F4C5af7473C46837357",
        "to": "0x2aEEe741fa1e21120a21E57Db9ee545428E683C9",
        "value": 17991444454902871n,
      },
      "blockHash": "0xc350d807505fb835650f0013632c5515592987ba169bbc6626d9fc54d91f0f0b",
      "blockNumber": 19868015n,
      "data": "0x000000000000000000000000000000000000000000000000003feb1f97bb0c57",
      "eventName": "Transfer",
      "logIndex": 1,
      "removed": false,
      "topics": [
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
        "0x0000000000000000000000009f1fdab6458c5fc642fa0f4c5af7473c46837357",
        "0x0000000000000000000000002aeee741fa1e21120a21e57db9ee545428e683c9",
      ],
      "transactionHash": "0xcdd096880f66c302c214338b8f860f39757aa10bc5f14561b21a42be88ef3f6a",
      "transactionIndex": 0,
    }
  `)

  const approvalLogs = parseEventLogs({
    abi,
    eventName: 'Approval',
    logs,
  })
  expect(approvalLogs.length).toBe(177)
  expect(approvalLogs[0]).toMatchInlineSnapshot(`
    {
      "address": "0xc56c7a0eaa804f854b536a5f3d5f49d2ec4b12b8",
      "args": {
        "owner": "0x9F1fdAb6458c5fc642fa0F4C5af7473C46837357",
        "spender": "0x40aA958dd87FC8305b97f2BA922CDdCa374bcD7f",
        "value": 115792089237316195423570985008687907853269984665640564039457566016468674737064n,
      },
      "blockHash": "0xc350d807505fb835650f0013632c5515592987ba169bbc6626d9fc54d91f0f0b",
      "blockNumber": 19868015n,
      "data": "0xffffffffffffffffffffffffffffffffffffffffffffffffffc014e06844f3a8",
      "eventName": "Approval",
      "logIndex": 2,
      "removed": false,
      "topics": [
        "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
        "0x0000000000000000000000009f1fdab6458c5fc642fa0f4c5af7473c46837357",
        "0x00000000000000000000000040aa958dd87fc8305b97f2ba922cddca374bcd7f",
      ],
      "transactionHash": "0xcdd096880f66c302c214338b8f860f39757aa10bc5f14561b21a42be88ef3f6a",
      "transactionIndex": 0,
    }
  `)

  const contractLogs = parseEventLogs({
    abi,
    eventName: ['Approval', 'Transfer'],
    logs,
  })
  expect(contractLogs.length).toBe(1135)
  expect(contractLogs[0]).toMatchInlineSnapshot(`
    {
      "address": "0xc56c7a0eaa804f854b536a5f3d5f49d2ec4b12b8",
      "args": {
        "from": "0x9F1fdAb6458c5fc642fa0F4C5af7473C46837357",
        "to": "0x2aEEe741fa1e21120a21E57Db9ee545428E683C9",
        "value": 17991444454902871n,
      },
      "blockHash": "0xc350d807505fb835650f0013632c5515592987ba169bbc6626d9fc54d91f0f0b",
      "blockNumber": 19868015n,
      "data": "0x000000000000000000000000000000000000000000000000003feb1f97bb0c57",
      "eventName": "Transfer",
      "logIndex": 1,
      "removed": false,
      "topics": [
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
        "0x0000000000000000000000009f1fdab6458c5fc642fa0f4c5af7473c46837357",
        "0x0000000000000000000000002aeee741fa1e21120a21e57db9ee545428e683c9",
      ],
      "transactionHash": "0xcdd096880f66c302c214338b8f860f39757aa10bc5f14561b21a42be88ef3f6a",
      "transactionIndex": 0,
    }
  `)
})

test('args: strict', async () => {
  const logs = await getLogs(client, {
    fromBlock: anvilMainnet.forkBlockNumber - 5n,
    toBlock: anvilMainnet.forkBlockNumber,
  })

  const parsedLogs = parseEventLogs({
    abi,
    logs,
    strict: false,
  })
  expect(parsedLogs.length).toBe(1152)
  expect(parsedLogs[0]).toMatchInlineSnapshot(`
    {
      "address": "0xc56c7a0eaa804f854b536a5f3d5f49d2ec4b12b8",
      "args": {
        "from": "0x9F1fdAb6458c5fc642fa0F4C5af7473C46837357",
        "to": "0x2aEEe741fa1e21120a21E57Db9ee545428E683C9",
        "value": 17991444454902871n,
      },
      "blockHash": "0xc350d807505fb835650f0013632c5515592987ba169bbc6626d9fc54d91f0f0b",
      "blockNumber": 19868015n,
      "data": "0x000000000000000000000000000000000000000000000000003feb1f97bb0c57",
      "eventName": "Transfer",
      "logIndex": 1,
      "removed": false,
      "topics": [
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
        "0x0000000000000000000000009f1fdab6458c5fc642fa0f4c5af7473c46837357",
        "0x0000000000000000000000002aeee741fa1e21120a21e57db9ee545428e683c9",
      ],
      "transactionHash": "0xcdd096880f66c302c214338b8f860f39757aa10bc5f14561b21a42be88ef3f6a",
      "transactionIndex": 0,
    }
  `)
})
