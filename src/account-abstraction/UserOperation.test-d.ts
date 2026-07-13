import type { Hex, Signature } from 'viem/utils'
import { UserOperation } from 'viem/account-abstraction'
import { expectTypeOf, test } from 'vitest'

const sender = '0x0000000000000000000000000000000000000001'
const operation = {
  callData: '0x',
  callGasLimit: 1n,
  maxFeePerGas: 1n,
  maxPriorityFeePerGas: 1n,
  nonce: 1n,
  preVerificationGas: 1n,
  sender,
  verificationGasLimit: 1n,
} as const
declare const signature: Signature.Signature

test('Request', () => {
  const calls = [{ to: sender }] as const
  const request = { calls } satisfies UserOperation.Request<'0.9', typeof calls>
  expectTypeOf(request.calls[0].to).toEqualTypeOf<typeof sender>()

  const encoded = { callData: '0x' } satisfies UserOperation.Request<'0.9'>
  expectTypeOf(encoded.callData).toEqualTypeOf<'0x'>()

  // @ts-expect-error A request requires calls or callData.
  const empty: UserOperation.Request<'0.9'> = {}
  void empty

  // @ts-expect-error Calls and callData are mutually exclusive.
  const ambiguous: UserOperation.Request<'0.9', typeof calls> = {
    callData: '0x',
    calls,
  }
  void ambiguous
})

test('from: structured signature', () => {
  const signed = UserOperation.from(operation, { signature })
  expectTypeOf(signed.signature).toEqualTypeOf<Hex.Hex>()
})
