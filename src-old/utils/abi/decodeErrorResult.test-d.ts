import { expectTypeOf, test } from 'vitest'

import { decodeErrorResult } from './decodeErrorResult.js'

test('default', async () => {
  const result = decodeErrorResult({
    abi: [
      {
        inputs: [
          {
            name: 'foo',
            type: 'string',
          },
        ],
        name: 'FooError',
        type: 'error',
      },
    ],
    data: '0x83aa206e0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001a796f7520646f206e6f7420686176652061636365737320736572000000000000',
  })

  expectTypeOf(result).toEqualTypeOf<{
    abiItem: {
      readonly inputs: readonly [
        {
          readonly name: 'foo'
          readonly type: 'string'
        },
      ]
      readonly name: 'FooError'
      readonly type: 'error'
    }
    errorName: 'FooError'
    args: readonly [string]
  }>()
})

test('multiple', async () => {
  const result = decodeErrorResult({
    abi: [
      {
        inputs: [
          {
            name: 'foo',
            type: 'string',
          },
        ],
        name: 'FooError',
        type: 'error',
      },
      {
        inputs: [
          {
            name: 'bar',
            type: 'uint256',
          },
        ],
        name: 'BarError',
        type: 'error',
      },
    ],
    data: '0x83aa206e0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001a796f7520646f206e6f7420686176652061636365737320736572000000000000',
  })

  expectTypeOf(result).toEqualTypeOf<
    | {
        abiItem: {
          readonly inputs: readonly [
            {
              readonly name: 'bar'
              readonly type: 'uint256'
            },
          ]
          readonly name: 'BarError'
          readonly type: 'error'
        }
        errorName: 'BarError'
        args: readonly [bigint]
      }
    | {
        abiItem: {
          readonly inputs: readonly [
            {
              readonly name: 'foo'
              readonly type: 'string'
            },
          ]
          readonly name: 'FooError'
          readonly type: 'error'
        }
        errorName: 'FooError'
        args: readonly [string]
      }
  >()
})

test('no abi', async () => {
  const result = decodeErrorResult({
    abi: [],
    data: '0x83aa206e0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001a796f7520646f206e6f7420686176652061636365737320736572000000000000',
  })

  expectTypeOf(result).toEqualTypeOf<{
    abiItem: never
    args: readonly unknown[]
    errorName: string
  }>()
})
