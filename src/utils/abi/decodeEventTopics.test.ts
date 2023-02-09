import { assertType, expect, expectTypeOf, test } from 'vitest'
import { decodeEventTopics } from './decodeEventTopics'

test('Transfer()', () => {
  const event = decodeEventTopics({
    abi: [
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

test('no args: Transfer(address,address,uint256)', () => {
  const event = decodeEventTopics({
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
    topics: [
      '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    ],
  })
  assertType<typeof event>({ eventName: 'Transfer' })
  expect(event).toEqual({
    eventName: 'Transfer',
  })
})

test('named args: Transfer(address,address,uint256)', () => {
  const event = decodeEventTopics({
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
    topics: [
      '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      '0x000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac',
    ],
  })
  assertType<typeof event>({ eventName: 'Transfer', args: { from: '0x' } })
  expect(event).toEqual({
    eventName: 'Transfer',
    args: {
      from: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
    },
  })
})

test('named args: Transfer(address,address,uint256)', () => {
  const event = decodeEventTopics({
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
    topics: [
      '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      '0x000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac',
      [],
    ],
  })
  assertType<typeof event>({
    eventName: 'Transfer',
    args: { from: '0x', to: [] },
  })
  expect(event).toEqual({
    eventName: 'Transfer',
    args: {
      from: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
      to: [],
    },
  })
})

test('named args: Transfer(address,address,uint256)', () => {
  const event = decodeEventTopics({
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
    topics: [
      '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      null,
      '0x000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac',
    ],
  })
  assertType<typeof event>({
    eventName: 'Transfer',
    args: { from: null, to: '0x' },
  })
  expect(event).toEqual({
    eventName: 'Transfer',
    args: {
      from: null,
      to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
    },
  })
})

test('named args: Transfer(address,address,uint256)', () => {
  const event = decodeEventTopics({
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
    topics: [
      '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      null,
      [
        '0x000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac',
        '0x000000000000000000000000c961145a54c96e3ae9baa048c4f4d6b04c13916b',
      ],
    ],
  })
  assertType<typeof event>({
    eventName: 'Transfer',
    args: { from: null, to: ['0x', '0x'] },
  })
  expect(event).toEqual({
    args: {
      from: null,
      to: [
        '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        '0xc961145a54C96E3aE9bAA048c4F4D6b04C13916b',
      ],
    },
    eventName: 'Transfer',
  })
})

test('unnamed args: Transfer(address,address,uint256)', () => {
  const event = decodeEventTopics({
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
    topics: [
      '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      null,
      '0x000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac',
    ],
  })
  assertType<typeof event>({ eventName: 'Transfer', args: [null, '0x'] })
  expect(event).toEqual({
    args: [null, '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC'],
    eventName: 'Transfer',
  })
})

test('unnamed args: Transfer(address,address,uint256)', () => {
  const event = decodeEventTopics({
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
    topics: [
      '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      null,
      [
        '0x000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac',
        '0x000000000000000000000000c961145a54c96e3ae9baa048c4f4d6b04c13916b',
      ],
    ],
  })
  assertType<typeof event>({
    eventName: 'Transfer',
    args: [null, ['0x', '0x']],
  })
  expect(event).toEqual({
    args: [
      null,
      [
        '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        '0xc961145a54C96E3aE9bAA048c4F4D6b04C13916b',
      ],
    ],
    eventName: 'Transfer',
  })
})

test('Foo(string)', () => {
  const event = decodeEventTopics({
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
  const event = decodeEventTopics({
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

test("errors: event doesn't exist", () => {
  expect(() =>
    decodeEventTopics({
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
      topics: [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8',
      ],
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    "Encoded event signature \\"0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef\\" not found on ABI.
    Make sure you are using the correct ABI and that the event exists on it.
    You can look up the signature here: https://openchain.xyz/signatures?query=0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef.

    Docs: https://viem.sh/docs/contract/decodeEventTopics
    Version: viem@1.0.2"
  `)
})
