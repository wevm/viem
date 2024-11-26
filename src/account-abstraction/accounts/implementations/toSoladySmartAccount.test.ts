import type { Address } from 'abitype'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { anvilMainnet } from '../../../../test/src/anvil.js'
import { accounts, typedData } from '../../../../test/src/constants.js'
import { deploySoladyAccount_07 } from '../../../../test/src/utils.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import {
  mine,
  verifyMessage,
  verifyTypedData,
  writeContract,
} from '../../../actions/index.js'
import { encodeFunctionData } from '../../../utils/abi/encodeFunctionData.js'
import { pad } from '../../../utils/data/pad.js'
import { toSoladySmartAccount } from './toSoladySmartAccount.js'

const client = anvilMainnet.getClient({ account: true })

let factoryAddress: Address
beforeAll(async () => {
  const { factoryAddress: _factoryAddress } = await deploySoladyAccount_07()
  factoryAddress = _factoryAddress
})

test('default', async () => {
  const account = await toSoladySmartAccount({
    client,
    factoryAddress,
    owner: accounts[1].address,
  })

  expect({
    ...account,
    _internal: null,
    abi: null,
    client: null,
    factory: null,
  }).toMatchInlineSnapshot(`
    {
      "_internal": null,
      "abi": null,
      "address": "0xE911628bF8428C23f179a07b081325cAe376DE1f",
      "client": null,
      "decodeCalls": [Function],
      "encodeCalls": [Function],
      "entryPoint": {
        "abi": [
          {
            "inputs": [
              {
                "name": "success",
                "type": "bool",
              },
              {
                "name": "ret",
                "type": "bytes",
              },
            ],
            "name": "DelegateAndRevert",
            "type": "error",
          },
          {
            "inputs": [
              {
                "name": "opIndex",
                "type": "uint256",
              },
              {
                "name": "reason",
                "type": "string",
              },
            ],
            "name": "FailedOp",
            "type": "error",
          },
          {
            "inputs": [
              {
                "name": "opIndex",
                "type": "uint256",
              },
              {
                "name": "reason",
                "type": "string",
              },
              {
                "name": "inner",
                "type": "bytes",
              },
            ],
            "name": "FailedOpWithRevert",
            "type": "error",
          },
          {
            "inputs": [
              {
                "name": "returnData",
                "type": "bytes",
              },
            ],
            "name": "PostOpReverted",
            "type": "error",
          },
          {
            "inputs": [],
            "name": "ReentrancyGuardReentrantCall",
            "type": "error",
          },
          {
            "inputs": [
              {
                "name": "sender",
                "type": "address",
              },
            ],
            "name": "SenderAddressResult",
            "type": "error",
          },
          {
            "inputs": [
              {
                "name": "aggregator",
                "type": "address",
              },
            ],
            "name": "SignatureValidationFailed",
            "type": "error",
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "name": "userOpHash",
                "type": "bytes32",
              },
              {
                "indexed": true,
                "name": "sender",
                "type": "address",
              },
              {
                "indexed": false,
                "name": "factory",
                "type": "address",
              },
              {
                "indexed": false,
                "name": "paymaster",
                "type": "address",
              },
            ],
            "name": "AccountDeployed",
            "type": "event",
          },
          {
            "anonymous": false,
            "inputs": [],
            "name": "BeforeExecution",
            "type": "event",
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "name": "account",
                "type": "address",
              },
              {
                "indexed": false,
                "name": "totalDeposit",
                "type": "uint256",
              },
            ],
            "name": "Deposited",
            "type": "event",
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "name": "userOpHash",
                "type": "bytes32",
              },
              {
                "indexed": true,
                "name": "sender",
                "type": "address",
              },
              {
                "indexed": false,
                "name": "nonce",
                "type": "uint256",
              },
              {
                "indexed": false,
                "name": "revertReason",
                "type": "bytes",
              },
            ],
            "name": "PostOpRevertReason",
            "type": "event",
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "name": "aggregator",
                "type": "address",
              },
            ],
            "name": "SignatureAggregatorChanged",
            "type": "event",
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "name": "account",
                "type": "address",
              },
              {
                "indexed": false,
                "name": "totalStaked",
                "type": "uint256",
              },
              {
                "indexed": false,
                "name": "unstakeDelaySec",
                "type": "uint256",
              },
            ],
            "name": "StakeLocked",
            "type": "event",
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "name": "account",
                "type": "address",
              },
              {
                "indexed": false,
                "name": "withdrawTime",
                "type": "uint256",
              },
            ],
            "name": "StakeUnlocked",
            "type": "event",
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "name": "account",
                "type": "address",
              },
              {
                "indexed": false,
                "name": "withdrawAddress",
                "type": "address",
              },
              {
                "indexed": false,
                "name": "amount",
                "type": "uint256",
              },
            ],
            "name": "StakeWithdrawn",
            "type": "event",
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "name": "userOpHash",
                "type": "bytes32",
              },
              {
                "indexed": true,
                "name": "sender",
                "type": "address",
              },
              {
                "indexed": true,
                "name": "paymaster",
                "type": "address",
              },
              {
                "indexed": false,
                "name": "nonce",
                "type": "uint256",
              },
              {
                "indexed": false,
                "name": "success",
                "type": "bool",
              },
              {
                "indexed": false,
                "name": "actualGasCost",
                "type": "uint256",
              },
              {
                "indexed": false,
                "name": "actualGasUsed",
                "type": "uint256",
              },
            ],
            "name": "UserOperationEvent",
            "type": "event",
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "name": "userOpHash",
                "type": "bytes32",
              },
              {
                "indexed": true,
                "name": "sender",
                "type": "address",
              },
              {
                "indexed": false,
                "name": "nonce",
                "type": "uint256",
              },
            ],
            "name": "UserOperationPrefundTooLow",
            "type": "event",
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "name": "userOpHash",
                "type": "bytes32",
              },
              {
                "indexed": true,
                "name": "sender",
                "type": "address",
              },
              {
                "indexed": false,
                "name": "nonce",
                "type": "uint256",
              },
              {
                "indexed": false,
                "name": "revertReason",
                "type": "bytes",
              },
            ],
            "name": "UserOperationRevertReason",
            "type": "event",
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "name": "account",
                "type": "address",
              },
              {
                "indexed": false,
                "name": "withdrawAddress",
                "type": "address",
              },
              {
                "indexed": false,
                "name": "amount",
                "type": "uint256",
              },
            ],
            "name": "Withdrawn",
            "type": "event",
          },
          {
            "inputs": [
              {
                "name": "unstakeDelaySec",
                "type": "uint32",
              },
            ],
            "name": "addStake",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function",
          },
          {
            "inputs": [
              {
                "name": "account",
                "type": "address",
              },
            ],
            "name": "balanceOf",
            "outputs": [
              {
                "name": "",
                "type": "uint256",
              },
            ],
            "stateMutability": "view",
            "type": "function",
          },
          {
            "inputs": [
              {
                "name": "target",
                "type": "address",
              },
              {
                "name": "data",
                "type": "bytes",
              },
            ],
            "name": "delegateAndRevert",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function",
          },
          {
            "inputs": [
              {
                "name": "account",
                "type": "address",
              },
            ],
            "name": "depositTo",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function",
          },
          {
            "inputs": [
              {
                "name": "",
                "type": "address",
              },
            ],
            "name": "deposits",
            "outputs": [
              {
                "name": "deposit",
                "type": "uint256",
              },
              {
                "name": "staked",
                "type": "bool",
              },
              {
                "name": "stake",
                "type": "uint112",
              },
              {
                "name": "unstakeDelaySec",
                "type": "uint32",
              },
              {
                "name": "withdrawTime",
                "type": "uint48",
              },
            ],
            "stateMutability": "view",
            "type": "function",
          },
          {
            "inputs": [
              {
                "name": "account",
                "type": "address",
              },
            ],
            "name": "getDepositInfo",
            "outputs": [
              {
                "components": [
                  {
                    "name": "deposit",
                    "type": "uint256",
                  },
                  {
                    "name": "staked",
                    "type": "bool",
                  },
                  {
                    "name": "stake",
                    "type": "uint112",
                  },
                  {
                    "name": "unstakeDelaySec",
                    "type": "uint32",
                  },
                  {
                    "name": "withdrawTime",
                    "type": "uint48",
                  },
                ],
                "name": "info",
                "type": "tuple",
              },
            ],
            "stateMutability": "view",
            "type": "function",
          },
          {
            "inputs": [
              {
                "name": "sender",
                "type": "address",
              },
              {
                "name": "key",
                "type": "uint192",
              },
            ],
            "name": "getNonce",
            "outputs": [
              {
                "name": "nonce",
                "type": "uint256",
              },
            ],
            "stateMutability": "view",
            "type": "function",
          },
          {
            "inputs": [
              {
                "name": "initCode",
                "type": "bytes",
              },
            ],
            "name": "getSenderAddress",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function",
          },
          {
            "inputs": [
              {
                "components": [
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
                  {
                    "name": "signature",
                    "type": "bytes",
                  },
                ],
                "name": "userOp",
                "type": "tuple",
              },
            ],
            "name": "getUserOpHash",
            "outputs": [
              {
                "name": "",
                "type": "bytes32",
              },
            ],
            "stateMutability": "view",
            "type": "function",
          },
          {
            "inputs": [
              {
                "components": [
                  {
                    "components": [
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
                      {
                        "name": "signature",
                        "type": "bytes",
                      },
                    ],
                    "name": "userOps",
                    "type": "tuple[]",
                  },
                  {
                    "name": "aggregator",
                    "type": "address",
                  },
                  {
                    "name": "signature",
                    "type": "bytes",
                  },
                ],
                "name": "opsPerAggregator",
                "type": "tuple[]",
              },
              {
                "name": "beneficiary",
                "type": "address",
              },
            ],
            "name": "handleAggregatedOps",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function",
          },
          {
            "inputs": [
              {
                "components": [
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
                  {
                    "name": "signature",
                    "type": "bytes",
                  },
                ],
                "name": "ops",
                "type": "tuple[]",
              },
              {
                "name": "beneficiary",
                "type": "address",
              },
            ],
            "name": "handleOps",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function",
          },
          {
            "inputs": [
              {
                "name": "key",
                "type": "uint192",
              },
            ],
            "name": "incrementNonce",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function",
          },
          {
            "inputs": [
              {
                "name": "callData",
                "type": "bytes",
              },
              {
                "components": [
                  {
                    "components": [
                      {
                        "name": "sender",
                        "type": "address",
                      },
                      {
                        "name": "nonce",
                        "type": "uint256",
                      },
                      {
                        "name": "verificationGasLimit",
                        "type": "uint256",
                      },
                      {
                        "name": "callGasLimit",
                        "type": "uint256",
                      },
                      {
                        "name": "paymasterVerificationGasLimit",
                        "type": "uint256",
                      },
                      {
                        "name": "paymasterPostOpGasLimit",
                        "type": "uint256",
                      },
                      {
                        "name": "preVerificationGas",
                        "type": "uint256",
                      },
                      {
                        "name": "paymaster",
                        "type": "address",
                      },
                      {
                        "name": "maxFeePerGas",
                        "type": "uint256",
                      },
                      {
                        "name": "maxPriorityFeePerGas",
                        "type": "uint256",
                      },
                    ],
                    "name": "mUserOp",
                    "type": "tuple",
                  },
                  {
                    "name": "userOpHash",
                    "type": "bytes32",
                  },
                  {
                    "name": "prefund",
                    "type": "uint256",
                  },
                  {
                    "name": "contextOffset",
                    "type": "uint256",
                  },
                  {
                    "name": "preOpGas",
                    "type": "uint256",
                  },
                ],
                "name": "opInfo",
                "type": "tuple",
              },
              {
                "name": "context",
                "type": "bytes",
              },
            ],
            "name": "innerHandleOp",
            "outputs": [
              {
                "name": "actualGasCost",
                "type": "uint256",
              },
            ],
            "stateMutability": "nonpayable",
            "type": "function",
          },
          {
            "inputs": [
              {
                "name": "",
                "type": "address",
              },
              {
                "name": "",
                "type": "uint192",
              },
            ],
            "name": "nonceSequenceNumber",
            "outputs": [
              {
                "name": "",
                "type": "uint256",
              },
            ],
            "stateMutability": "view",
            "type": "function",
          },
          {
            "inputs": [
              {
                "name": "interfaceId",
                "type": "bytes4",
              },
            ],
            "name": "supportsInterface",
            "outputs": [
              {
                "name": "",
                "type": "bool",
              },
            ],
            "stateMutability": "view",
            "type": "function",
          },
          {
            "inputs": [],
            "name": "unlockStake",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function",
          },
          {
            "inputs": [
              {
                "name": "withdrawAddress",
                "type": "address",
              },
            ],
            "name": "withdrawStake",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function",
          },
          {
            "inputs": [
              {
                "name": "withdrawAddress",
                "type": "address",
              },
              {
                "name": "withdrawAmount",
                "type": "uint256",
              },
            ],
            "name": "withdrawTo",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function",
          },
          {
            "stateMutability": "payable",
            "type": "receive",
          },
        ],
        "address": "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
        "version": "0.7",
      },
      "factory": null,
      "getAddress": [Function],
      "getFactoryArgs": [Function],
      "getNonce": [Function],
      "getStubSignature": [Function],
      "isDeployed": [Function],
      "signMessage": [Function],
      "signTypedData": [Function],
      "signUserOperation": [Function],
      "type": "smart",
    }
  `)
})

test('args: salt', async () => {
  const account_1 = await toSoladySmartAccount({
    client,
    factoryAddress,
    salt: '0x1',
    owner: accounts[1].address,
  })

  const account_2 = await toSoladySmartAccount({
    client,
    factoryAddress,
    salt: '0x2',
    owner: accounts[1].address,
  })

  expect(await account_1.getAddress()).toMatchInlineSnapshot(
    `"0x0b3D649C00208AFB6A40b4A7e918b84A52D783B8"`,
  )
  expect(await account_2.getAddress()).toMatchInlineSnapshot(
    `"0x274B2baeCC1A87493db36439Df3D8012855fB182"`,
  )
})

describe('return value: entryPoint', () => {
  test('default', async () => {
    const account = await toSoladySmartAccount({
      client,
      factoryAddress,
      owner: accounts[1].address,
    })

    expect(account.entryPoint).toMatchInlineSnapshot(
      `
      {
        "abi": [
          {
            "inputs": [
              {
                "name": "success",
                "type": "bool",
              },
              {
                "name": "ret",
                "type": "bytes",
              },
            ],
            "name": "DelegateAndRevert",
            "type": "error",
          },
          {
            "inputs": [
              {
                "name": "opIndex",
                "type": "uint256",
              },
              {
                "name": "reason",
                "type": "string",
              },
            ],
            "name": "FailedOp",
            "type": "error",
          },
          {
            "inputs": [
              {
                "name": "opIndex",
                "type": "uint256",
              },
              {
                "name": "reason",
                "type": "string",
              },
              {
                "name": "inner",
                "type": "bytes",
              },
            ],
            "name": "FailedOpWithRevert",
            "type": "error",
          },
          {
            "inputs": [
              {
                "name": "returnData",
                "type": "bytes",
              },
            ],
            "name": "PostOpReverted",
            "type": "error",
          },
          {
            "inputs": [],
            "name": "ReentrancyGuardReentrantCall",
            "type": "error",
          },
          {
            "inputs": [
              {
                "name": "sender",
                "type": "address",
              },
            ],
            "name": "SenderAddressResult",
            "type": "error",
          },
          {
            "inputs": [
              {
                "name": "aggregator",
                "type": "address",
              },
            ],
            "name": "SignatureValidationFailed",
            "type": "error",
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "name": "userOpHash",
                "type": "bytes32",
              },
              {
                "indexed": true,
                "name": "sender",
                "type": "address",
              },
              {
                "indexed": false,
                "name": "factory",
                "type": "address",
              },
              {
                "indexed": false,
                "name": "paymaster",
                "type": "address",
              },
            ],
            "name": "AccountDeployed",
            "type": "event",
          },
          {
            "anonymous": false,
            "inputs": [],
            "name": "BeforeExecution",
            "type": "event",
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "name": "account",
                "type": "address",
              },
              {
                "indexed": false,
                "name": "totalDeposit",
                "type": "uint256",
              },
            ],
            "name": "Deposited",
            "type": "event",
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "name": "userOpHash",
                "type": "bytes32",
              },
              {
                "indexed": true,
                "name": "sender",
                "type": "address",
              },
              {
                "indexed": false,
                "name": "nonce",
                "type": "uint256",
              },
              {
                "indexed": false,
                "name": "revertReason",
                "type": "bytes",
              },
            ],
            "name": "PostOpRevertReason",
            "type": "event",
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "name": "aggregator",
                "type": "address",
              },
            ],
            "name": "SignatureAggregatorChanged",
            "type": "event",
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "name": "account",
                "type": "address",
              },
              {
                "indexed": false,
                "name": "totalStaked",
                "type": "uint256",
              },
              {
                "indexed": false,
                "name": "unstakeDelaySec",
                "type": "uint256",
              },
            ],
            "name": "StakeLocked",
            "type": "event",
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "name": "account",
                "type": "address",
              },
              {
                "indexed": false,
                "name": "withdrawTime",
                "type": "uint256",
              },
            ],
            "name": "StakeUnlocked",
            "type": "event",
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "name": "account",
                "type": "address",
              },
              {
                "indexed": false,
                "name": "withdrawAddress",
                "type": "address",
              },
              {
                "indexed": false,
                "name": "amount",
                "type": "uint256",
              },
            ],
            "name": "StakeWithdrawn",
            "type": "event",
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "name": "userOpHash",
                "type": "bytes32",
              },
              {
                "indexed": true,
                "name": "sender",
                "type": "address",
              },
              {
                "indexed": true,
                "name": "paymaster",
                "type": "address",
              },
              {
                "indexed": false,
                "name": "nonce",
                "type": "uint256",
              },
              {
                "indexed": false,
                "name": "success",
                "type": "bool",
              },
              {
                "indexed": false,
                "name": "actualGasCost",
                "type": "uint256",
              },
              {
                "indexed": false,
                "name": "actualGasUsed",
                "type": "uint256",
              },
            ],
            "name": "UserOperationEvent",
            "type": "event",
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "name": "userOpHash",
                "type": "bytes32",
              },
              {
                "indexed": true,
                "name": "sender",
                "type": "address",
              },
              {
                "indexed": false,
                "name": "nonce",
                "type": "uint256",
              },
            ],
            "name": "UserOperationPrefundTooLow",
            "type": "event",
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "name": "userOpHash",
                "type": "bytes32",
              },
              {
                "indexed": true,
                "name": "sender",
                "type": "address",
              },
              {
                "indexed": false,
                "name": "nonce",
                "type": "uint256",
              },
              {
                "indexed": false,
                "name": "revertReason",
                "type": "bytes",
              },
            ],
            "name": "UserOperationRevertReason",
            "type": "event",
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "name": "account",
                "type": "address",
              },
              {
                "indexed": false,
                "name": "withdrawAddress",
                "type": "address",
              },
              {
                "indexed": false,
                "name": "amount",
                "type": "uint256",
              },
            ],
            "name": "Withdrawn",
            "type": "event",
          },
          {
            "inputs": [
              {
                "name": "unstakeDelaySec",
                "type": "uint32",
              },
            ],
            "name": "addStake",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function",
          },
          {
            "inputs": [
              {
                "name": "account",
                "type": "address",
              },
            ],
            "name": "balanceOf",
            "outputs": [
              {
                "name": "",
                "type": "uint256",
              },
            ],
            "stateMutability": "view",
            "type": "function",
          },
          {
            "inputs": [
              {
                "name": "target",
                "type": "address",
              },
              {
                "name": "data",
                "type": "bytes",
              },
            ],
            "name": "delegateAndRevert",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function",
          },
          {
            "inputs": [
              {
                "name": "account",
                "type": "address",
              },
            ],
            "name": "depositTo",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function",
          },
          {
            "inputs": [
              {
                "name": "",
                "type": "address",
              },
            ],
            "name": "deposits",
            "outputs": [
              {
                "name": "deposit",
                "type": "uint256",
              },
              {
                "name": "staked",
                "type": "bool",
              },
              {
                "name": "stake",
                "type": "uint112",
              },
              {
                "name": "unstakeDelaySec",
                "type": "uint32",
              },
              {
                "name": "withdrawTime",
                "type": "uint48",
              },
            ],
            "stateMutability": "view",
            "type": "function",
          },
          {
            "inputs": [
              {
                "name": "account",
                "type": "address",
              },
            ],
            "name": "getDepositInfo",
            "outputs": [
              {
                "components": [
                  {
                    "name": "deposit",
                    "type": "uint256",
                  },
                  {
                    "name": "staked",
                    "type": "bool",
                  },
                  {
                    "name": "stake",
                    "type": "uint112",
                  },
                  {
                    "name": "unstakeDelaySec",
                    "type": "uint32",
                  },
                  {
                    "name": "withdrawTime",
                    "type": "uint48",
                  },
                ],
                "name": "info",
                "type": "tuple",
              },
            ],
            "stateMutability": "view",
            "type": "function",
          },
          {
            "inputs": [
              {
                "name": "sender",
                "type": "address",
              },
              {
                "name": "key",
                "type": "uint192",
              },
            ],
            "name": "getNonce",
            "outputs": [
              {
                "name": "nonce",
                "type": "uint256",
              },
            ],
            "stateMutability": "view",
            "type": "function",
          },
          {
            "inputs": [
              {
                "name": "initCode",
                "type": "bytes",
              },
            ],
            "name": "getSenderAddress",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function",
          },
          {
            "inputs": [
              {
                "components": [
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
                  {
                    "name": "signature",
                    "type": "bytes",
                  },
                ],
                "name": "userOp",
                "type": "tuple",
              },
            ],
            "name": "getUserOpHash",
            "outputs": [
              {
                "name": "",
                "type": "bytes32",
              },
            ],
            "stateMutability": "view",
            "type": "function",
          },
          {
            "inputs": [
              {
                "components": [
                  {
                    "components": [
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
                      {
                        "name": "signature",
                        "type": "bytes",
                      },
                    ],
                    "name": "userOps",
                    "type": "tuple[]",
                  },
                  {
                    "name": "aggregator",
                    "type": "address",
                  },
                  {
                    "name": "signature",
                    "type": "bytes",
                  },
                ],
                "name": "opsPerAggregator",
                "type": "tuple[]",
              },
              {
                "name": "beneficiary",
                "type": "address",
              },
            ],
            "name": "handleAggregatedOps",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function",
          },
          {
            "inputs": [
              {
                "components": [
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
                  {
                    "name": "signature",
                    "type": "bytes",
                  },
                ],
                "name": "ops",
                "type": "tuple[]",
              },
              {
                "name": "beneficiary",
                "type": "address",
              },
            ],
            "name": "handleOps",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function",
          },
          {
            "inputs": [
              {
                "name": "key",
                "type": "uint192",
              },
            ],
            "name": "incrementNonce",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function",
          },
          {
            "inputs": [
              {
                "name": "callData",
                "type": "bytes",
              },
              {
                "components": [
                  {
                    "components": [
                      {
                        "name": "sender",
                        "type": "address",
                      },
                      {
                        "name": "nonce",
                        "type": "uint256",
                      },
                      {
                        "name": "verificationGasLimit",
                        "type": "uint256",
                      },
                      {
                        "name": "callGasLimit",
                        "type": "uint256",
                      },
                      {
                        "name": "paymasterVerificationGasLimit",
                        "type": "uint256",
                      },
                      {
                        "name": "paymasterPostOpGasLimit",
                        "type": "uint256",
                      },
                      {
                        "name": "preVerificationGas",
                        "type": "uint256",
                      },
                      {
                        "name": "paymaster",
                        "type": "address",
                      },
                      {
                        "name": "maxFeePerGas",
                        "type": "uint256",
                      },
                      {
                        "name": "maxPriorityFeePerGas",
                        "type": "uint256",
                      },
                    ],
                    "name": "mUserOp",
                    "type": "tuple",
                  },
                  {
                    "name": "userOpHash",
                    "type": "bytes32",
                  },
                  {
                    "name": "prefund",
                    "type": "uint256",
                  },
                  {
                    "name": "contextOffset",
                    "type": "uint256",
                  },
                  {
                    "name": "preOpGas",
                    "type": "uint256",
                  },
                ],
                "name": "opInfo",
                "type": "tuple",
              },
              {
                "name": "context",
                "type": "bytes",
              },
            ],
            "name": "innerHandleOp",
            "outputs": [
              {
                "name": "actualGasCost",
                "type": "uint256",
              },
            ],
            "stateMutability": "nonpayable",
            "type": "function",
          },
          {
            "inputs": [
              {
                "name": "",
                "type": "address",
              },
              {
                "name": "",
                "type": "uint192",
              },
            ],
            "name": "nonceSequenceNumber",
            "outputs": [
              {
                "name": "",
                "type": "uint256",
              },
            ],
            "stateMutability": "view",
            "type": "function",
          },
          {
            "inputs": [
              {
                "name": "interfaceId",
                "type": "bytes4",
              },
            ],
            "name": "supportsInterface",
            "outputs": [
              {
                "name": "",
                "type": "bool",
              },
            ],
            "stateMutability": "view",
            "type": "function",
          },
          {
            "inputs": [],
            "name": "unlockStake",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function",
          },
          {
            "inputs": [
              {
                "name": "withdrawAddress",
                "type": "address",
              },
            ],
            "name": "withdrawStake",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function",
          },
          {
            "inputs": [
              {
                "name": "withdrawAddress",
                "type": "address",
              },
              {
                "name": "withdrawAmount",
                "type": "uint256",
              },
            ],
            "name": "withdrawTo",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function",
          },
          {
            "stateMutability": "payable",
            "type": "receive",
          },
        ],
        "address": "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
        "version": "0.7",
      }
    `,
    )
  })
})

describe('return value: getAddress', () => {
  test('default', async () => {
    const account = await toSoladySmartAccount({
      client,
      factoryAddress,
      owner: accounts[1].address,
    })

    const address = await account.getAddress()
    expect(address).toMatchInlineSnapshot(
      `"0xE911628bF8428C23f179a07b081325cAe376DE1f"`,
    )
  })
})

describe('return value: decodeCalls', () => {
  test('single', async () => {
    const account = await toSoladySmartAccount({
      client,
      factoryAddress,
      owner: accounts[1].address,
    })

    const calls = [
      {
        to: '0x0000000000000000000000000000000000000000',
        value: 69n,
        data: '0xdeadbeef',
      },
    ] as const

    const data = await account.encodeCalls(calls)
    const decoded = await account.decodeCalls?.(data)
    expect(decoded).toEqual(calls)
  })

  test('batch', async () => {
    const account = await toSoladySmartAccount({
      client,
      factoryAddress,
      owner: accounts[1].address,
    })

    const calls = [
      {
        data: '0x',
        to: '0x0000000000000000000000000000000000000000',
        value: 0n,
      },
      {
        data: '0x',
        to: '0x0000000000000000000000000000000000000000',
        value: 69n,
      },
      {
        to: '0x0000000000000000000000000000000000000000',
        value: 69n,
        data: '0xdeadbeef',
      },
    ] as const

    const data = await account.encodeCalls(calls)
    const decoded = await account.decodeCalls?.(data)
    expect(decoded).toEqual(calls)
  })

  test('invalid data', async () => {
    const account = await toSoladySmartAccount({
      client,
      factoryAddress,
      owner: accounts[1].address,
    })

    const data = encodeFunctionData({
      abi: account.abi,
      functionName: 'entryPoint',
    })
    await expect(() =>
      account.decodeCalls?.(data),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [BaseError: unable to decode calls for "entryPoint"

      Version: viem@x.y.z]
    `)
  })
})

describe('return value: encodeCalls', () => {
  test('single', async () => {
    const account = await toSoladySmartAccount({
      client,
      factoryAddress,
      owner: accounts[1].address,
    })

    const callData_1 = await account.encodeCalls([
      { to: '0x0000000000000000000000000000000000000000' },
    ])
    const callData_2 = await account.encodeCalls([
      { to: '0x0000000000000000000000000000000000000000', value: 69n },
    ])
    const callData_3 = await account.encodeCalls([
      {
        to: '0x0000000000000000000000000000000000000000',
        value: 69n,
        data: '0xdeadbeef',
      },
    ])

    expect(callData_1).toMatchInlineSnapshot(
      `"0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000"`,
    )
    expect(callData_2).toMatchInlineSnapshot(
      `"0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004500000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000"`,
    )
    expect(callData_3).toMatchInlineSnapshot(
      `"0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004500000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000004deadbeef00000000000000000000000000000000000000000000000000000000"`,
    )
  })

  test('batch', async () => {
    const account = await toSoladySmartAccount({
      client,
      factoryAddress,
      owner: accounts[1].address,
    })

    const callData = await account.encodeCalls([
      { to: '0x0000000000000000000000000000000000000000' },
      { to: '0x0000000000000000000000000000000000000000', value: 69n },
      {
        to: '0x0000000000000000000000000000000000000000',
        value: 69n,
        data: '0xdeadbeef',
      },
    ])

    expect(callData).toMatchInlineSnapshot(
      `"0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000045000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004500000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000004deadbeef00000000000000000000000000000000000000000000000000000000"`,
    )
  })
})

describe('return value: getFactoryArgs', () => {
  test('default', async () => {
    const account = await toSoladySmartAccount({
      client,
      factoryAddress,
      owner: accounts[1].address,
    })

    const signature = await account.getFactoryArgs()
    expect(signature).toMatchInlineSnapshot(
      `
      {
        "factory": "0xfb6dab6200b8958c2655c3747708f82243d3f32e",
        "factoryData": "0xf14ddffc00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c80000000000000000000000000000000000000000000000000000000000000000",
      }
    `,
    )
  })
})

describe('return value: getSignature', () => {
  test('default', async () => {
    const account = await toSoladySmartAccount({
      client,
      factoryAddress,
      owner: accounts[1].address,
    })

    const signature = await account.getStubSignature()
    expect(signature).toMatchInlineSnapshot(
      `"0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c"`,
    )
  })
})

describe('return value: getNonce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(Date.UTC(2023, 1, 1)))
    return () => vi.useRealTimers()
  })

  test('default', async () => {
    const account = await toSoladySmartAccount({
      client,
      factoryAddress,
      owner: accounts[1].address,
    })

    const nonce = await account.getNonce()
    expect(nonce).toMatchInlineSnapshot('30902162761021348478818713600000n')
  })

  test('args: key', async () => {
    const account = await toSoladySmartAccount({
      client,
      factoryAddress,
      owner: accounts[1].address,
    })

    const nonce = await account.getNonce({ key: 0n })
    expect(nonce).toMatchInlineSnapshot('0n')
  })
})

describe('return value: signMessage', () => {
  test('default', async () => {
    const account = await toSoladySmartAccount({
      client,
      factoryAddress,
      owner: accounts[1].address,
    })

    await writeContract(client, {
      ...account.factory,
      functionName: 'createAccount',
      args: [accounts[1].address, pad('0x0')],
    })
    await mine(client, {
      blocks: 1,
    })

    const signature = await account.signMessage({
      message: 'hello world',
    })

    const result = await verifyMessage(client, {
      address: await account.getAddress(),
      message: 'hello world',
      signature,
    })

    expect(result).toBeTruthy()
  })

  test('counterfactual', async () => {
    const account = await toSoladySmartAccount({
      client,
      factoryAddress,
      owner: accounts[9].address,
      salt: '0x9',
    })

    const signature = await account.signMessage({
      message: 'hello world',
    })

    const result = await verifyMessage(client, {
      address: await account.getAddress(),
      message: 'hello world',
      signature,
    })

    expect(result).toBeTruthy()
  })
})

describe('return value: signTypedData', () => {
  test('default', async () => {
    const account = await toSoladySmartAccount({
      client,
      factoryAddress,
      owner: privateKeyToAccount(accounts[1].privateKey),
    })

    await writeContract(client, {
      ...account.factory,
      functionName: 'createAccount',
      args: [accounts[1].address, pad('0x0')],
    })
    await mine(client, {
      blocks: 1,
    })

    const signature = await account.signTypedData({
      ...typedData.basic,
      primaryType: 'Mail',
    })

    const result = await verifyTypedData(client, {
      address: await account.getAddress(),
      signature,
      ...typedData.basic,
      primaryType: 'Mail',
    })
    expect(result).toBeTruthy()
  })

  test('counterfactual', async () => {
    const account = await toSoladySmartAccount({
      client,
      factoryAddress,
      owner: accounts[9].address,
      salt: '0x9',
    })

    const signature = await account.signTypedData({
      ...typedData.basic,
      primaryType: 'Mail',
    })

    const result = await verifyTypedData(client, {
      address: await account.getAddress(),
      signature,
      ...typedData.basic,
      primaryType: 'Mail',
    })
    expect(result).toBeTruthy()
  })
})

describe('return value: signUserOperation', () => {
  test('default', async () => {
    const account = await toSoladySmartAccount({
      client,
      factoryAddress,
      owner: accounts[1].address,
    })

    const signature = await account.signUserOperation({
      callData: '0xdeadbeef',
      callGasLimit: 69n,
      maxFeePerGas: 69n,
      maxPriorityFeePerGas: 69n,
      nonce: 0n,
      preVerificationGas: 69n,
      signature: '0xdeadbeef',
      verificationGasLimit: 69n,
    })

    expect(signature).toMatchInlineSnapshot(
      `"0x9500afd481cfd9e21302f178c616fe23c3762829e87ff4ff012cdf10b2633cd408cc37e045774581b21035e90d645e23cbc4857468cd83f690c4fecec246d53a1b"`,
    )
  })
})
