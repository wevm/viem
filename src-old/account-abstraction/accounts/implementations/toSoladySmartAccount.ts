import type { Abi, Address, TypedData } from 'abitype'

import { parseAccount } from '../../../accounts/utils/parseAccount.js'
import { readContract } from '../../../actions/public/readContract.js'
import { signMessage as signMessage_ } from '../../../actions/wallet/signMessage.js'
import { BaseError } from '../../../errors/base.js'
import { signMessage } from '../../../experimental/erc7739/actions/signMessage.js'
import { signTypedData } from '../../../experimental/erc7739/actions/signTypedData.js'
import type { Account } from '../../../types/account.js'
import type { Hex } from '../../../types/misc.js'
import type { TypedDataDefinition } from '../../../types/typedData.js'
import type { Prettify } from '../../../types/utils.js'
import { decodeFunctionData } from '../../../utils/abi/decodeFunctionData.js'
import { encodeFunctionData } from '../../../utils/abi/encodeFunctionData.js'
import { pad } from '../../../utils/data/pad.js'
import { getAction } from '../../../utils/getAction.js'
import { entryPoint07Abi } from '../../constants/abis.js'
import { entryPoint07Address } from '../../constants/address.js'
import type { EntryPointVersion } from '../../types/entryPointVersion.js'
import { getUserOperationHash } from '../../utils/userOperation/getUserOperationHash.js'
import { toSmartAccount } from '../toSmartAccount.js'
import type { SmartAccount, SmartAccountImplementation } from '../types.js'

export type ToSoladySmartAccountParameters<
  entryPointAbi extends Abi = Abi,
  entryPointVersion extends EntryPointVersion = EntryPointVersion,
> = {
  address?: Address | undefined
  client: SoladySmartAccountImplementation['client']
  entryPoint?:
    | {
        abi: entryPointAbi
        address: Address
        version: entryPointVersion | EntryPointVersion
      }
    | undefined
  factoryAddress?: Address | undefined
  getNonce?: SmartAccountImplementation['getNonce'] | undefined
  owner: Address | Account
  salt?: Hex | undefined
}

export type ToSoladySmartAccountReturnType<
  entryPointAbi extends Abi = Abi,
  entryPointVersion extends EntryPointVersion = EntryPointVersion,
> = Prettify<
  SmartAccount<
    SoladySmartAccountImplementation<entryPointAbi, entryPointVersion>
  >
>

export type SoladySmartAccountImplementation<
  entryPointAbi extends Abi = Abi,
  entryPointVersion extends EntryPointVersion = EntryPointVersion,
> = SmartAccountImplementation<
  entryPointAbi,
  entryPointVersion,
  { abi: typeof abi; factory: { abi: typeof factoryAbi; address: Address } }
>

/**
 * @description Create a Solady Smart Account – based off [Solady's `ERC4337.sol`](https://github.com/Vectorized/solady/blob/main/src/accounts/ERC4337.sol).
 *
 * @param parameters - {@link ToSoladySmartAccountParameters}
 * @returns Solady Smart Account. {@link ToSoladySmartAccountReturnType}
 *
 * @example
 * import { toSoladySmartAccount } from 'viem/account-abstraction'
 * import { client } from './client.js'
 *
 * const implementation = toSoladySmartAccount({
 *   client,
 *   owner: '0x...',
 * })
 */
export async function toSoladySmartAccount<
  entryPointAbi extends Abi = typeof entryPoint07Abi,
  entryPointVersion extends EntryPointVersion = '0.7',
>(
  parameters: ToSoladySmartAccountParameters<entryPointAbi, entryPointVersion>,
): Promise<ToSoladySmartAccountReturnType<entryPointAbi, entryPointVersion>> {
  const {
    address,
    client,
    entryPoint: entryPoint_ = {
      abi: entryPoint07Abi,
      address: entryPoint07Address,
      version: '0.7',
    },
    factoryAddress = '0x5d82735936c6Cd5DE57cC3c1A799f6B2E6F933Df',
    getNonce,
    salt = '0x0',
  } = parameters

  const entryPoint = {
    abi: entryPoint_.abi as entryPointAbi,
    address: entryPoint_.address,
    version: entryPoint_.version as entryPointVersion,
  } as const
  const factory = {
    abi: factoryAbi,
    address: factoryAddress,
  } as const
  const owner = parseAccount(parameters.owner)

  return toSmartAccount({
    client,
    entryPoint,
    getNonce,

    extend: { abi, factory },

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
      if (address) return address
      return await readContract(client, {
        ...factory,
        functionName: 'getAddress',
        args: [pad(salt)],
      })
    },

    async getFactoryArgs() {
      const factoryData = encodeFunctionData({
        abi: factory.abi,
        functionName: 'createAccount',
        args: [owner.address, pad(salt)],
      })
      return { factory: factory.address, factoryData }
    },

    async getStubSignature() {
      return '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c'
    },

    async signMessage(parameters) {
      const { message } = parameters
      const [address, { factory, factoryData }] = await Promise.all([
        this.getAddress(),
        this.getFactoryArgs(),
      ])
      return await signMessage(client, {
        account: owner,
        factory,
        factoryData,
        message,
        verifier: address,
      })
    },

    async signTypedData(parameters) {
      const { domain, types, primaryType, message } =
        parameters as TypedDataDefinition<TypedData, string>
      const [address, { factory, factoryData }] = await Promise.all([
        this.getAddress(),
        this.getFactoryArgs(),
      ])
      return await signTypedData(client, {
        account: owner,
        domain,
        message,
        factory,
        factoryData,
        primaryType,
        types,
        verifier: address,
      })
    },

    async signUserOperation(parameters) {
      const { chainId = client.chain!.id, ...userOperation } = parameters

      const address = await this.getAddress()
      const userOpHash = getUserOperationHash({
        chainId,
        entryPointAddress: entryPoint.address,
        entryPointVersion: entryPoint.version,
        userOperation: {
          ...(userOperation as any),
          sender: address,
        },
      })
      const signature = await getAction(
        client,
        signMessage_,
        'signMessage',
      )({
        account: owner,
        message: {
          raw: userOpHash,
        },
      })
      return signature
    },
  })
}

/////////////////////////////////////////////////////////////////////////////////////////////
// Constants

const abi = [
  {
    type: 'fallback',
    stateMutability: 'payable',
  },
  {
    type: 'receive',
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'addDeposit',
    inputs: [],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'cancelOwnershipHandover',
    inputs: [],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'completeOwnershipHandover',
    inputs: [
      {
        name: 'pendingOwner',
        type: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'delegateExecute',
    inputs: [
      {
        name: 'delegate',
        type: 'address',
      },
      {
        name: 'data',
        type: 'bytes',
      },
    ],
    outputs: [
      {
        name: 'result',
        type: 'bytes',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'eip712Domain',
    inputs: [],
    outputs: [
      {
        name: 'name',
        type: 'string',
      },
      {
        name: 'version',
        type: 'string',
      },
      {
        name: 'chainId',
        type: 'uint256',
      },
      {
        name: 'verifyingContract',
        type: 'address',
      },
      {
        name: 'salt',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'entryPoint',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'execute',
    inputs: [
      {
        name: 'target',
        type: 'address',
      },
      {
        name: 'value',
        type: 'uint256',
      },
      {
        name: 'data',
        type: 'bytes',
      },
    ],
    outputs: [
      {
        name: 'result',
        type: 'bytes',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'executeBatch',
    inputs: [
      {
        name: 'calls',
        type: 'tuple[]',

        components: [
          {
            name: 'target',
            type: 'address',
          },
          {
            name: 'value',
            type: 'uint256',
          },
          {
            name: 'data',
            type: 'bytes',
          },
        ],
      },
    ],
    outputs: [
      {
        name: 'results',
        type: 'bytes[]',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'getDeposit',
    inputs: [],
    outputs: [
      {
        name: 'result',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'initialize',
    inputs: [
      {
        name: 'newOwner',
        type: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'isValidSignature',
    inputs: [
      {
        name: 'hash',
        type: 'bytes32',
      },
      {
        name: 'signature',
        type: 'bytes',
      },
    ],
    outputs: [
      {
        name: 'result',
        type: 'bytes4',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [
      {
        name: 'result',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'ownershipHandoverExpiresAt',
    inputs: [
      {
        name: 'pendingOwner',
        type: 'address',
      },
    ],
    outputs: [
      {
        name: 'result',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'proxiableUUID',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'renounceOwnership',
    inputs: [],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'requestOwnershipHandover',
    inputs: [],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'storageLoad',
    inputs: [
      {
        name: 'storageSlot',
        type: 'bytes32',
      },
    ],
    outputs: [
      {
        name: 'result',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'storageStore',
    inputs: [
      {
        name: 'storageSlot',
        type: 'bytes32',
      },
      {
        name: 'storageValue',
        type: 'bytes32',
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'transferOwnership',
    inputs: [
      {
        name: 'newOwner',
        type: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'upgradeToAndCall',
    inputs: [
      {
        name: 'newImplementation',
        type: 'address',
      },
      {
        name: 'data',
        type: 'bytes',
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'validateUserOp',
    inputs: [
      {
        name: 'userOp',
        type: 'tuple',

        components: [
          {
            name: 'sender',
            type: 'address',
          },
          {
            name: 'nonce',
            type: 'uint256',
          },
          {
            name: 'initCode',
            type: 'bytes',
          },
          {
            name: 'callData',
            type: 'bytes',
          },
          {
            name: 'accountGasLimits',
            type: 'bytes32',
          },
          {
            name: 'preVerificationGas',
            type: 'uint256',
          },
          {
            name: 'gasFees',
            type: 'bytes32',
          },
          {
            name: 'paymasterAndData',
            type: 'bytes',
          },
          {
            name: 'signature',
            type: 'bytes',
          },
        ],
      },
      {
        name: 'userOpHash',
        type: 'bytes32',
      },
      {
        name: 'missingAccountFunds',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'validationData',
        type: 'uint256',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'withdrawDepositTo',
    inputs: [
      {
        name: 'to',
        type: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'event',
    name: 'OwnershipHandoverCanceled',
    inputs: [
      {
        name: 'pendingOwner',
        type: 'address',
        indexed: true,
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OwnershipHandoverRequested',
    inputs: [
      {
        name: 'pendingOwner',
        type: 'address',
        indexed: true,
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OwnershipTransferred',
    inputs: [
      {
        name: 'oldOwner',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        type: 'address',
        indexed: true,
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Upgraded',
    inputs: [
      {
        name: 'implementation',
        type: 'address',
        indexed: true,
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'AlreadyInitialized',
    inputs: [],
  },
  {
    type: 'error',
    name: 'FnSelectorNotRecognized',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NewOwnerIsZeroAddress',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NoHandoverRequest',
    inputs: [],
  },
  {
    type: 'error',
    name: 'Unauthorized',
    inputs: [],
  },
  {
    type: 'error',
    name: 'UnauthorizedCallContext',
    inputs: [],
  },
  {
    type: 'error',
    name: 'UpgradeFailed',
    inputs: [],
  },
] as const

const factoryAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: 'erc4337',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'createAccount',
    inputs: [
      {
        name: 'owner',
        type: 'address',
      },
      {
        name: 'salt',
        type: 'bytes32',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'getAddress',
    inputs: [
      {
        name: 'salt',
        type: 'bytes32',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'implementation',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'initCodeHash',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
] as const
