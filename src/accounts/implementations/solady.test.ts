import type { Address } from 'abitype'
import { beforeAll, describe, expect, test } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { accounts, typedData } from '../../../test/src/constants.js'
import { deployMock4337Account_07 } from '../../../test/src/utils.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import {
  mine,
  verifyMessage,
  verifyTypedData,
  writeContract,
} from '../../actions/index.js'
import { pad } from '../../utils/data/pad.js'
import { solady } from './solady.js'

const client = anvilMainnet.getClient({ account: true })

let factoryAddress: Address
beforeAll(async () => {
  const { factoryAddress: _factoryAddress } = await deployMock4337Account_07()
  factoryAddress = _factoryAddress
})

test('default', async () => {
  const implementation = solady({
    factoryAddress,
    owner: accounts[1].address,
  })({ client })

  expect({
    ...implementation,
    _internal: null,
    abi: null,
    factory: null,
  }).toMatchInlineSnapshot(`
    {
      "_internal": null,
      "abi": null,
      "entryPoint": {
        "abi": [
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
        "address": "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
        "version": "0.7",
      },
      "factory": null,
      "formatSignature": [Function],
      "getAddress": [Function],
      "getCallData": [Function],
      "getFactoryArgs": [Function],
      "getNonce": [Function],
      "signMessage": [Function],
      "signTypedData": [Function],
      "signUserOperation": [Function],
    }
  `)
})

test('args: salt', async () => {
  const account_1 = solady({
    factoryAddress,
    salt: '0x1',
    owner: accounts[1].address,
  })({ client })

  const account_2 = solady({
    factoryAddress,
    salt: '0x2',
    owner: accounts[1].address,
  })({ client })

  expect(await account_1.getAddress()).toMatchInlineSnapshot(
    `"0x0b3D649C00208AFB6A40b4A7e918b84A52D783B8"`,
  )
  expect(await account_2.getAddress()).toMatchInlineSnapshot(
    `"0x274B2baeCC1A87493db36439Df3D8012855fB182"`,
  )
})

describe('return value: entryPoint', () => {
  test('default', async () => {
    const implementation = solady({
      factoryAddress,
      owner: accounts[1].address,
    })({ client })

    expect(implementation.entryPoint).toMatchInlineSnapshot(
      `
      {
        "abi": [
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
        "address": "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
        "version": "0.7",
      }
    `,
    )
  })
})

describe('return value: getAddress', () => {
  test('default', async () => {
    const implementation = solady({
      factoryAddress,
      owner: accounts[1].address,
    })({ client })

    const address = await implementation.getAddress()
    expect(address).toMatchInlineSnapshot(
      `"0xE911628bF8428C23f179a07b081325cAe376DE1f"`,
    )
  })
})

describe('return value: getCallData', () => {
  test('single', async () => {
    const implementation = solady({
      factoryAddress,
      owner: accounts[1].address,
    })({ client })

    const callData_1 = await implementation.getCallData([
      { to: '0x0000000000000000000000000000000000000000' },
    ])
    const callData_2 = await implementation.getCallData([
      { to: '0x0000000000000000000000000000000000000000', value: 69n },
    ])
    const callData_3 = await implementation.getCallData([
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
    const implementation = solady({
      factoryAddress,
      owner: accounts[1].address,
    })({ client })

    const callData = await implementation.getCallData([
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
    const implementation = solady({
      factoryAddress,
      owner: accounts[1].address,
    })({ client })

    const signature = await implementation.getFactoryArgs()
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

describe('return value: formatSignature', () => {
  test('default', async () => {
    const implementation = solady({
      factoryAddress,
      owner: accounts[1].address,
    })({ client })

    const signature = await implementation.formatSignature()
    expect(signature).toMatchInlineSnapshot(
      `"0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c"`,
    )

    const signature_2 = await implementation.formatSignature({
      signature: '0xdeadbeef',
    })
    expect(signature_2).toMatchInlineSnapshot(`"0xdeadbeef"`)
  })
})

describe('return value: getNonce', () => {
  test('default', async () => {
    const implementation = solady({
      factoryAddress,
      owner: accounts[1].address,
    })({ client })

    const nonce = await implementation.getNonce()
    expect(nonce).toMatchInlineSnapshot('0n')
  })
})

describe('return value: signMessage', () => {
  test('default', async () => {
    const implementation = solady({
      factoryAddress,
      owner: accounts[1].address,
    })({ client })

    await writeContract(client, {
      ...implementation.factory,
      functionName: 'createAccount',
      args: [accounts[1].address, pad('0x0')],
    })
    await mine(client, {
      blocks: 1,
    })

    const signature = await implementation.signMessage({
      message: 'hello world',
    })

    const result = await verifyMessage(client, {
      address: await implementation.getAddress(),
      message: 'hello world',
      signature,
    })

    expect(result).toBeTruthy()
  })

  test('counterfactual', async () => {
    const implementation = solady({
      factoryAddress,
      owner: accounts[1].address,
    })({ client })

    const signature = await implementation.signMessage({
      message: 'hello world',
    })

    const result = await verifyMessage(client, {
      address: await implementation.getAddress(),
      message: 'hello world',
      signature,
    })

    expect(result).toBeTruthy()
  })
})

describe('return value: signTypedData', () => {
  test('default', async () => {
    const implementation = solady({
      factoryAddress,
      owner: privateKeyToAccount(accounts[1].privateKey),
    })({ client })

    await writeContract(client, {
      ...implementation.factory,
      functionName: 'createAccount',
      args: [accounts[1].address, pad('0x0')],
    })
    await mine(client, {
      blocks: 1,
    })

    const signature = await implementation.signTypedData({
      ...typedData.basic,
      primaryType: 'Mail',
    })

    const result = await verifyTypedData(client, {
      address: await implementation.getAddress(),
      signature,
      ...typedData.basic,
      primaryType: 'Mail',
    })
    expect(result).toBeTruthy()
  })

  test('counterfactual', async () => {
    const implementation = solady({
      factoryAddress,
      owner: privateKeyToAccount(accounts[1].privateKey),
    })({ client })

    const signature = await implementation.signTypedData({
      ...typedData.basic,
      primaryType: 'Mail',
    })

    const result = await verifyTypedData(client, {
      address: await implementation.getAddress(),
      signature,
      ...typedData.basic,
      primaryType: 'Mail',
    })
    expect(result).toBeTruthy()
  })
})

describe('return value: signUserOperation', () => {
  test('default', async () => {
    const implementation = solady({
      factoryAddress,
      owner: accounts[1].address,
    })({ client })

    const signature = await implementation.signUserOperation({
      userOperation: {
        callData: '0xdeadbeef',
        callGasLimit: 69n,
        maxFeePerGas: 69n,
        maxPriorityFeePerGas: 69n,
        nonce: 0n,
        preVerificationGas: 69n,
        signature: '0xdeadbeef',
        verificationGasLimit: 69n,
      },
    })

    expect(signature).toMatchInlineSnapshot(
      `"0x9500afd481cfd9e21302f178c616fe23c3762829e87ff4ff012cdf10b2633cd408cc37e045774581b21035e90d645e23cbc4857468cd83f690c4fecec246d53a1b"`,
    )
  })
})
