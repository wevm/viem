import { describe, expect, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
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
  expect(parsedLogs.length).toBe(1626)
  expect(parsedLogs[0]).toMatchInlineSnapshot(`
    {
      "address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      "args": {
        "from": "0x9a772018FbD77fcD2d25657e5C547BAfF3Fd7D16",
        "to": "0x51C72848c68a965f66FA7a88855F9f7784502a7F",
        "value": 120434120394n,
      },
      "blockHash": "0xcefce01338b9da7553647cf3912ae562abaa0139fc7360f1ca279a609473ef3f",
      "blockNumber": 22263618n,
      "blockTimestamp": 1744590239n,
      "data": "0x0000000000000000000000000000000000000000000000000000001c0a6ed6ca",
      "eventName": "Transfer",
      "logIndex": 0,
      "removed": false,
      "topics": [
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
        "0x0000000000000000000000009a772018fbd77fcd2d25657e5c547baff3fd7d16",
        "0x00000000000000000000000051c72848c68a965f66fa7a88855f9f7784502a7f",
      ],
      "transactionHash": "0x5a85da72e82150fc8272f4baa637f0bb9e5b7159912650f2c11f45e7a2b6d1a5",
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
  expect(transferLogs.length).toBe(1465)
  expect(transferLogs[0]).toMatchInlineSnapshot(`
    {
      "address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      "args": {
        "from": "0x9a772018FbD77fcD2d25657e5C547BAfF3Fd7D16",
        "to": "0x51C72848c68a965f66FA7a88855F9f7784502a7F",
        "value": 120434120394n,
      },
      "blockHash": "0xcefce01338b9da7553647cf3912ae562abaa0139fc7360f1ca279a609473ef3f",
      "blockNumber": 22263618n,
      "blockTimestamp": 1744590239n,
      "data": "0x0000000000000000000000000000000000000000000000000000001c0a6ed6ca",
      "eventName": "Transfer",
      "logIndex": 0,
      "removed": false,
      "topics": [
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
        "0x0000000000000000000000009a772018fbd77fcd2d25657e5c547baff3fd7d16",
        "0x00000000000000000000000051c72848c68a965f66fa7a88855f9f7784502a7f",
      ],
      "transactionHash": "0x5a85da72e82150fc8272f4baa637f0bb9e5b7159912650f2c11f45e7a2b6d1a5",
      "transactionIndex": 0,
    }
  `)

  const approvalLogs = parseEventLogs({
    abi,
    eventName: 'Approval',
    logs,
  })
  expect(approvalLogs.length).toBe(161)
  expect(approvalLogs[0]).toMatchInlineSnapshot(`
    {
      "address": "0x62b9c7356a2dc64a1969e19c23e4f579f9810aa7",
      "args": {
        "owner": "0xf081470f5C6FBCCF48cC4e5B82Dd926409DcdD67",
        "spender": "0x971add32Ea87f10bD192671630be3BE8A11b8623",
        "value": 115792089237316195423570985008687907853269984665640553065265497905716727142853n,
      },
      "blockHash": "0xcefce01338b9da7553647cf3912ae562abaa0139fc7360f1ca279a609473ef3f",
      "blockNumber": 22263618n,
      "blockTimestamp": 1744590239n,
      "data": "0xfffffffffffffffffffffffffffffffffffffffffff6ec1fdaddeba7574c59c5",
      "eventName": "Approval",
      "logIndex": 91,
      "removed": false,
      "topics": [
        "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
        "0x000000000000000000000000f081470f5c6fbccf48cc4e5b82dd926409dcdd67",
        "0x000000000000000000000000971add32ea87f10bd192671630be3be8a11b8623",
      ],
      "transactionHash": "0xd1426c3c24ca7eedd1cc53a09fed99c1e04796f15d8f6f8c09fd395d1af1b99c",
      "transactionIndex": 38,
    }
  `)

  const contractLogs = parseEventLogs({
    abi,
    eventName: ['Approval', 'Transfer'],
    logs,
  })
  expect(contractLogs.length).toBe(1626)
  expect(contractLogs[0]).toMatchInlineSnapshot(`
    {
      "address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      "args": {
        "from": "0x9a772018FbD77fcD2d25657e5C547BAfF3Fd7D16",
        "to": "0x51C72848c68a965f66FA7a88855F9f7784502a7F",
        "value": 120434120394n,
      },
      "blockHash": "0xcefce01338b9da7553647cf3912ae562abaa0139fc7360f1ca279a609473ef3f",
      "blockNumber": 22263618n,
      "blockTimestamp": 1744590239n,
      "data": "0x0000000000000000000000000000000000000000000000000000001c0a6ed6ca",
      "eventName": "Transfer",
      "logIndex": 0,
      "removed": false,
      "topics": [
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
        "0x0000000000000000000000009a772018fbd77fcd2d25657e5c547baff3fd7d16",
        "0x00000000000000000000000051c72848c68a965f66fa7a88855f9f7784502a7f",
      ],
      "transactionHash": "0x5a85da72e82150fc8272f4baa637f0bb9e5b7159912650f2c11f45e7a2b6d1a5",
      "transactionIndex": 0,
    }
  `)
})

describe('behavior: events with identical selectors', () => {
  const erc20TransferAbi = {
    name: 'Transfer',
    type: 'event',
    inputs: [
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'value', type: 'uint256' },
    ],
  } as const

  const erc721TransferAbi = {
    name: 'Transfer',
    type: 'event',
    inputs: [
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: true, name: 'tokenId', type: 'uint256' },
    ],
  } as const

  const erc20Log = {
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    topics: [
      '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      '0x0000000000000000000000009f1fdab6458c5fc642fa0f4c5af7473c46837357',
      '0x0000000000000000000000002aeee741fa1e21120a21e57db9ee545428e683c9',
    ],
    data: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
    blockHash:
      '0xc350d807505fb835650f0013632c5515592987ba169bbc6626d9fc54d91f0f0b',
    blockNumber: 1n,
    transactionHash:
      '0xcdd096880f66c302c214338b8f860f39757aa10bc5f14561b21a42be88ef3f6a',
    transactionIndex: 0,
    logIndex: 1,
    removed: false,
  } as const satisfies Log

  const erc721Log = {
    address: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
    topics: [
      '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      '0x000000000000000000000000bda319bc7cc8f0829df39ec0fff5d1e061ffadf7',
      '0x00000000000000000000000060bdee58d18dd68af4a2ee39fe4e67def7f51dc2',
      '0x0000000000000000000000000000000000000000000000000000000000000001',
    ],
    data: '0x',
    blockHash:
      '0xc350d807505fb835650f0013632c5515592987ba169bbc6626d9fc54d91f0f0b',
    blockNumber: 2n,
    transactionHash:
      '0xcdd096880f66c302c214338b8f860f39757aa10bc5f14561b21a42be88ef3f6a',
    transactionIndex: 1,
    logIndex: 2,
    removed: false,
  } as const satisfies Log

  test('behavior: decodes ERC20 and ERC721 Transfer events correctly', () => {
    const parsedLogs = parseEventLogs({
      abi: [erc20TransferAbi, erc721TransferAbi],
      logs: [erc20Log, erc721Log],
    })

    expect(parsedLogs).toHaveLength(2)

    expect(parsedLogs[0]).toMatchObject({
      eventName: 'Transfer',
      args: {
        from: '0x9F1fdAb6458c5fc642fa0F4C5af7473C46837357',
        to: '0x2aEEe741fa1e21120a21E57Db9ee545428E683C9',
        value: 1000000000000000000n,
      },
    })

    expect(parsedLogs[1]).toMatchObject({
      eventName: 'Transfer',
      args: {
        from: '0xBDA319Bc7Cc8F0829df39eC0FFF5D1E061FFadf7',
        to: '0x60BDEe58D18Dd68AF4A2eE39FE4E67DeF7F51Dc2',
        tokenId: 1n,
      },
    })
  })

  test('behavior: decodes correctly when ERC721 ABI is listed first', () => {
    const parsedLogs = parseEventLogs({
      abi: [erc721TransferAbi, erc20TransferAbi],
      logs: [erc20Log, erc721Log],
    })

    expect(parsedLogs).toHaveLength(2)

    expect(parsedLogs[0]).toMatchObject({
      eventName: 'Transfer',
      args: {
        from: '0x9F1fdAb6458c5fc642fa0F4C5af7473C46837357',
        to: '0x2aEEe741fa1e21120a21E57Db9ee545428E683C9',
        value: 1000000000000000000n,
      },
    })

    expect(parsedLogs[1]).toMatchObject({
      eventName: 'Transfer',
      args: {
        from: '0xBDA319Bc7Cc8F0829df39eC0FFF5D1E061FFadf7',
        to: '0x60BDEe58D18Dd68AF4A2eE39FE4E67DeF7F51Dc2',
        tokenId: 1n,
      },
    })
  })

  test('behavior: returns partial log when all decoding attempts fail in non-strict mode (named)', () => {
    const malformedLog: Log = {
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      topics: [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x0000000000000000000000009f1fdab6458c5fc642fa0f4c5af7473c46837357',
      ],
      data: '0x',
      blockHash:
        '0xc350d807505fb835650f0013632c5515592987ba169bbc6626d9fc54d91f0f0b',
      blockNumber: 1n,
      transactionHash:
        '0xcdd096880f66c302c214338b8f860f39757aa10bc5f14561b21a42be88ef3f6a',
      transactionIndex: 0,
      logIndex: 1,
      removed: false,
    }

    const parsedLogs = parseEventLogs({
      abi: [erc20TransferAbi, erc721TransferAbi],
      logs: [malformedLog],
      strict: false,
    })

    expect(parsedLogs).toHaveLength(1)
    expect(parsedLogs[0]).toMatchObject({
      eventName: 'Transfer',
      args: {
        from: '0x9F1fdAb6458c5fc642fa0F4C5af7473C46837357',
      },
    })
  })

  test('behavior: returns partial log when all decoding attempts fail in non-strict mode (unnamed)', () => {
    const unnamedAbi = [
      {
        name: 'Transfer',
        type: 'event',
        inputs: [
          { indexed: true, type: 'address' },
          { indexed: true, type: 'address' },
          { indexed: false, type: 'uint256' },
        ],
      },
    ] as const

    const malformedLog: Log = {
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      topics: [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x0000000000000000000000009f1fdab6458c5fc642fa0f4c5af7473c46837357',
      ],
      data: '0x',
      blockHash:
        '0xc350d807505fb835650f0013632c5515592987ba169bbc6626d9fc54d91f0f0b',
      blockNumber: 1n,
      transactionHash:
        '0xcdd096880f66c302c214338b8f860f39757aa10bc5f14561b21a42be88ef3f6a',
      transactionIndex: 0,
      logIndex: 1,
      removed: false,
    }

    const parsedLogs = parseEventLogs({
      abi: unnamedAbi,
      logs: [malformedLog],
      strict: false,
    })

    expect(parsedLogs).toHaveLength(1)
    expect(parsedLogs[0]).toMatchObject({
      eventName: 'Transfer',
      args: ['0x9F1fdAb6458c5fc642fa0F4C5af7473C46837357'],
    })
  })
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
  expect(parsedLogs.length).toBe(1650)
  expect(parsedLogs[0]).toMatchInlineSnapshot(`
    {
      "address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      "args": {
        "from": "0x9a772018FbD77fcD2d25657e5C547BAfF3Fd7D16",
        "to": "0x51C72848c68a965f66FA7a88855F9f7784502a7F",
        "value": 120434120394n,
      },
      "blockHash": "0xcefce01338b9da7553647cf3912ae562abaa0139fc7360f1ca279a609473ef3f",
      "blockNumber": 22263618n,
      "blockTimestamp": 1744590239n,
      "data": "0x0000000000000000000000000000000000000000000000000000001c0a6ed6ca",
      "eventName": "Transfer",
      "logIndex": 0,
      "removed": false,
      "topics": [
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
        "0x0000000000000000000000009a772018fbd77fcd2d25657e5c547baff3fd7d16",
        "0x00000000000000000000000051c72848c68a965f66fa7a88855f9f7784502a7f",
      ],
      "transactionHash": "0x5a85da72e82150fc8272f4baa637f0bb9e5b7159912650f2c11f45e7a2b6d1a5",
      "transactionIndex": 0,
    }
  `)
})
