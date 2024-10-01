import { assertType, describe, expect, test } from 'vitest'

import { getAddress } from '../address/getAddress.js'
import { toEventSelector } from '../hash/toEventSelector.js'

import { decodeEventLog } from './decodeEventLog.js'

test('Transfer()', () => {
  const event = decodeEventLog({
    abi: [
      {
        inputs: [],
        stateMutability: 'nonpayable',
        type: 'constructor',
      },
      {
        inputs: [],
        name: 'Transfer',
        type: 'event',
      },
      {
        inputs: [],
        name: 'Approve',
        type: 'event',
      },
    ],
    topics: [
      '0x406dade31f7ae4b5dbc276258c28dde5ae6d5c2773c5745802c493a2360e55e0',
    ],
  })
  assertType<typeof event>({ eventName: 'Transfer' })
  expect(event).toEqual({
    eventName: 'Transfer',
  })
})

test('named args: Transfer(address,address,uint256)', () => {
  const event = decodeEventLog({
    abi: [
      {
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
            name: 'tokenId',
            type: 'uint256',
          },
        ],
        name: 'Transfer',
        type: 'event',
      },
    ],
    data: '0x0000000000000000000000000000000000000000000000000000000000000001',
    topics: [
      '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      '0x000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac',
      '0x000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac',
    ],
  })
  assertType<typeof event>({
    eventName: 'Transfer',
    args: { from: '0x', to: '0x', tokenId: 1n },
  })
  expect(event).toEqual({
    eventName: 'Transfer',
    args: {
      from: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
      to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
      tokenId: 1n,
    },
  })
})

test('named args with a missing name: Transfer(address,address,uint256)', () => {
  const event = decodeEventLog({
    abi: [
      {
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
            name: '',
            type: 'uint256',
          },
        ],
        name: 'Transfer',
        type: 'event',
      },
    ],
    data: '0x0000000000000000000000000000000000000000000000000000000000000001',
    topics: [
      '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      '0x000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac',
      '0x000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac',
    ],
  })
  assertType<typeof event>({
    eventName: 'Transfer',
    args: ['0x', '0x', 1n],
  })
  expect(event).toEqual({
    args: [
      '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
      '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
      1n,
    ],
    eventName: 'Transfer',
  })
})

test('unnamed args: Transfer(address,address,uint256)', () => {
  const event = decodeEventLog({
    abi: [
      {
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
        name: 'Transfer',
        type: 'event',
      },
    ],
    data: '0x0000000000000000000000000000000000000000000000000000000000000001',
    topics: [
      '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      '0x000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac',
      '0x000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac',
    ],
  })
  assertType<typeof event>({
    eventName: 'Transfer',
    args: ['0x', '0x', 1n],
  })
  expect(event).toEqual({
    args: [
      '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
      '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
      1n,
    ],
    eventName: 'Transfer',
  })
})

test('Foo(string)', () => {
  const event = decodeEventLog({
    abi: [
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
    ],
    topics: [
      '0x9f0b7f1630bdb7d474466e2dfef0fb9dff65f7a50eec83935b68f77d0808f08a',
      '0x1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8',
    ],
  })
  assertType<typeof event>({
    eventName: 'Foo',
    args: {
      message:
        '0x1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8',
    },
  })
  expect(event).toEqual({
    args: {
      message:
        '0x1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8',
    },
    eventName: 'Foo',
  })
})

test('args: eventName', () => {
  const event = decodeEventLog({
    abi: [
      {
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
        name: 'Transfer',
        type: 'event',
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
    ],
    eventName: 'Foo',
    topics: [
      '0x9f0b7f1630bdb7d474466e2dfef0fb9dff65f7a50eec83935b68f77d0808f08a',
      '0x1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8',
    ],
  })
  assertType<typeof event>({
    eventName: 'Foo',
    args: {
      message:
        '0x1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8',
    },
  })
  expect(event).toEqual({
    args: {
      message:
        '0x1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8',
    },
    eventName: 'Foo',
  })
})

test('args: data – named (address,address,uint256)', () => {
  const event = decodeEventLog({
    abi: [
      {
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
            name: 'tokenId',
            type: 'uint256',
          },
        ],
        name: 'Transfer',
        type: 'event',
      },
    ],
    eventName: 'Transfer',
    data: '0x0000000000000000000000000000000000000000000000000000000000000001',
    topics: [
      '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      '0x000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045',
      '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    ],
  })
  assertType<typeof event>({
    eventName: 'Transfer',
    args: {
      from: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
      to: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
      tokenId: 1n,
    },
  })
  expect(event).toEqual({
    eventName: 'Transfer',
    args: {
      from: getAddress('0xd8da6bf26964af9d7eed9e03e53415d37aa96045'),
      to: getAddress('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'),
      tokenId: 1n,
    },
  })
})

test('args: data – unnamed (address,address,uint256)', () => {
  const event = decodeEventLog({
    abi: [
      {
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
        name: 'Transfer',
        type: 'event',
      },
    ],
    data: '0x0000000000000000000000000000000000000000000000000000000000000001',
    eventName: 'Transfer',
    topics: [
      '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      '0x000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045',
      '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    ],
  })
  assertType<typeof event>({
    eventName: 'Transfer',
    args: [
      '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
      '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
      1n,
    ],
  })
  expect(event).toEqual({
    eventName: 'Transfer',
    args: [
      getAddress('0xd8da6bf26964af9d7eed9e03e53415d37aa96045'),
      getAddress('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'),
      1n,
    ],
  })
})

test('named: topics + event params mismatch', () => {
  expect(() =>
    decodeEventLog({
      abi: [
        {
          inputs: [
            {
              indexed: true,
              name: 'from',
              type: 'address',
            },
            {
              indexed: false,
              name: 'to',
              type: 'address',
            },
            {
              indexed: true,
              name: 'id',
              type: 'uint256',
            },
          ],
          name: 'Transfer',
          type: 'event',
        },
      ],
      topics: [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
      ],
    }),
  ).toThrowErrorMatchingInlineSnapshot(
    `
    [DecodeLogTopicsMismatch: Expected a topic for indexed event parameter "id" on event "Transfer(address from, address to, uint256 id)".

    Version: viem@x.y.z]
  `,
  )
})

test('unnamed: topics + event params mismatch', () => {
  expect(() =>
    decodeEventLog({
      abi: [
        {
          inputs: [
            {
              indexed: true,
              type: 'address',
            },
            {
              indexed: false,
              type: 'address',
            },
            {
              indexed: true,
              type: 'uint256',
            },
          ],
          name: 'Transfer',
          type: 'event',
        },
      ],
      topics: [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
      ],
    }),
  ).toThrowErrorMatchingInlineSnapshot(
    `
    [DecodeLogTopicsMismatch: Expected a topic for indexed event parameter on event "Transfer(address, address, uint256)".

    Version: viem@x.y.z]
  `,
  )
})

test('data + event params mismatch', () => {
  expect(() =>
    decodeEventLog({
      abi: [
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,

              name: 'from',
              type: 'address',
            },
            {
              indexed: false,

              name: 'to',
              type: 'address',
            },
            {
              indexed: false,

              name: 'id',
              type: 'uint256',
            },
          ],
          name: 'Transfer',
          type: 'event',
        },
      ],
      data: '0x0000000000000000000000000000000000000000000000000000000023c34600',
      topics: [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
        '0x00000000000000000000000070e8a65d014918798ba424110d5df658cde1cc58',
      ],
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [DecodeLogDataMismatch: Data size of 32 bytes is too small for non-indexed event parameters.

    Params: (address to, uint256 id)
    Data:   0x0000000000000000000000000000000000000000000000000000000023c34600 (32 bytes)

    Version: viem@x.y.z]
  `)

  expect(() =>
    decodeEventLog({
      abi: [
        {
          inputs: [
            {
              indexed: true,
              name: 'from',
              type: 'address',
            },
            {
              indexed: false,
              name: 'to',
              type: 'address',
            },
            {
              indexed: true,
              name: 'id',
              type: 'uint256',
            },
          ],
          name: 'Transfer',
          type: 'event',
        },
      ],
      topics: [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
        '0x0000000000000000000000000000000000000000000000000000000000000001',
      ],
    }),
  ).toThrowErrorMatchingInlineSnapshot(
    `
    [DecodeLogDataMismatch: Data size of 0 bytes is too small for non-indexed event parameters.

    Params: (address to)
    Data:   0x (0 bytes)

    Version: viem@x.y.z]
  `,
  )

  expect(() =>
    decodeEventLog({
      abi: [
        {
          inputs: [
            {
              indexed: true,
              name: 'from',
              type: 'address',
            },
            {
              indexed: false,
              name: 'to',
              type: 'address',
            },
            {
              indexed: true,
              name: 'id',
              type: 'uint256',
            },
          ],
          name: 'Transfer',
          type: 'event',
        },
      ],
      data: '0x',
      topics: [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
        '0x0000000000000000000000000000000000000000000000000000000000000001',
      ],
    }),
  ).toThrowErrorMatchingInlineSnapshot(
    `
    [DecodeLogDataMismatch: Data size of 0 bytes is too small for non-indexed event parameters.

    Params: (address to)
    Data:   0x (0 bytes)

    Version: viem@x.y.z]
  `,
  )
})

test('strict', () => {
  expect(
    decodeEventLog({
      abi: [
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,

              name: 'from',
              type: 'address',
            },
            {
              indexed: false,

              name: 'to',
              type: 'address',
            },
            {
              indexed: false,

              name: 'id',
              type: 'uint256',
            },
          ],
          name: 'Transfer',
          type: 'event',
        },
      ],
      data: '0x0000000000000000000000000000000000000000000000000000000023c34600',
      strict: false,
      topics: [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
        '0x00000000000000000000000070e8a65d014918798ba424110d5df658cde1cc58',
      ],
    }),
  ).toMatchInlineSnapshot(`
    {
      "args": {
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      },
      "eventName": "Transfer",
    }
  `)

  expect(
    decodeEventLog({
      abi: [
        {
          inputs: [
            {
              indexed: true,
              name: 'from',
              type: 'address',
            },
            {
              indexed: false,
              name: 'to',
              type: 'address',
            },
            {
              indexed: true,
              name: 'id',
              type: 'uint256',
            },
          ],
          name: 'Transfer',
          type: 'event',
        },
      ],
      strict: false,
      topics: [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
        '0x0000000000000000000000000000000000000000000000000000000000000001',
      ],
    }),
  ).toMatchInlineSnapshot(
    `
    {
      "args": {
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "id": 1n,
      },
      "eventName": "Transfer",
    }
  `,
  )
})

describe('GitHub repros', () => {
  describe('https://github.com/wevm/viem/issues/168', () => {
    test('zero data string', () => {
      const result = decodeEventLog({
        abi: [
          {
            anonymous: false,
            inputs: [
              {
                indexed: false,

                name: 'voter',
                type: 'address',
              },
              {
                indexed: false,

                name: 'proposalId',
                type: 'bytes32',
              },
              {
                indexed: false,

                name: 'support',
                type: 'uint256',
              },
              {
                indexed: false,

                name: 'weight',
                type: 'uint256',
              },
              {
                indexed: false,

                name: 'reason',
                type: 'string',
              },
            ],
            name: 'VoteCast',
            type: 'event',
          },
        ],
        data: '0x000000000000000000000000d1d1d4e36117ab794ec5d4c78cbd3a8904e691d04bdc559e89b88b73d8edeea6a767041d448d8076d070facc8340621555be3ac40000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000',
        topics: [
          '0x0c165c85edbf8f9b99d51793c9429beb9dc2b608a7f81e64623052f829657af3',
        ],
      })
      expect(result).toMatchInlineSnapshot(`
        {
          "args": {
            "proposalId": "0x4bdc559e89b88b73d8edeea6a767041d448d8076d070facc8340621555be3ac4",
            "reason": "",
            "support": 1n,
            "voter": "0xd1d1D4e36117aB794ec5d4c78cBD3a8904E691D0",
            "weight": 1n,
          },
          "eventName": "VoteCast",
        }
      `)
    })
  })

  describe('https://github.com/wevm/viem/issues/197', () => {
    test('topics + event params mismatch', () => {
      expect(() =>
        decodeEventLog({
          abi: [
            {
              anonymous: false,
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
                  indexed: true,

                  name: 'id',
                  type: 'uint256',
                },
              ],
              name: 'Transfer',
              type: 'event',
            },
          ],
          data: '0x0000000000000000000000000000000000000000000000000000000023c34600',
          topics: [
            '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
            '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
            '0x00000000000000000000000070e8a65d014918798ba424110d5df658cde1cc58',
          ],
        }),
      ).toThrowErrorMatchingInlineSnapshot(
        `
        [DecodeLogTopicsMismatch: Expected a topic for indexed event parameter "id" on event "Transfer(address from, address to, uint256 id)".

        Version: viem@x.y.z]
      `,
      )
    })
  })

  describe('https://github.com/wevm/viem/issues/323', () => {
    test('data + params mismatch', () => {
      expect(() =>
        decodeEventLog({
          abi: [
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,

                  name: 'from',
                  type: 'address',
                },
                {
                  indexed: false,

                  name: 'to',
                  type: 'address',
                },
                {
                  indexed: false,

                  name: 'id',
                  type: 'uint256',
                },
              ],
              name: 'Transfer',
              type: 'event',
            },
          ],
          data: '0x0000000000000000000000000000000000000000000000000000000023c34600',
          topics: [
            '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
            '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
            '0x00000000000000000000000070e8a65d014918798ba424110d5df658cde1cc58',
          ],
        }),
      ).toThrowErrorMatchingInlineSnapshot(`
        [DecodeLogDataMismatch: Data size of 32 bytes is too small for non-indexed event parameters.

        Params: (address to, uint256 id)
        Data:   0x0000000000000000000000000000000000000000000000000000000023c34600 (32 bytes)

        Version: viem@x.y.z]
      `)
    })
  })

  describe('https://github.com/wevm/viem/issues/1336', () => {
    test('topics + event params mismatch', () => {
      expect(() =>
        decodeEventLog({
          abi: [
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,

                  name: 'nounId',
                  type: 'uint256',
                },
                {
                  indexed: false,

                  name: 'startTime',
                  type: 'uint256',
                },
                {
                  indexed: false,

                  name: 'endTime',
                  type: 'uint256',
                },
              ],
              name: 'AuctionCreated',
              type: 'event',
            },
          ],
          data: '0x00000000000000000000000000000000000000000000000000000000000000680000000000000000000000000000000000000000000000004563918244f400000000000000000000000000000000000000000000000000000000000062845fba',
          topics: [
            '0xd6eddd1118d71820909c1197aa966dbc15ed6f508554252169cc3d5ccac756ca',
          ],
        }),
      ).toThrowErrorMatchingInlineSnapshot(
        `
        [DecodeLogTopicsMismatch: Expected a topic for indexed event parameter "nounId" on event "AuctionCreated(uint256 nounId, uint256 startTime, uint256 endTime)".

        Version: viem@x.y.z]
      `,
      )
    })
  })
})

test("errors: event doesn't exist", () => {
  expect(() =>
    decodeEventLog({
      abi: [
        {
          inputs: [
            {
              indexed: true,
              name: 'message',
              type: 'string',
            },
          ],
          name: 'Bar',
          type: 'event',
        },
        {
          inputs: [
            {
              indexed: true,
              name: 'message',
              type: 'string',
            },
          ],
          name: 'Baz',
          type: 'event',
        },
      ],
      topics: [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8',
      ],
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [AbiEventSignatureNotFoundError: Encoded event signature "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef" not found on ABI.
    Make sure you are using the correct ABI and that the event exists on it.
    You can look up the signature here: https://openchain.xyz/signatures?query=0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef.

    Docs: https://viem.sh/docs/contract/decodeEventLog
    Version: viem@x.y.z]
  `)
})

test('errors: no topics', () => {
  expect(() =>
    decodeEventLog({
      abi: [
        {
          inputs: [
            {
              indexed: true,
              name: 'message',
              type: 'string',
            },
          ],
          name: 'Bar',
          type: 'event',
        },
      ],
      topics: [],
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [AbiEventSignatureEmptyTopicsError: Cannot extract event signature from empty topics.

    Docs: https://viem.sh/docs/contract/decodeEventLog
    Version: viem@x.y.z]
  `)
})

test('errors: invalid data size', () => {
  expect(() =>
    decodeEventLog({
      abi: [
        {
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
              name: 'tokenId',
              type: 'uint256',
            },
          ],
          name: 'Transfer',
          type: 'event',
        },
      ],
      data: '0x1',
      eventName: 'Transfer',
      topics: [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045',
        '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
      ],
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [DecodeLogDataMismatch: Data size of 1 bytes is too small for non-indexed event parameters.

    Params: (uint256 tokenId)
    Data:   0x1 (1 bytes)

    Version: viem@x.y.z]
  `)
})

test('errors: invalid bool', () => {
  expect(() =>
    decodeEventLog({
      abi: [
        {
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
              name: 'sender',
              type: 'bool',
            },
          ],
          name: 'Transfer',
          type: 'event',
        },
      ],
      data: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      eventName: 'Transfer',
      topics: [
        toEventSelector('Transfer(address,address,bool)'),
        '0x000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045',
        '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
      ],
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [InvalidBytesBooleanError: Bytes value "221,242,82,173,27,226,200,155,105,194,176,104,252,55,141,170,149,43,167,241,99,196,161,22,40,245,90,77,245,35,179,239" is not a valid boolean. The bytes array must contain a single byte of either a 0 or 1 value.

    Version: viem@x.y.z]
  `)
})
