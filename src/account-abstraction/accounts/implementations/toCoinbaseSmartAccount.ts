import type { Address, TypedData } from 'abitype'
import * as Signature from 'ox/Signature'
import type * as WebAuthnP256 from 'ox/WebAuthnP256'

import type { LocalAccount } from '../../../accounts/types.js'
import { readContract } from '../../../actions/public/readContract.js'
import { BaseError } from '../../../errors/base.js'
import type { Hash, Hex } from '../../../types/misc.js'
import type { TypedDataDefinition } from '../../../types/typedData.js'
import type { Assign, OneOf, Prettify } from '../../../types/utils.js'
import { decodeFunctionData } from '../../../utils/abi/decodeFunctionData.js'
import { encodeAbiParameters } from '../../../utils/abi/encodeAbiParameters.js'
import { encodeFunctionData } from '../../../utils/abi/encodeFunctionData.js'
import { encodePacked } from '../../../utils/abi/encodePacked.js'
import { pad } from '../../../utils/data/pad.js'
import { size } from '../../../utils/data/size.js'
import { stringToHex } from '../../../utils/encoding/toHex.js'
import { hashMessage } from '../../../utils/signature/hashMessage.js'
import { hashTypedData } from '../../../utils/signature/hashTypedData.js'
import { parseSignature } from '../../../utils/signature/parseSignature.js'
import { entryPoint06Abi } from '../../constants/abis.js'
import { entryPoint06Address } from '../../constants/address.js'
import type { UserOperation } from '../../types/userOperation.js'
import { getUserOperationHash } from '../../utils/userOperation/getUserOperationHash.js'
import { toSmartAccount } from '../toSmartAccount.js'
import type {
  SmartAccount,
  SmartAccountImplementation,
  WebAuthnAccount,
} from '../types.js'

export type ToCoinbaseSmartAccountParameters = {
  address?: Address | undefined
  client: CoinbaseSmartAccountImplementation['client']
  ownerIndex?: number | undefined
  owners: readonly (Address | OneOf<LocalAccount | WebAuthnAccount>)[]
  nonce?: bigint | undefined
  version: '1.1' | '1'
}

export type ToCoinbaseSmartAccountReturnType = Prettify<
  SmartAccount<CoinbaseSmartAccountImplementation>
>

export type CoinbaseSmartAccountImplementation = Assign<
  SmartAccountImplementation<
    typeof entryPoint06Abi,
    '0.6',
    { abi: typeof abi; factory: { abi: typeof factoryAbi; address: Address } }
  >,
  {
    decodeCalls: NonNullable<SmartAccountImplementation['decodeCalls']>
    sign: NonNullable<SmartAccountImplementation['sign']>
  }
>

const factoryAddress = {
  '1.1': '0xba5ed110efdba3d005bfc882d75358acbbb85842',
  '1': '0x0ba5ed0c6aa8c49038f819e587e2633c4a9f428a',
} as const

/**
 * @description Create a Coinbase Smart Account.
 *
 * @param parameters - {@link ToCoinbaseSmartAccountParameters}
 * @returns Coinbase Smart Account. {@link ToCoinbaseSmartAccountReturnType}
 *
 * @example
 * import { toCoinbaseSmartAccount } from 'viem/account-abstraction'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { client } from './client.js'
 *
 * const account = toCoinbaseSmartAccount({
 *   client,
 *   owners: [privateKeyToAccount('0x...')],
 *   version: '1.1',
 * })
 */
export async function toCoinbaseSmartAccount(
  parameters: ToCoinbaseSmartAccountParameters,
): Promise<ToCoinbaseSmartAccountReturnType> {
  const {
    client,
    ownerIndex = 0,
    owners,
    nonce = 0n,
    version = '1',
  } = parameters

  let address = parameters.address

  const entryPoint = {
    abi: entryPoint06Abi,
    address: entryPoint06Address,
    version: '0.6',
  } as const
  const factory = {
    abi: factoryAbi,
    address: factoryAddress[version],
  } as const

  const owners_bytes = owners.map((owner) => {
    if (typeof owner === 'string') return pad(owner)
    if (owner.type === 'webAuthn') return owner.publicKey
    if (owner.type === 'local') return pad(owner.address)
    throw new BaseError('invalid owner type')
  })

  const owner = (() => {
    const owner = owners[ownerIndex] ?? owners[0]
    if (typeof owner === 'string')
      return { address: owner, type: 'address' } as const
    return owner
  })()

  return toSmartAccount({
    client,
    entryPoint,

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
      address ??= await readContract(client, {
        ...factory,
        functionName: 'getAddress',
        args: [owners_bytes, nonce],
      })
      return address
    },

    async getFactoryArgs() {
      const factoryData = encodeFunctionData({
        abi: factory.abi,
        functionName: 'createAccount',
        args: [owners_bytes, nonce],
      })
      return { factory: factory.address, factoryData }
    },

    async getStubSignature() {
      if (owner.type === 'webAuthn')
        return '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000000170000000000000000000000000000000000000000000000000000000000000001949fc7c88032b9fcb5f6efc7a7b8c63668eae9871b765e23123bb473ff57aa831a7c0d9276168ebcc29f2875a0239cffdf2a9cd1c2007c5c77c071db9264df1d000000000000000000000000000000000000000000000000000000000000002549960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d97630500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008a7b2274797065223a22776562617574686e2e676574222c226368616c6c656e6765223a2273496a396e6164474850596759334b7156384f7a4a666c726275504b474f716d59576f4d57516869467773222c226f726967696e223a2268747470733a2f2f7369676e2e636f696e626173652e636f6d222c2263726f73734f726967696e223a66616c73657d00000000000000000000000000000000000000000000'
      return wrapSignature({
        ownerIndex,
        signature:
          '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c',
      })
    },

    async sign(parameters) {
      const address = await this.getAddress()

      const typedData = toReplaySafeTypedData({
        address,
        chainId: client.chain!.id,
        hash: parameters.hash,
      })

      if (owner.type === 'address') throw new Error('owner cannot sign')
      const signature = await signTypedData({ owner, typedData })

      return wrapSignature({
        ownerIndex,
        signature,
      })
    },

    async signMessage(parameters) {
      const { message } = parameters
      const address = await this.getAddress()

      const typedData = toReplaySafeTypedData({
        address,
        chainId: client.chain!.id,
        hash: hashMessage(message),
      })

      if (owner.type === 'address') throw new Error('owner cannot sign')
      const signature = await signTypedData({ owner, typedData })

      return wrapSignature({
        ownerIndex,
        signature,
      })
    },

    async signTypedData(parameters) {
      const { domain, types, primaryType, message } =
        parameters as TypedDataDefinition<TypedData, string>
      const address = await this.getAddress()

      const typedData = toReplaySafeTypedData({
        address,
        chainId: client.chain!.id,
        hash: hashTypedData({
          domain,
          message,
          primaryType,
          types,
        }),
      })

      if (owner.type === 'address') throw new Error('owner cannot sign')
      const signature = await signTypedData({ owner, typedData })

      return wrapSignature({
        ownerIndex,
        signature,
      })
    },

    async signUserOperation(parameters) {
      const { chainId = client.chain!.id, ...userOperation } = parameters

      const address = await this.getAddress()
      const hash = getUserOperationHash({
        chainId,
        entryPointAddress: entryPoint.address,
        entryPointVersion: entryPoint.version,
        userOperation: {
          ...(userOperation as unknown as UserOperation),
          sender: address,
        },
      })

      if (owner.type === 'address') throw new Error('owner cannot sign')
      const signature = await sign({ hash, owner })

      return wrapSignature({
        ownerIndex,
        signature,
      })
    },

    userOperation: {
      async estimateGas(userOperation) {
        if (owner.type !== 'webAuthn') return

        // Accounts with WebAuthn owner require a minimum verification gas limit of 800,000.
        return {
          verificationGasLimit: BigInt(
            Math.max(Number(userOperation.verificationGasLimit ?? 0n), 800_000),
          ),
        }
      },
    },
  })
}

/////////////////////////////////////////////////////////////////////////////////////////////
// Utilities
/////////////////////////////////////////////////////////////////////////////////////////////

/** @internal */
export async function signTypedData({
  typedData,
  owner,
}: {
  typedData: TypedDataDefinition
  owner: OneOf<LocalAccount | WebAuthnAccount>
}) {
  if (owner.type === 'local' && owner.signTypedData)
    return owner.signTypedData(typedData)

  const hash = hashTypedData(typedData)
  return sign({ hash, owner })
}

/** @internal */
export async function sign({
  hash,
  owner,
}: {
  hash: Hash
  owner: OneOf<LocalAccount | WebAuthnAccount>
}) {
  // WebAuthn Account (Passkey)
  if (owner.type === 'webAuthn') {
    const { signature, webauthn } = await owner.sign({
      hash,
    })
    return toWebAuthnSignature({ signature, webauthn })
  }

  if (owner.sign) return owner.sign({ hash })

  throw new BaseError('`owner` does not support raw sign.')
}

/** @internal */
export function toReplaySafeTypedData({
  address,
  chainId,
  hash,
}: {
  address: Address
  chainId: number
  hash: Hash
}) {
  return {
    domain: {
      chainId,
      name: 'Coinbase Smart Wallet',
      verifyingContract: address,
      version: '1',
    },
    types: {
      CoinbaseSmartWalletMessage: [
        {
          name: 'hash',
          type: 'bytes32',
        },
      ],
    },
    primaryType: 'CoinbaseSmartWalletMessage',
    message: {
      hash,
    },
  } as const
}

/** @internal */
export function toWebAuthnSignature({
  webauthn,
  signature,
}: {
  webauthn: WebAuthnP256.SignMetadata
  signature: Hex
}) {
  const { r, s } = Signature.fromHex(signature)
  return encodeAbiParameters(
    [
      {
        components: [
          {
            name: 'authenticatorData',
            type: 'bytes',
          },
          { name: 'clientDataJSON', type: 'bytes' },
          { name: 'challengeIndex', type: 'uint256' },
          { name: 'typeIndex', type: 'uint256' },
          {
            name: 'r',
            type: 'uint256',
          },
          {
            name: 's',
            type: 'uint256',
          },
        ],
        type: 'tuple',
      },
    ],
    [
      {
        authenticatorData: webauthn.authenticatorData,
        clientDataJSON: stringToHex(webauthn.clientDataJSON),
        challengeIndex: BigInt(webauthn.challengeIndex ?? 0n),
        typeIndex: BigInt(webauthn.typeIndex ?? 0n),
        r,
        s,
      },
    ],
  )
}

/** @internal */
export function wrapSignature(parameters: {
  ownerIndex?: number | undefined
  signature: Hex
}) {
  const { ownerIndex = 0 } = parameters
  const signatureData = (() => {
    if (size(parameters.signature) !== 65) return parameters.signature
    const signature = parseSignature(parameters.signature)
    return encodePacked(
      ['bytes32', 'bytes32', 'uint8'],
      [signature.r, signature.s, signature.yParity === 0 ? 27 : 28],
    )
  })()
  return encodeAbiParameters(
    [
      {
        components: [
          {
            name: 'ownerIndex',
            type: 'uint8',
          },
          {
            name: 'signatureData',
            type: 'bytes',
          },
        ],
        type: 'tuple',
      },
    ],
    [
      {
        ownerIndex,
        signatureData,
      },
    ],
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////
// Constants
/////////////////////////////////////////////////////////////////////////////////////////////

const abi = [
  { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
  {
    inputs: [{ name: 'owner', type: 'bytes' }],
    name: 'AlreadyOwner',
    type: 'error',
  },
  { inputs: [], name: 'Initialized', type: 'error' },
  {
    inputs: [{ name: 'owner', type: 'bytes' }],
    name: 'InvalidEthereumAddressOwner',
    type: 'error',
  },
  {
    inputs: [{ name: 'key', type: 'uint256' }],
    name: 'InvalidNonceKey',
    type: 'error',
  },
  {
    inputs: [{ name: 'owner', type: 'bytes' }],
    name: 'InvalidOwnerBytesLength',
    type: 'error',
  },
  { inputs: [], name: 'LastOwner', type: 'error' },
  {
    inputs: [{ name: 'index', type: 'uint256' }],
    name: 'NoOwnerAtIndex',
    type: 'error',
  },
  {
    inputs: [{ name: 'ownersRemaining', type: 'uint256' }],
    name: 'NotLastOwner',
    type: 'error',
  },
  {
    inputs: [{ name: 'selector', type: 'bytes4' }],
    name: 'SelectorNotAllowed',
    type: 'error',
  },
  { inputs: [], name: 'Unauthorized', type: 'error' },
  { inputs: [], name: 'UnauthorizedCallContext', type: 'error' },
  { inputs: [], name: 'UpgradeFailed', type: 'error' },
  {
    inputs: [
      { name: 'index', type: 'uint256' },
      { name: 'expectedOwner', type: 'bytes' },
      { name: 'actualOwner', type: 'bytes' },
    ],
    name: 'WrongOwnerAtIndex',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,

        name: 'index',
        type: 'uint256',
      },
      { indexed: false, name: 'owner', type: 'bytes' },
    ],
    name: 'AddOwner',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,

        name: 'index',
        type: 'uint256',
      },
      { indexed: false, name: 'owner', type: 'bytes' },
    ],
    name: 'RemoveOwner',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,

        name: 'implementation',
        type: 'address',
      },
    ],
    name: 'Upgraded',
    type: 'event',
  },
  { stateMutability: 'payable', type: 'fallback' },
  {
    inputs: [],
    name: 'REPLAYABLE_NONCE_KEY',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'addOwnerAddress',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'x', type: 'bytes32' },
      { name: 'y', type: 'bytes32' },
    ],
    name: 'addOwnerPublicKey',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'functionSelector', type: 'bytes4' }],
    name: 'canSkipChainIdValidation',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'domainSeparator',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'eip712Domain',
    outputs: [
      { name: 'fields', type: 'bytes1' },
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
      { name: 'salt', type: 'bytes32' },
      { name: 'extensions', type: 'uint256[]' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'entryPoint',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'target', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'data', type: 'bytes' },
    ],
    name: 'execute',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { name: 'target', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'data', type: 'bytes' },
        ],

        name: 'calls',
        type: 'tuple[]',
      },
    ],
    name: 'executeBatch',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ name: 'calls', type: 'bytes[]' }],
    name: 'executeWithoutChainIdValidation',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { name: 'sender', type: 'address' },
          { name: 'nonce', type: 'uint256' },
          { name: 'initCode', type: 'bytes' },
          { name: 'callData', type: 'bytes' },
          { name: 'callGasLimit', type: 'uint256' },
          {
            name: 'verificationGasLimit',
            type: 'uint256',
          },
          {
            name: 'preVerificationGas',
            type: 'uint256',
          },
          { name: 'maxFeePerGas', type: 'uint256' },
          {
            name: 'maxPriorityFeePerGas',
            type: 'uint256',
          },
          { name: 'paymasterAndData', type: 'bytes' },
          { name: 'signature', type: 'bytes' },
        ],

        name: 'userOp',
        type: 'tuple',
      },
    ],
    name: 'getUserOpHashWithoutChainId',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'implementation',
    outputs: [{ name: '$', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'owners', type: 'bytes[]' }],
    name: 'initialize',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'isOwnerAddress',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'bytes' }],
    name: 'isOwnerBytes',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'x', type: 'bytes32' },
      { name: 'y', type: 'bytes32' },
    ],
    name: 'isOwnerPublicKey',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'hash', type: 'bytes32' },
      { name: 'signature', type: 'bytes' },
    ],
    name: 'isValidSignature',
    outputs: [{ name: 'result', type: 'bytes4' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'nextOwnerIndex',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'index', type: 'uint256' }],
    name: 'ownerAtIndex',
    outputs: [{ name: '', type: 'bytes' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ownerCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'index', type: 'uint256' },
      { name: 'owner', type: 'bytes' },
    ],
    name: 'removeLastOwner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'index', type: 'uint256' },
      { name: 'owner', type: 'bytes' },
    ],
    name: 'removeOwnerAtIndex',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'removedOwnersCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'hash', type: 'bytes32' }],
    name: 'replaySafeHash',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'newImplementation', type: 'address' },
      { name: 'data', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { name: 'sender', type: 'address' },
          { name: 'nonce', type: 'uint256' },
          { name: 'initCode', type: 'bytes' },
          { name: 'callData', type: 'bytes' },
          { name: 'callGasLimit', type: 'uint256' },
          {
            name: 'verificationGasLimit',
            type: 'uint256',
          },
          {
            name: 'preVerificationGas',
            type: 'uint256',
          },
          { name: 'maxFeePerGas', type: 'uint256' },
          {
            name: 'maxPriorityFeePerGas',
            type: 'uint256',
          },
          { name: 'paymasterAndData', type: 'bytes' },
          { name: 'signature', type: 'bytes' },
        ],

        name: 'userOp',
        type: 'tuple',
      },
      { name: 'userOpHash', type: 'bytes32' },
      { name: 'missingAccountFunds', type: 'uint256' },
    ],
    name: 'validateUserOp',
    outputs: [{ name: 'validationData', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  { stateMutability: 'payable', type: 'receive' },
] as const

const factoryAbi = [
  {
    inputs: [{ name: 'implementation_', type: 'address' }],
    stateMutability: 'payable',
    type: 'constructor',
  },
  { inputs: [], name: 'OwnerRequired', type: 'error' },
  {
    inputs: [
      { name: 'owners', type: 'bytes[]' },
      { name: 'nonce', type: 'uint256' },
    ],
    name: 'createAccount',
    outputs: [
      {
        name: 'account',
        type: 'address',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owners', type: 'bytes[]' },
      { name: 'nonce', type: 'uint256' },
    ],
    name: 'getAddress',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'implementation',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'initCodeHash',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const
