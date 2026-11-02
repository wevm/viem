import { encodeAbiParameters, encodeEventTopics } from 'viem'
import { assertType, describe, expect, test } from 'vitest'

import { waitForTransactionReceipt } from '../../actions/public/waitForTransactionReceipt.js'
import { base } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { http } from '../../clients/transports/http.js'
import type { Hex } from '../../types/misc.js'
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

test('unnamed args: mixed ordering of indexed args', () => {
  const event = decodeEventLog({
    abi: [
      {
        inputs: [
          {
            indexed: true,
            type: 'address',
          },
          {
            indexed: false,
            type: 'uint256',
          },
          {
            indexed: true,
            type: 'address',
          },
        ],
        name: 'Transfer',
        type: 'event',
      },
    ],
    data: '0x0000000000000000000000000000000000000000000000000000000000000001',
    topics: [
      '0x138dbc8474f748db86063dcef24cef1495bc73385a946f8d691128085e5ebec2',
      '0x000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac',
      '0x000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac',
    ],
  })
  assertType<typeof event>({
    eventName: 'Transfer',
    args: ['0x', 1n, '0x'],
  })
  expect(event).toEqual({
    args: [
      '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
      1n,
      '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
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
  describe('https://github.com/wevm/viem/issues/4237', () => {
    test('mismatch in indexed parameters', () => {
      const result = decodeEventLog({
        abi: [
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                internalType: 'address',
                name: 'owner',
                type: 'address',
              },
            ],
            name: 'AddedOwner',
            type: 'event',
          },
        ],
        topics: [
          '0x9465fa0c962cc76958e6373a993326400c1c94f8be2fe3a952adfa7f60b2ea26',
        ],
        data: '0x0000000000000000000000007ac4cdaf979c525cccfa9e5a474b0173bd960aad',
        strict: false,
      })
      expect(result).toMatchInlineSnapshot(`
        {
          "args": {
            "owner": "0x7aC4CDAf979c525CcCFa9e5A474B0173bD960aAd",
          },
          "eventName": "AddedOwner",
        }
      `)
    })

    test('multiple missing indexed parameters decoded from data', () => {
      const result = decodeEventLog({
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
                indexed: false,
                name: 'value',
                type: 'uint256',
              },
            ],
            name: 'Transfer',
            type: 'event',
          },
        ],
        topics: [
          '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        ],
        data: '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac0000000000000000000000000000000000000000000000000000000000000064',
        strict: false,
      })
      expect(result).toMatchInlineSnapshot(`
        {
          "args": {
            "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            "to": "0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC",
            "value": 100n,
          },
          "eventName": "Transfer",
        }
      `)
    })

    test('partial indexed parameters: some in topics, some in data', () => {
      const result = decodeEventLog({
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
                indexed: false,
                name: 'value',
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
        data: '0x000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac0000000000000000000000000000000000000000000000000000000000000064',
        strict: false,
      })
      expect(result).toMatchInlineSnapshot(`
        {
          "args": {
            "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            "to": "0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC",
            "value": 100n,
          },
          "eventName": "Transfer",
        }
      `)
    })

    test('missing indexed parameters with strict: true should throw', () => {
      expect(() =>
        decodeEventLog({
          abi: [
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  name: 'owner',
                  type: 'address',
                },
              ],
              name: 'AddedOwner',
              type: 'event',
            },
          ],
          topics: [
            '0x9465fa0c962cc76958e6373a993326400c1c94f8be2fe3a952adfa7f60b2ea26',
          ],
          data: '0x0000000000000000000000007ac4cdaf979c525cccfa9e5a474b0173bd960aad',
          strict: true,
        }),
      ).toThrowErrorMatchingInlineSnapshot(`
        [DecodeLogTopicsMismatch: Expected a topic for indexed event parameter "owner" on event "AddedOwner(address owner)".

        Version: viem@x.y.z]
      `)
    })

    test('missing indexed parameters with no data and strict: false', () => {
      const result = decodeEventLog({
        abi: [
          {
            anonymous: false,
            inputs: [
              {
                indexed: true,
                name: 'owner',
                type: 'address',
              },
            ],
            name: 'AddedOwner',
            type: 'event',
          },
        ],
        topics: [
          '0x9465fa0c962cc76958e6373a993326400c1c94f8be2fe3a952adfa7f60b2ea26',
        ],
        strict: false,
      })
      expect(result).toMatchInlineSnapshot(`
        {
          "args": undefined,
          "eventName": "AddedOwner",
        }
      `)
    })

    test('unnamed args: missing indexed parameters decoded from data', () => {
      const result = decodeEventLog({
        abi: [
          {
            anonymous: false,
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
        topics: [
          '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        ],
        data: '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac0000000000000000000000000000000000000000000000000000000000000064',
        strict: false,
      })
      expect(result).toMatchInlineSnapshot(`
        {
          "args": [
            "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            "0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC",
            100n,
          ],
          "eventName": "Transfer",
        }
      `)
    })

    test('unnamed args: partial indexed parameters in topics and data', () => {
      const result = decodeEventLog({
        abi: [
          {
            anonymous: false,
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
        topics: [
          '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
          '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
        ],
        data: '0x000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac0000000000000000000000000000000000000000000000000000000000000064',
        strict: false,
      })
      expect(result).toMatchInlineSnapshot(`
        {
          "args": [
            "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            "0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC",
            100n,
          ],
          "eventName": "Transfer",
        }
      `)
    })

    test('all indexed parameters missing with non-indexed params', () => {
      const abi = [
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              name: 'sender',
              type: 'address',
            },
            {
              indexed: false,
              name: 'amount',
              type: 'uint256',
            },
            {
              indexed: false,
              name: 'recipient',
              type: 'address',
            },
          ],
          name: 'Deposit',
          type: 'event',
        },
      ] as const
      const result = decodeEventLog({
        abi,
        topics: [toEventSelector(abi[0])],
        data: '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb9226600000000000000000000000000000000000000000000000000000000000003e8000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac',
        strict: false,
      })
      expect(result).toMatchInlineSnapshot(`
        {
          "args": {
            "amount": 1000n,
            "recipient": "0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC",
            "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          },
          "eventName": "Deposit",
        }
      `)
    })

    test('mixed indexed: first indexed in topic, second indexed in data', () => {
      const abi = [
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              name: 'operator',
              type: 'address',
            },
            {
              indexed: true,
              name: 'tokenId',
              type: 'uint256',
            },
            {
              indexed: false,
              name: 'approved',
              type: 'bool',
            },
          ],
          name: 'Approval',
          type: 'event',
        },
      ] as const
      const result = decodeEventLog({
        abi,
        topics: [
          toEventSelector(abi[0]),
          '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
        ],
        data: '0x00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001',
        strict: false,
      })
      expect(result).toMatchInlineSnapshot(`
        {
          "args": {
            "approved": true,
            "operator": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            "tokenId": 1n,
          },
          "eventName": "Approval",
        }
      `)
    })
  })

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

  test('https://github.com/wevm/viem/issues/3705', async () => {
    const client = createClient({
      chain: base,
      transport: http(),
    })

    const receipt = await waitForTransactionReceipt(client, {
      hash: '0xbee3f576c43a29d3c924cd46ff1ff42489eceae5e8e31afdbba8f982c8291a76',
    })

    const decoded = receipt.logs
      .map((log) => {
        try {
          return decodeEventLog({
            ...log,
            abi: [
              {
                type: 'event',
                name: 'PetRegistered',
                inputs: [
                  {
                    name: 'petId',
                    type: 'uint256',
                    indexed: true,
                    internalType: 'uint256',
                  },
                  {
                    name: 'user',
                    type: 'address',
                    indexed: true,
                    internalType: 'address',
                  },
                ],
                anonymous: false,
              },
            ],
          })
        } catch {
          return null
        }
      })
      .filter((log) => log?.eventName === 'PetRegistered')

    expect(decoded).toMatchInlineSnapshot(`
      [
        {
          "args": {
            "petId": 75574n,
            "user": "0x03998b821AB247677a034762CA7F99fACF227975",
          },
          "eventName": "PetRegistered",
        },
        {
          "args": {
            "petId": 75575n,
            "user": "0x03998b821AB247677a034762CA7F99fACF227975",
          },
          "eventName": "PetRegistered",
        },
      ]
    `)
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
    You can look up the signature here: https://4byte.sourcify.dev/?q=0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef.

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

const from = '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC'

function anonymousTopics(
  parameters: Parameters<typeof encodeEventTopics>[0],
): [Hex, ...Hex[]] | [] {
  const topics = encodeEventTopics(parameters).filter(
    (topic): topic is Hex => typeof topic === 'string',
  )
  const [topic, ...rest] = topics
  if (!topic) return []
  return [topic, ...rest]
}

describe('anonymous', () => {
  test('indexed address and non-indexed string', () => {
    const abi = [
      {
        anonymous: true,
        inputs: [
          { indexed: true, name: 'from', type: 'address' },
          { indexed: false, name: 'note', type: 'string' },
        ],
        name: 'Message',
        type: 'event',
      },
    ] as const
    const event = decodeEventLog({
      abi,
      data: encodeAbiParameters([{ type: 'string' }], ['hello']),
      topics: anonymousTopics({
        abi,
        args: { from },
        eventName: 'Message',
      }),
    })
    expect(event).toMatchInlineSnapshot(`
      {
        "args": {
          "from": "0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC",
          "note": "hello",
        },
        "eventName": "Message",
      }
    `)
  })

  test('indexed arguments only', () => {
    const abi = [
      {
        anonymous: true,
        inputs: [{ indexed: true, name: 'from', type: 'address' }],
        name: 'Ping',
        type: 'event',
      },
    ] as const
    expect(
      decodeEventLog({
        abi,
        data: '0x',
        topics: anonymousTopics({
          abi,
          args: { from },
          eventName: 'Ping',
        }),
      }),
    ).toMatchInlineSnapshot(`
      {
        "args": {
          "from": "0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC",
        },
        "eventName": "Ping",
      }
    `)
  })

  test('no indexed arguments', () => {
    const abi = [
      {
        anonymous: true,
        inputs: [{ indexed: false, name: 'note', type: 'string' }],
        name: 'Note',
        type: 'event',
      },
    ] as const
    expect(
      decodeEventLog({
        abi,
        data: encodeAbiParameters([{ type: 'string' }], ['hello']),
        topics: [],
      }),
    ).toMatchInlineSnapshot(`
      {
        "args": {
          "note": "hello",
        },
        "eventName": "Note",
      }
    `)
  })

  test('leading non-indexed argument', () => {
    const abi = [
      {
        anonymous: true,
        inputs: [
          { indexed: false, name: 'title', type: 'string' },
          { indexed: true, name: 'message', type: 'string' },
        ],
        name: 'Bar',
        type: 'event',
      },
    ] as const
    const message =
      '0x1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8'
    expect(
      decodeEventLog({
        abi,
        data: encodeAbiParameters([{ type: 'string' }], ['title']),
        topics: [message],
      }),
    ).toMatchInlineSnapshot(`
      {
        "args": {
          "message": "0x1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8",
          "title": "title",
        },
        "eventName": "Bar",
      }
    `)
  })

  test('signature match wins over an anonymous event in the same ABI', () => {
    const signature = toEventSelector('Transfer(address,uint256)')
    const event = decodeEventLog({
      abi: [
        {
          anonymous: true,
          inputs: [
            { indexed: true, name: 'from', type: 'address' },
            { indexed: true, name: 'value', type: 'uint256' },
          ],
          name: 'Anon',
          type: 'event',
        },
        {
          inputs: [
            { indexed: true, name: 'from', type: 'address' },
            { indexed: false, name: 'value', type: 'uint256' },
          ],
          name: 'Transfer',
          type: 'event',
        },
      ],
      data: '0x0000000000000000000000000000000000000000000000000000000000000001',
      topics: [
        signature,
        '0x000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac',
      ],
    })
    expect(event).toMatchInlineSnapshot(`
      {
        "args": {
          "from": "0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC",
          "value": 1n,
        },
        "eventName": "Transfer",
      }
    `)
    expect(
      decodeEventLog({
        abi: [
          {
            anonymous: true,
            inputs: [
              { indexed: true, name: 'from', type: 'address' },
              { indexed: true, name: 'value', type: 'uint256' },
            ],
            name: 'Anon',
            type: 'event',
          },
          {
            inputs: [
              { indexed: true, name: 'from', type: 'address' },
              { indexed: false, name: 'value', type: 'uint256' },
            ],
            name: 'Transfer',
            type: 'event',
          },
        ],
        data: '0x0000000000000000000000000000000000000000000000000000000000000001',
        eventName: 'Anon',
        topics: [
          signature,
          '0x000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac',
        ],
      }),
    ).toMatchInlineSnapshot(`
      {
        "args": {
          "from": "0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC",
          "value": 1n,
        },
        "eventName": "Transfer",
      }
    `)
  })

  test('anonymous event is not requested in a mixed ABI without eventName', () => {
    const abi = [
      {
        anonymous: true,
        inputs: [
          { indexed: true, name: 'a', type: 'address' },
          { indexed: true, name: 'b', type: 'address' },
        ],
        name: 'Anon',
        type: 'event',
      },
      {
        inputs: [
          { indexed: true, name: 'from', type: 'address' },
          { indexed: false, name: 'value', type: 'uint256' },
        ],
        name: 'Transfer',
        type: 'event',
      },
    ] as const
    // A log from another contract: an unknown signature and one indexed
    // argument, so the topic count fits `Anon`.
    const topics = [
      toEventSelector('Deposit(address,uint256)'),
      '0x000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac',
    ] as const

    expect(() =>
      decodeEventLog({ abi, data: '0x', topics: [...topics] }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [AbiEventSignatureNotFoundError: Encoded event signature "0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c" not found on ABI.
      Make sure you are using the correct ABI and that the event exists on it.
      You can look up the signature here: https://4byte.sourcify.dev/?q=0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c.

      Docs: https://viem.sh/docs/contract/decodeEventLog
      Version: viem@x.y.z]
    `)
    expect(
      decodeEventLog({
        abi,
        data: '0x',
        eventName: 'Anon',
        topics: [...topics],
      }),
    ).toMatchInlineSnapshot(`
      {
        "args": {
          "a": "0x8bFC6cDa04EB5B0d3c460751C2402c5C5CC9109C",
          "b": "0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC",
        },
        "eventName": "Anon",
      }
    `)
  })

  test('eventName does not skip the indexed arity check', () => {
    const abi = [
      {
        anonymous: true,
        inputs: [{ indexed: true, name: 'a', type: 'address' }],
        name: 'Foo',
        type: 'event',
      },
      {
        anonymous: true,
        inputs: [
          { indexed: true, name: 'a', type: 'address' },
          { indexed: true, name: 'b', type: 'address' },
        ],
        name: 'Foo',
        type: 'event',
      },
    ] as const
    const a =
      '0x000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac'
    const b =
      '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266'
    expect(
      decodeEventLog({
        abi,
        data: '0x',
        eventName: 'Foo',
        topics: [a, b],
      }),
    ).toMatchInlineSnapshot(`
      {
        "args": {
          "a": "0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC",
          "b": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        },
        "eventName": "Foo",
      }
    `)
    expect(() =>
      decodeEventLog({
        abi: [abi[0]],
        data: '0x',
        eventName: 'Foo',
        topics: [a, b],
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [AbiEventSignatureNotFoundError: Encoded event signature "0x000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac" not found on ABI.
      Make sure you are using the correct ABI and that the event exists on it.
      You can look up the signature here: https://4byte.sourcify.dev/?q=0x000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac.

      Docs: https://viem.sh/docs/contract/decodeEventLog
      Version: viem@x.y.z]
    `)
  })

  test('same-name overloads with the same arity need a narrowed abi', () => {
    const abi = [
      {
        anonymous: true,
        inputs: [
          { indexed: true, name: 'from', type: 'address' },
          { indexed: false, name: 'value', type: 'uint256' },
        ],
        name: 'Foo',
        type: 'event',
      },
      {
        anonymous: true,
        inputs: [
          { indexed: true, name: 'from', type: 'address' },
          { indexed: false, name: 'note', type: 'string' },
        ],
        name: 'Foo',
        type: 'event',
      },
    ] as const
    const topics = anonymousTopics({
      abi: [abi[0]],
      args: { from },
      eventName: 'Foo',
    })
    const data =
      '0x0000000000000000000000000000000000000000000000000000000000000001'

    expect(() =>
      decodeEventLog({ abi, data, eventName: 'Foo', topics }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [AbiEventAmbiguityError: Ambiguous anonymous event log.

      Matched \`Foo\`, \`Foo\`.
      These events take the same number of indexed topics.
      Pass an \`abi\` that holds only the event to decode.

      Docs: https://viem.sh/docs/contract/decodeEventLog
      Version: viem@x.y.z]
    `)
    expect(
      decodeEventLog({ abi: [abi[0]], data, eventName: 'Foo', topics }),
    ).toMatchInlineSnapshot(`
      {
        "args": {
          "from": "0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC",
          "value": 1n,
        },
        "eventName": "Foo",
      }
    `)
  })

  test('same indexed arity is ambiguous without eventName', () => {
    const abi = [
      {
        anonymous: true,
        inputs: [
          { indexed: true, name: 'from', type: 'address' },
          { indexed: false, name: 'value', type: 'uint256' },
        ],
        name: 'Count',
        type: 'event',
      },
      {
        anonymous: true,
        inputs: [
          { indexed: true, name: 'from', type: 'address' },
          { indexed: false, name: 'note', type: 'string' },
        ],
        name: 'Message',
        type: 'event',
      },
    ] as const
    const topics = anonymousTopics({
      abi: [abi[1]],
      args: { from },
      eventName: 'Message',
    })
    expect(() =>
      decodeEventLog({
        abi,
        data: encodeAbiParameters([{ type: 'string' }], ['hello']),
        topics,
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [AbiEventAmbiguityError: Ambiguous anonymous event log.

      Matched \`Count\`, \`Message\`.
      These events take the same number of indexed topics.
      Pass \`eventName\` to choose one.

      Docs: https://viem.sh/docs/contract/decodeEventLog
      Version: viem@x.y.z]
    `)
    expect(
      decodeEventLog({
        abi,
        data: encodeAbiParameters([{ type: 'string' }], ['hello']),
        eventName: 'Message',
        topics,
      }),
    ).toMatchInlineSnapshot(`
      {
        "args": {
          "from": "0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC",
          "note": "hello",
        },
        "eventName": "Message",
      }
    `)
  })

  test('eventName selects an anonymous event with the same shape', () => {
    const abi = [
      {
        anonymous: true,
        inputs: [
          { indexed: true, name: 'from', type: 'address' },
          { indexed: false, name: 'value', type: 'uint256' },
        ],
        name: 'First',
        type: 'event',
      },
      {
        anonymous: true,
        inputs: [
          { indexed: true, name: 'from', type: 'address' },
          { indexed: false, name: 'value', type: 'uint256' },
        ],
        name: 'Second',
        type: 'event',
      },
    ] as const
    const topics = anonymousTopics({
      abi: [abi[0]],
      args: { from },
      eventName: 'First',
    })
    expect(
      decodeEventLog({
        abi,
        data: '0x0000000000000000000000000000000000000000000000000000000000000001',
        eventName: 'Second',
        topics,
      }),
    ).toMatchInlineSnapshot(`
      {
        "args": {
          "from": "0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC",
          "value": 1n,
        },
        "eventName": "Second",
      }
    `)
  })
})
