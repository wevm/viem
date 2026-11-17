import type { Address } from 'ox/Address'
import type { Hex } from 'ox/Hex'
import { type Capabilities, ExecutionError } from 'viem/tempo'
import { expectTypeOf, test } from 'vitest'

test('narrows decoded arguments by error name', () => {
  const error = ExecutionError.from(new Error('reverted'))
  if (error.errorName === 'TokenAlreadyExists') {
    expectTypeOf(error.args).toEqualTypeOf<readonly [Address] | undefined>()
    expectTypeOf(error.data).toEqualTypeOf<Hex>()
  }
  expectTypeOf(error.message).toEqualTypeOf<string>()
})

test('preserves the original error and custom property types', () => {
  const original = Object.assign(new TypeError('reverted'), { code: -32000 })
  const error = ExecutionError.from(original)
  expectTypeOf(error).toExtend<TypeError>()
  expectTypeOf(error.code).toEqualTypeOf<number>()
  expectTypeOf(error.stack).toEqualTypeOf<string | undefined>()

  const object = ExecutionError.from({
    data: '0x82b42900',
    message: 'original' as const,
    errorName: 'stale' as const,
    requestId: 'request-1' as const,
  })
  expectTypeOf(object.requestId).toEqualTypeOf<'request-1'>()
  expectTypeOf(object.message).toEqualTypeOf<string>()
  expectTypeOf(object.errorName).not.toEqualTypeOf<'stale'>()
})

test('accepts selectors without adding Error instance properties', () => {
  const error = ExecutionError.from('0x82b42900')
  expectTypeOf(error.data).toExtend<Hex>()
  // @ts-expect-error Hex input produces a plain object.
  error.stack
})

test('accepts nested revert data on plain error objects', () => {
  const error = ExecutionError.from({
    data: { data: '0x82b42900' },
    message: 'reverted',
    requestId: 'request-1' as const,
  })
  expectTypeOf(error.requestId).toEqualTypeOf<'request-1'>()
  if (error.errorName === 'Unauthorized')
    expectTypeOf(error.data).toEqualTypeOf<Hex>()
})

test('omits decoded arguments from RPC errors', () => {
  const error = ExecutionError.serialize(
    ExecutionError.from(new Error('reverted')),
  )
  expectTypeOf(error).toEqualTypeOf<ExecutionError.Rpc>()
  // @ts-expect-error RPC errors omit decoded arguments.
  error.args
})

test('fill error capabilities use the serialized execution error type', () => {
  expectTypeOf<
    NonNullable<Capabilities.FillTransactionCapabilities['error']>
  >().toEqualTypeOf<ExecutionError.Rpc>()
  const capability: Capabilities.FillTransactionCapabilities = {
    error: ExecutionError.serialize(ExecutionError.from('0x82b42900')),
  }
  if (capability.error?.errorName === 'Unauthorized') {
    expectTypeOf(capability.error.data).toEqualTypeOf<Hex>()
    // @ts-expect-error Serialized capabilities omit decoded arguments.
    capability.error.args
  }
})
