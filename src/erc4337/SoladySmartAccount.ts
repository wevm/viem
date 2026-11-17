import type { Abi as AbiType } from 'abitype'
import { Abi, AbiFunction, Errors, Hex } from 'ox'
import type { Address } from 'ox'
import { EntryPoint, UserOperation } from 'ox/erc4337'

import * as viem_Account from '../core/Account.js'
import type * as Client from '../core/Client.js'
import { getId } from '../core/actions/chains/getId.js'
import { read } from '../core/actions/contract/read.js'
import { signMessage as signMessage_ } from '../core/actions/signMessage.js'
import type { Assign } from '../core/internal/types.js'
import * as SmartAccount from './SmartAccount.js'
import * as erc7739 from './internal/erc7739.js'

const commonAbi = [
  { stateMutability: 'payable', type: 'fallback' },
  { stateMutability: 'payable', type: 'receive' },
  .../*#__PURE__*/ Abi.from([
    'function addDeposit() payable',
    'function cancelOwnershipHandover() payable',
    'function completeOwnershipHandover(address pendingOwner) payable',
    'function delegateExecute(address delegate, bytes data) payable returns (bytes result)',
    'function eip712Domain() view returns (bytes1 fields, string name, string version, uint256 chainId, address verifyingContract, bytes32 salt, uint256[] extensions)',
    'function entryPoint() view returns (address)',
    'function execute(address target, uint256 value, bytes data) payable returns (bytes result)',
    'function executeBatch((address target, uint256 value, bytes data)[] calls) payable returns (bytes[] results)',
    'function getDeposit() view returns (uint256 result)',
    'function initialize(address newOwner) payable',
    'function isValidSignature(bytes32 hash, bytes signature) view returns (bytes4 result)',
    'function owner() view returns (address result)',
    'function ownershipHandoverExpiresAt(address pendingOwner) view returns (uint256 result)',
    'function proxiableUUID() view returns (bytes32)',
    'function renounceOwnership() payable',
    'function requestOwnershipHandover() payable',
    'function storageLoad(bytes32 storageSlot) view returns (bytes32 result)',
    'function storageStore(bytes32 storageSlot, bytes32 storageValue) payable',
    'function transferOwnership(address newOwner) payable',
    'function upgradeToAndCall(address newImplementation, bytes data) payable',
    'function withdrawDepositTo(address to, uint256 amount) payable',
    'event OwnershipHandoverCanceled(address indexed pendingOwner)',
    'event OwnershipHandoverRequested(address indexed pendingOwner)',
    'event OwnershipTransferred(address indexed oldOwner, address indexed newOwner)',
    'event Upgraded(address indexed implementation)',
    'error AlreadyInitialized()',
    'error NewOwnerIsZeroAddress()',
    'error NoHandoverRequest()',
    'error Unauthorized()',
    'error UnauthorizedCallContext()',
    'error UpgradeFailed()',
  ]),
] as const

const abiV06 = [
  ...commonAbi,
  .../*#__PURE__*/ Abi.from([
    'function validateUserOp((address sender, uint256 nonce, bytes initCode, bytes callData, uint256 callGasLimit, uint256 verificationGasLimit, uint256 preVerificationGas, uint256 maxFeePerGas, uint256 maxPriorityFeePerGas, bytes paymasterAndData, bytes signature) userOp, bytes32 userOpHash, uint256 missingAccountFunds) payable returns (uint256 validationData)',
  ]),
] as const

const abiV07 = [
  ...commonAbi,
  .../*#__PURE__*/ Abi.from([
    'function validateUserOp((address sender, uint256 nonce, bytes initCode, bytes callData, bytes32 accountGasLimits, uint256 preVerificationGas, bytes32 gasFees, bytes paymasterAndData, bytes signature) userOp, bytes32 userOpHash, uint256 missingAccountFunds) payable returns (uint256 validationData)',
    'error FnSelectorNotRecognized()',
  ]),
] as const

const factoryAbi = /*#__PURE__*/ Abi.from([
  'constructor(address erc4337)',
  'function createAccount(address owner, bytes32 salt) payable returns (address)',
  'function getAddress(bytes32 salt) view returns (address)',
  'function implementation() view returns (address)',
  'function initCodeHash() view returns (bytes32)',
] as const)

const execute = /*#__PURE__*/ AbiFunction.fromAbi(commonAbi, 'execute')
const executeBatch = /*#__PURE__*/ AbiFunction.fromAbi(
  commonAbi,
  'executeBatch',
)
const createAccount = /*#__PURE__*/ AbiFunction.fromAbi(
  factoryAbi,
  'createAccount',
)

const defaultFactoryAddress =
  '0x5d82735936c6Cd5DE57cC3c1A799f6B2E6F933Df' as const

const stubSignature =
  '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c' as const

/** A Solady Smart Account. */
export type Account<
  address extends Address.Address = Address.Address,
  entryPointAbi extends AbiType = AbiType,
  entryPointVersion extends from.EntryPointVersion = from.EntryPointVersion,
  factoryAddress extends Address.Address = Address.Address,
> = SmartAccount.SmartAccount<
  Implementation<address, entryPointAbi, entryPointVersion, factoryAddress>
>

/** Solady Smart Account implementation definition. */
export type Implementation<
  address extends Address.Address = Address.Address,
  entryPointAbi extends AbiType = AbiType,
  entryPointVersion extends from.EntryPointVersion = from.EntryPointVersion,
  factoryAddress extends Address.Address = Address.Address,
> = Assign<
  SmartAccount.Implementation<
    entryPointAbi,
    entryPointVersion,
    {
      /** Solady Smart Account ABI. */
      abi: AccountAbi<entryPointVersion>
      /** Solady Smart Account factory. */
      factory: {
        /** Solady Smart Account factory ABI. */
        abi: typeof factoryAbi
        /** Solady Smart Account factory address. */
        address: factoryAddress
      }
    }
  >,
  {
    decodeCalls: NonNullable<SmartAccount.Implementation['decodeCalls']>
    getAddress: () => Promise<address>
  }
>

/**
 * Creates a Solady Smart Account for EntryPoint 0.6 or 0.7.
 * Message and typed-data signing requires an ERC-7739-compatible implementation.
 *
 * @example
 * ```ts
 * import { Account } from 'viem'
 * import { SoladySmartAccount } from 'viem/erc4337'
 *
 * const account = await SoladySmartAccount.from({
 *   client,
 *   owner: Account.fromPrivateKey('0x…'),
 * })
 * ```
 *
 * @param options Account configuration.
 * @returns A Solady Smart Account.
 */
export async function from<const options extends from.Options>(
  options: options,
): Promise<from.ReturnType<options>> {
  const { client, getNonce } = options
  const factoryAddress = resolveFactoryAddress(options)
  const owner =
    typeof options.owner === 'string'
      ? viem_Account.from(options.owner)
      : options.owner
  const salt = Hex.padLeft(options.salt ?? '0x0')

  type ResolvedEntryPoint = {
    abi: ResolvedEntryPointAbi<options>
    address: Address.Address
    version: ResolvedEntryPointVersion<options>
  }
  const entryPoint = (options.entryPoint ?? {
    abi: EntryPoint.abiV07,
    address: EntryPoint.addressV07,
    version: '0.7',
  }) as ResolvedEntryPoint

  type Factory = {
    abi: typeof factoryAbi
    address: ResolvedFactoryAddress<options>
  }
  const factory: Factory = {
    abi: factoryAbi,
    address: factoryAddress as ResolvedFactoryAddress<options>,
  }

  let address = options.address as Address.Address | undefined
  const accountAbi = (
    entryPoint.version === '0.6' ? abiV06 : abiV07
  ) as AccountAbi<ResolvedEntryPointVersion<options>>

  async function getAddress(): Promise<ResolvedAddress<options>> {
    address ??= await read(client, {
      ...factory,
      args: [salt],
      functionName: 'getAddress',
    })
    return address as ResolvedAddress<options>
  }

  function getFactoryArgs() {
    return {
      factory: factory.address,
      factoryData: AbiFunction.encodeData(createAccount, [owner.address, salt]),
    }
  }

  const account = await SmartAccount.from({
    client,
    entryPoint,
    extend: { abi: accountAbi, factory },
    getNonce,

    decodeCalls(data) {
      const { name } = AbiFunction.fromAbi(commonAbi, data)
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
      throw new Errors.BaseError(`Unable to decode calls for "${name}".`)
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

    getFactoryArgs,

    getStubSignature() {
      return stubSignature
    },

    async signMessage({ message }) {
      return erc7739.signMessage(client, {
        ...getFactoryArgs(),
        account: owner,
        message,
        verifier: await getAddress(),
      })
    },

    async signTypedData(value) {
      return erc7739.signTypedData(client, {
        ...getFactoryArgs(),
        account: owner,
        value,
        verifier: await getAddress(),
      })
    },

    async signUserOperation(options) {
      const chainId =
        options.chainId ?? client.chain?.id ?? (await getId(client))
      const { chainId: _, ...userOperation } = options
      type Operation = UserOperation.UserOperation<
        ResolvedEntryPointVersion<options>
      >
      // Adding the sender completes the version-specific operation.
      const operation = {
        ...userOperation,
        sender: await getAddress(),
      } as Operation
      const payload = UserOperation.getSignPayload(operation, {
        chainId,
        entryPointAddress: entryPoint.address,
        entryPointVersion: entryPoint.version,
      })
      return signMessage_(client, {
        account: owner,
        message: { raw: payload },
      })
    },
  })
  // TypeScript widens the callback before resolving the input version.
  return account as from.ReturnType<options>
}

function resolveFactoryAddress(options: {
  entryPoint?: { version: from.EntryPointVersion } | undefined
  factoryAddress?: Address.Address | undefined
}) {
  if (options.factoryAddress) return options.factoryAddress
  if (options.entryPoint)
    throw new Errors.BaseError(
      '`factoryAddress` is required when `entryPoint` is provided.',
    )
  return defaultFactoryAddress
}

export declare namespace from {
  /** EntryPoint versions supported by Solady Smart Accounts. */
  type EntryPointVersion = '0.6' | '0.7'

  /** Options for {@link from}. */
  type Options = {
    /** Existing account address. */
    address?: Address.Address | undefined
    /** Client used to read account and EntryPoint state. */
    client: Client.Client
    /** Overrides the account nonce resolver. */
    getNonce?: Implementation['getNonce'] | undefined
    /** Account that owns the Smart Account. */
    owner: Address.Address | viem_Account.Account
    /** Account deployment salt. */
    salt?: Hex.Hex | undefined
  } & (
    | {
        /** Uses the default EntryPoint when omitted. */
        entryPoint?: undefined
        /** Solady factory. Defaults to the EntryPoint 0.7 deployment. */
        factoryAddress?: Address.Address | undefined
      }
    | {
        /** EntryPoint supported by the account deployment. */
        entryPoint: {
          /** EntryPoint ABI. */
          abi: AbiType
          /** EntryPoint address. */
          address: Address.Address
          /** EntryPoint version. */
          version: EntryPointVersion
        }
        /** Factory deploying an implementation compatible with the EntryPoint. */
        factoryAddress: Address.Address
      }
  )

  /** Solady Smart Account returned by {@link from}. */
  type ReturnType<options extends Options = Options> = Account<
    ResolvedAddress<options>,
    ResolvedEntryPointAbi<options>,
    ResolvedEntryPointVersion<options>,
    ResolvedFactoryAddress<options>
  >

  /** Errors thrown by {@link from}. */
  type ErrorType =
    | SmartAccount.from.ErrorType
    | viem_Account.from.ErrorType
    | Hex.padLeft.ErrorType
    | read.ErrorType
    | Errors.GlobalErrorType
}

type AccountAbi<version extends from.EntryPointVersion> = version extends '0.6'
  ? typeof abiV06
  : typeof abiV07

type ResolvedAddress<options extends from.Options> = options extends {
  address: infer address extends Address.Address
}
  ? address
  : Address.Address

type ResolvedEntryPointAbi<options extends from.Options> =
  'entryPoint' extends keyof options
    ? options extends {
        entryPoint: { abi: infer abi extends AbiType }
      }
      ? abi
      : AbiType
    : typeof EntryPoint.abiV07

type ResolvedEntryPointVersion<options extends from.Options> =
  'entryPoint' extends keyof options
    ? options extends {
        entryPoint: {
          version: infer version extends from.EntryPointVersion
        }
      }
      ? version
      : from.EntryPointVersion
    : '0.7'

type ResolvedFactoryAddress<options extends from.Options> =
  'factoryAddress' extends keyof options
    ? options extends {
        factoryAddress: infer address extends Address.Address
      }
      ? address
      : Address.Address
    : typeof defaultFactoryAddress
