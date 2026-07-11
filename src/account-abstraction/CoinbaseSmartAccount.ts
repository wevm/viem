import {
  Abi,
  AbiFunction,
  AbiParameters,
  Errors,
  Hex,
  PersonalMessage,
  Signature,
  TypedData,
} from 'ox'
import type { Address } from 'ox'
import { EntryPoint, UserOperation } from 'ox/erc4337'

import type * as viem_Account from '../core/Account.js'
import type * as Client from '../core/Client.js'
import { getId } from '../core/actions/chains/getId.js'
import { read } from '../core/actions/contract/read.js'
import type { Assign } from '../core/internal/types.js'
import * as SmartAccount from './SmartAccount.js'
import type * as WebAuthnAccount from './WebAuthnAccount.js'

const abi_ = /*#__PURE__*/ Abi.from([
  'constructor()',
  'error AlreadyOwner(bytes owner)',
  'error Initialized()',
  'error InvalidEthereumAddressOwner(bytes owner)',
  'error InvalidNonceKey(uint256 key)',
  'error InvalidOwnerBytesLength(bytes owner)',
  'error LastOwner()',
  'error NoOwnerAtIndex(uint256 index)',
  'error NotLastOwner(uint256 ownersRemaining)',
  'error SelectorNotAllowed(bytes4 selector)',
  'error Unauthorized()',
  'error UnauthorizedCallContext()',
  'error UpgradeFailed()',
  'error WrongOwnerAtIndex(uint256 index, bytes expectedOwner, bytes actualOwner)',
  'event AddOwner(uint256 indexed index, bytes owner)',
  'event RemoveOwner(uint256 indexed index, bytes owner)',
  'event Upgraded(address indexed implementation)',
  'function REPLAYABLE_NONCE_KEY() view returns (uint256)',
  'function addOwnerAddress(address owner)',
  'function addOwnerPublicKey(bytes32 x, bytes32 y)',
  'function canSkipChainIdValidation(bytes4 functionSelector) pure returns (bool)',
  'function domainSeparator() view returns (bytes32)',
  'function eip712Domain() view returns (bytes1 fields, string name, string version, uint256 chainId, address verifyingContract, bytes32 salt, uint256[] extensions)',
  'function entryPoint() view returns (address)',
  'function execute(address target, uint256 value, bytes data) payable',
  'function executeBatch((address target, uint256 value, bytes data)[] calls) payable',
  'function executeWithoutChainIdValidation(bytes[] calls) payable',
  'function getUserOpHashWithoutChainId((address sender, uint256 nonce, bytes initCode, bytes callData, uint256 callGasLimit, uint256 verificationGasLimit, uint256 preVerificationGas, uint256 maxFeePerGas, uint256 maxPriorityFeePerGas, bytes paymasterAndData, bytes signature) userOp) view returns (bytes32)',
  'function implementation() view returns (address $)',
  'function initialize(bytes[] owners) payable',
  'function isOwnerAddress(address account) view returns (bool)',
  'function isOwnerBytes(bytes account) view returns (bool)',
  'function isOwnerPublicKey(bytes32 x, bytes32 y) view returns (bool)',
  'function isValidSignature(bytes32 hash, bytes signature) view returns (bytes4 result)',
  'function nextOwnerIndex() view returns (uint256)',
  'function ownerAtIndex(uint256 index) view returns (bytes)',
  'function ownerCount() view returns (uint256)',
  'function proxiableUUID() view returns (bytes32)',
  'function removeLastOwner(uint256 index, bytes owner)',
  'function removeOwnerAtIndex(uint256 index, bytes owner)',
  'function removedOwnersCount() view returns (uint256)',
  'function replaySafeHash(bytes32 hash) view returns (bytes32)',
  'function upgradeToAndCall(address newImplementation, bytes data) payable',
  'function validateUserOp((address sender, uint256 nonce, bytes initCode, bytes callData, uint256 callGasLimit, uint256 verificationGasLimit, uint256 preVerificationGas, uint256 maxFeePerGas, uint256 maxPriorityFeePerGas, bytes paymasterAndData, bytes signature) userOp, bytes32 userOpHash, uint256 missingAccountFunds) returns (uint256 validationData)',
  'receive() external payable',
] as const)
const abi = [...abi_, { stateMutability: 'payable', type: 'fallback' }] as const

const factoryAbi = /*#__PURE__*/ Abi.from([
  'constructor(address implementation_) payable',
  'error OwnerRequired()',
  'function createAccount(bytes[] owners, uint256 nonce) payable returns (address account)',
  'function getAddress(bytes[] owners, uint256 nonce) view returns (address)',
  'function implementation() view returns (address)',
  'function initCodeHash() view returns (bytes32)',
] as const)

const execute = /*#__PURE__*/ AbiFunction.fromAbi(abi, 'execute')
const executeBatch = /*#__PURE__*/ AbiFunction.fromAbi(abi, 'executeBatch')
const createAccount = /*#__PURE__*/ AbiFunction.fromAbi(
  factoryAbi,
  'createAccount',
)

const factoryAddress = {
  '1': '0x0ba5ed0c6aa8c49038f819e587e2633c4a9f428a',
  '1.1': '0xba5ed110efdba3d005bfc882d75358acbbb85842',
} as const

const signatureParameters = [
  {
    components: [
      { name: 'ownerIndex', type: 'uint8' },
      { name: 'signatureData', type: 'bytes' },
    ],
    type: 'tuple',
  },
] as const

const webAuthnSignatureParameters = [
  {
    components: [
      { name: 'authenticatorData', type: 'bytes' },
      { name: 'clientDataJSON', type: 'bytes' },
      { name: 'challengeIndex', type: 'uint256' },
      { name: 'typeIndex', type: 'uint256' },
      { name: 'r', type: 'uint256' },
      { name: 's', type: 'uint256' },
    ],
    type: 'tuple',
  },
] as const

const stubSignature =
  '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c' as const

const webAuthnStubSignature =
  '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000000170000000000000000000000000000000000000000000000000000000000000001949fc7c88032b9fcb5f6efc7a7b8c63668eae9871b765e23123bb473ff57aa831a7c0d9276168ebcc29f2875a0239cffdf2a9cd1c2007c5c77c071db9264df1d000000000000000000000000000000000000000000000000000000000000002549960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d97630500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008a7b2274797065223a22776562617574686e2e676574222c226368616c6c656e6765223a2273496a396e6164474850596759334b7156384f7a4a666c726275504b474f716d59576f4d57516869467773222c226f726967696e223a2268747470733a2f2f7369676e2e636f696e626173652e636f6d222c2263726f73734f726967696e223a66616c73657d00000000000000000000000000000000000000000000' as const

const [{ signatureData: webAuthnStubSignatureData }] = AbiParameters.decode(
  signatureParameters,
  webAuthnStubSignature,
)

/** A Coinbase Smart Account. */
export type Account<
  address extends Address.Address = Address.Address,
  version extends from.Version = from.Version,
> = SmartAccount.SmartAccount<Implementation<address, version>>

/** Coinbase Smart Account implementation definition. */
export type Implementation<
  address extends Address.Address = Address.Address,
  version extends from.Version = from.Version,
> = Assign<
  SmartAccount.Implementation<
    typeof EntryPoint.abiV06,
    '0.6',
    {
      /** Coinbase Smart Account ABI. */
      abi: typeof abi
      /** Coinbase Smart Account factory. */
      factory: {
        /** Coinbase Smart Account factory ABI. */
        abi: typeof factoryAbi
        /** Coinbase Smart Account factory address. */
        address: (typeof factoryAddress)[version]
      }
    },
    false
  >,
  {
    decodeCalls: NonNullable<SmartAccount.Implementation['decodeCalls']>
    getAddress: () => Promise<address>
    sign: NonNullable<SmartAccount.Implementation['sign']>
  }
>

/**
 * Creates a Coinbase Smart Account for EntryPoint 0.6.
 *
 * @example
 * ```ts
 * import { Account } from 'viem'
 * import { CoinbaseSmartAccount } from 'viem/account-abstraction'
 *
 * const account = await CoinbaseSmartAccount.from({
 *   client,
 *   owners: [Account.fromPrivateKey('0x…')],
 *   version: '1.1',
 * })
 * ```
 *
 * @param options Account configuration.
 * @returns A Coinbase Smart Account.
 */
export async function from<const options extends from.Options>(
  options: options,
): Promise<from.ReturnType<options>> {
  const { client, nonce = 0n, ownerIndex = 0, owners, version = '1' } = options

  let address = options.address as Address.Address | undefined
  type Factory = {
    abi: typeof factoryAbi
    address: (typeof factoryAddress)[options['version']]
  }
  const factory: Factory = {
    abi: factoryAbi,
    address: factoryAddress[version] as Factory['address'],
  }
  const ownersBytes = owners.map((owner) => {
    if (typeof owner === 'string') return Hex.padLeft(owner)
    if (owner.type === 'webAuthn') return owner.publicKey
    if (owner.type === 'local') return Hex.padLeft(owner.address)
    throw new Errors.BaseError('invalid owner type')
  })
  const owner = (() => {
    const owner = owners[ownerIndex] ?? owners[0]
    if (!owner) throw new Errors.BaseError('At least one owner is required.')
    if (typeof owner === 'string')
      return { address: owner, type: 'address' } as const
    return owner
  })()

  async function getAddress(): Promise<ResolvedAddress<options>> {
    address ??= await read(client, {
      ...factory,
      args: [ownersBytes, nonce],
      functionName: 'getAddress',
    })
    return address as ResolvedAddress<options>
  }

  async function getChainId() {
    return client.chain?.id ?? (await getId(client))
  }

  return SmartAccount.from({
    client,
    entryPoint: {
      abi: EntryPoint.abiV06,
      address: EntryPoint.addressV06,
      version: '0.6',
    },
    extend: { abi, factory },

    decodeCalls(data) {
      const { name } = AbiFunction.fromAbi(abi, data)
      if (name === 'execute') {
        const [to, value, data_] = AbiFunction.decodeData(execute, data)
        return [{ data: data_, to, value }]
      }
      if (name === 'executeBatch') {
        const [calls] = AbiFunction.decodeData(executeBatch, data)
        return calls.map((call) => ({
          data: call.data,
          to: call.target,
          value: call.value,
        }))
      }
      throw new Errors.BaseError(`unable to decode calls for "${name}"`)
    },

    encodeCalls(calls) {
      const call = calls[0]
      if (calls.length === 1 && call)
        return AbiFunction.encodeData(execute, [
          call.to,
          call.value ?? 0n,
          call.data ?? '0x',
        ])
      return AbiFunction.encodeData(executeBatch, [
        calls.map((call) => ({
          data: call.data ?? '0x',
          target: call.to,
          value: call.value ?? 0n,
        })),
      ])
    },

    getAddress,

    getFactoryArgs() {
      return {
        factory: factory.address,
        factoryData: AbiFunction.encodeData(createAccount, [
          ownersBytes,
          nonce,
        ]),
      }
    },

    getStubSignature() {
      if (owner.type === 'webAuthn')
        return wrapSignature({
          ownerIndex,
          signature: webAuthnStubSignatureData,
        })
      return wrapSignature({ ownerIndex, signature: stubSignature })
    },

    async sign({ hash }) {
      const typedData = toReplaySafeTypedData({
        address: await getAddress(),
        chainId: await getChainId(),
        hash,
      })
      if (owner.type === 'address') throw new Error('owner cannot sign')
      return wrapSignature({
        ownerIndex,
        signature: await signTypedData({ owner, typedData }),
      })
    },

    async signMessage({ message }) {
      const payload =
        typeof message === 'string' ? Hex.fromString(message) : message.raw
      const typedData = toReplaySafeTypedData({
        address: await getAddress(),
        chainId: await getChainId(),
        hash: PersonalMessage.getSignPayload(payload),
      })
      if (owner.type === 'address') throw new Error('owner cannot sign')
      return wrapSignature({
        ownerIndex,
        signature: await signTypedData({ owner, typedData }),
      })
    },

    async signTypedData(typedData) {
      const replaySafeTypedData = toReplaySafeTypedData({
        address: await getAddress(),
        chainId: await getChainId(),
        hash: TypedData.getSignPayload(
          typedData as TypedData.encode.Value<TypedData.TypedData, string>,
        ),
      })
      if (owner.type === 'address') throw new Error('owner cannot sign')
      return wrapSignature({
        ownerIndex,
        signature: await signTypedData({
          owner,
          typedData: replaySafeTypedData,
        }),
      })
    },

    async signUserOperation(options) {
      const chainId = options.chainId ?? (await getChainId())
      const { chainId: _, ...userOperation } = options
      const hash = UserOperation.getSignPayload(
        { ...userOperation, sender: await getAddress() },
        {
          chainId,
          entryPointAddress: EntryPoint.addressV06,
          entryPointVersion: '0.6',
        },
      )
      if (owner.type === 'address') throw new Error('owner cannot sign')
      return wrapSignature({
        ownerIndex,
        signature: await sign({ hash, owner }),
      })
    },

    userOperation: {
      estimateGas(userOperation) {
        if (owner.type !== 'webAuthn') return undefined
        const verificationGasLimit = userOperation.verificationGasLimit ?? 0n
        return {
          verificationGasLimit:
            verificationGasLimit > 800_000n ? verificationGasLimit : 800_000n,
        }
      },
    },
  })
}

export declare namespace from {
  /** Owner accepted by {@link from}. */
  type Owner = Address.Address | viem_Account.Local | WebAuthnAccount.Account

  /** Coinbase Smart Account contract version. */
  type Version = keyof typeof factoryAddress

  /** Options for {@link from}. */
  type Options = {
    /** Existing account address. */
    address?: Address.Address | undefined
    /** Client used to read account and EntryPoint state. */
    client: Client.Client
    /** Account creation nonce. */
    nonce?: bigint | undefined
    /** Owner used to sign. Falls back to the first owner when out of bounds. */
    ownerIndex?: number | undefined
    /** Account owners. */
    owners: readonly Owner[]
    /** Coinbase Smart Account contract version. */
    version: Version
  }

  /** Coinbase Smart Account returned by {@link from}. */
  type ReturnType<options extends Options = Options> = Account<
    ResolvedAddress<options>,
    options['version']
  >

  /** Errors thrown by {@link from}. */
  type ErrorType =
    | SmartAccount.from.ErrorType
    | getId.ErrorType
    | read.ErrorType
    | Errors.GlobalErrorType
}

type ResolvedAddress<options extends from.Options> = options extends {
  address: infer address extends Address.Address
}
  ? address
  : Address.Address

async function signTypedData(options: {
  owner: viem_Account.Local | WebAuthnAccount.Account
  typedData: TypedData.Definition
}) {
  const { owner, typedData } = options
  if (owner.type === 'local' && owner.signTypedData)
    return owner.signTypedData(typedData)
  return sign({ hash: TypedData.getSignPayload(typedData), owner })
}

async function sign(options: {
  hash: Hex.Hex
  owner: viem_Account.Local | WebAuthnAccount.Account
}) {
  const { hash, owner } = options
  if (owner.type === 'webAuthn') {
    const { signature, webauthn } = await owner.sign({ hash })
    const { r, s } = Signature.fromHex(signature)
    return AbiParameters.encode(webAuthnSignatureParameters, [
      {
        authenticatorData: webauthn.authenticatorData,
        challengeIndex: BigInt(webauthn.challengeIndex ?? 0),
        clientDataJSON: Hex.fromString(webauthn.clientDataJSON),
        r: Hex.toBigInt(r),
        s: Hex.toBigInt(s),
        typeIndex: BigInt(webauthn.typeIndex ?? 0),
      },
    ])
  }
  if (owner.sign) return owner.sign({ hash })
  throw new Errors.BaseError('`owner` does not support raw sign.')
}

function toReplaySafeTypedData(options: {
  address: Address.Address
  chainId: number
  hash: Hex.Hex
}) {
  const { address, chainId, hash } = options
  return {
    domain: {
      chainId,
      name: 'Coinbase Smart Wallet',
      verifyingContract: address,
      version: '1',
    },
    message: { hash },
    primaryType: 'CoinbaseSmartWalletMessage',
    types: {
      CoinbaseSmartWalletMessage: [{ name: 'hash', type: 'bytes32' }],
    },
  } as const
}

function wrapSignature(options: {
  ownerIndex?: number | undefined
  signature: Hex.Hex
}) {
  const { ownerIndex = 0 } = options
  const signatureData = (() => {
    if (Hex.size(options.signature) !== 65) return options.signature
    const signature = Signature.fromHex(options.signature)
    return AbiParameters.encodePacked(
      ['bytes32', 'bytes32', 'uint8'],
      [signature.r, signature.s, signature.yParity === 0 ? 27 : 28],
    )
  })()
  return AbiParameters.encode(signatureParameters, [
    { ownerIndex, signatureData },
  ])
}
