import type { Address } from 'abitype'
import { expectTypeOf, test } from 'vitest'

import { decodeFunctionResult } from './decodeFunctionResult.js'

test('default', () => {
  const data = decodeFunctionResult({
    abi: [
      {
        inputs: [],
        name: 'foo',
        outputs: [
          {
            name: 'sender',
            type: 'address',
          },
        ],
        stateMutability: 'pure',
        type: 'function',
      },
    ],
    functionName: 'foo',
    data: '0x000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac',
  })

  expectTypeOf(data).toEqualTypeOf<Address>()
})

test('inferred functionName', () => {
  expectTypeOf(
    decodeFunctionResult({
      abi: [
        {
          inputs: [],
          name: 'foo',
          outputs: [
            {
              name: 'sender',
              type: 'address',
            },
          ],
          stateMutability: 'pure',
          type: 'function',
        },
      ],
      data: '0x000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac',
    }),
  ).toEqualTypeOf<Address>()
})
