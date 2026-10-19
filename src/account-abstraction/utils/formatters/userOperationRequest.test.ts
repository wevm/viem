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

test('behavior: eip7702 authorization (yParity: 0)', () => {
  const request = formatUserOperationRequest({
    callData: '0xdeadbeef',
    callGasLimit: 69420n,
    maxFeePerGas: 69420n,
    maxPriorityFeePerGas: 10n,
    nonce: 69n,
    preVerificationGas: 69420n,
    verificationGasLimit: 69420n,
    sender: '0x0000000000000000000000000000000000000000',
    signature: '0xdeadbeef',
    authorization: {
      address: '0x0000000000000000000000000000000000000000',
      chainId: 1,
      nonce: 0,
      r: '0x0000000000000000000000000000000000000000000000000000000000000001',
      s: '0x0000000000000000000000000000000000000000000000000000000000000002',
      yParity: 0,
    },
  })

  // `yParity` of `0` must be encoded as the 1-byte `0x00`, not a 32-byte zero.
  expect(request.eip7702Auth?.yParity).toBe('0x00')
  expect(request.eip7702Auth).toMatchInlineSnapshot(`
    {
      "address": "0x0000000000000000000000000000000000000000",
      "chainId": "0x1",
      "nonce": "0x0",
      "r": "0x0000000000000000000000000000000000000000000000000000000000000001",
      "s": "0x0000000000000000000000000000000000000000000000000000000000000002",
      "yParity": "0x00",
    }
  `)
})

test('behavior: eip7702 authorization (yParity: 1)', () => {
  const request = formatUserOperationRequest({
    callData: '0xdeadbeef',
    callGasLimit: 69420n,
    maxFeePerGas: 69420n,
    maxPriorityFeePerGas: 10n,
    nonce: 69n,
    preVerificationGas: 69420n,
    verificationGasLimit: 69420n,
    sender: '0x0000000000000000000000000000000000000000',
    signature: '0xdeadbeef',
    authorization: {
      address: '0x0000000000000000000000000000000000000000',
      chainId: 1,
      nonce: 0,
      r: '0x0000000000000000000000000000000000000000000000000000000000000001',
      s: '0x0000000000000000000000000000000000000000000000000000000000000002',
      yParity: 1,
    },
  })

  expect(request.eip7702Auth?.yParity).toBe('0x01')
})
