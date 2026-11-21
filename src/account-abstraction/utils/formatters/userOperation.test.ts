import { expect, test } from 'vitest'
import type { RpcUserOperation } from '../../types/rpc.js'
import { formatUserOperation } from './userOperation.js'

const userOperation = {
  callData: '0xdeadbeef',
  callGasLimit: '0x10f2c',
  factory: '0x0000000000000000000000000000000000000000',
  factoryData: '0xdeadbeef',
  maxFeePerGas: '0x10f2c',
  maxPriorityFeePerGas: '0xa',
  nonce: '0x45',
  paymaster: '0x0000000000000000000000000000000000000000',
  paymasterData: '0xdeadbeef',
  paymasterPostOpGasLimit: '0x10f2c',
  paymasterVerificationGasLimit: '0x10f2c',
  preVerificationGas: '0x10f2c',
  sender: '0x0000000000000000000000000000000000000000',
  signature: '0xdeadbeef',
  verificationGasLimit: '0x10f2c',
} as const satisfies RpcUserOperation

test('default', () => {
  expect(formatUserOperation(userOperation)).toMatchInlineSnapshot(`
    {
      "callData": "0xdeadbeef",
      "callGasLimit": 69420n,
      "factory": "0x0000000000000000000000000000000000000000",
      "factoryData": "0xdeadbeef",
      "maxFeePerGas": 69420n,
      "maxPriorityFeePerGas": 10n,
      "nonce": 69n,
      "paymaster": "0x0000000000000000000000000000000000000000",
      "paymasterData": "0xdeadbeef",
      "paymasterPostOpGasLimit": 69420n,
      "paymasterVerificationGasLimit": 69420n,
      "preVerificationGas": 69420n,
      "sender": "0x0000000000000000000000000000000000000000",
      "signature": "0xdeadbeef",
      "verificationGasLimit": 69420n,
    }
  `)
})

test('behavior: eip7702Auth', () => {
  expect(
    formatUserOperation({
      ...userOperation,
      eip7702Auth: {
        address: '0xe6Cae83BdE06E4c305530e199D7217f42808555B',
        chainId: '0x1',
        nonce: '0x2',
        r: '0x1111111111111111111111111111111111111111111111111111111111111111',
        s: '0x2222222222222222222222222222222222222222222222222222222222222222',
        yParity: '0x01',
      },
      factory: '0x7702',
    }),
  ).toMatchInlineSnapshot(`
    {
      "authorization": {
        "address": "0xe6Cae83BdE06E4c305530e199D7217f42808555B",
        "chainId": 1,
        "nonce": 2,
        "r": "0x1111111111111111111111111111111111111111111111111111111111111111",
        "s": "0x2222222222222222222222222222222222222222222222222222222222222222",
        "yParity": 1,
      },
      "callData": "0xdeadbeef",
      "callGasLimit": 69420n,
      "factory": "0x7702",
      "factoryData": "0xdeadbeef",
      "maxFeePerGas": 69420n,
      "maxPriorityFeePerGas": 10n,
      "nonce": 69n,
      "paymaster": "0x0000000000000000000000000000000000000000",
      "paymasterData": "0xdeadbeef",
      "paymasterPostOpGasLimit": 69420n,
      "paymasterVerificationGasLimit": 69420n,
      "preVerificationGas": 69420n,
      "sender": "0x0000000000000000000000000000000000000000",
      "signature": "0xdeadbeef",
      "verificationGasLimit": 69420n,
    }
  `)
})
