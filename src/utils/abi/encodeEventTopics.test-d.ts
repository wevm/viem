import type { Abi } from 'abitype'
import { expectTypeOf, test } from 'vitest'

import { seaportContractConfig } from '~test/src/abis.js'
import {
  type EncodeEventTopicsParameters,
  encodeEventTopics,
} from './encodeEventTopics.js'

test('default', () => {
  encodeEventTopics({
    abi: seaportContractConfig.abi,
    eventName: 'CounterIncremented',
    args: {
      offerer: '0x',
    },
  })
})

test('defined inline', () => {
  encodeEventTopics({
    abi: [
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,

            name: 'newCounter',
            type: 'uint256',
          },
          {
            indexed: true,

            name: 'offerer',
            type: 'address',
          },
        ],
        name: 'CounterIncremented',
        type: 'event',
      },
    ],
    eventName: 'CounterIncremented',
    args: {
      offerer: '0x',
    },
  })
})

test('declared as Abi', () => {
  const abi = [
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,

          name: 'newCounter',
          type: 'uint256',
        },
        {
          indexed: true,

          name: 'offerer',
          type: 'address',
        },
      ],
      name: 'CounterIncremented',
      type: 'event',
    },
  ] as Abi
  encodeEventTopics({
    abi,
    eventName: 'SoldOutError',
    args: ['0x'],
  })

  encodeEventTopics({
    abi,
    args: ['0x'],
  })
})

test('no const assertion', () => {
  const abi = [
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,

          name: 'newCounter',
          type: 'uint256',
        },
        {
          indexed: true,

          name: 'offerer',
          type: 'address',
        },
      ],
      name: 'CounterIncremented',
      type: 'event',
    },
  ]
  encodeEventTopics({
    abi,
    eventName: 'SoldOutError',
    args: ['0x'],
  })

  encodeEventTopics({
    abi,
    args: ['0x'],
  })
})

test('single abi error, eventName not required', () => {
  const abi = [
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,

          name: 'newCounter',
          type: 'uint256',
        },
        {
          indexed: true,

          name: 'offerer',
          type: 'address',
        },
      ],
      name: 'CounterIncremented',
      type: 'event',
    },
  ] as const
  encodeEventTopics({
    abi,
    args: {
      offerer: '0x',
    },
  })

  type Result = EncodeEventTopicsParameters<typeof abi>
  expectTypeOf<Result['eventName']>().toEqualTypeOf<
    'CounterIncremented' | undefined
  >()
})

test('multiple abi errors, eventName required', () => {
  // @ts-expect-error eventName required
  encodeEventTopics({
    abi: seaportContractConfig.abi,
  })

  type Result = EncodeEventTopicsParameters<typeof seaportContractConfig.abi>
  expectTypeOf<Result['eventName']>().not.toEqualTypeOf<undefined>()
})

test('abi has no errors', () => {
  // @ts-expect-error
  encodeEventTopics({
    abi: [
      {
        inputs: [],
        name: 'Foo',
        outputs: [],
        type: 'function',
        stateMutability: 'view',
      },
    ],
  })
})
