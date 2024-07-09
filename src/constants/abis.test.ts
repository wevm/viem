import { expect, test } from 'vitest'

import * as abis from './abis.js'

test('exports abis', () => {
  expect(abis).toMatchInlineSnapshot(`
    {
      "addressResolverAbi": [
        {
          "inputs": [
            {
              "name": "name",
              "type": "bytes32",
            },
          ],
          "name": "addr",
          "outputs": [
            {
              "name": "",
              "type": "address",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "name",
              "type": "bytes32",
            },
            {
              "name": "coinType",
              "type": "uint256",
            },
          ],
          "name": "addr",
          "outputs": [
            {
              "name": "",
              "type": "bytes",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
      ],
      "entryPoint06Abi": [
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "preOpGas",
              "type": "uint256",
            },
            {
              "internalType": "uint256",
              "name": "paid",
              "type": "uint256",
            },
            {
              "internalType": "uint48",
              "name": "validAfter",
              "type": "uint48",
            },
            {
              "internalType": "uint48",
              "name": "validUntil",
              "type": "uint48",
            },
            {
              "internalType": "bool",
              "name": "targetSuccess",
              "type": "bool",
            },
            {
              "internalType": "bytes",
              "name": "targetResult",
              "type": "bytes",
            },
          ],
          "name": "ExecutionResult",
          "type": "error",
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "opIndex",
              "type": "uint256",
            },
            {
              "internalType": "string",
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
              "internalType": "address",
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
              "internalType": "address",
              "name": "aggregator",
              "type": "address",
            },
          ],
          "name": "SignatureValidationFailed",
          "type": "error",
        },
        {
          "inputs": [
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "preOpGas",
                  "type": "uint256",
                },
                {
                  "internalType": "uint256",
                  "name": "prefund",
                  "type": "uint256",
                },
                {
                  "internalType": "bool",
                  "name": "sigFailed",
                  "type": "bool",
                },
                {
                  "internalType": "uint48",
                  "name": "validAfter",
                  "type": "uint48",
                },
                {
                  "internalType": "uint48",
                  "name": "validUntil",
                  "type": "uint48",
                },
                {
                  "internalType": "bytes",
                  "name": "paymasterContext",
                  "type": "bytes",
                },
              ],
              "internalType": "struct IEntryPoint.ReturnInfo",
              "name": "returnInfo",
              "type": "tuple",
            },
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "stake",
                  "type": "uint256",
                },
                {
                  "internalType": "uint256",
                  "name": "unstakeDelaySec",
                  "type": "uint256",
                },
              ],
              "internalType": "struct IStakeManager.StakeInfo",
              "name": "senderInfo",
              "type": "tuple",
            },
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "stake",
                  "type": "uint256",
                },
                {
                  "internalType": "uint256",
                  "name": "unstakeDelaySec",
                  "type": "uint256",
                },
              ],
              "internalType": "struct IStakeManager.StakeInfo",
              "name": "factoryInfo",
              "type": "tuple",
            },
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "stake",
                  "type": "uint256",
                },
                {
                  "internalType": "uint256",
                  "name": "unstakeDelaySec",
                  "type": "uint256",
                },
              ],
              "internalType": "struct IStakeManager.StakeInfo",
              "name": "paymasterInfo",
              "type": "tuple",
            },
          ],
          "name": "ValidationResult",
          "type": "error",
        },
        {
          "inputs": [
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "preOpGas",
                  "type": "uint256",
                },
                {
                  "internalType": "uint256",
                  "name": "prefund",
                  "type": "uint256",
                },
                {
                  "internalType": "bool",
                  "name": "sigFailed",
                  "type": "bool",
                },
                {
                  "internalType": "uint48",
                  "name": "validAfter",
                  "type": "uint48",
                },
                {
                  "internalType": "uint48",
                  "name": "validUntil",
                  "type": "uint48",
                },
                {
                  "internalType": "bytes",
                  "name": "paymasterContext",
                  "type": "bytes",
                },
              ],
              "internalType": "struct IEntryPoint.ReturnInfo",
              "name": "returnInfo",
              "type": "tuple",
            },
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "stake",
                  "type": "uint256",
                },
                {
                  "internalType": "uint256",
                  "name": "unstakeDelaySec",
                  "type": "uint256",
                },
              ],
              "internalType": "struct IStakeManager.StakeInfo",
              "name": "senderInfo",
              "type": "tuple",
            },
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "stake",
                  "type": "uint256",
                },
                {
                  "internalType": "uint256",
                  "name": "unstakeDelaySec",
                  "type": "uint256",
                },
              ],
              "internalType": "struct IStakeManager.StakeInfo",
              "name": "factoryInfo",
              "type": "tuple",
            },
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "stake",
                  "type": "uint256",
                },
                {
                  "internalType": "uint256",
                  "name": "unstakeDelaySec",
                  "type": "uint256",
                },
              ],
              "internalType": "struct IStakeManager.StakeInfo",
              "name": "paymasterInfo",
              "type": "tuple",
            },
            {
              "components": [
                {
                  "internalType": "address",
                  "name": "aggregator",
                  "type": "address",
                },
                {
                  "components": [
                    {
                      "internalType": "uint256",
                      "name": "stake",
                      "type": "uint256",
                    },
                    {
                      "internalType": "uint256",
                      "name": "unstakeDelaySec",
                      "type": "uint256",
                    },
                  ],
                  "internalType": "struct IStakeManager.StakeInfo",
                  "name": "stakeInfo",
                  "type": "tuple",
                },
              ],
              "internalType": "struct IEntryPoint.AggregatorStakeInfo",
              "name": "aggregatorInfo",
              "type": "tuple",
            },
          ],
          "name": "ValidationResultWithAggregation",
          "type": "error",
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "userOpHash",
              "type": "bytes32",
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "sender",
              "type": "address",
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "factory",
              "type": "address",
            },
            {
              "indexed": false,
              "internalType": "address",
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
              "internalType": "address",
              "name": "account",
              "type": "address",
            },
            {
              "indexed": false,
              "internalType": "uint256",
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
              "internalType": "address",
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
              "internalType": "address",
              "name": "account",
              "type": "address",
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "totalStaked",
              "type": "uint256",
            },
            {
              "indexed": false,
              "internalType": "uint256",
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
              "internalType": "address",
              "name": "account",
              "type": "address",
            },
            {
              "indexed": false,
              "internalType": "uint256",
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
              "internalType": "address",
              "name": "account",
              "type": "address",
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "withdrawAddress",
              "type": "address",
            },
            {
              "indexed": false,
              "internalType": "uint256",
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
              "internalType": "bytes32",
              "name": "userOpHash",
              "type": "bytes32",
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "sender",
              "type": "address",
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "paymaster",
              "type": "address",
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "nonce",
              "type": "uint256",
            },
            {
              "indexed": false,
              "internalType": "bool",
              "name": "success",
              "type": "bool",
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "actualGasCost",
              "type": "uint256",
            },
            {
              "indexed": false,
              "internalType": "uint256",
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
              "internalType": "bytes32",
              "name": "userOpHash",
              "type": "bytes32",
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "sender",
              "type": "address",
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "nonce",
              "type": "uint256",
            },
            {
              "indexed": false,
              "internalType": "bytes",
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
              "internalType": "address",
              "name": "account",
              "type": "address",
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "withdrawAddress",
              "type": "address",
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256",
            },
          ],
          "name": "Withdrawn",
          "type": "event",
        },
        {
          "inputs": [],
          "name": "SIG_VALIDATION_FAILED",
          "outputs": [
            {
              "internalType": "uint256",
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
              "internalType": "bytes",
              "name": "initCode",
              "type": "bytes",
            },
            {
              "internalType": "address",
              "name": "sender",
              "type": "address",
            },
            {
              "internalType": "bytes",
              "name": "paymasterAndData",
              "type": "bytes",
            },
          ],
          "name": "_validateSenderAndPaymaster",
          "outputs": [],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "internalType": "uint32",
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
              "internalType": "address",
              "name": "account",
              "type": "address",
            },
          ],
          "name": "balanceOf",
          "outputs": [
            {
              "internalType": "uint256",
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
              "internalType": "address",
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
              "internalType": "address",
              "name": "",
              "type": "address",
            },
          ],
          "name": "deposits",
          "outputs": [
            {
              "internalType": "uint112",
              "name": "deposit",
              "type": "uint112",
            },
            {
              "internalType": "bool",
              "name": "staked",
              "type": "bool",
            },
            {
              "internalType": "uint112",
              "name": "stake",
              "type": "uint112",
            },
            {
              "internalType": "uint32",
              "name": "unstakeDelaySec",
              "type": "uint32",
            },
            {
              "internalType": "uint48",
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
              "internalType": "address",
              "name": "account",
              "type": "address",
            },
          ],
          "name": "getDepositInfo",
          "outputs": [
            {
              "components": [
                {
                  "internalType": "uint112",
                  "name": "deposit",
                  "type": "uint112",
                },
                {
                  "internalType": "bool",
                  "name": "staked",
                  "type": "bool",
                },
                {
                  "internalType": "uint112",
                  "name": "stake",
                  "type": "uint112",
                },
                {
                  "internalType": "uint32",
                  "name": "unstakeDelaySec",
                  "type": "uint32",
                },
                {
                  "internalType": "uint48",
                  "name": "withdrawTime",
                  "type": "uint48",
                },
              ],
              "internalType": "struct IStakeManager.DepositInfo",
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
              "internalType": "address",
              "name": "sender",
              "type": "address",
            },
            {
              "internalType": "uint192",
              "name": "key",
              "type": "uint192",
            },
          ],
          "name": "getNonce",
          "outputs": [
            {
              "internalType": "uint256",
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
              "internalType": "bytes",
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
                  "internalType": "address",
                  "name": "sender",
                  "type": "address",
                },
                {
                  "internalType": "uint256",
                  "name": "nonce",
                  "type": "uint256",
                },
                {
                  "internalType": "bytes",
                  "name": "initCode",
                  "type": "bytes",
                },
                {
                  "internalType": "bytes",
                  "name": "callData",
                  "type": "bytes",
                },
                {
                  "internalType": "uint256",
                  "name": "callGasLimit",
                  "type": "uint256",
                },
                {
                  "internalType": "uint256",
                  "name": "verificationGasLimit",
                  "type": "uint256",
                },
                {
                  "internalType": "uint256",
                  "name": "preVerificationGas",
                  "type": "uint256",
                },
                {
                  "internalType": "uint256",
                  "name": "maxFeePerGas",
                  "type": "uint256",
                },
                {
                  "internalType": "uint256",
                  "name": "maxPriorityFeePerGas",
                  "type": "uint256",
                },
                {
                  "internalType": "bytes",
                  "name": "paymasterAndData",
                  "type": "bytes",
                },
                {
                  "internalType": "bytes",
                  "name": "signature",
                  "type": "bytes",
                },
              ],
              "internalType": "struct UserOperation",
              "name": "userOp",
              "type": "tuple",
            },
          ],
          "name": "getUserOpHash",
          "outputs": [
            {
              "internalType": "bytes32",
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
                      "internalType": "address",
                      "name": "sender",
                      "type": "address",
                    },
                    {
                      "internalType": "uint256",
                      "name": "nonce",
                      "type": "uint256",
                    },
                    {
                      "internalType": "bytes",
                      "name": "initCode",
                      "type": "bytes",
                    },
                    {
                      "internalType": "bytes",
                      "name": "callData",
                      "type": "bytes",
                    },
                    {
                      "internalType": "uint256",
                      "name": "callGasLimit",
                      "type": "uint256",
                    },
                    {
                      "internalType": "uint256",
                      "name": "verificationGasLimit",
                      "type": "uint256",
                    },
                    {
                      "internalType": "uint256",
                      "name": "preVerificationGas",
                      "type": "uint256",
                    },
                    {
                      "internalType": "uint256",
                      "name": "maxFeePerGas",
                      "type": "uint256",
                    },
                    {
                      "internalType": "uint256",
                      "name": "maxPriorityFeePerGas",
                      "type": "uint256",
                    },
                    {
                      "internalType": "bytes",
                      "name": "paymasterAndData",
                      "type": "bytes",
                    },
                    {
                      "internalType": "bytes",
                      "name": "signature",
                      "type": "bytes",
                    },
                  ],
                  "internalType": "struct UserOperation[]",
                  "name": "userOps",
                  "type": "tuple[]",
                },
                {
                  "internalType": "contract IAggregator",
                  "name": "aggregator",
                  "type": "address",
                },
                {
                  "internalType": "bytes",
                  "name": "signature",
                  "type": "bytes",
                },
              ],
              "internalType": "struct IEntryPoint.UserOpsPerAggregator[]",
              "name": "opsPerAggregator",
              "type": "tuple[]",
            },
            {
              "internalType": "address payable",
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
                  "internalType": "address",
                  "name": "sender",
                  "type": "address",
                },
                {
                  "internalType": "uint256",
                  "name": "nonce",
                  "type": "uint256",
                },
                {
                  "internalType": "bytes",
                  "name": "initCode",
                  "type": "bytes",
                },
                {
                  "internalType": "bytes",
                  "name": "callData",
                  "type": "bytes",
                },
                {
                  "internalType": "uint256",
                  "name": "callGasLimit",
                  "type": "uint256",
                },
                {
                  "internalType": "uint256",
                  "name": "verificationGasLimit",
                  "type": "uint256",
                },
                {
                  "internalType": "uint256",
                  "name": "preVerificationGas",
                  "type": "uint256",
                },
                {
                  "internalType": "uint256",
                  "name": "maxFeePerGas",
                  "type": "uint256",
                },
                {
                  "internalType": "uint256",
                  "name": "maxPriorityFeePerGas",
                  "type": "uint256",
                },
                {
                  "internalType": "bytes",
                  "name": "paymasterAndData",
                  "type": "bytes",
                },
                {
                  "internalType": "bytes",
                  "name": "signature",
                  "type": "bytes",
                },
              ],
              "internalType": "struct UserOperation[]",
              "name": "ops",
              "type": "tuple[]",
            },
            {
              "internalType": "address payable",
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
              "internalType": "uint192",
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
              "internalType": "bytes",
              "name": "callData",
              "type": "bytes",
            },
            {
              "components": [
                {
                  "components": [
                    {
                      "internalType": "address",
                      "name": "sender",
                      "type": "address",
                    },
                    {
                      "internalType": "uint256",
                      "name": "nonce",
                      "type": "uint256",
                    },
                    {
                      "internalType": "uint256",
                      "name": "callGasLimit",
                      "type": "uint256",
                    },
                    {
                      "internalType": "uint256",
                      "name": "verificationGasLimit",
                      "type": "uint256",
                    },
                    {
                      "internalType": "uint256",
                      "name": "preVerificationGas",
                      "type": "uint256",
                    },
                    {
                      "internalType": "address",
                      "name": "paymaster",
                      "type": "address",
                    },
                    {
                      "internalType": "uint256",
                      "name": "maxFeePerGas",
                      "type": "uint256",
                    },
                    {
                      "internalType": "uint256",
                      "name": "maxPriorityFeePerGas",
                      "type": "uint256",
                    },
                  ],
                  "internalType": "struct EntryPoint.MemoryUserOp",
                  "name": "mUserOp",
                  "type": "tuple",
                },
                {
                  "internalType": "bytes32",
                  "name": "userOpHash",
                  "type": "bytes32",
                },
                {
                  "internalType": "uint256",
                  "name": "prefund",
                  "type": "uint256",
                },
                {
                  "internalType": "uint256",
                  "name": "contextOffset",
                  "type": "uint256",
                },
                {
                  "internalType": "uint256",
                  "name": "preOpGas",
                  "type": "uint256",
                },
              ],
              "internalType": "struct EntryPoint.UserOpInfo",
              "name": "opInfo",
              "type": "tuple",
            },
            {
              "internalType": "bytes",
              "name": "context",
              "type": "bytes",
            },
          ],
          "name": "innerHandleOp",
          "outputs": [
            {
              "internalType": "uint256",
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
              "internalType": "address",
              "name": "",
              "type": "address",
            },
            {
              "internalType": "uint192",
              "name": "",
              "type": "uint192",
            },
          ],
          "name": "nonceSequenceNumber",
          "outputs": [
            {
              "internalType": "uint256",
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
              "components": [
                {
                  "internalType": "address",
                  "name": "sender",
                  "type": "address",
                },
                {
                  "internalType": "uint256",
                  "name": "nonce",
                  "type": "uint256",
                },
                {
                  "internalType": "bytes",
                  "name": "initCode",
                  "type": "bytes",
                },
                {
                  "internalType": "bytes",
                  "name": "callData",
                  "type": "bytes",
                },
                {
                  "internalType": "uint256",
                  "name": "callGasLimit",
                  "type": "uint256",
                },
                {
                  "internalType": "uint256",
                  "name": "verificationGasLimit",
                  "type": "uint256",
                },
                {
                  "internalType": "uint256",
                  "name": "preVerificationGas",
                  "type": "uint256",
                },
                {
                  "internalType": "uint256",
                  "name": "maxFeePerGas",
                  "type": "uint256",
                },
                {
                  "internalType": "uint256",
                  "name": "maxPriorityFeePerGas",
                  "type": "uint256",
                },
                {
                  "internalType": "bytes",
                  "name": "paymasterAndData",
                  "type": "bytes",
                },
                {
                  "internalType": "bytes",
                  "name": "signature",
                  "type": "bytes",
                },
              ],
              "internalType": "struct UserOperation",
              "name": "op",
              "type": "tuple",
            },
            {
              "internalType": "address",
              "name": "target",
              "type": "address",
            },
            {
              "internalType": "bytes",
              "name": "targetCallData",
              "type": "bytes",
            },
          ],
          "name": "simulateHandleOp",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function",
        },
        {
          "inputs": [
            {
              "components": [
                {
                  "internalType": "address",
                  "name": "sender",
                  "type": "address",
                },
                {
                  "internalType": "uint256",
                  "name": "nonce",
                  "type": "uint256",
                },
                {
                  "internalType": "bytes",
                  "name": "initCode",
                  "type": "bytes",
                },
                {
                  "internalType": "bytes",
                  "name": "callData",
                  "type": "bytes",
                },
                {
                  "internalType": "uint256",
                  "name": "callGasLimit",
                  "type": "uint256",
                },
                {
                  "internalType": "uint256",
                  "name": "verificationGasLimit",
                  "type": "uint256",
                },
                {
                  "internalType": "uint256",
                  "name": "preVerificationGas",
                  "type": "uint256",
                },
                {
                  "internalType": "uint256",
                  "name": "maxFeePerGas",
                  "type": "uint256",
                },
                {
                  "internalType": "uint256",
                  "name": "maxPriorityFeePerGas",
                  "type": "uint256",
                },
                {
                  "internalType": "bytes",
                  "name": "paymasterAndData",
                  "type": "bytes",
                },
                {
                  "internalType": "bytes",
                  "name": "signature",
                  "type": "bytes",
                },
              ],
              "internalType": "struct UserOperation",
              "name": "userOp",
              "type": "tuple",
            },
          ],
          "name": "simulateValidation",
          "outputs": [],
          "stateMutability": "nonpayable",
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
              "internalType": "address payable",
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
              "internalType": "address payable",
              "name": "withdrawAddress",
              "type": "address",
            },
            {
              "internalType": "uint256",
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
      "entryPoint07Abi": [
        {
          "inputs": [
            {
              "internalType": "bool",
              "name": "success",
              "type": "bool",
            },
            {
              "internalType": "bytes",
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
              "internalType": "uint256",
              "name": "opIndex",
              "type": "uint256",
            },
            {
              "internalType": "string",
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
              "internalType": "uint256",
              "name": "opIndex",
              "type": "uint256",
            },
            {
              "internalType": "string",
              "name": "reason",
              "type": "string",
            },
            {
              "internalType": "bytes",
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
              "internalType": "bytes",
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
              "internalType": "address",
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
              "internalType": "address",
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
              "internalType": "bytes32",
              "name": "userOpHash",
              "type": "bytes32",
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "sender",
              "type": "address",
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "factory",
              "type": "address",
            },
            {
              "indexed": false,
              "internalType": "address",
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
              "internalType": "address",
              "name": "account",
              "type": "address",
            },
            {
              "indexed": false,
              "internalType": "uint256",
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
              "internalType": "bytes32",
              "name": "userOpHash",
              "type": "bytes32",
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "sender",
              "type": "address",
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "nonce",
              "type": "uint256",
            },
            {
              "indexed": false,
              "internalType": "bytes",
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
              "internalType": "address",
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
              "internalType": "address",
              "name": "account",
              "type": "address",
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "totalStaked",
              "type": "uint256",
            },
            {
              "indexed": false,
              "internalType": "uint256",
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
              "internalType": "address",
              "name": "account",
              "type": "address",
            },
            {
              "indexed": false,
              "internalType": "uint256",
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
              "internalType": "address",
              "name": "account",
              "type": "address",
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "withdrawAddress",
              "type": "address",
            },
            {
              "indexed": false,
              "internalType": "uint256",
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
              "internalType": "bytes32",
              "name": "userOpHash",
              "type": "bytes32",
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "sender",
              "type": "address",
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "paymaster",
              "type": "address",
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "nonce",
              "type": "uint256",
            },
            {
              "indexed": false,
              "internalType": "bool",
              "name": "success",
              "type": "bool",
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "actualGasCost",
              "type": "uint256",
            },
            {
              "indexed": false,
              "internalType": "uint256",
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
              "internalType": "bytes32",
              "name": "userOpHash",
              "type": "bytes32",
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "sender",
              "type": "address",
            },
            {
              "indexed": false,
              "internalType": "uint256",
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
              "internalType": "bytes32",
              "name": "userOpHash",
              "type": "bytes32",
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "sender",
              "type": "address",
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "nonce",
              "type": "uint256",
            },
            {
              "indexed": false,
              "internalType": "bytes",
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
              "internalType": "address",
              "name": "account",
              "type": "address",
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "withdrawAddress",
              "type": "address",
            },
            {
              "indexed": false,
              "internalType": "uint256",
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
              "internalType": "uint32",
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
              "internalType": "address",
              "name": "account",
              "type": "address",
            },
          ],
          "name": "balanceOf",
          "outputs": [
            {
              "internalType": "uint256",
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
              "internalType": "address",
              "name": "target",
              "type": "address",
            },
            {
              "internalType": "bytes",
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
              "internalType": "address",
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
              "internalType": "address",
              "name": "",
              "type": "address",
            },
          ],
          "name": "deposits",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "deposit",
              "type": "uint256",
            },
            {
              "internalType": "bool",
              "name": "staked",
              "type": "bool",
            },
            {
              "internalType": "uint112",
              "name": "stake",
              "type": "uint112",
            },
            {
              "internalType": "uint32",
              "name": "unstakeDelaySec",
              "type": "uint32",
            },
            {
              "internalType": "uint48",
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
              "internalType": "address",
              "name": "account",
              "type": "address",
            },
          ],
          "name": "getDepositInfo",
          "outputs": [
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "deposit",
                  "type": "uint256",
                },
                {
                  "internalType": "bool",
                  "name": "staked",
                  "type": "bool",
                },
                {
                  "internalType": "uint112",
                  "name": "stake",
                  "type": "uint112",
                },
                {
                  "internalType": "uint32",
                  "name": "unstakeDelaySec",
                  "type": "uint32",
                },
                {
                  "internalType": "uint48",
                  "name": "withdrawTime",
                  "type": "uint48",
                },
              ],
              "internalType": "struct IStakeManager.DepositInfo",
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
              "internalType": "address",
              "name": "sender",
              "type": "address",
            },
            {
              "internalType": "uint192",
              "name": "key",
              "type": "uint192",
            },
          ],
          "name": "getNonce",
          "outputs": [
            {
              "internalType": "uint256",
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
              "internalType": "bytes",
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
                  "internalType": "address",
                  "name": "sender",
                  "type": "address",
                },
                {
                  "internalType": "uint256",
                  "name": "nonce",
                  "type": "uint256",
                },
                {
                  "internalType": "bytes",
                  "name": "initCode",
                  "type": "bytes",
                },
                {
                  "internalType": "bytes",
                  "name": "callData",
                  "type": "bytes",
                },
                {
                  "internalType": "bytes32",
                  "name": "accountGasLimits",
                  "type": "bytes32",
                },
                {
                  "internalType": "uint256",
                  "name": "preVerificationGas",
                  "type": "uint256",
                },
                {
                  "internalType": "bytes32",
                  "name": "gasFees",
                  "type": "bytes32",
                },
                {
                  "internalType": "bytes",
                  "name": "paymasterAndData",
                  "type": "bytes",
                },
                {
                  "internalType": "bytes",
                  "name": "signature",
                  "type": "bytes",
                },
              ],
              "internalType": "struct PackedUserOperation",
              "name": "userOp",
              "type": "tuple",
            },
          ],
          "name": "getUserOpHash",
          "outputs": [
            {
              "internalType": "bytes32",
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
                      "internalType": "address",
                      "name": "sender",
                      "type": "address",
                    },
                    {
                      "internalType": "uint256",
                      "name": "nonce",
                      "type": "uint256",
                    },
                    {
                      "internalType": "bytes",
                      "name": "initCode",
                      "type": "bytes",
                    },
                    {
                      "internalType": "bytes",
                      "name": "callData",
                      "type": "bytes",
                    },
                    {
                      "internalType": "bytes32",
                      "name": "accountGasLimits",
                      "type": "bytes32",
                    },
                    {
                      "internalType": "uint256",
                      "name": "preVerificationGas",
                      "type": "uint256",
                    },
                    {
                      "internalType": "bytes32",
                      "name": "gasFees",
                      "type": "bytes32",
                    },
                    {
                      "internalType": "bytes",
                      "name": "paymasterAndData",
                      "type": "bytes",
                    },
                    {
                      "internalType": "bytes",
                      "name": "signature",
                      "type": "bytes",
                    },
                  ],
                  "internalType": "struct PackedUserOperation[]",
                  "name": "userOps",
                  "type": "tuple[]",
                },
                {
                  "internalType": "contract IAggregator",
                  "name": "aggregator",
                  "type": "address",
                },
                {
                  "internalType": "bytes",
                  "name": "signature",
                  "type": "bytes",
                },
              ],
              "internalType": "struct IEntryPoint.UserOpsPerAggregator[]",
              "name": "opsPerAggregator",
              "type": "tuple[]",
            },
            {
              "internalType": "address payable",
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
                  "internalType": "address",
                  "name": "sender",
                  "type": "address",
                },
                {
                  "internalType": "uint256",
                  "name": "nonce",
                  "type": "uint256",
                },
                {
                  "internalType": "bytes",
                  "name": "initCode",
                  "type": "bytes",
                },
                {
                  "internalType": "bytes",
                  "name": "callData",
                  "type": "bytes",
                },
                {
                  "internalType": "bytes32",
                  "name": "accountGasLimits",
                  "type": "bytes32",
                },
                {
                  "internalType": "uint256",
                  "name": "preVerificationGas",
                  "type": "uint256",
                },
                {
                  "internalType": "bytes32",
                  "name": "gasFees",
                  "type": "bytes32",
                },
                {
                  "internalType": "bytes",
                  "name": "paymasterAndData",
                  "type": "bytes",
                },
                {
                  "internalType": "bytes",
                  "name": "signature",
                  "type": "bytes",
                },
              ],
              "internalType": "struct PackedUserOperation[]",
              "name": "ops",
              "type": "tuple[]",
            },
            {
              "internalType": "address payable",
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
              "internalType": "uint192",
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
              "internalType": "bytes",
              "name": "callData",
              "type": "bytes",
            },
            {
              "components": [
                {
                  "components": [
                    {
                      "internalType": "address",
                      "name": "sender",
                      "type": "address",
                    },
                    {
                      "internalType": "uint256",
                      "name": "nonce",
                      "type": "uint256",
                    },
                    {
                      "internalType": "uint256",
                      "name": "verificationGasLimit",
                      "type": "uint256",
                    },
                    {
                      "internalType": "uint256",
                      "name": "callGasLimit",
                      "type": "uint256",
                    },
                    {
                      "internalType": "uint256",
                      "name": "paymasterVerificationGasLimit",
                      "type": "uint256",
                    },
                    {
                      "internalType": "uint256",
                      "name": "paymasterPostOpGasLimit",
                      "type": "uint256",
                    },
                    {
                      "internalType": "uint256",
                      "name": "preVerificationGas",
                      "type": "uint256",
                    },
                    {
                      "internalType": "address",
                      "name": "paymaster",
                      "type": "address",
                    },
                    {
                      "internalType": "uint256",
                      "name": "maxFeePerGas",
                      "type": "uint256",
                    },
                    {
                      "internalType": "uint256",
                      "name": "maxPriorityFeePerGas",
                      "type": "uint256",
                    },
                  ],
                  "internalType": "struct EntryPoint.MemoryUserOp",
                  "name": "mUserOp",
                  "type": "tuple",
                },
                {
                  "internalType": "bytes32",
                  "name": "userOpHash",
                  "type": "bytes32",
                },
                {
                  "internalType": "uint256",
                  "name": "prefund",
                  "type": "uint256",
                },
                {
                  "internalType": "uint256",
                  "name": "contextOffset",
                  "type": "uint256",
                },
                {
                  "internalType": "uint256",
                  "name": "preOpGas",
                  "type": "uint256",
                },
              ],
              "internalType": "struct EntryPoint.UserOpInfo",
              "name": "opInfo",
              "type": "tuple",
            },
            {
              "internalType": "bytes",
              "name": "context",
              "type": "bytes",
            },
          ],
          "name": "innerHandleOp",
          "outputs": [
            {
              "internalType": "uint256",
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
              "internalType": "address",
              "name": "",
              "type": "address",
            },
            {
              "internalType": "uint192",
              "name": "",
              "type": "uint192",
            },
          ],
          "name": "nonceSequenceNumber",
          "outputs": [
            {
              "internalType": "uint256",
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
              "internalType": "bytes4",
              "name": "interfaceId",
              "type": "bytes4",
            },
          ],
          "name": "supportsInterface",
          "outputs": [
            {
              "internalType": "bool",
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
              "internalType": "address payable",
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
              "internalType": "address payable",
              "name": "withdrawAddress",
              "type": "address",
            },
            {
              "internalType": "uint256",
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
      "erc20Abi": [
        {
          "inputs": [
            {
              "indexed": true,
              "name": "owner",
              "type": "address",
            },
            {
              "indexed": true,
              "name": "spender",
              "type": "address",
            },
            {
              "indexed": false,
              "name": "value",
              "type": "uint256",
            },
          ],
          "name": "Approval",
          "type": "event",
        },
        {
          "inputs": [
            {
              "indexed": true,
              "name": "from",
              "type": "address",
            },
            {
              "indexed": true,
              "name": "to",
              "type": "address",
            },
            {
              "indexed": false,
              "name": "value",
              "type": "uint256",
            },
          ],
          "name": "Transfer",
          "type": "event",
        },
        {
          "inputs": [
            {
              "name": "owner",
              "type": "address",
            },
            {
              "name": "spender",
              "type": "address",
            },
          ],
          "name": "allowance",
          "outputs": [
            {
              "type": "uint256",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "spender",
              "type": "address",
            },
            {
              "name": "amount",
              "type": "uint256",
            },
          ],
          "name": "approve",
          "outputs": [
            {
              "type": "bool",
            },
          ],
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
          "name": "balanceOf",
          "outputs": [
            {
              "type": "uint256",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [],
          "name": "decimals",
          "outputs": [
            {
              "type": "uint8",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [],
          "name": "name",
          "outputs": [
            {
              "type": "string",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [],
          "name": "symbol",
          "outputs": [
            {
              "type": "string",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [],
          "name": "totalSupply",
          "outputs": [
            {
              "type": "uint256",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "recipient",
              "type": "address",
            },
            {
              "name": "amount",
              "type": "uint256",
            },
          ],
          "name": "transfer",
          "outputs": [
            {
              "type": "bool",
            },
          ],
          "stateMutability": "nonpayable",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "sender",
              "type": "address",
            },
            {
              "name": "recipient",
              "type": "address",
            },
            {
              "name": "amount",
              "type": "uint256",
            },
          ],
          "name": "transferFrom",
          "outputs": [
            {
              "type": "bool",
            },
          ],
          "stateMutability": "nonpayable",
          "type": "function",
        },
      ],
      "erc20Abi_bytes32": [
        {
          "inputs": [
            {
              "indexed": true,
              "name": "owner",
              "type": "address",
            },
            {
              "indexed": true,
              "name": "spender",
              "type": "address",
            },
            {
              "indexed": false,
              "name": "value",
              "type": "uint256",
            },
          ],
          "name": "Approval",
          "type": "event",
        },
        {
          "inputs": [
            {
              "indexed": true,
              "name": "from",
              "type": "address",
            },
            {
              "indexed": true,
              "name": "to",
              "type": "address",
            },
            {
              "indexed": false,
              "name": "value",
              "type": "uint256",
            },
          ],
          "name": "Transfer",
          "type": "event",
        },
        {
          "inputs": [
            {
              "name": "owner",
              "type": "address",
            },
            {
              "name": "spender",
              "type": "address",
            },
          ],
          "name": "allowance",
          "outputs": [
            {
              "type": "uint256",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "spender",
              "type": "address",
            },
            {
              "name": "amount",
              "type": "uint256",
            },
          ],
          "name": "approve",
          "outputs": [
            {
              "type": "bool",
            },
          ],
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
          "name": "balanceOf",
          "outputs": [
            {
              "type": "uint256",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [],
          "name": "decimals",
          "outputs": [
            {
              "type": "uint8",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [],
          "name": "name",
          "outputs": [
            {
              "type": "bytes32",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [],
          "name": "symbol",
          "outputs": [
            {
              "type": "bytes32",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [],
          "name": "totalSupply",
          "outputs": [
            {
              "type": "uint256",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "recipient",
              "type": "address",
            },
            {
              "name": "amount",
              "type": "uint256",
            },
          ],
          "name": "transfer",
          "outputs": [
            {
              "type": "bool",
            },
          ],
          "stateMutability": "nonpayable",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "sender",
              "type": "address",
            },
            {
              "name": "recipient",
              "type": "address",
            },
            {
              "name": "amount",
              "type": "uint256",
            },
          ],
          "name": "transferFrom",
          "outputs": [
            {
              "type": "bool",
            },
          ],
          "stateMutability": "nonpayable",
          "type": "function",
        },
      ],
      "erc4626Abi": [
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "name": "owner",
              "type": "address",
            },
            {
              "indexed": true,
              "name": "spender",
              "type": "address",
            },
            {
              "indexed": false,
              "name": "value",
              "type": "uint256",
            },
          ],
          "name": "Approval",
          "type": "event",
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "name": "sender",
              "type": "address",
            },
            {
              "indexed": true,
              "name": "receiver",
              "type": "address",
            },
            {
              "indexed": false,
              "name": "assets",
              "type": "uint256",
            },
            {
              "indexed": false,
              "name": "shares",
              "type": "uint256",
            },
          ],
          "name": "Deposit",
          "type": "event",
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "name": "from",
              "type": "address",
            },
            {
              "indexed": true,
              "name": "to",
              "type": "address",
            },
            {
              "indexed": false,
              "name": "value",
              "type": "uint256",
            },
          ],
          "name": "Transfer",
          "type": "event",
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "name": "sender",
              "type": "address",
            },
            {
              "indexed": true,
              "name": "receiver",
              "type": "address",
            },
            {
              "indexed": true,
              "name": "owner",
              "type": "address",
            },
            {
              "indexed": false,
              "name": "assets",
              "type": "uint256",
            },
            {
              "indexed": false,
              "name": "shares",
              "type": "uint256",
            },
          ],
          "name": "Withdraw",
          "type": "event",
        },
        {
          "inputs": [
            {
              "name": "owner",
              "type": "address",
            },
            {
              "name": "spender",
              "type": "address",
            },
          ],
          "name": "allowance",
          "outputs": [
            {
              "type": "uint256",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "spender",
              "type": "address",
            },
            {
              "name": "amount",
              "type": "uint256",
            },
          ],
          "name": "approve",
          "outputs": [
            {
              "type": "bool",
            },
          ],
          "stateMutability": "nonpayable",
          "type": "function",
        },
        {
          "inputs": [],
          "name": "asset",
          "outputs": [
            {
              "name": "assetTokenAddress",
              "type": "address",
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
          "name": "balanceOf",
          "outputs": [
            {
              "type": "uint256",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "shares",
              "type": "uint256",
            },
          ],
          "name": "convertToAssets",
          "outputs": [
            {
              "name": "assets",
              "type": "uint256",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "assets",
              "type": "uint256",
            },
          ],
          "name": "convertToShares",
          "outputs": [
            {
              "name": "shares",
              "type": "uint256",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "assets",
              "type": "uint256",
            },
            {
              "name": "receiver",
              "type": "address",
            },
          ],
          "name": "deposit",
          "outputs": [
            {
              "name": "shares",
              "type": "uint256",
            },
          ],
          "stateMutability": "nonpayable",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "caller",
              "type": "address",
            },
          ],
          "name": "maxDeposit",
          "outputs": [
            {
              "name": "maxAssets",
              "type": "uint256",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "caller",
              "type": "address",
            },
          ],
          "name": "maxMint",
          "outputs": [
            {
              "name": "maxShares",
              "type": "uint256",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "owner",
              "type": "address",
            },
          ],
          "name": "maxRedeem",
          "outputs": [
            {
              "name": "maxShares",
              "type": "uint256",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "owner",
              "type": "address",
            },
          ],
          "name": "maxWithdraw",
          "outputs": [
            {
              "name": "maxAssets",
              "type": "uint256",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "shares",
              "type": "uint256",
            },
            {
              "name": "receiver",
              "type": "address",
            },
          ],
          "name": "mint",
          "outputs": [
            {
              "name": "assets",
              "type": "uint256",
            },
          ],
          "stateMutability": "nonpayable",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "assets",
              "type": "uint256",
            },
          ],
          "name": "previewDeposit",
          "outputs": [
            {
              "name": "shares",
              "type": "uint256",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "shares",
              "type": "uint256",
            },
          ],
          "name": "previewMint",
          "outputs": [
            {
              "name": "assets",
              "type": "uint256",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "shares",
              "type": "uint256",
            },
          ],
          "name": "previewRedeem",
          "outputs": [
            {
              "name": "assets",
              "type": "uint256",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "assets",
              "type": "uint256",
            },
          ],
          "name": "previewWithdraw",
          "outputs": [
            {
              "name": "shares",
              "type": "uint256",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "shares",
              "type": "uint256",
            },
            {
              "name": "receiver",
              "type": "address",
            },
            {
              "name": "owner",
              "type": "address",
            },
          ],
          "name": "redeem",
          "outputs": [
            {
              "name": "assets",
              "type": "uint256",
            },
          ],
          "stateMutability": "nonpayable",
          "type": "function",
        },
        {
          "inputs": [],
          "name": "totalAssets",
          "outputs": [
            {
              "name": "totalManagedAssets",
              "type": "uint256",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [],
          "name": "totalSupply",
          "outputs": [
            {
              "type": "uint256",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "to",
              "type": "address",
            },
            {
              "name": "amount",
              "type": "uint256",
            },
          ],
          "name": "transfer",
          "outputs": [
            {
              "type": "bool",
            },
          ],
          "stateMutability": "nonpayable",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "from",
              "type": "address",
            },
            {
              "name": "to",
              "type": "address",
            },
            {
              "name": "amount",
              "type": "uint256",
            },
          ],
          "name": "transferFrom",
          "outputs": [
            {
              "type": "bool",
            },
          ],
          "stateMutability": "nonpayable",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "assets",
              "type": "uint256",
            },
            {
              "name": "receiver",
              "type": "address",
            },
            {
              "name": "owner",
              "type": "address",
            },
          ],
          "name": "withdraw",
          "outputs": [
            {
              "name": "shares",
              "type": "uint256",
            },
          ],
          "stateMutability": "nonpayable",
          "type": "function",
        },
      ],
      "erc721Abi": [
        {
          "inputs": [
            {
              "indexed": true,
              "name": "owner",
              "type": "address",
            },
            {
              "indexed": true,
              "name": "spender",
              "type": "address",
            },
            {
              "indexed": true,
              "name": "tokenId",
              "type": "uint256",
            },
          ],
          "name": "Approval",
          "type": "event",
        },
        {
          "inputs": [
            {
              "indexed": true,
              "name": "owner",
              "type": "address",
            },
            {
              "indexed": true,
              "name": "operator",
              "type": "address",
            },
            {
              "indexed": false,
              "name": "approved",
              "type": "bool",
            },
          ],
          "name": "ApprovalForAll",
          "type": "event",
        },
        {
          "inputs": [
            {
              "indexed": true,
              "name": "from",
              "type": "address",
            },
            {
              "indexed": true,
              "name": "to",
              "type": "address",
            },
            {
              "indexed": true,
              "name": "tokenId",
              "type": "uint256",
            },
          ],
          "name": "Transfer",
          "type": "event",
        },
        {
          "inputs": [
            {
              "name": "spender",
              "type": "address",
            },
            {
              "name": "tokenId",
              "type": "uint256",
            },
          ],
          "name": "approve",
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
              "type": "uint256",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "tokenId",
              "type": "uint256",
            },
          ],
          "name": "getApproved",
          "outputs": [
            {
              "type": "address",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "owner",
              "type": "address",
            },
            {
              "name": "operator",
              "type": "address",
            },
          ],
          "name": "isApprovedForAll",
          "outputs": [
            {
              "type": "bool",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [],
          "name": "name",
          "outputs": [
            {
              "type": "string",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "tokenId",
              "type": "uint256",
            },
          ],
          "name": "ownerOf",
          "outputs": [
            {
              "name": "owner",
              "type": "address",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "from",
              "type": "address",
            },
            {
              "name": "to",
              "type": "address",
            },
            {
              "name": "tokenId",
              "type": "uint256",
            },
          ],
          "name": "safeTransferFrom",
          "outputs": [],
          "stateMutability": "payable",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "from",
              "type": "address",
            },
            {
              "name": "to",
              "type": "address",
            },
            {
              "name": "id",
              "type": "uint256",
            },
            {
              "name": "data",
              "type": "bytes",
            },
          ],
          "name": "safeTransferFrom",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "operator",
              "type": "address",
            },
            {
              "name": "approved",
              "type": "bool",
            },
          ],
          "name": "setApprovalForAll",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function",
        },
        {
          "inputs": [],
          "name": "symbol",
          "outputs": [
            {
              "type": "string",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "index",
              "type": "uint256",
            },
          ],
          "name": "tokenByIndex",
          "outputs": [
            {
              "type": "uint256",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "owner",
              "type": "address",
            },
            {
              "name": "index",
              "type": "uint256",
            },
          ],
          "name": "tokenByIndex",
          "outputs": [
            {
              "name": "tokenId",
              "type": "uint256",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "tokenId",
              "type": "uint256",
            },
          ],
          "name": "tokenURI",
          "outputs": [
            {
              "type": "string",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [],
          "name": "totalSupply",
          "outputs": [
            {
              "type": "uint256",
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
              "name": "recipient",
              "type": "address",
            },
            {
              "name": "tokeId",
              "type": "uint256",
            },
          ],
          "name": "transferFrom",
          "outputs": [],
          "stateMutability": "payable",
          "type": "function",
        },
      ],
      "multicall3Abi": [
        {
          "inputs": [
            {
              "components": [
                {
                  "name": "target",
                  "type": "address",
                },
                {
                  "name": "allowFailure",
                  "type": "bool",
                },
                {
                  "name": "callData",
                  "type": "bytes",
                },
              ],
              "name": "calls",
              "type": "tuple[]",
            },
          ],
          "name": "aggregate3",
          "outputs": [
            {
              "components": [
                {
                  "name": "success",
                  "type": "bool",
                },
                {
                  "name": "returnData",
                  "type": "bytes",
                },
              ],
              "name": "returnData",
              "type": "tuple[]",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
      ],
      "smartAccountAbi": [
        {
          "inputs": [
            {
              "name": "hash",
              "type": "bytes32",
            },
            {
              "name": "signature",
              "type": "bytes",
            },
          ],
          "name": "isValidSignature",
          "outputs": [
            {
              "name": "",
              "type": "bytes4",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
      ],
      "textResolverAbi": [
        {
          "inputs": [
            {
              "name": "name",
              "type": "bytes32",
            },
            {
              "name": "key",
              "type": "string",
            },
          ],
          "name": "text",
          "outputs": [
            {
              "name": "",
              "type": "string",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
      ],
      "universalResolverResolveAbi": [
        {
          "inputs": [],
          "name": "ResolverNotFound",
          "type": "error",
        },
        {
          "inputs": [],
          "name": "ResolverWildcardNotSupported",
          "type": "error",
        },
        {
          "inputs": [],
          "name": "ResolverNotContract",
          "type": "error",
        },
        {
          "inputs": [
            {
              "name": "returnData",
              "type": "bytes",
            },
          ],
          "name": "ResolverError",
          "type": "error",
        },
        {
          "inputs": [
            {
              "components": [
                {
                  "name": "status",
                  "type": "uint16",
                },
                {
                  "name": "message",
                  "type": "string",
                },
              ],
              "name": "errors",
              "type": "tuple[]",
            },
          ],
          "name": "HttpError",
          "type": "error",
        },
        {
          "inputs": [
            {
              "name": "name",
              "type": "bytes",
            },
            {
              "name": "data",
              "type": "bytes",
            },
          ],
          "name": "resolve",
          "outputs": [
            {
              "name": "",
              "type": "bytes",
            },
            {
              "name": "address",
              "type": "address",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "name",
              "type": "bytes",
            },
            {
              "name": "data",
              "type": "bytes",
            },
            {
              "name": "gateways",
              "type": "string[]",
            },
          ],
          "name": "resolve",
          "outputs": [
            {
              "name": "",
              "type": "bytes",
            },
            {
              "name": "address",
              "type": "address",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
      ],
      "universalResolverReverseAbi": [
        {
          "inputs": [],
          "name": "ResolverNotFound",
          "type": "error",
        },
        {
          "inputs": [],
          "name": "ResolverWildcardNotSupported",
          "type": "error",
        },
        {
          "inputs": [],
          "name": "ResolverNotContract",
          "type": "error",
        },
        {
          "inputs": [
            {
              "name": "returnData",
              "type": "bytes",
            },
          ],
          "name": "ResolverError",
          "type": "error",
        },
        {
          "inputs": [
            {
              "components": [
                {
                  "name": "status",
                  "type": "uint16",
                },
                {
                  "name": "message",
                  "type": "string",
                },
              ],
              "name": "errors",
              "type": "tuple[]",
            },
          ],
          "name": "HttpError",
          "type": "error",
        },
        {
          "inputs": [
            {
              "name": "reverseName",
              "type": "bytes",
            },
          ],
          "name": "reverse",
          "outputs": [
            {
              "name": "resolvedName",
              "type": "string",
            },
            {
              "name": "resolvedAddress",
              "type": "address",
            },
            {
              "name": "reverseResolver",
              "type": "address",
            },
            {
              "name": "resolver",
              "type": "address",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
        {
          "inputs": [
            {
              "name": "reverseName",
              "type": "bytes",
            },
            {
              "name": "gateways",
              "type": "string[]",
            },
          ],
          "name": "reverse",
          "outputs": [
            {
              "name": "resolvedName",
              "type": "string",
            },
            {
              "name": "resolvedAddress",
              "type": "address",
            },
            {
              "name": "reverseResolver",
              "type": "address",
            },
            {
              "name": "resolver",
              "type": "address",
            },
          ],
          "stateMutability": "view",
          "type": "function",
        },
      ],
      "universalSignatureValidatorAbi": [
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_signer",
              "type": "address",
            },
            {
              "internalType": "bytes32",
              "name": "_hash",
              "type": "bytes32",
            },
            {
              "internalType": "bytes",
              "name": "_signature",
              "type": "bytes",
            },
          ],
          "stateMutability": "nonpayable",
          "type": "constructor",
        },
      ],
    }
  `)
})
