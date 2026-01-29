import type { Abi } from 'abitype'
import { expectTypeOf, test } from 'vitest'

import { seaportContractConfig } from '~test/src/abis.js'
import {
  type EncodeErrorResultParameters,
  encodeErrorResult,
} from './encodeErrorResult.js'

test('default', () => {
  encodeErrorResult({
    abi: seaportContractConfig.abi,
    errorName: 'BadFraction',
    args: [],
  })
})

test('defined inline', () => {
  encodeErrorResult({
    abi: [
      {
        inputs: [{ type: 'address' }],
        name: 'SoldOutError',
        type: 'error',
      },
    ],
    errorName: 'SoldOutError',
    args: ['0x'],
  })
})

test('declared as Abi', () => {
  const abi = [
    {
      inputs: [{ type: 'address' }],
      name: 'SoldOutError',
      type: 'error',
    },
  ] as Abi
  encodeErrorResult({
    abi,
    errorName: 'SoldOutError',
    args: ['0x'],
  })

  encodeErrorResult({
    abi,
    args: ['0x'],
  })
})

test('no const assertion', () => {
  const abi = [
    {
      inputs: [{ type: 'address' }],
      name: 'SoldOutError',
      type: 'error',
    },
  ]
  encodeErrorResult({
    abi,
    errorName: 'SoldOutError',
    args: ['0x'],
  })

  encodeErrorResult({
    abi,
    args: ['0x'],
  })
})

test('single abi error, errorName not required', () => {
  const abi = [
    {
      inputs: [{ type: 'address' }],
      name: 'SoldOutError',
      type: 'error',
    },
  ] as const
  encodeErrorResult({
    abi,
    args: ['0x'],
  })

  type Result = EncodeErrorResultParameters<typeof abi>
  expectTypeOf<Result['errorName']>().toEqualTypeOf<
    'SoldOutError' | undefined
  >()
})

test('multiple abi errors, errorName required', () => {
  // @ts-expect-error errorName required
  encodeErrorResult({
    abi: seaportContractConfig.abi,
  })

  type Result = EncodeErrorResultParameters<typeof seaportContractConfig.abi>
  expectTypeOf<Result['errorName']>().not.toEqualTypeOf<undefined>()
})

test('abi has no errors', () => {
  // @ts-expect-error
  encodeErrorResult({
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
