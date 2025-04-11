import type { Address, TypedData } from 'abitype'

import type { LocalAccount } from '../../../accounts/types.js'
import { parseAccount } from '../../../accounts/utils/parseAccount.js'
import type { Client } from '../../../clients/createClient.js'
import { entryPoint08Address } from '../../../constants/address.js'
import { BaseError } from '../../../errors/base.js'
import type { TypedDataDefinition } from '../../../types/typedData.js'
import type { Prettify } from '../../../types/utils.js'
import { decodeFunctionData } from '../../../utils/abi/decodeFunctionData.js'
import { encodeFunctionData } from '../../../utils/abi/encodeFunctionData.js'
import { concat, encodePacked, numberToHex, pad } from '../../../utils/index.js'
import { entryPoint08Abi } from '../../constants/abis.js'
import { toSmartAccount } from '../toSmartAccount.js'
import type { SmartAccount, SmartAccountImplementation } from '../types.js'

export type ToSimple7702SmartAccountParameters = {
  client: Client
  implementation?: Address | undefined
  getNonce?: SmartAccountImplementation['getNonce'] | undefined
  owner: LocalAccount
}

export type ToSimple7702SmartAccountReturnType = Prettify<
  SmartAccount<Simple7702SmartAccountImplementation>
>

export type Simple7702SmartAccountImplementation = SmartAccountImplementation<
  typeof entryPoint08Abi,
  '0.8',
  { abi: typeof abi; implementation: Address }
>

/**
 * @description Create a Simple7702 Smart Account.
 *
 * @param parameters - {@link ToSimple7702SmartAccountParameters}
 * @returns Simple7702 Smart Account. {@link ToSimple7702SmartAccountReturnType}
 *
 * @example
 * import { toSimple7702SmartAccount } from 'viem/account-abstraction'
 * import { client } from './client.js'
 *
 * const implementation = toSimple7702SmartAccount({
 *   client,
 *   owner: '0x...',
 * })
 */
export async function toSimple7702SmartAccount(
  parameters: ToSimple7702SmartAccountParameters,
): Promise<ToSimple7702SmartAccountReturnType> {
  const {
    client,
    implementation = '0xe6Cae83BdE06E4c305530e199D7217f42808555B',
    getNonce,
  } = parameters

  const entryPoint = {
    abi: entryPoint08Abi,
    address: entryPoint08Address,
    version: '0.8',
  } as const
  const owner = parseAccount(parameters.owner)

  return toSmartAccount({
    client,
    entryPoint,
    getNonce,
    abi,
    extend: { abi, implementation }, // not removing abi from here as this will be a breaking change

    async decodeCalls(data) {
      const result = decodeFunctionData({
        abi,
        data,
      })

      if (result.functionName === 'execute')
        return [
          { to: result.args[0], value: result.args[1], data: result.args[2] },
        ]
      if (result.functionName === 'executeBatch')
        return result.args[0].map((arg) => ({
          to: arg.target,
          value: arg.value,
          data: arg.data,
        }))
      throw new BaseError(`unable to decode calls for "${result.functionName}"`)
    },

    async encodeCalls(calls) {
      if (calls.length === 1)
        return encodeFunctionData({
          abi,
          functionName: 'execute',
          args: [calls[0].to, calls[0].value ?? 0n, calls[0].data ?? '0x'],
        })
      return encodeFunctionData({
        abi,
        functionName: 'executeBatch',
        args: [
          calls.map((call) => ({
            data: call.data ?? '0x',
            target: call.to,
            value: call.value ?? 0n,
          })),
        ],
      })
    },

    async getAddress() {
      return owner.address
    },

    async getFactoryArgs() {
      return { factory: '0x7702', factoryData: '0x' }
    },

    async getStubSignature() {
      return '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c'
    },

    async signMessage(parameters) {
      const { message } = parameters
      return await owner.signMessage({ message })
    },

    async signTypedData(parameters) {
      const { domain, types, primaryType, message } =
        parameters as TypedDataDefinition<TypedData, string>
      return await owner.signTypedData({
        domain,
        message,
        primaryType,
        types,
      })
    },

    async signUserOperation(parameters) {
      const { chainId = client.chain!.id, ...userOperation } = parameters

      const address = await this.getAddress()

      const isEip7702 =
        userOperation.factory &&
        userOperation.factory === '0x7702' &&
        userOperation.authorization

      const delegate = isEip7702
        ? (userOperation.authorization?.address ??
          userOperation.authorization?.contractAddress)
        : undefined

      const initCode = delegate
        ? userOperation.factoryData
          ? encodePacked(
              ['address', 'bytes'],
              [delegate, userOperation.factoryData],
            )
          : encodePacked(['address'], [delegate])
        : userOperation.factory && userOperation.factoryData
          ? concat([userOperation.factory, userOperation.factoryData])
          : '0x'

      const accountGasLimits = concat([
        pad(numberToHex(userOperation.verificationGasLimit), { size: 16 }),
        pad(numberToHex(userOperation.callGasLimit), { size: 16 }),
      ])
      const gasFees = concat([
        pad(numberToHex(userOperation.maxPriorityFeePerGas), { size: 16 }),
        pad(numberToHex(userOperation.maxFeePerGas), { size: 16 }),
      ])
      const paymasterAndData = userOperation.paymaster
        ? concat([
            userOperation.paymaster,
            pad(numberToHex(userOperation.paymasterVerificationGasLimit || 0), {
              size: 16,
            }),
            pad(numberToHex(userOperation.paymasterPostOpGasLimit || 0), {
              size: 16,
            }),
            userOperation.paymasterData || '0x',
          ])
        : '0x'

      const signature = await owner.signTypedData({
        types: {
          PackedUserOperation: [
            { type: 'address', name: 'sender' },
            { type: 'uint256', name: 'nonce' },
            { type: 'bytes', name: 'initCode' },
            { type: 'bytes', name: 'callData' },
            { type: 'bytes32', name: 'accountGasLimits' },
            { type: 'uint256', name: 'preVerificationGas' },
            { type: 'bytes32', name: 'gasFees' },
            { type: 'bytes', name: 'paymasterAndData' },
          ],
        },
        primaryType: 'PackedUserOperation',
        domain: {
          name: 'ERC4337',
          version: '1',
          chainId,
          verifyingContract: entryPoint.address,
        },
        message: {
          sender: address,
          nonce: userOperation.nonce,
          initCode,
          callData: userOperation.callData,
          accountGasLimits,
          preVerificationGas: userOperation.preVerificationGas,
          gasFees,
          paymasterAndData,
        },
      })
      return signature
    },
  })
}

/////////////////////////////////////////////////////////////////////////////////////////////
// Constants

const abi = [
  { inputs: [], name: 'ECDSAInvalidSignature', type: 'error' },
  {
    inputs: [{ internalType: 'uint256', name: 'length', type: 'uint256' }],
    name: 'ECDSAInvalidSignatureLength',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 's', type: 'bytes32' }],
    name: 'ECDSAInvalidSignatureS',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'index', type: 'uint256' },
      { internalType: 'bytes', name: 'error', type: 'bytes' },
    ],
    name: 'ExecuteError',
    type: 'error',
  },
  { stateMutability: 'payable', type: 'fallback' },
  {
    inputs: [],
    name: 'entryPoint',
    outputs: [
      { internalType: 'contract IEntryPoint', name: '', type: 'address' },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'target', type: 'address' },
      { internalType: 'uint256', name: 'value', type: 'uint256' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
    ],
    name: 'execute',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'target', type: 'address' },
          { internalType: 'uint256', name: 'value', type: 'uint256' },
          { internalType: 'bytes', name: 'data', type: 'bytes' },
        ],
        internalType: 'struct BaseAccount.Call[]',
        name: 'calls',
        type: 'tuple[]',
      },
    ],
    name: 'executeBatch',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getNonce',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'hash', type: 'bytes32' },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
    ],
    name: 'isValidSignature',
    outputs: [{ internalType: 'bytes4', name: 'magicValue', type: 'bytes4' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'uint256[]', name: '', type: 'uint256[]' },
      { internalType: 'uint256[]', name: '', type: 'uint256[]' },
      { internalType: 'bytes', name: '', type: 'bytes' },
    ],
    name: 'onERC1155BatchReceived',
    outputs: [{ internalType: 'bytes4', name: '', type: 'bytes4' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'bytes', name: '', type: 'bytes' },
    ],
    name: 'onERC1155Received',
    outputs: [{ internalType: 'bytes4', name: '', type: 'bytes4' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'bytes', name: '', type: 'bytes' },
    ],
    name: 'onERC721Received',
    outputs: [{ internalType: 'bytes4', name: '', type: 'bytes4' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes4', name: 'id', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'sender', type: 'address' },
          { internalType: 'uint256', name: 'nonce', type: 'uint256' },
          { internalType: 'bytes', name: 'initCode', type: 'bytes' },
          { internalType: 'bytes', name: 'callData', type: 'bytes' },
          {
            internalType: 'bytes32',
            name: 'accountGasLimits',
            type: 'bytes32',
          },
          {
            internalType: 'uint256',
            name: 'preVerificationGas',
            type: 'uint256',
          },
          { internalType: 'bytes32', name: 'gasFees', type: 'bytes32' },
          { internalType: 'bytes', name: 'paymasterAndData', type: 'bytes' },
          { internalType: 'bytes', name: 'signature', type: 'bytes' },
        ],
        internalType: 'struct PackedUserOperation',
        name: 'userOp',
        type: 'tuple',
      },
      { internalType: 'bytes32', name: 'userOpHash', type: 'bytes32' },
      { internalType: 'uint256', name: 'missingAccountFunds', type: 'uint256' },
    ],
    name: 'validateUserOp',
    outputs: [
      { internalType: 'uint256', name: 'validationData', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  { stateMutability: 'payable', type: 'receive' },
] as const
