import { describe, expect, test } from 'vitest'
import type { UserOperation } from '../../types/userOperation.js'
import { toPackedUserOperation } from './toPackedUserOperation.js'

const paymasterSignatureMagic = '0x22e325a297439656'

describe('toPackedUserOperation', () => {
  const baseUserOp: UserOperation<'0.9'> = {
    callData: '0x',
    callGasLimit: 6942069n,
    maxFeePerGas: 69420n,
    maxPriorityFeePerGas: 69n,
    nonce: 0n,
    preVerificationGas: 6942069n,
    sender: '0x1234567890123456789012345678901234567890',
    signature: '0x',
    verificationGasLimit: 6942069n,
  }

  test('default', () => {
    const packed = toPackedUserOperation(baseUserOp)
    expect(packed.paymasterAndData).toBe('0x')
  })

  test('paymaster without signature', () => {
    const userOp: UserOperation<'0.9'> = {
      ...baseUserOp,
      paymaster: '0x1234567890123456789012345678901234567890',
      paymasterVerificationGasLimit: 6942069n,
      paymasterPostOpGasLimit: 6942069n,
      paymasterData: '0xdeadbeef',
    }
    const packed = toPackedUserOperation(userOp)
    expect(packed.paymasterAndData).toMatchInlineSnapshot(
      `"0x12345678901234567890123456789012345678900000000000000000000000000069ed750000000000000000000000000069ed75deadbeef"`,
    )
  })

  describe('paymasterSignature encoding', () => {
    const userOpWithPaymasterSig: UserOperation<'0.9'> = {
      ...baseUserOp,
      paymaster: '0x1234567890123456789012345678901234567890',
      paymasterVerificationGasLimit: 6942069n,
      paymasterPostOpGasLimit: 6942069n,
      paymasterData: '0xdeadbeef',
      paymasterSignature: '0xcafebabe',
    }

    test('forHash: true - uses magic only', () => {
      const packed = toPackedUserOperation(userOpWithPaymasterSig, {
        forHash: true,
      })
      expect(packed.paymasterAndData).toMatchInlineSnapshot(
        `"0x12345678901234567890123456789012345678900000000000000000000000000069ed750000000000000000000000000069ed75deadbeef22e325a297439656"`,
      )
      expect(
        packed.paymasterAndData.endsWith(paymasterSignatureMagic.slice(2)),
      ).toBe(true)
    })

    test('forHash: false - includes signature + length + magic', () => {
      const packed = toPackedUserOperation(userOpWithPaymasterSig, {
        forHash: false,
      })
      expect(packed.paymasterAndData).toMatchInlineSnapshot(
        `"0x12345678901234567890123456789012345678900000000000000000000000000069ed750000000000000000000000000069ed75deadbeefcafebabe000422e325a297439656"`,
      )
      expect(
        packed.paymasterAndData.endsWith(paymasterSignatureMagic.slice(2)),
      ).toBe(true)
      expect(packed.paymasterAndData).toContain('cafebabe')
      expect(packed.paymasterAndData).toContain('0004')
    })

    test('default (no options) - includes signature + length + magic', () => {
      const packed = toPackedUserOperation(userOpWithPaymasterSig)
      expect(packed.paymasterAndData).toMatchInlineSnapshot(
        `"0x12345678901234567890123456789012345678900000000000000000000000000069ed750000000000000000000000000069ed75deadbeefcafebabe000422e325a297439656"`,
      )
    })

    test('longer signature encodes correct length', () => {
      const longSig =
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef00'
      const userOp: UserOperation<'0.9'> = {
        ...baseUserOp,
        paymaster: '0x1234567890123456789012345678901234567890',
        paymasterVerificationGasLimit: 1n,
        paymasterPostOpGasLimit: 1n,
        paymasterSignature: longSig,
      }
      const packed = toPackedUserOperation(userOp)
      expect(packed.paymasterAndData).toContain('0041')
    })
  })
})
