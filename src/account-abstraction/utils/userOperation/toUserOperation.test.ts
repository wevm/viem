import { expect, test } from 'vitest'
import type {
  PackedUserOperation,
  UserOperation,
} from '../../types/userOperation.js'
import { toPackedUserOperation } from './toPackedUserOperation.js'
import { toUserOperation } from './toUserOperation.js'

test('round trip: basic user operation', () => {
  const userOp: UserOperation = {
    callData: '0x',
    callGasLimit: 200000n,
    maxFeePerGas: 20000000000n,
    maxPriorityFeePerGas: 1000000000n,
    nonce: 0n,
    preVerificationGas: 50000n,
    sender: '0x1234567890123456789012345678901234567890',
    signature: '0x',
    verificationGasLimit: 100000n,
  }

  expect(toUserOperation(toPackedUserOperation(userOp))).toStrictEqual({
    ...userOp,
    // packed format adds these empty fields for absent optional data
    initCode: '0x',
    paymasterAndData: '0x',
  })
})

test('round trip: with factory fields', () => {
  const original: UserOperation = {
    callData: '0x',
    callGasLimit: 200000n,
    maxFeePerGas: 20000000000n,
    maxPriorityFeePerGas: 1000000000n,
    nonce: 0n,
    preVerificationGas: 50000n,
    sender: '0x1234567890123456789012345678901234567890',
    signature: '0x',
    verificationGasLimit: 100000n,
    factory: '0x1234567890123456789012345678901234567890',
    factoryData: '0xdeadbeef',
  }

  expect(toUserOperation(toPackedUserOperation(original))).toStrictEqual({
    ...original,
    // packed format adds these empty fields for absent optional data
    paymasterAndData: '0x',
  })
})

test('round trip: complete operation with all fields', () => {
  const original: UserOperation = {
    callData:
      '0xb61d27f60000000000000000000000004e59b44847b379578588920ca78fbf26c0b4956c',
    callGasLimit: 211314n,
    maxFeePerGas: 49900000336n,
    maxPriorityFeePerGas: 1650000n,
    nonce: 32324340618445458439256401772544n,
    preVerificationGas: 66333n,
    sender: '0x11e70472DC78AD2e11650B497cAB1f55a647914c',
    signature:
      '0xbf0c42a5f75c5159bb9c32864e6ff3cccb7bef6a0e019aaca9b54740efb6ad5f4a80b2d4106cc67ac94d7a8bcb345362210c2165b67e48f4646039065d58865e1b',
    verificationGasLimit: 61585n,
    factory: '0x1234567890123456789012345678901234567890',
    factoryData: '0xdeadbeef',
    paymaster: '0x777777777777aec03fd955926dbf81597e66834c',
    paymasterVerificationGasLimit: 150000n,
    paymasterPostOpGasLimit: 100000n,
    paymasterData: '0xcafebabe',
  }

  expect(toUserOperation(toPackedUserOperation(original))).toStrictEqual(
    original,
  )
})

test('idempotency: preserves already unpacked user operation', () => {
  const original: UserOperation = {
    callData: '0x',
    callGasLimit: 200000n,
    maxFeePerGas: 20000000000n,
    maxPriorityFeePerGas: 1000000000n,
    nonce: 0n,
    preVerificationGas: 50000n,
    sender: '0x1234567890123456789012345678901234567890',
    signature: '0x',
    verificationGasLimit: 100000n,
  }

  expect(toUserOperation(original)).toStrictEqual(original)
})

test('edge case: mixed packed and unpacked fields', () => {
  // Test with some fields already unpacked and some still packed
  const mixedUserOperation = {
    sender: '0x1234567890123456789012345678901234567890',
    nonce: 0n,
    initCode: '0x',
    callData: '0x',
    // Already unpacked gas limits - these should be preserved
    callGasLimit: 300000n,
    verificationGasLimit: 150000n,
    preVerificationGas: 50000n,
    // Still packed gas fees - these should be unpacked
    gasFees: '0x0000000000000000000000003b9aca000000000000000000000004a817c800',
    paymasterAndData: '0x',
    signature: '0x',
  } as any // Using 'as any' since this mixed format doesn't match either type

  expect(toUserOperation(mixedUserOperation)).toStrictEqual({
    sender: '0x1234567890123456789012345678901234567890',
    nonce: 0n,
    initCode: '0x',
    callData: '0x',
    callGasLimit: 300000n,
    verificationGasLimit: 150000n,
    preVerificationGas: 50000n,
    maxPriorityFeePerGas: 1000000000n,
    maxFeePerGas: 20000000000n,
    paymasterAndData: '0x',
    signature: '0x',
  })
})

test('edge case: zero values in packed format', () => {
  const packedUserOperation: PackedUserOperation = {
    sender: '0x1234567890123456789012345678901234567890',
    nonce: 0n,
    initCode: '0x',
    callData: '0x',
    // All zeros
    accountGasLimits:
      '0x00000000000000000000000000000000000000000000000000000000000000000',
    preVerificationGas: 0n,
    gasFees:
      '0x00000000000000000000000000000000000000000000000000000000000000000',
    paymasterAndData: '0x',
    signature: '0x',
  }

  expect(toUserOperation(packedUserOperation)).toStrictEqual({
    sender: '0x1234567890123456789012345678901234567890',
    nonce: 0n,
    initCode: '0x',
    callData: '0x',
    verificationGasLimit: 0n,
    callGasLimit: 0n,
    preVerificationGas: 0n,
    maxPriorityFeePerGas: 0n,
    maxFeePerGas: 0n,
    paymasterAndData: '0x',
    signature: '0x',
  })
})

test('edge case: short paymasterAndData not unpacked', () => {
  // Test that short paymasterAndData (less than minimum packed format) is preserved as-is
  const packedUserOperation: PackedUserOperation = {
    sender: '0x1234567890123456789012345678901234567890',
    nonce: 0n,
    initCode: '0x',
    callData: '0x',
    accountGasLimits:
      '0x00000000000000000000000030d400000000000000000000000001e8480',
    preVerificationGas: 50000n,
    gasFees: '0x0000000000000000000000003b9aca000000000000000000000004a817c800',
    paymasterAndData: '0x1234', // Too short to be packed format
    signature: '0x',
  }

  expect(toUserOperation(packedUserOperation)).toStrictEqual({
    sender: '0x1234567890123456789012345678901234567890',
    nonce: 0n,
    initCode: '0x',
    callData: '0x',
    verificationGasLimit: 819200000n,
    callGasLimit: 2000000n,
    preVerificationGas: 50000n,
    maxPriorityFeePerGas: 1000000000n,
    maxFeePerGas: 20000000000n,
    paymasterAndData: '0x1234', // Should preserve short paymasterAndData as-is
    signature: '0x',
  })
})

test('edge case: EIP-7702 authorization prefix in initCode', () => {
  // Test handling of EIP-7702 authorization prefix
  const packedUserOperation: PackedUserOperation = {
    sender: '0x1234567890123456789012345678901234567890',
    nonce: 0n,
    initCode: '0x7702000000000000000000000000000000000000',
    callData: '0x',
    accountGasLimits:
      '0x00000000000000000000000030d400000000000000000000000001e8480',
    preVerificationGas: 50000n,
    gasFees: '0x0000000000000000000000003b9aca000000000000000000000004a817c800',
    paymasterAndData: '0x',
    signature: '0x',
  }

  expect(toUserOperation(packedUserOperation)).toStrictEqual({
    sender: '0x1234567890123456789012345678901234567890',
    nonce: 0n,
    callData: '0x',
    verificationGasLimit: 819200000n,
    callGasLimit: 2000000n,
    preVerificationGas: 50000n,
    maxPriorityFeePerGas: 1000000000n,
    maxFeePerGas: 20000000000n,
    paymasterAndData: '0x',
    signature: '0x',
    factory: '0x7702000000000000000000000000000000000000',
  })
})

test('edge case: packed paymaster unpacking', () => {
  // Test unpacking of properly formatted packed paymasterAndData
  const packedUserOperation: PackedUserOperation = {
    sender: '0x1234567890123456789012345678901234567890',
    nonce: 0n,
    initCode: '0x',
    callData: '0x',
    accountGasLimits:
      '0x00000000000000000000000030d400000000000000000000000001e8480',
    preVerificationGas: 50000n,
    gasFees: '0x0000000000000000000000003b9aca000000000000000000000004a817c800',
    // Packed paymaster: paymaster(20) + verificationGasLimit(16) + postOpGasLimit(16) + data
    // paymaster: 777777777777aec03fd955926dbf81597e66834c (20 bytes)
    // verificationGasLimit: 000000000000000000000000000249f0 (16 bytes = 150000)
    // postOpGasLimit: 000000000000000000000000000186a0 (16 bytes = 100000)
    // data: cafebabe (4 bytes)
    paymasterAndData:
      '0x777777777777aec03fd955926dbf81597e66834c000000000000000000000000000249f0000000000000000000000000000186a0cafebabe',
    signature: '0x',
  }

  expect(toUserOperation(packedUserOperation)).toStrictEqual({
    sender: '0x1234567890123456789012345678901234567890',
    nonce: 0n,
    initCode: '0x',
    callData: '0x',
    verificationGasLimit: 819200000n,
    callGasLimit: 2000000n,
    preVerificationGas: 50000n,
    maxPriorityFeePerGas: 1000000000n,
    maxFeePerGas: 20000000000n,
    signature: '0x',
    paymaster: '0x777777777777aec03fd955926dbf81597e66834c',
    paymasterVerificationGasLimit: 150000n,
    paymasterPostOpGasLimit: 100000n,
    paymasterData: '0xcafebabe',
  })
})
