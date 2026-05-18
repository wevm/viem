import { expect, test } from 'vitest'
import { assertEip712Request } from './assertEip712Request.js'

test('default', () => {
  assertEip712Request({
    account: '0x0000000000000000000000000000000000000000',
    type: 'eip712',
  })

  expect(() =>
    assertEip712Request({
      account: '0x0000000000000000000000000000000000000000',
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [InvalidEip712TransactionError: Transaction is not an EIP712 transaction.

    Transaction must:
      - include \`type: "eip712"\`
      - include one of the following: \`customSignature\`, \`paymaster\`, \`paymasterInput\`, \`gasPerPubdata\`, \`factoryDeps\`

    Version: viem@x.y.z]
  `)

  expect(() =>
    assertEip712Request({
      account: '0x0000000000000000000000000000000000000000',
      maxFeePerGas: 1n,
      maxPriorityFeePerGas: 2n,
      type: 'eip712',
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [TipAboveFeeCapError: The provided tip (\`maxPriorityFeePerGas\` = 0.000000002 gwei) cannot be higher than the fee cap (\`maxFeePerGas\` = 0.000000001 gwei).

    Version: viem@x.y.z]
  `)
})
