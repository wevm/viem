import type { Abi, Address, TypedData } from 'abitype'

import type { PrivateKeyAccount } from '../../../accounts/types.js'
import { BaseError } from '../../../errors/base.js'
import type { TypedDataDefinition } from '../../../types/typedData.js'
import type { Prettify } from '../../../types/utils.js'
import { decodeFunctionData } from '../../../utils/abi/decodeFunctionData.js'
import { encodeFunctionData } from '../../../utils/abi/encodeFunctionData.js'
import { entryPoint08Abi, entryPoint09Abi } from '../../constants/abis.js'
import {
  entryPoint08Address,
  entryPoint09Address,
} from '../../constants/address.js'
import type { EntryPointVersion } from '../../types/entryPointVersion.js'
import { getUserOperationTypedData } from '../../utils/userOperation/getUserOperationTypedData.js'
import { toSmartAccount } from '../toSmartAccount.js'
import type { SmartAccount, SmartAccountImplementation } from '../types.js'

type EntryPoint =
  | '0.8'
  | '0.9'
  | {
      abi: Abi
      address: Address
      version: EntryPointVersion
    }

export type ToSimple7702SmartAccountParameters<
  entryPoint extends EntryPoint = '0.8',
> = {
  client: Simple7702SmartAccountImplementation['client']
  entryPoint?: entryPoint | EntryPoint | undefined
  implementation?: Address | undefined
  getNonce?: SmartAccountImplementation['getNonce'] | undefined
  owner: PrivateKeyAccount
}

export type ToSimple7702SmartAccountReturnType<
  entryPoint extends EntryPoint = '0.8',
> = Prettify<SmartAccount<Simple7702SmartAccountImplementation<entryPoint>>>

export type Simple7702SmartAccountImplementation<
  entryPoint extends EntryPoint = '0.8',
> = SmartAccountImplementation<
  entryPoint extends { abi: infer abi }
    ? abi
    : entryPoint extends '0.9'
      ? typeof entryPoint09Abi
      : typeof entryPoint08Abi,
  entryPoint extends string
    ? entryPoint
    : entryPoint extends { version: infer version }
      ? version
      : EntryPointVersion,
  {
    abi: entryPoint extends { abi: infer abi }
      ? abi
      : entryPoint extends '0.9'
        ? typeof entryPoint09Abi
        : typeof entryPoint08Abi
    owner: PrivateKeyAccount
  },
  true
>

/**
 * @description Create a Simple7702 Smart Account – based off [eth-infinitism's `Simple7702Account.sol`](https://github.com/eth-infinitism/account-abstraction/blob/develop/contracts/accounts/Simple7702Account.sol).
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
export async function toSimple7702SmartAccount<
  entryPoint extends EntryPoint = '0.8',
>(
  parameters: ToSimple7702SmartAccountParameters<entryPoint>,
): Promise<ToSimple7702SmartAccountReturnType<entryPoint>> {
  const { client, getNonce, owner } = parameters

  const entryPoint = (() => {
    if (parameters.entryPoint === '0.9')
      return {
        abi: entryPoint09Abi,
        address: entryPoint09Address,
        version: '0.9',
      } as const
    if (typeof parameters.entryPoint === 'object') return parameters.entryPoint
    return {
      abi: entryPoint08Abi,
      address: entryPoint08Address,
      version: '0.8',
    } as const
  })()

  const implementation = (() => {
    if (parameters.implementation) return parameters.implementation
    if (parameters.entryPoint === '0.9')
      return '0xa46cc63eBF4Bd77888AA327837d20b23A63a56B5'
    return '0xe6Cae83BdE06E4c305530e199D7217f42808555B'
  })()

  return toSmartAccount({
    authorization: { account: owner, address: implementation },
    abi,
    client,
    extend: { abi, owner }, // not removing abi from here as this will be a breaking change
    entryPoint,
    getNonce,

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
      const typedData = getUserOperationTypedData({
        chainId,
        entryPointAddress: entryPoint.address,
        userOperation: {
          ...userOperation,
          sender: address,
        },
      })
      return await owner.signTypedData(typedData)
    },
  }) as unknown as ToSimple7702SmartAccountReturnType<entryPoint>
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
