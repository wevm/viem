import { type Address, type TypedData, parseAbi } from 'abitype'
import {
  type WebAuthnData,
  parseSignature as parseP256Signature,
} from 'webauthn-p256'

import type { LocalAccount } from '../../../accounts/types.js'
import { readContract } from '../../../actions/public/readContract.js'
import { entryPoint06Address } from '../../../constants/address.js'
import type { Hash, Hex } from '../../../types/misc.js'
import type { TypedDataDefinition } from '../../../types/typedData.js'
import type { OneOf } from '../../../types/utils.js'
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
import type { UserOperation } from '../../types/userOperation.js'
import { getUserOperationHash } from '../../utils/userOperation/getUserOperationHash.js'
import type { WebAuthnAccount } from '../types.js'
import {
  type SmartAccountImplementation,
  type SmartAccountImplementationFn,
  defineImplementation,
} from './defineImplementation.js'

export type CoinbaseImplementation = SmartAccountImplementation<
  typeof abi,
  typeof factoryAbi,
  typeof entryPoint06Abi,
  '0.6'
>

export type CoinbaseImplementationParameters = {
  owners: readonly OneOf<LocalAccount | WebAuthnAccount>[]
  nonce?: bigint | undefined
}

export type CoinbaseImplementationReturnType =
  SmartAccountImplementationFn<CoinbaseImplementation>

/**
 * @description Smart account implementation for Coinbase Smart Wallet.
 *
 * @param parameters - {@link CoinbaseImplementationParameters}
 * @returns Coinbase implementation. {@link CoinbaseImplementationReturnType}
 *
 * @example
 * import { coinbase, privateKeyToAccount } from 'viem/accounts'
 *
 * const implementation = coinbase({
 *   owners: [privateKeyToAccount('0x...')],
 * })
 */
export function coinbase(
  parameters: CoinbaseImplementationParameters,
): CoinbaseImplementationReturnType {
  return defineImplementation(({ address, client }) => {
    const { owners, nonce = 0n } = parameters

    const owners_bytes = owners.map((owner) =>
      owner.type === 'webAuthn' ? owner.publicKey : pad(owner.address),
    )

    const owner = owners[0]

    return {
      abi,
      entryPoint: {
        abi: entryPoint06Abi,
        address: entryPoint06Address,
        version: '0.6',
      },
      factory: {
        abi: factoryAbi,
        address: '0x0ba5ed0c6aa8c49038f819e587e2633c4a9f428a',
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
          ...this.factory,
          functionName: 'getAddress',
          args: [owners_bytes, nonce],
        })
      },

      async getFactoryArgs() {
        const factoryData = encodeFunctionData({
          abi: this.factory.abi,
          functionName: 'createAccount',
          args: [owners_bytes, nonce],
        })
        return { factory: this.factory.address, factoryData }
      },

      async getNonce() {
        const address = await this.getAddress()
        const nonce = await readContract(client, {
          abi: parseAbi([
            'function getNonce(address, uint192) pure returns (uint256)',
          ]),
          address: this.entryPoint.address,
          functionName: 'getNonce',
          args: [address, 0n],
        })
        return nonce
      },

      async getStubSignature() {
        if (owner.type === 'webAuthn')
          return '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000000170000000000000000000000000000000000000000000000000000000000000001949fc7c88032b9fcb5f6efc7a7b8c63668eae9871b765e23123bb473ff57aa831a7c0d9276168ebcc29f2875a0239cffdf2a9cd1c2007c5c77c071db9264df1d000000000000000000000000000000000000000000000000000000000000002549960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d97630500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008a7b2274797065223a22776562617574686e2e676574222c226368616c6c656e6765223a2273496a396e6164474850596759334b7156384f7a4a666c726275504b474f716d59576f4d57516869467773222c226f726967696e223a2268747470733a2f2f7369676e2e636f696e626173652e636f6d222c2263726f73734f726967696e223a66616c73657d00000000000000000000000000000000000000000000'
        return wrapSignature({
          signature:
            '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c',
        })
      },

      async prepareUserOperation(parameters) {
        if (owner.type === 'webAuthn')
          return {
            ...parameters,
            verificationGasLimit: BigInt(
              Math.max(Number(parameters.verificationGasLimit ?? 0n), 800_000),
            ),
          }
        return parameters
      },

      async signMessage(parameters) {
        const { message } = parameters
        const address = await this.getAddress()

        const hash = toReplaySafeHash({
          address,
          chainId: client.chain!.id,
          hash: hashMessage(message),
        })

        const signature = await sign({ hash, owner })

        return wrapSignature({
          signature,
        })
      },

      async signTypedData(parameters) {
        const { domain, types, primaryType, message } =
          parameters as TypedDataDefinition<TypedData, string>
        const address = await this.getAddress()

        const hash = toReplaySafeHash({
          address,
          chainId: client.chain!.id,
          hash: hashTypedData({
            domain,
            message,
            primaryType,
            types,
          }),
        })

        const signature = await sign({ hash, owner })

        return wrapSignature({
          signature,
        })
      },

      async signUserOperation(parameters) {
        const { chainId = client.chain!.id, ...userOperation } = parameters

        const address = await this.getAddress()
        const hash = getUserOperationHash({
          chainId,
          entryPointAddress: this.entryPoint.address,
          entryPointVersion: this.entryPoint.version,
          userOperation: {
            ...(userOperation as unknown as UserOperation),
            sender: address,
          },
        })

        const signature = await sign({ hash, owner })

        return wrapSignature({
          signature,
        })
      },
    }
  })
}

/////////////////////////////////////////////////////////////////////////////////////////////
// Utilities
/////////////////////////////////////////////////////////////////////////////////////////////

/** @internal */
export async function sign({
  hash,
  owner,
}: { hash: Hash; owner: OneOf<LocalAccount | WebAuthnAccount> }) {
  // WebAuthn Account (Passkey)
  if (owner.type === 'webAuthn') {
    const { signature, webauthn } = await owner.sign({
      hash,
    })
    return toWebAuthnSignature({ signature, webauthn })
  }

  // Local Account
  return owner.sign({ hash })
}

/** @internal */
export function toReplaySafeHash({
  address,
  chainId,
  hash,
}: { address: Address; chainId: number; hash: Hash }) {
  return hashTypedData({
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
  })
}

/** @internal */
export function toWebAuthnSignature({
  webauthn,
  signature,
}: {
  webauthn: WebAuthnData
  signature: Hex
}) {
  const { r, s } = parseP256Signature(signature)
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
        challengeIndex: BigInt(webauthn.challengeIndex),
        typeIndex: BigInt(webauthn.typeIndex),
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
    inputs: [{ internalType: 'bytes', name: 'owner', type: 'bytes' }],
    name: 'AlreadyOwner',
    type: 'error',
  },
  { inputs: [], name: 'Initialized', type: 'error' },
  {
    inputs: [{ internalType: 'bytes', name: 'owner', type: 'bytes' }],
    name: 'InvalidEthereumAddressOwner',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'key', type: 'uint256' }],
    name: 'InvalidNonceKey',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'bytes', name: 'owner', type: 'bytes' }],
    name: 'InvalidOwnerBytesLength',
    type: 'error',
  },
  { inputs: [], name: 'LastOwner', type: 'error' },
  {
    inputs: [{ internalType: 'uint256', name: 'index', type: 'uint256' }],
    name: 'NoOwnerAtIndex',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'ownersRemaining', type: 'uint256' },
    ],
    name: 'NotLastOwner',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'bytes4', name: 'selector', type: 'bytes4' }],
    name: 'SelectorNotAllowed',
    type: 'error',
  },
  { inputs: [], name: 'Unauthorized', type: 'error' },
  { inputs: [], name: 'UnauthorizedCallContext', type: 'error' },
  { inputs: [], name: 'UpgradeFailed', type: 'error' },
  {
    inputs: [
      { internalType: 'uint256', name: 'index', type: 'uint256' },
      { internalType: 'bytes', name: 'expectedOwner', type: 'bytes' },
      { internalType: 'bytes', name: 'actualOwner', type: 'bytes' },
    ],
    name: 'WrongOwnerAtIndex',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
      { indexed: false, internalType: 'bytes', name: 'owner', type: 'bytes' },
    ],
    name: 'AddOwner',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
      { indexed: false, internalType: 'bytes', name: 'owner', type: 'bytes' },
    ],
    name: 'RemoveOwner',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
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
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
    name: 'addOwnerAddress',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'x', type: 'bytes32' },
      { internalType: 'bytes32', name: 'y', type: 'bytes32' },
    ],
    name: 'addOwnerPublicKey',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes4', name: 'functionSelector', type: 'bytes4' },
    ],
    name: 'canSkipChainIdValidation',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'domainSeparator',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'eip712Domain',
    outputs: [
      { internalType: 'bytes1', name: 'fields', type: 'bytes1' },
      { internalType: 'string', name: 'name', type: 'string' },
      { internalType: 'string', name: 'version', type: 'string' },
      { internalType: 'uint256', name: 'chainId', type: 'uint256' },
      { internalType: 'address', name: 'verifyingContract', type: 'address' },
      { internalType: 'bytes32', name: 'salt', type: 'bytes32' },
      { internalType: 'uint256[]', name: 'extensions', type: 'uint256[]' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'entryPoint',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
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
    stateMutability: 'payable',
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
        internalType: 'struct CoinbaseSmartWallet.Call[]',
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
    inputs: [{ internalType: 'bytes[]', name: 'calls', type: 'bytes[]' }],
    name: 'executeWithoutChainIdValidation',
    outputs: [],
    stateMutability: 'payable',
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
          { internalType: 'uint256', name: 'callGasLimit', type: 'uint256' },
          {
            internalType: 'uint256',
            name: 'verificationGasLimit',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'preVerificationGas',
            type: 'uint256',
          },
          { internalType: 'uint256', name: 'maxFeePerGas', type: 'uint256' },
          {
            internalType: 'uint256',
            name: 'maxPriorityFeePerGas',
            type: 'uint256',
          },
          { internalType: 'bytes', name: 'paymasterAndData', type: 'bytes' },
          { internalType: 'bytes', name: 'signature', type: 'bytes' },
        ],
        internalType: 'struct UserOperation',
        name: 'userOp',
        type: 'tuple',
      },
    ],
    name: 'getUserOpHashWithoutChainId',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'implementation',
    outputs: [{ internalType: 'address', name: '$', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes[]', name: 'owners', type: 'bytes[]' }],
    name: 'initialize',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'isOwnerAddress',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes', name: 'account', type: 'bytes' }],
    name: 'isOwnerBytes',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'x', type: 'bytes32' },
      { internalType: 'bytes32', name: 'y', type: 'bytes32' },
    ],
    name: 'isOwnerPublicKey',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'hash', type: 'bytes32' },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
    ],
    name: 'isValidSignature',
    outputs: [{ internalType: 'bytes4', name: 'result', type: 'bytes4' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'nextOwnerIndex',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'index', type: 'uint256' }],
    name: 'ownerAtIndex',
    outputs: [{ internalType: 'bytes', name: '', type: 'bytes' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ownerCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'index', type: 'uint256' },
      { internalType: 'bytes', name: 'owner', type: 'bytes' },
    ],
    name: 'removeLastOwner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'index', type: 'uint256' },
      { internalType: 'bytes', name: 'owner', type: 'bytes' },
    ],
    name: 'removeOwnerAtIndex',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'removedOwnersCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'hash', type: 'bytes32' }],
    name: 'replaySafeHash',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'newImplementation', type: 'address' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
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
          { internalType: 'address', name: 'sender', type: 'address' },
          { internalType: 'uint256', name: 'nonce', type: 'uint256' },
          { internalType: 'bytes', name: 'initCode', type: 'bytes' },
          { internalType: 'bytes', name: 'callData', type: 'bytes' },
          { internalType: 'uint256', name: 'callGasLimit', type: 'uint256' },
          {
            internalType: 'uint256',
            name: 'verificationGasLimit',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'preVerificationGas',
            type: 'uint256',
          },
          { internalType: 'uint256', name: 'maxFeePerGas', type: 'uint256' },
          {
            internalType: 'uint256',
            name: 'maxPriorityFeePerGas',
            type: 'uint256',
          },
          { internalType: 'bytes', name: 'paymasterAndData', type: 'bytes' },
          { internalType: 'bytes', name: 'signature', type: 'bytes' },
        ],
        internalType: 'struct UserOperation',
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

const factoryAbi = [
  {
    inputs: [
      { internalType: 'address', name: 'implementation_', type: 'address' },
    ],
    stateMutability: 'payable',
    type: 'constructor',
  },
  { inputs: [], name: 'OwnerRequired', type: 'error' },
  {
    inputs: [
      { internalType: 'bytes[]', name: 'owners', type: 'bytes[]' },
      { internalType: 'uint256', name: 'nonce', type: 'uint256' },
    ],
    name: 'createAccount',
    outputs: [
      {
        internalType: 'contract CoinbaseSmartWallet',
        name: 'account',
        type: 'address',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes[]', name: 'owners', type: 'bytes[]' },
      { internalType: 'uint256', name: 'nonce', type: 'uint256' },
    ],
    name: 'getAddress',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'implementation',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'initCodeHash',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const
