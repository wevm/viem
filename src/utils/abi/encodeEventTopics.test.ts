import { expect, test } from 'vitest'

import { encodeEventTopics } from './encodeEventTopics.js'

test('Transfer()', () => {
  expect(
    encodeEventTopics({
      abi: [
        {
          inputs: [],
          name: 'Transfer',
          type: 'event',
        },
      ],
      eventName: 'Transfer',
    }),
  ).toEqual([
    '0x406dade31f7ae4b5dbc276258c28dde5ae6d5c2773c5745802c493a2360e55e0',
  ])
  expect(
    encodeEventTopics({
      abi: [
        {
          name: 'Transfer',
          type: 'event',
        },
      ],
      eventName: 'Transfer',
    }),
  ).toEqual([
    '0x406dade31f7ae4b5dbc276258c28dde5ae6d5c2773c5745802c493a2360e55e0',
  ])
})

test('no args: Transfer(address,address,uint256)', () => {
  expect(
    encodeEventTopics({
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
    }),
  ).toEqual([
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
  ])

  expect(
    encodeEventTopics({
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
      args: {},
    }),
  ).toEqual([
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
  ])

  expect(
    encodeEventTopics({
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
      eventName: 'Transfer',
      args: [],
    }),
  ).toEqual([
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
  ])
})

test('named args: Transfer(address,address,uint256)', () => {
  expect(
    encodeEventTopics({
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
      args: {
        from: null,
        to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
      },
    }),
  ).toEqual([
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    null,
    '0x000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac',
  ])
})

test('named args: Transfer(address,address,uint256)', () => {
  expect(
    encodeEventTopics({
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
      args: {
        from: null,
        to: [
          '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
          '0xc961145a54C96E3aE9bAA048c4F4D6b04C13916b',
        ],
      },
    }),
  ).toEqual([
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    null,
    [
      '0x000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac',
      '0x000000000000000000000000c961145a54c96e3ae9baa048c4f4d6b04c13916b',
    ],
  ])
})

test('unnamed args: Transfer(address,address,uint256)', () => {
  expect(
    encodeEventTopics({
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
      eventName: 'Transfer',
      args: [null, '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC'],
    }),
  ).toEqual([
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    null,
    '0x000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac',
  ])
})

test('unnamed args: Transfer(address,address,uint256)', () => {
  expect(
    encodeEventTopics({
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
      eventName: 'Transfer',
      args: [
        null,
        [
          '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
          '0xc961145a54C96E3aE9bAA048c4F4D6b04C13916b',
        ],
      ],
    }),
  ).toEqual([
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    null,
    [
      '0x000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac',
      '0x000000000000000000000000c961145a54c96e3ae9baa048c4f4d6b04c13916b',
    ],
  ])
})

test('Foo(string)', () => {
  expect(
    encodeEventTopics({
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
      eventName: 'Foo',
      args: {
        message: 'hello',
      },
    }),
  ).toEqual([
    '0x9f0b7f1630bdb7d474466e2dfef0fb9dff65f7a50eec83935b68f77d0808f08a',
    '0x1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8',
  ])
})

test('Foo((uint,string))', () => {
  expect(() =>
    encodeEventTopics({
      abi: [
        {
          inputs: [
            {
              components: [
                {
                  name: 'a',
                  type: 'uint256',
                },
                {
                  name: 'b',
                  type: 'string',
                },
              ],
              indexed: true,
              name: 'x',
              type: 'tuple',
            },
          ],
          name: 'Bar',
          type: 'event',
        },
      ],
      eventName: 'Bar',
      args: {
        x: {
          a: 1n,
          b: 'hello',
        },
      },
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [FilterTypeNotSupportedError: Filter type "tuple" is not supported.

    Version: viem@x.y.z]
  `)
})

test('leading non-indexed args: Bar(string,string)', () => {
  expect(
    encodeEventTopics({
      abi: [
        {
          inputs: [
            {
              indexed: false,
              name: 'title',
              type: 'string',
            },
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
      eventName: 'Bar',
      args: {
        message: 'hello',
      },
    }),
  ).toEqual([
    '0xc4a51b4017224dc1cc4aff8acc6d8da6475dfcb9743bb821dc45c91454526cbd',
    '0x1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8',
  ])
})

test('inferred eventName', () => {
  expect(
    encodeEventTopics({
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
      args: {
        from: null,
        to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
      },
    }),
  ).toEqual([
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    null,
    '0x000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac',
  ])
})

test("errors: event doesn't exist", () => {
  expect(() =>
    encodeEventTopics({
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
      // @ts-expect-error
      eventName: 'Bar',
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [AbiEventNotFoundError: Event "Bar" not found on ABI.
    Make sure you are using the correct ABI and that the event exists on it.

    Docs: https://viem.sh/docs/contract/encodeEventTopics
    Version: viem@x.y.z]
  `)
})

test('errors: abi item not an event', () => {
  expect(() =>
    // @ts-expect-error
    encodeEventTopics({
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
          type: 'function',
          outputs: [],
          stateMutability: 'pure',
        },
      ],
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [AbiEventNotFoundError: Event not found on ABI.
    Make sure you are using the correct ABI and that the event exists on it.

    Docs: https://viem.sh/docs/contract/encodeEventTopics
    Version: viem@x.y.z]
  `)
})

test("errors: event doesn't exist", () => {
  expect(
    encodeEventTopics({
      abi: [
        {
          inputs: undefined,
          name: 'Foo',
          type: 'event',
        },
      ],
      eventName: 'Foo',
      args: [],
    }),
  ).toMatchInlineSnapshot(`
    [
      "0xbfb4ebcfff8f360b39de1de85df1edc256d63337b743120bf6e2e2144b973d38",
    ]
  `)
})
