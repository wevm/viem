import { expect, test } from 'vitest'
import { formatUserOperationRequest } from './userOperationRequest.js'

test('default', () => {
  expect(
    formatUserOperationRequest({
      callData: '0xdeadbeef',
      callGasLimit: 69420n,
      factory: '0x0000000000000000000000000000000000000000',
      factoryData: '0xdeadbeef',
      maxFeePerGas: 69420n,
      maxPriorityFeePerGas: 10n,
      nonce: 69n,
      paymaster: '0x0000000000000000000000000000000000000000',
      paymasterData: '0xdeadbeef',
      paymasterPostOpGasLimit: 69420n,
      paymasterVerificationGasLimit: 69420n,
      preVerificationGas: 69420n,
      verificationGasLimit: 69420n,
      sender: '0x0000000000000000000000000000000000000000',
      signature: '0xdeadbeef',
    }),
  ).toMatchInlineSnapshot(`
    {
      "callData": "0xdeadbeef",
      "callGasLimit": "0x10f2c",
      "factory": "0x0000000000000000000000000000000000000000",
      "factoryData": "0xdeadbeef",
      "maxFeePerGas": "0x10f2c",
      "maxPriorityFeePerGas": "0xa",
      "nonce": "0x45",
      "paymaster": "0x0000000000000000000000000000000000000000",
      "paymasterData": "0xdeadbeef",
      "paymasterPostOpGasLimit": "0x10f2c",
      "paymasterVerificationGasLimit": "0x10f2c",
      "preVerificationGas": "0x10f2c",
      "sender": "0x0000000000000000000000000000000000000000",
      "signature": "0xdeadbeef",
      "verificationGasLimit": "0x10f2c",
    }
  `)

  expect(
    formatUserOperationRequest({
      callData: '0xdeadbeef',
      callGasLimit: 69420n,
      initCode: '0x0000000000000000000000000000000000000000deadbeef',
      maxFeePerGas: 69420n,
      maxPriorityFeePerGas: 10n,
      nonce: 69n,
      paymasterAndData: '0x0000000000000000000000000000000000000000deadbeef',
      preVerificationGas: 69420n,
      verificationGasLimit: 69420n,
      sender: '0x0000000000000000000000000000000000000000',
      signature: '0xdeadbeef',
    }),
  ).toMatchInlineSnapshot(`
    {
      "callData": "0xdeadbeef",
      "callGasLimit": "0x10f2c",
      "initCode": "0x0000000000000000000000000000000000000000deadbeef",
      "maxFeePerGas": "0x10f2c",
      "maxPriorityFeePerGas": "0xa",
      "nonce": "0x45",
      "paymasterAndData": "0x0000000000000000000000000000000000000000deadbeef",
      "preVerificationGas": "0x10f2c",
      "sender": "0x0000000000000000000000000000000000000000",
      "signature": "0xdeadbeef",
      "verificationGasLimit": "0x10f2c",
    }
  `)
})
