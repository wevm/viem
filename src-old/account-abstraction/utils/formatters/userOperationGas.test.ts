import { expect, test } from 'vitest'
import { formatUserOperationGas } from './userOperationGas.js'

test('default', () => {
  expect(
    formatUserOperationGas({
      callGasLimit: '0x1',
      paymasterPostOpGasLimit: '0x6',
      paymasterVerificationGasLimit: '0x5',
      preVerificationGas: '0x3',
      verificationGasLimit: '0x4',
    }),
  ).toMatchInlineSnapshot(`
    {
      "callGasLimit": 1n,
      "paymasterPostOpGasLimit": 6n,
      "paymasterVerificationGasLimit": 5n,
      "preVerificationGas": 3n,
      "verificationGasLimit": 4n,
    }
  `)
})
