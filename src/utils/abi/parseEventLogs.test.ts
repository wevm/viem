import { describe, expect, test } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { getLogs } from '../../actions/public/getLogs.js'
import type { Log } from '../../types/log.js'
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
  {
    inputs: [
      {
        indexed: true,
        name: 'message',
        type: 'string',
      },
    ],
    name: 'Foo',
    type: 'event',
  },
] as const

const abi_unnamed = [
  {
    name: 'Transfer',
    type: 'event',
    inputs: [
      {
        indexed: true,
        type: 'address',
      },
      {
        indexed: true,
        type: 'address',
      },
      {
        indexed: false,
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
        type: 'address',
      },
      {
        indexed: true,
        type: 'address',
      },
      {
        indexed: false,
        type: 'uint256',
      },
    ],
  },
  {
    inputs: [
      {
        indexed: true,
        type: 'string',
      },
    ],
    name: 'Foo',
    type: 'event',
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

describe('args: args', () => {
  const logs: Log[] = [
    {
      address: '0xc56c7a0eaa804f854b536a5f3d5f49d2ec4b12b8',
      topics: [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x0000000000000000000000009f1fdab6458c5fc642fa0f4c5af7473c46837357',
        '0x0000000000000000000000002aeee741fa1e21120a21e57db9ee545428e683c9',
      ],
      data: '0x000000000000000000000000000000000000000000000000003feb1f97bb0c57',
      blockHash:
        '0xc350d807505fb835650f0013632c5515592987ba169bbc6626d9fc54d91f0f0b',
      blockNumber: 1n,
      transactionHash:
        '0xcdd096880f66c302c214338b8f860f39757aa10bc5f14561b21a42be88ef3f6a',
      transactionIndex: 0,
      logIndex: 1,
      removed: false,
    },
    {
      address: '0xc56c7a0eaa804f854b536a5f3d5f49d2ec4b12b8',
      topics: [
        '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
        '0x0000000000000000000000009f1fdab6458c5fc642fa0f4c5af7473c46837357',
        '0x00000000000000000000000040aa958dd87fc8305b97f2ba922cddca374bcd7f',
      ],
      data: '0xffffffffffffffffffffffffffffffffffffffffffffffffffc014e06844f3a8',
      blockHash:
        '0xc350d807505fb835650f0013632c5515592987ba169bbc6626d9fc54d91f0f0b',
      blockNumber: 2n,
      transactionHash:
        '0xcdd096880f66c302c214338b8f860f39757aa10bc5f14561b21a42be88ef3f6a',
      transactionIndex: 0,
      logIndex: 2,
      removed: false,
    },
    {
      address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      topics: [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x0000000000000000000000002aeee741fa1e21120a21e57db9ee545428e683c9',
        '0x000000000000000000000000f3de3c0d654fda23dad170f0f320a92172509127',
      ],
      data: '0x000000000000000000000000000000000000000000000000018197f25ac80581',
      blockHash:
        '0xc350d807505fb835650f0013632c5515592987ba169bbc6626d9fc54d91f0f0b',
      blockNumber: 3n,
      transactionHash:
        '0xcdd096880f66c302c214338b8f860f39757aa10bc5f14561b21a42be88ef3f6a',
      transactionIndex: 0,
      logIndex: 3,
      removed: false,
    },
    {
      address: '0xc56c7a0eaa804f854b536a5f3d5f49d2ec4b12b8',
      topics: [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x0000000000000000000000009f1fdab6458c5fc642fa0f4c5af7473c46837357',
        '0x000000000000000000000000f3de3c0d654fda23dad170f0f320a92172509127',
      ],
      data: '0x000000000000000000000000000000000000000000000000003feb1f97bb0c59',
      blockHash:
        '0xc350d807505fb835650f0013632c5515592987ba169bbc6626d9fc54d91f0f0b',
      blockNumber: 1n,
      transactionHash:
        '0xcdd096880f66c302c214338b8f860f39757aa10bc5f14561b21a42be88ef3f6a',
      transactionIndex: 0,
      logIndex: 4,
      removed: false,
    },
    {
      address: '0xc56c7a0eaa804f854b536a5f3d5f49d2ec4b12b8',
      topics: [
        '0x9f0b7f1630bdb7d474466e2dfef0fb9dff65f7a50eec83935b68f77d0808f08a',
        '0x1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8',
      ],
      data: '0x',
      blockHash:
        '0xc350d807505fb835650f0013632c5515592987ba169bbc6626d9fc54d91f0f0b',
      blockNumber: 1n,
      transactionHash:
        '0xcdd096880f66c302c214338b8f860f39757aa10bc5f14561b21a42be88ef3f6a',
      transactionIndex: 0,
      logIndex: 5,
      removed: false,
    },
  ]

  test('named: single arg', async () => {
    const parsedLogs = parseEventLogs({
      abi,
      logs,
      args: {
        from: '0x9F1fdAb6458c5fc642fa0F4C5af7473C46837357',
      },
    })
    expect(parsedLogs).toMatchInlineSnapshot(`
      [
        {
          "address": "0xc56c7a0eaa804f854b536a5f3d5f49d2ec4b12b8",
          "args": {
            "from": "0x9F1fdAb6458c5fc642fa0F4C5af7473C46837357",
            "to": "0x2aEEe741fa1e21120a21E57Db9ee545428E683C9",
            "value": 17991444454902871n,
          },
          "blockHash": "0xc350d807505fb835650f0013632c5515592987ba169bbc6626d9fc54d91f0f0b",
          "blockNumber": 1n,
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
        },
        {
          "address": "0xc56c7a0eaa804f854b536a5f3d5f49d2ec4b12b8",
          "args": {
            "from": "0x9F1fdAb6458c5fc642fa0F4C5af7473C46837357",
            "to": "0xF3dE3C0d654FDa23daD170f0f320a92172509127",
            "value": 17991444454902873n,
          },
          "blockHash": "0xc350d807505fb835650f0013632c5515592987ba169bbc6626d9fc54d91f0f0b",
          "blockNumber": 1n,
          "data": "0x000000000000000000000000000000000000000000000000003feb1f97bb0c59",
          "eventName": "Transfer",
          "logIndex": 4,
          "removed": false,
          "topics": [
            "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
            "0x0000000000000000000000009f1fdab6458c5fc642fa0f4c5af7473c46837357",
            "0x000000000000000000000000f3de3c0d654fda23dad170f0f320a92172509127",
          ],
          "transactionHash": "0xcdd096880f66c302c214338b8f860f39757aa10bc5f14561b21a42be88ef3f6a",
          "transactionIndex": 0,
        },
      ]
    `)
  })

  test('named: single arg (array)', async () => {
    const parsedLogs = parseEventLogs({
      abi,
      logs,
      args: {
        from: [
          '0x9F1fdAb6458c5fc642fa0F4C5af7473C46837357',
          '0x2aeee741fa1e21120a21e57db9ee545428e683c9',
        ],
      },
    })
    expect(parsedLogs).toMatchInlineSnapshot(`
      [
        {
          "address": "0xc56c7a0eaa804f854b536a5f3d5f49d2ec4b12b8",
          "args": {
            "from": "0x9F1fdAb6458c5fc642fa0F4C5af7473C46837357",
            "to": "0x2aEEe741fa1e21120a21E57Db9ee545428E683C9",
            "value": 17991444454902871n,
          },
          "blockHash": "0xc350d807505fb835650f0013632c5515592987ba169bbc6626d9fc54d91f0f0b",
          "blockNumber": 1n,
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
        },
        {
          "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
          "args": {
            "from": "0x2aEEe741fa1e21120a21E57Db9ee545428E683C9",
            "to": "0xF3dE3C0d654FDa23daD170f0f320a92172509127",
            "value": 108534933194540417n,
          },
          "blockHash": "0xc350d807505fb835650f0013632c5515592987ba169bbc6626d9fc54d91f0f0b",
          "blockNumber": 3n,
          "data": "0x000000000000000000000000000000000000000000000000018197f25ac80581",
          "eventName": "Transfer",
          "logIndex": 3,
          "removed": false,
          "topics": [
            "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
            "0x0000000000000000000000002aeee741fa1e21120a21e57db9ee545428e683c9",
            "0x000000000000000000000000f3de3c0d654fda23dad170f0f320a92172509127",
          ],
          "transactionHash": "0xcdd096880f66c302c214338b8f860f39757aa10bc5f14561b21a42be88ef3f6a",
          "transactionIndex": 0,
        },
        {
          "address": "0xc56c7a0eaa804f854b536a5f3d5f49d2ec4b12b8",
          "args": {
            "from": "0x9F1fdAb6458c5fc642fa0F4C5af7473C46837357",
            "to": "0xF3dE3C0d654FDa23daD170f0f320a92172509127",
            "value": 17991444454902873n,
          },
          "blockHash": "0xc350d807505fb835650f0013632c5515592987ba169bbc6626d9fc54d91f0f0b",
          "blockNumber": 1n,
          "data": "0x000000000000000000000000000000000000000000000000003feb1f97bb0c59",
          "eventName": "Transfer",
          "logIndex": 4,
          "removed": false,
          "topics": [
            "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
            "0x0000000000000000000000009f1fdab6458c5fc642fa0f4c5af7473c46837357",
            "0x000000000000000000000000f3de3c0d654fda23dad170f0f320a92172509127",
          ],
          "transactionHash": "0xcdd096880f66c302c214338b8f860f39757aa10bc5f14561b21a42be88ef3f6a",
          "transactionIndex": 0,
        },
      ]
    `)
  })

  test('named: multiple args', async () => {
    const parsedLogs = parseEventLogs({
      abi,
      logs,
      args: {
        from: '0x9F1fdAb6458c5fc642fa0F4C5af7473C46837357',
        to: '0x2aEEe741fa1e21120a21E57Db9ee545428E683C9',
      },
    })
    expect(parsedLogs).toMatchInlineSnapshot(`
      [
        {
          "address": "0xc56c7a0eaa804f854b536a5f3d5f49d2ec4b12b8",
          "args": {
            "from": "0x9F1fdAb6458c5fc642fa0F4C5af7473C46837357",
            "to": "0x2aEEe741fa1e21120a21E57Db9ee545428E683C9",
            "value": 17991444454902871n,
          },
          "blockHash": "0xc350d807505fb835650f0013632c5515592987ba169bbc6626d9fc54d91f0f0b",
          "blockNumber": 1n,
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
        },
      ]
    `)
  })

  test('named: multiple args (array)', async () => {
    const parsedLogs = parseEventLogs({
      abi,
      logs,
      args: {
        from: [
          '0x9F1fdAb6458c5fc642fa0F4C5af7473C46837357',
          '0x2aeee741fa1e21120a21e57db9ee545428e683c9',
        ],
        to: [
          '0x2aeee741fa1e21120a21e57db9ee545428e683c9',
          '0xf3de3c0d654fda23dad170f0f320a92172509127',
        ],
      },
    })
    expect(parsedLogs).toMatchInlineSnapshot(`
      [
        {
          "address": "0xc56c7a0eaa804f854b536a5f3d5f49d2ec4b12b8",
          "args": {
            "from": "0x9F1fdAb6458c5fc642fa0F4C5af7473C46837357",
            "to": "0x2aEEe741fa1e21120a21E57Db9ee545428E683C9",
            "value": 17991444454902871n,
          },
          "blockHash": "0xc350d807505fb835650f0013632c5515592987ba169bbc6626d9fc54d91f0f0b",
          "blockNumber": 1n,
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
        },
        {
          "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
          "args": {
            "from": "0x2aEEe741fa1e21120a21E57Db9ee545428E683C9",
            "to": "0xF3dE3C0d654FDa23daD170f0f320a92172509127",
            "value": 108534933194540417n,
          },
          "blockHash": "0xc350d807505fb835650f0013632c5515592987ba169bbc6626d9fc54d91f0f0b",
          "blockNumber": 3n,
          "data": "0x000000000000000000000000000000000000000000000000018197f25ac80581",
          "eventName": "Transfer",
          "logIndex": 3,
          "removed": false,
          "topics": [
            "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
            "0x0000000000000000000000002aeee741fa1e21120a21e57db9ee545428e683c9",
            "0x000000000000000000000000f3de3c0d654fda23dad170f0f320a92172509127",
          ],
          "transactionHash": "0xcdd096880f66c302c214338b8f860f39757aa10bc5f14561b21a42be88ef3f6a",
          "transactionIndex": 0,
        },
        {
          "address": "0xc56c7a0eaa804f854b536a5f3d5f49d2ec4b12b8",
          "args": {
            "from": "0x9F1fdAb6458c5fc642fa0F4C5af7473C46837357",
            "to": "0xF3dE3C0d654FDa23daD170f0f320a92172509127",
            "value": 17991444454902873n,
          },
          "blockHash": "0xc350d807505fb835650f0013632c5515592987ba169bbc6626d9fc54d91f0f0b",
          "blockNumber": 1n,
          "data": "0x000000000000000000000000000000000000000000000000003feb1f97bb0c59",
          "eventName": "Transfer",
          "logIndex": 4,
          "removed": false,
          "topics": [
            "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
            "0x0000000000000000000000009f1fdab6458c5fc642fa0f4c5af7473c46837357",
            "0x000000000000000000000000f3de3c0d654fda23dad170f0f320a92172509127",
          ],
          "transactionHash": "0xcdd096880f66c302c214338b8f860f39757aa10bc5f14561b21a42be88ef3f6a",
          "transactionIndex": 0,
        },
      ]
    `)
  })

  test('named: nullish args', async () => {
    const parsedLogs = parseEventLogs({
      abi,
      logs,
      args: {
        owner: null,
        spender: '0x40aA958dd87FC8305b97f2BA922CDdCa374bcD7f',
        value: undefined,
      },
    })
    expect(parsedLogs).toMatchInlineSnapshot(`
      [
        {
          "address": "0xc56c7a0eaa804f854b536a5f3d5f49d2ec4b12b8",
          "args": {
            "owner": "0x9F1fdAb6458c5fc642fa0F4C5af7473C46837357",
            "spender": "0x40aA958dd87FC8305b97f2BA922CDdCa374bcD7f",
            "value": 115792089237316195423570985008687907853269984665640564039457566016468674737064n,
          },
          "blockHash": "0xc350d807505fb835650f0013632c5515592987ba169bbc6626d9fc54d91f0f0b",
          "blockNumber": 2n,
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
        },
      ]
    `)
  })

  test('named: string type', async () => {
    const parsedLogs = parseEventLogs({
      abi,
      logs,
      args: {
        message: 'hello',
      },
    })
    expect(parsedLogs).toMatchInlineSnapshot(`
      [
        {
          "address": "0xc56c7a0eaa804f854b536a5f3d5f49d2ec4b12b8",
          "args": {
            "message": "0x1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8",
          },
          "blockHash": "0xc350d807505fb835650f0013632c5515592987ba169bbc6626d9fc54d91f0f0b",
          "blockNumber": 1n,
          "data": "0x",
          "eventName": "Foo",
          "logIndex": 5,
          "removed": false,
          "topics": [
            "0x9f0b7f1630bdb7d474466e2dfef0fb9dff65f7a50eec83935b68f77d0808f08a",
            "0x1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8",
          ],
          "transactionHash": "0xcdd096880f66c302c214338b8f860f39757aa10bc5f14561b21a42be88ef3f6a",
          "transactionIndex": 0,
        },
      ]
    `)
  })

  test('unnamed: single arg', async () => {
    const parsedLogs = parseEventLogs({
      abi: abi_unnamed,
      logs,
      args: ['0x9F1fdAb6458c5fc642fa0F4C5af7473C46837357'],
    })
    expect(parsedLogs).toMatchInlineSnapshot(`
      [
        {
          "address": "0xc56c7a0eaa804f854b536a5f3d5f49d2ec4b12b8",
          "args": [
            "0x9F1fdAb6458c5fc642fa0F4C5af7473C46837357",
            "0x2aEEe741fa1e21120a21E57Db9ee545428E683C9",
            17991444454902871n,
          ],
          "blockHash": "0xc350d807505fb835650f0013632c5515592987ba169bbc6626d9fc54d91f0f0b",
          "blockNumber": 1n,
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
        },
        {
          "address": "0xc56c7a0eaa804f854b536a5f3d5f49d2ec4b12b8",
          "args": [
            "0x9F1fdAb6458c5fc642fa0F4C5af7473C46837357",
            "0x40aA958dd87FC8305b97f2BA922CDdCa374bcD7f",
            115792089237316195423570985008687907853269984665640564039457566016468674737064n,
          ],
          "blockHash": "0xc350d807505fb835650f0013632c5515592987ba169bbc6626d9fc54d91f0f0b",
          "blockNumber": 2n,
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
        },
        {
          "address": "0xc56c7a0eaa804f854b536a5f3d5f49d2ec4b12b8",
          "args": [
            "0x9F1fdAb6458c5fc642fa0F4C5af7473C46837357",
            "0xF3dE3C0d654FDa23daD170f0f320a92172509127",
            17991444454902873n,
          ],
          "blockHash": "0xc350d807505fb835650f0013632c5515592987ba169bbc6626d9fc54d91f0f0b",
          "blockNumber": 1n,
          "data": "0x000000000000000000000000000000000000000000000000003feb1f97bb0c59",
          "eventName": "Transfer",
          "logIndex": 4,
          "removed": false,
          "topics": [
            "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
            "0x0000000000000000000000009f1fdab6458c5fc642fa0f4c5af7473c46837357",
            "0x000000000000000000000000f3de3c0d654fda23dad170f0f320a92172509127",
          ],
          "transactionHash": "0xcdd096880f66c302c214338b8f860f39757aa10bc5f14561b21a42be88ef3f6a",
          "transactionIndex": 0,
        },
      ]
    `)
  })

  test('unnamed: single arg (array)', async () => {
    const parsedLogs = parseEventLogs({
      abi: abi_unnamed,
      logs,
      args: [
        [
          '0x9F1fdAb6458c5fc642fa0F4C5af7473C46837357',
          '0x2aEEe741fa1e21120a21E57Db9ee545428E683C9',
        ],
      ],
    })
    expect(parsedLogs).toMatchInlineSnapshot(`
      [
        {
          "address": "0xc56c7a0eaa804f854b536a5f3d5f49d2ec4b12b8",
          "args": [
            "0x9F1fdAb6458c5fc642fa0F4C5af7473C46837357",
            "0x2aEEe741fa1e21120a21E57Db9ee545428E683C9",
            17991444454902871n,
          ],
          "blockHash": "0xc350d807505fb835650f0013632c5515592987ba169bbc6626d9fc54d91f0f0b",
          "blockNumber": 1n,
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
        },
        {
          "address": "0xc56c7a0eaa804f854b536a5f3d5f49d2ec4b12b8",
          "args": [
            "0x9F1fdAb6458c5fc642fa0F4C5af7473C46837357",
            "0x40aA958dd87FC8305b97f2BA922CDdCa374bcD7f",
            115792089237316195423570985008687907853269984665640564039457566016468674737064n,
          ],
          "blockHash": "0xc350d807505fb835650f0013632c5515592987ba169bbc6626d9fc54d91f0f0b",
          "blockNumber": 2n,
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
        },
        {
          "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
          "args": [
            "0x2aEEe741fa1e21120a21E57Db9ee545428E683C9",
            "0xF3dE3C0d654FDa23daD170f0f320a92172509127",
            108534933194540417n,
          ],
          "blockHash": "0xc350d807505fb835650f0013632c5515592987ba169bbc6626d9fc54d91f0f0b",
          "blockNumber": 3n,
          "data": "0x000000000000000000000000000000000000000000000000018197f25ac80581",
          "eventName": "Transfer",
          "logIndex": 3,
          "removed": false,
          "topics": [
            "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
            "0x0000000000000000000000002aeee741fa1e21120a21e57db9ee545428e683c9",
            "0x000000000000000000000000f3de3c0d654fda23dad170f0f320a92172509127",
          ],
          "transactionHash": "0xcdd096880f66c302c214338b8f860f39757aa10bc5f14561b21a42be88ef3f6a",
          "transactionIndex": 0,
        },
        {
          "address": "0xc56c7a0eaa804f854b536a5f3d5f49d2ec4b12b8",
          "args": [
            "0x9F1fdAb6458c5fc642fa0F4C5af7473C46837357",
            "0xF3dE3C0d654FDa23daD170f0f320a92172509127",
            17991444454902873n,
          ],
          "blockHash": "0xc350d807505fb835650f0013632c5515592987ba169bbc6626d9fc54d91f0f0b",
          "blockNumber": 1n,
          "data": "0x000000000000000000000000000000000000000000000000003feb1f97bb0c59",
          "eventName": "Transfer",
          "logIndex": 4,
          "removed": false,
          "topics": [
            "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
            "0x0000000000000000000000009f1fdab6458c5fc642fa0f4c5af7473c46837357",
            "0x000000000000000000000000f3de3c0d654fda23dad170f0f320a92172509127",
          ],
          "transactionHash": "0xcdd096880f66c302c214338b8f860f39757aa10bc5f14561b21a42be88ef3f6a",
          "transactionIndex": 0,
        },
      ]
    `)
  })

  test('unnamed: multiple args', async () => {
    const parsedLogs = parseEventLogs({
      abi: abi_unnamed,
      logs,
      args: [
        '0x9F1fdAb6458c5fc642fa0F4C5af7473C46837357',
        '0x2aEEe741fa1e21120a21E57Db9ee545428E683C9',
      ],
    })
    expect(parsedLogs).toMatchInlineSnapshot(`
      [
        {
          "address": "0xc56c7a0eaa804f854b536a5f3d5f49d2ec4b12b8",
          "args": [
            "0x9F1fdAb6458c5fc642fa0F4C5af7473C46837357",
            "0x2aEEe741fa1e21120a21E57Db9ee545428E683C9",
            17991444454902871n,
          ],
          "blockHash": "0xc350d807505fb835650f0013632c5515592987ba169bbc6626d9fc54d91f0f0b",
          "blockNumber": 1n,
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
        },
      ]
    `)
  })

  test('unnamed: nullish arg', async () => {
    const parsedLogs = parseEventLogs({
      abi: abi_unnamed,
      logs,
      args: [
        null,
        '0x40aA958dd87FC8305b97f2BA922CDdCa374bcD7f',
        115792089237316195423570985008687907853269984665640564039457566016468674737064n,
      ],
    })
    expect(parsedLogs).toMatchInlineSnapshot(`
      [
        {
          "address": "0xc56c7a0eaa804f854b536a5f3d5f49d2ec4b12b8",
          "args": [
            "0x9F1fdAb6458c5fc642fa0F4C5af7473C46837357",
            "0x40aA958dd87FC8305b97f2BA922CDdCa374bcD7f",
            115792089237316195423570985008687907853269984665640564039457566016468674737064n,
          ],
          "blockHash": "0xc350d807505fb835650f0013632c5515592987ba169bbc6626d9fc54d91f0f0b",
          "blockNumber": 2n,
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
        },
      ]
    `)
  })

  test('unnamed: string type', async () => {
    const parsedLogs = parseEventLogs({
      abi: abi_unnamed,
      logs,
      args: ['hello'],
    })
    expect(parsedLogs).toMatchInlineSnapshot(`
      [
        {
          "address": "0xc56c7a0eaa804f854b536a5f3d5f49d2ec4b12b8",
          "args": [
            "0x1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8",
          ],
          "blockHash": "0xc350d807505fb835650f0013632c5515592987ba169bbc6626d9fc54d91f0f0b",
          "blockNumber": 1n,
          "data": "0x",
          "eventName": "Foo",
          "logIndex": 5,
          "removed": false,
          "topics": [
            "0x9f0b7f1630bdb7d474466e2dfef0fb9dff65f7a50eec83935b68f77d0808f08a",
            "0x1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8",
          ],
          "transactionHash": "0xcdd096880f66c302c214338b8f860f39757aa10bc5f14561b21a42be88ef3f6a",
          "transactionIndex": 0,
        },
      ]
    `)
  })

  test('behavior: incompatible args', async () => {
    const parsedLogs = parseEventLogs({
      abi: abi_unnamed,
      logs,
      args: {
        // @ts-expect-error
        to: '0x0000000000000000000000000000000000000000',
      },
    })
    expect(parsedLogs).toMatchInlineSnapshot('[]')
  })
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
