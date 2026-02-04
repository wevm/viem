import { describe, expect, test } from 'vitest'
import { getUserOperationTypedData } from './getUserOperationTypedData.js'

describe('entryPoint: 0.8', () => {
  test('default', () => {
    expect(
      getUserOperationTypedData({
        chainId: 1,
        entryPointAddress: '0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108',
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
      `
      {
        "domain": {
          "chainId": 1,
          "name": "ERC4337",
          "verifyingContract": "0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108",
          "version": "1",
        },
        "message": {
          "accountGasLimits": "0x0000000000000000000000000069ed750000000000000000000000000069ed75",
          "callData": "0x",
          "gasFees": "0x0000000000000000000000000000004500000000000000000000000000010f2c",
          "initCode": "0x",
          "nonce": 0n,
          "paymasterAndData": "0x",
          "preVerificationGas": 6942069n,
          "sender": "0x1234567890123456789012345678901234567890",
          "signature": "0x",
        },
        "primaryType": "PackedUserOperation",
        "types": {
          "EIP712Domain": [
            {
              "name": "name",
              "type": "string",
            },
            {
              "name": "version",
              "type": "string",
            },
            {
              "name": "chainId",
              "type": "uint256",
            },
            {
              "name": "verifyingContract",
              "type": "address",
            },
          ],
          "PackedUserOperation": [
            {
              "name": "sender",
              "type": "address",
            },
            {
              "name": "nonce",
              "type": "uint256",
            },
            {
              "name": "initCode",
              "type": "bytes",
            },
            {
              "name": "callData",
              "type": "bytes",
            },
            {
              "name": "accountGasLimits",
              "type": "bytes32",
            },
            {
              "name": "preVerificationGas",
              "type": "uint256",
            },
            {
              "name": "gasFees",
              "type": "bytes32",
            },
            {
              "name": "paymasterAndData",
              "type": "bytes",
            },
          ],
        },
      }
    `,
    )
  })

  test('args: authorization', () => {
    expect(
      getUserOperationTypedData({
        chainId: 1,
        entryPointAddress: '0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108',
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
          factory: '0x7702',
          factoryData: '0xdeadbeef',
          authorization: {
            address: '0x1234567890123456789012345678901234567890',
            chainId: 1,
            nonce: 0,
            yParity: 0,
            r: '0x0000000000000000000000000000000000000000000000000000000000000000',
            s: '0x0000000000000000000000000000000000000000000000000000000000000000',
          },
        },
      }),
    ).toMatchInlineSnapshot(
      `
      {
        "domain": {
          "chainId": 1,
          "name": "ERC4337",
          "verifyingContract": "0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108",
          "version": "1",
        },
        "message": {
          "accountGasLimits": "0x0000000000000000000000000069ed750000000000000000000000000069ed75",
          "callData": "0x",
          "gasFees": "0x0000000000000000000000000000004500000000000000000000000000010f2c",
          "initCode": "0x1234567890123456789012345678901234567890deadbeef",
          "nonce": 0n,
          "paymasterAndData": "0x12345678901234567890123456789012345678900000000000000000000000000069ed750000000000000000000000000069ed75deadbeef",
          "preVerificationGas": 6942069n,
          "sender": "0x1234567890123456789012345678901234567890",
          "signature": "0x",
        },
        "primaryType": "PackedUserOperation",
        "types": {
          "EIP712Domain": [
            {
              "name": "name",
              "type": "string",
            },
            {
              "name": "version",
              "type": "string",
            },
            {
              "name": "chainId",
              "type": "uint256",
            },
            {
              "name": "verifyingContract",
              "type": "address",
            },
          ],
          "PackedUserOperation": [
            {
              "name": "sender",
              "type": "address",
            },
            {
              "name": "nonce",
              "type": "uint256",
            },
            {
              "name": "initCode",
              "type": "bytes",
            },
            {
              "name": "callData",
              "type": "bytes",
            },
            {
              "name": "accountGasLimits",
              "type": "bytes32",
            },
            {
              "name": "preVerificationGas",
              "type": "uint256",
            },
            {
              "name": "gasFees",
              "type": "bytes32",
            },
            {
              "name": "paymasterAndData",
              "type": "bytes",
            },
          ],
        },
      }
    `,
    )

    expect(
      getUserOperationTypedData({
        chainId: 1,
        entryPointAddress: '0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108',
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
          factory: '0x7702',
          authorization: {
            address: '0x1234567890123456789012345678901234567890',
            chainId: 1,
            nonce: 0,
            yParity: 0,
            r: '0x0000000000000000000000000000000000000000000000000000000000000000',
            s: '0x0000000000000000000000000000000000000000000000000000000000000000',
          },
        },
      }),
    ).toMatchInlineSnapshot(
      `
      {
        "domain": {
          "chainId": 1,
          "name": "ERC4337",
          "verifyingContract": "0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108",
          "version": "1",
        },
        "message": {
          "accountGasLimits": "0x0000000000000000000000000069ed750000000000000000000000000069ed75",
          "callData": "0x",
          "gasFees": "0x0000000000000000000000000000004500000000000000000000000000010f2c",
          "initCode": "0x1234567890123456789012345678901234567890",
          "nonce": 0n,
          "paymasterAndData": "0x12345678901234567890123456789012345678900000000000000000000000000069ed750000000000000000000000000069ed75deadbeef",
          "preVerificationGas": 6942069n,
          "sender": "0x1234567890123456789012345678901234567890",
          "signature": "0x",
        },
        "primaryType": "PackedUserOperation",
        "types": {
          "EIP712Domain": [
            {
              "name": "name",
              "type": "string",
            },
            {
              "name": "version",
              "type": "string",
            },
            {
              "name": "chainId",
              "type": "uint256",
            },
            {
              "name": "verifyingContract",
              "type": "address",
            },
          ],
          "PackedUserOperation": [
            {
              "name": "sender",
              "type": "address",
            },
            {
              "name": "nonce",
              "type": "uint256",
            },
            {
              "name": "initCode",
              "type": "bytes",
            },
            {
              "name": "callData",
              "type": "bytes",
            },
            {
              "name": "accountGasLimits",
              "type": "bytes32",
            },
            {
              "name": "preVerificationGas",
              "type": "uint256",
            },
            {
              "name": "gasFees",
              "type": "bytes32",
            },
            {
              "name": "paymasterAndData",
              "type": "bytes",
            },
          ],
        },
      }
    `,
    )
  })
})
