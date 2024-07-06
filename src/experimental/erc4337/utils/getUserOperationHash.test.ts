import { describe, expect, test } from 'vitest'
import { getUserOperationHash } from './getUserOperationHash.js'

describe('entryPoint: 0.7', () => {
  test('default', () => {
    expect(
      getUserOperationHash({
        chainId: 1,
        entryPointAddress: '0x1234567890123456789012345678901234567890',
        entryPointVersion: '0.7',
        userOperation: {
          callData: '0x',
          callGasLimit: 6942069n,
          maxFeePerGas: 69420n,
          maxPriorityFeePerGas: 69n,
          nonce: 0n,
          preVerificationGas: 6942069n,
          sender: '0x1234567890123456789012345678901234567890',
          signature: '0x',
          verificationGasLimit: 6942069n,
        },
      }),
    ).toMatchInlineSnapshot(
      `"0x1903d62bb5dc75af6fed866aa46d8e80063d9e288aa7f2caad0ff1fcae22e40d"`,
    )
  })

  test('args: factory + factoryData', () => {
    expect(
      getUserOperationHash({
        chainId: 1,
        entryPointAddress: '0x1234567890123456789012345678901234567890',
        entryPointVersion: '0.7',
        userOperation: {
          callData: '0x',
          callGasLimit: 6942069n,
          maxFeePerGas: 69420n,
          maxPriorityFeePerGas: 69n,
          nonce: 0n,
          preVerificationGas: 6942069n,
          sender: '0x1234567890123456789012345678901234567890',
          signature: '0x',
          verificationGasLimit: 6942069n,
          factory: '0x1234567890123456789012345678901234567890',
          factoryData: '0xdeadbeef',
        },
      }),
    ).toMatchInlineSnapshot(
      `"0x46c1d51e831d50c1a93135f026a7d3f1921ed66e9c81da723dd3817a49f01bc1"`,
    )
  })

  test('args: paymaster', () => {
    expect(
      getUserOperationHash({
        chainId: 1,
        entryPointAddress: '0x1234567890123456789012345678901234567890',
        entryPointVersion: '0.7',
        userOperation: {
          callData: '0x',
          callGasLimit: 6942069n,
          maxFeePerGas: 69420n,
          maxPriorityFeePerGas: 69n,
          nonce: 0n,
          preVerificationGas: 6942069n,
          sender: '0x1234567890123456789012345678901234567890',
          signature: '0x',
          verificationGasLimit: 6942069n,
          paymaster: '0x1234567890123456789012345678901234567890',
        },
      }),
    ).toMatchInlineSnapshot(
      `"0x1f2cf8638ead0fc621c6fb1562b8222c06539efcec09be156191f72418ebb109"`,
    )
  })

  test('args: paymasterVerificationGasLimit', () => {
    expect(
      getUserOperationHash({
        chainId: 1,
        entryPointAddress: '0x1234567890123456789012345678901234567890',
        entryPointVersion: '0.7',
        userOperation: {
          callData: '0x',
          callGasLimit: 6942069n,
          maxFeePerGas: 69420n,
          maxPriorityFeePerGas: 69n,
          nonce: 0n,
          preVerificationGas: 6942069n,
          sender: '0x1234567890123456789012345678901234567890',
          signature: '0x',
          verificationGasLimit: 6942069n,
          paymaster: '0x1234567890123456789012345678901234567890',
          paymasterVerificationGasLimit: 6942069n,
        },
      }),
    ).toMatchInlineSnapshot(
      `"0x950763d3ef84eb05b6cd1d95f3b736bb02988d643c6e11a76bf8beddc611cc95"`,
    )
  })

  test('args: paymasterPostOpGasLimit', () => {
    expect(
      getUserOperationHash({
        chainId: 1,
        entryPointAddress: '0x1234567890123456789012345678901234567890',
        entryPointVersion: '0.7',
        userOperation: {
          callData: '0x',
          callGasLimit: 6942069n,
          maxFeePerGas: 69420n,
          maxPriorityFeePerGas: 69n,
          nonce: 0n,
          preVerificationGas: 6942069n,
          sender: '0x1234567890123456789012345678901234567890',
          signature: '0x',
          verificationGasLimit: 6942069n,
          paymaster: '0x1234567890123456789012345678901234567890',
          paymasterVerificationGasLimit: 6942069n,
          paymasterPostOpGasLimit: 6942069n,
        },
      }),
    ).toMatchInlineSnapshot(
      `"0xd6efc63c28df53b49dd6fa10cec0a92ac61f8c70e9a45265e39c955f9bf821ed"`,
    )
  })

  test('args: paymasterData', () => {
    expect(
      getUserOperationHash({
        chainId: 1,
        entryPointAddress: '0x1234567890123456789012345678901234567890',
        entryPointVersion: '0.7',
        userOperation: {
          callData: '0x',
          callGasLimit: 6942069n,
          maxFeePerGas: 69420n,
          maxPriorityFeePerGas: 69n,
          nonce: 0n,
          preVerificationGas: 6942069n,
          sender: '0x1234567890123456789012345678901234567890',
          signature: '0x',
          verificationGasLimit: 6942069n,
          paymaster: '0x1234567890123456789012345678901234567890',
          paymasterVerificationGasLimit: 6942069n,
          paymasterPostOpGasLimit: 6942069n,
          paymasterData: '0xdeadbeef',
        },
      }),
    ).toMatchInlineSnapshot(
      `"0x265fc1350b3fc016d493f9533354cf1a758c0fb9ddbbfd8b19c987d4e8935eed"`,
    )
  })
})

describe('entryPoint: 0.6', () => {
  test('default', () => {
    expect(
      getUserOperationHash({
        chainId: 1,
        entryPointAddress: '0x1234567890123456789012345678901234567890',
        entryPointVersion: '0.6',
        userOperation: {
          callData: '0x',
          callGasLimit: 6942069n,
          maxFeePerGas: 69420n,
          maxPriorityFeePerGas: 69n,
          nonce: 0n,
          preVerificationGas: 6942069n,
          sender: '0x1234567890123456789012345678901234567890',
          signature: '0x',
          verificationGasLimit: 6942069n,
        },
      }),
    ).toMatchInlineSnapshot(
      `"0xe331591ab320e956b5e93f04e1dcf706bc128bc7b510602d2e0553f8be25fcba"`,
    )
  })

  test('args: initCode', () => {
    expect(
      getUserOperationHash({
        chainId: 1,
        entryPointAddress: '0x1234567890123456789012345678901234567890',
        entryPointVersion: '0.6',
        userOperation: {
          callData: '0x',
          callGasLimit: 6942069n,
          maxFeePerGas: 69420n,
          maxPriorityFeePerGas: 69n,
          nonce: 0n,
          preVerificationGas: 6942069n,
          sender: '0x1234567890123456789012345678901234567890',
          signature: '0x',
          verificationGasLimit: 6942069n,
          initCode: '0x1234567890123456789012345678901234567890deadbeef',
        },
      }),
    ).toMatchInlineSnapshot(
      `"0xaa4a4fa863b3018e0e23291ca82a8747d06c6a92548eb9198f54f4a63540d06e"`,
    )
  })

  test('args: paymasterAndData', () => {
    expect(
      getUserOperationHash({
        chainId: 1,
        entryPointAddress: '0x1234567890123456789012345678901234567890',
        entryPointVersion: '0.6',
        userOperation: {
          callData: '0x',
          callGasLimit: 6942069n,
          maxFeePerGas: 69420n,
          maxPriorityFeePerGas: 69n,
          nonce: 0n,
          preVerificationGas: 6942069n,
          sender: '0x1234567890123456789012345678901234567890',
          signature: '0x',
          verificationGasLimit: 6942069n,
          paymasterAndData: '0x1234567890123456789012345678901234567890',
        },
      }),
    ).toMatchInlineSnapshot(
      `"0x72bb2d82af9e9da2079fab165bc219c967c6ca0a63dfa55f382c5914ba2f77c5"`,
    )
  })
})
