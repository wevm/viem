import { expect, test } from 'vitest'
import { assertEip712Transaction } from './assertEip712Transaction.js'

test('default', () => {
  assertEip712Transaction({
    chainId: 1,
    type: 'eip712',
  })

  expect(() => assertEip712Transaction({})).toThrowErrorMatchingInlineSnapshot(`
    [InvalidEip712TransactionError: Transaction is not an EIP712 transaction.

    Transaction must:
      - include \`type: "eip712"\`
      - include one of the following: \`customSignature\`, \`paymaster\`, \`paymasterInput\`, \`gasPerPubdata\`, \`factoryDeps\`

    Version: viem@x.y.z]
  `)

  expect(() =>
    assertEip712Transaction({
      type: 'eip712',
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [InvalidChainIdError: Chain ID is invalid.

    Version: viem@x.y.z]
  `)

  expect(() =>
    assertEip712Transaction({
      chainId: -1,
      type: 'eip712',
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [InvalidChainIdError: Chain ID "-1" is invalid.

    Version: viem@x.y.z]
  `)

  expect(() =>
    assertEip712Transaction({
      chainId: 300,
      to: '0x',
      type: 'eip712',
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [InvalidAddressError: Address "0x" is invalid.

    - Address must be a hex value of 20 bytes (40 hex characters).
    - Address must match its checksum counterpart.

    Version: viem@x.y.z]
  `)

  expect(() =>
    assertEip712Transaction({
      chainId: 300,
      from: '0x',
      type: 'eip712',
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [InvalidAddressError: Address "0x" is invalid.

    - Address must be a hex value of 20 bytes (40 hex characters).
    - Address must match its checksum counterpart.

    Version: viem@x.y.z]
  `)

  expect(() =>
    assertEip712Transaction({
      chainId: 300,
      paymaster: '0x',
      type: 'eip712',
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [InvalidAddressError: Address "0x" is invalid.

    - Address must be a hex value of 20 bytes (40 hex characters).
    - Address must match its checksum counterpart.

    Version: viem@x.y.z]
  `)

  expect(() =>
    assertEip712Transaction({
      chainId: 300,
      paymaster: '0x0000000000000000000000000000000000000000',
      type: 'eip712',
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [BaseError: \`paymasterInput\` must be provided when \`paymaster\` is defined

    Version: viem@x.y.z]
  `)

  expect(() =>
    assertEip712Transaction({
      chainId: 300,
      paymasterInput: '0x0000000000000000000000000000000000000000',
      type: 'eip712',
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [BaseError: \`paymaster\` must be provided when \`paymasterInput\` is defined

    Version: viem@x.y.z]
  `)
})
