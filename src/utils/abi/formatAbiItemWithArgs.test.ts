import { expect, test } from 'vitest'

import { formatAbiItemWithArgs } from './formatAbiItemWithArgs.js'

test('default', () => {
  expect(
    formatAbiItemWithArgs({
      abiItem: {
        name: 'foo',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
        inputs: [],
      },
      args: [],
    }),
  ).toEqual('foo()')

  expect(
    formatAbiItemWithArgs({
      abiItem: {
        name: 'foo',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
        inputs: [
          {
            name: 'x',
            type: 'uint256',
          },
          {
            name: 'sender',
            type: 'address',
          },
        ],
      },
      args: [1n, '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC'],
    }),
  ).toEqual('foo(1, 0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC)')

  expect(
    formatAbiItemWithArgs({
      abiItem: {
        name: 'foo',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
        inputs: [
          {
            name: 'x',
            type: 'uint256',
          },
          {
            name: 'sender',
            type: 'address',
          },
        ],
      },
      args: [1n, '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC'],
      includeFunctionName: false,
    }),
  ).toEqual('(1, 0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC)')

  expect(
    formatAbiItemWithArgs({
      abiItem: {
        name: 'foo',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
        inputs: [
          {
            type: 'uint256',
          },
          {
            type: 'address',
          },
        ],
      },
      args: [1n, '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC'],
    }),
  ).toEqual('foo(1, 0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC)')

  expect(
    formatAbiItemWithArgs({
      abiItem: {
        name: 'foo',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
        inputs: [
          {
            components: [
              {
                name: 'x',
                type: 'uint256[]',
              },
              {
                name: 'y',
                type: 'bool',
              },
              {
                name: 'z',
                type: 'string[]',
              },
            ],
            name: 'bar',
            type: 'tuple',
          },
          {
            name: 'a',
            type: 'uint256',
          },
          {
            name: 'b',
            type: 'string[]',
          },
        ],
      },
      args: [
        {
          x: [1n, 2n, 3n, 4n],
          y: true,
          z: ['hello', 'world'],
        },
        420n,
        ['wagmi', 'viem'],
      ],
    }),
  ).toMatchInlineSnapshot(
    `"foo({"x":["1","2","3","4"],"y":true,"z":["hello","world"]}, 420, ["wagmi","viem"])"`,
  )

  expect(
    formatAbiItemWithArgs({
      abiItem: {
        name: 'foo',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
        inputs: [
          {
            components: [
              {
                name: 'x',
                type: 'uint256[]',
              },
              {
                name: 'y',
                type: 'bool',
              },
              {
                name: 'z',
                type: 'string[]',
              },
            ],
            name: 'bar',
            type: 'tuple',
          },
          {
            name: 'a',
            type: 'uint256',
          },
          {
            name: 'b',
            type: 'string[]',
          },
        ],
      },
      args: [
        {
          x: [1n, 2n, 3n, 4n],
          y: true,
          z: ['hello', 'world'],
        },
        420n,
        ['wagmi', 'viem'],
      ],
      includeFunctionName: false,
    }),
  ).toMatchInlineSnapshot(
    `"({"x":["1","2","3","4"],"y":true,"z":["hello","world"]}, 420, ["wagmi","viem"])"`,
  )

  expect(
    formatAbiItemWithArgs({
      abiItem: {
        name: 'foo',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
        inputs: [
          {
            components: [
              {
                name: 'x',
                type: 'uint256[]',
              },
              {
                name: 'y',
                type: 'bool',
              },
              {
                name: 'z',
                type: 'string[]',
              },
            ],
            name: 'bar',
            type: 'tuple',
          },
          {
            name: 'a',
            type: 'uint256',
          },
          {
            name: 'b',
            type: 'string[]',
          },
        ],
      },
      args: [
        {
          x: [1n, 2n, 3n, 4n],
          y: true,
          z: ['hello', 'world'],
        },
        420n,
        ['wagmi', 'viem'],
      ],
      includeName: true,
    }),
  ).toMatchInlineSnapshot(
    `"foo(bar: {"x":["1","2","3","4"],"y":true,"z":["hello","world"]}, a: 420, b: ["wagmi","viem"])"`,
  )

  expect(
    formatAbiItemWithArgs({
      // @ts-expect-error
      abiItem: {
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
        inputs: [],
      },
      args: [],
    }),
  ).toEqual(undefined)
  expect(
    formatAbiItemWithArgs({
      // @ts-expect-error
      abiItem: {
        name: 'foo',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      args: [],
    }),
  ).toEqual(undefined)
  expect(
    formatAbiItemWithArgs({
      abiItem: {
        name: 'foo',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
        // @ts-expect-error
        inputs: undefined,
      },
      args: [],
    }),
  ).toEqual(undefined)
})
