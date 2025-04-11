import type { Address } from 'abitype'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { anvilMainnet } from '../../../../test/src/anvil.js'
import { accounts, typedData } from '../../../../test/src/constants.js'
import { deploySimple7702Account_08 } from '../../../../test/src/utils.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import {
  mine,
  sendTransaction,
  signAuthorization,
  verifyMessage,
  verifyTypedData,
} from '../../../actions/index.js'
import { zeroAddress } from '../../../constants/address.js'
import { encodeFunctionData } from '../../../utils/abi/encodeFunctionData.js'
import { toSimple7702SmartAccount } from './toSimple7702SmartAccount.js'

const client = anvilMainnet.getClient({ account: true })

let implementation: Address
beforeAll(async () => {
  const { implementationAddress: _implementation } =
    await deploySimple7702Account_08()
  implementation = _implementation
})

test('default', async () => {
  const account = await toSimple7702SmartAccount({
    client,
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
      "address": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
      "client": null,
      "decodeCalls": [Function],
      "encodeCalls": [Function],
      "entryPoint": {
        "abi": [
          {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor",
          },
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
            "inputs": [],
            "name": "InvalidShortString",
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
            "inputs": [
              {
                "internalType": "string",
                "name": "str",
                "type": "string",
              },
            ],
            "name": "StringTooLong",
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
            "inputs": [],
            "name": "EIP712DomainChanged",
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
            "inputs": [],
            "name": "eip712Domain",
            "outputs": [
              {
                "internalType": "bytes1",
                "name": "fields",
                "type": "bytes1",
              },
              {
                "internalType": "string",
                "name": "name",
                "type": "string",
              },
              {
                "internalType": "string",
                "name": "version",
                "type": "string",
              },
              {
                "internalType": "uint256",
                "name": "chainId",
                "type": "uint256",
              },
              {
                "internalType": "address",
                "name": "verifyingContract",
                "type": "address",
              },
              {
                "internalType": "bytes32",
                "name": "salt",
                "type": "bytes32",
              },
              {
                "internalType": "uint256[]",
                "name": "extensions",
                "type": "uint256[]",
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
            "inputs": [],
            "name": "getDomainSeparatorV4",
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
            "inputs": [],
            "name": "getPackedUserOpTypeHash",
            "outputs": [
              {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32",
              },
            ],
            "stateMutability": "pure",
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
            "inputs": [],
            "name": "senderCreator",
            "outputs": [
              {
                "internalType": "contract ISenderCreator",
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
        "address": "0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108",
        "version": "0.8",
      },
      "factory": null,
      "getAddress": [Function],
      "getFactoryArgs": [Function],
      "getNonce": [Function],
      "getStubSignature": [Function],
      "implementation": "0xe6Cae83BdE06E4c305530e199D7217f42808555B",
      "isDeployed": [Function],
      "signMessage": [Function],
      "signTypedData": [Function],
      "signUserOperation": [Function],
      "type": "smart",
    }
  `)
})

describe('return value: entryPoint', () => {
  test('default', async () => {
    const account = await toSimple7702SmartAccount({
      client,
      implementation,
      owner: accounts[1].address,
    })

    expect(account.entryPoint).toMatchInlineSnapshot(
      `
      {
        "abi": [
          {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor",
          },
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
            "inputs": [],
            "name": "InvalidShortString",
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
            "inputs": [
              {
                "internalType": "string",
                "name": "str",
                "type": "string",
              },
            ],
            "name": "StringTooLong",
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
            "inputs": [],
            "name": "EIP712DomainChanged",
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
            "inputs": [],
            "name": "eip712Domain",
            "outputs": [
              {
                "internalType": "bytes1",
                "name": "fields",
                "type": "bytes1",
              },
              {
                "internalType": "string",
                "name": "name",
                "type": "string",
              },
              {
                "internalType": "string",
                "name": "version",
                "type": "string",
              },
              {
                "internalType": "uint256",
                "name": "chainId",
                "type": "uint256",
              },
              {
                "internalType": "address",
                "name": "verifyingContract",
                "type": "address",
              },
              {
                "internalType": "bytes32",
                "name": "salt",
                "type": "bytes32",
              },
              {
                "internalType": "uint256[]",
                "name": "extensions",
                "type": "uint256[]",
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
            "inputs": [],
            "name": "getDomainSeparatorV4",
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
            "inputs": [],
            "name": "getPackedUserOpTypeHash",
            "outputs": [
              {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32",
              },
            ],
            "stateMutability": "pure",
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
            "inputs": [],
            "name": "senderCreator",
            "outputs": [
              {
                "internalType": "contract ISenderCreator",
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
        "address": "0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108",
        "version": "0.8",
      }
    `,
    )
  })
})

describe('return value: getAddress', () => {
  test('default', async () => {
    const account = await toSimple7702SmartAccount({
      client,
      implementation,
      owner: accounts[1].address,
    })

    const address = await account.getAddress()
    expect(address).toMatchInlineSnapshot(
      `"0x70997970c51812dc3a010c7d01b50e0d17dc79c8"`,
    )
  })
})

describe('return value: decodeCalls', () => {
  test('single', async () => {
    const account = await toSimple7702SmartAccount({
      client,
      implementation,
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
    const account = await toSimple7702SmartAccount({
      client,
      implementation,
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
    const account = await toSimple7702SmartAccount({
      client,
      implementation,
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
    const account = await toSimple7702SmartAccount({
      client,
      implementation,
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
    const account = await toSimple7702SmartAccount({
      client,
      implementation,
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
    const account = await toSimple7702SmartAccount({
      client,
      implementation,
      owner: accounts[1].address,
    })

    const signature = await account.getFactoryArgs()
    expect(signature).toMatchInlineSnapshot(
      `
      {
        "factory": "0x7702",
        "factoryData": "0x",
      }
    `,
    )
  })
})

describe('return value: getSignature', () => {
  test('default', async () => {
    const account = await toSimple7702SmartAccount({
      client,
      implementation,
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
    const account = await toSimple7702SmartAccount({
      client,
      implementation,
      owner: accounts[1].address,
    })

    const nonce = await account.getNonce()
    expect(nonce).toMatchInlineSnapshot('30902162761021348478818713600000n')
  })

  test('args: key', async () => {
    const account = await toSimple7702SmartAccount({
      client,
      implementation,
      owner: accounts[1].address,
    })

    const nonce = await account.getNonce({ key: 0n })
    expect(nonce).toMatchInlineSnapshot('0n')
  })
})

describe('return value: signMessage', () => {
  test('default', async () => {
    const account = await toSimple7702SmartAccount({
      client,
      implementation,
      owner: accounts[1].address,
    })

    const authorization = await signAuthorization(client, {
      address: implementation,
      account: privateKeyToAccount(accounts[1].privateKey),
    })

    await sendTransaction(client, {
      account: privateKeyToAccount(accounts[1].privateKey),
      to: zeroAddress,
      value: 0n,
      data: '0x',
      authorizationList: [authorization],
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
})

describe('return value: signTypedData', () => {
  test('default', async () => {
    const account = await toSimple7702SmartAccount({
      client,
      implementation,
      owner: privateKeyToAccount(accounts[1].privateKey),
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
    const account = await toSimple7702SmartAccount({
      client,
      implementation,
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
      `"0xe9c0e8c18b021583df1d878db71819c3fa54e2175bd2ff6b5336dc051704ad9b5e481361a7d6602231651710ecf492dfc273d87b58d94bddcc2ffbcc0b1290431b"`,
    )
  })
})
