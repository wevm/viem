import { Signature } from 'viem/utils'
import { UserOperation } from 'viem/account-abstraction'
import { expect, test } from 'vitest'

test('from: structured signature', () => {
  const operation = UserOperation.from(
    {
      callData: '0x',
      callGasLimit: 1n,
      maxFeePerGas: 1n,
      maxPriorityFeePerGas: 1n,
      nonce: 1n,
      preVerificationGas: 1n,
      sender: '0x0000000000000000000000000000000000000001',
      verificationGasLimit: 1n,
    },
    {
      signature: Signature.from({
        r: '0x1',
        s: '0x2',
        yParity: 0,
      }),
    },
  )

  expect(operation.signature).toMatchInlineSnapshot(
    `"0x000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000021b"`,
  )
})
