import { expect, test } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { accounts } from '../../../test/src/constants.js'
import { deploySoladyAccount_07 } from '../../../test/src/utils.js'
import { mine, writeContract } from '../../actions/index.js'
import { createNonceManager, pad } from '../../utils/index.js'
import { toSoladySmartAccount } from './implementations/toSoladySmartAccount.js'
import { toSmartAccount } from './toSmartAccount.js'

const client = anvilMainnet.getClient({ account: true })

test('default', async () => {
  const { factoryAddress } = await deploySoladyAccount_07()

  const account = await toSoladySmartAccount({
    client,
    factoryAddress,
    owner: accounts[1].address,
  })

  expect({
    ...account,
    client: null,
    _internal: null,
    abi: null,
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

test('args: nonceKeyManager', async () => {
  const { factoryAddress } = await deploySoladyAccount_07()

  const nonceKeyManager = createNonceManager({
    source: {
      get() {
        return 69
      },
      set() {},
    },
  })

  const implementation = await toSoladySmartAccount({
    client,
    factoryAddress,
    owner: accounts[1].address,
  })
  const account = await toSmartAccount({
    ...implementation,
    async getNonce(parameters) {
      return parameters!.key as bigint
    },
    nonceKeyManager,
  })

  const nonces = await Promise.all([
    account.getNonce(),
    account.getNonce(),
    account.getNonce(),
  ])

  expect(nonces).toEqual([69n, 70n, 71n])
})

test('return value: `isDeployed`', async () => {
  const { factoryAddress } = await deploySoladyAccount_07()

  const account = await toSoladySmartAccount({
    client,
    factoryAddress,
    owner: accounts[1].address,
  })
  expect(await account.isDeployed()).toBe(false)

  await writeContract(client, {
    ...account.factory,
    functionName: 'createAccount',
    args: [account.address, pad('0x0')],
  })
  await mine(client, {
    blocks: 1,
  })

  expect(await account.isDeployed()).toBe(true)
  expect(await account.isDeployed()).toBe(true)
})

test('return value: `getFactoryArgs`', async () => {
  const { factoryAddress } = await deploySoladyAccount_07()

  const account = await toSoladySmartAccount({
    client,
    factoryAddress,
    owner: accounts[1].address,
  })

  expect(await account.getFactoryArgs()).toMatchInlineSnapshot(`
    {
      "factory": "0x82a9286db983093ff234cefcea1d8fa66382876b",
      "factoryData": "0xf14ddffc00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c80000000000000000000000000000000000000000000000000000000000000000",
    }
  `)

  await writeContract(client, {
    ...account.factory,
    functionName: 'createAccount',
    args: [account.address, pad('0x0')],
  })
  await mine(client, {
    blocks: 1,
  })
  expect(await account.getFactoryArgs()).toMatchInlineSnapshot(`
    {
      "factory": undefined,
      "factoryData": undefined,
    }
  `)
})

test('return value: `getNonce`', async () => {
  const { factoryAddress } = await deploySoladyAccount_07()

  const account = await toSoladySmartAccount({
    client,
    factoryAddress,
    owner: accounts[1].address,
  })
  expect(await account.getNonce()).toBeDefined()
})

test('return value: `getNonce` (implementation override)', async () => {
  const { factoryAddress } = await deploySoladyAccount_07()

  const account = await toSoladySmartAccount({
    client,
    factoryAddress,
    owner: accounts[1].address,
    async getNonce() {
      return 69n
    },
  })
  expect(await account.getNonce()).toBe(69n)
})
