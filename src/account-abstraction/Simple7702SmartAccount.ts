import type { Abi as AbiType } from 'abitype'
import { Abi, AbiFunction, Errors } from 'ox'
import type { Address } from 'ox'

import type * as viem_Account from '../core/Account.js'
import type * as Client from '../core/Client.js'
import { getId } from '../core/actions/chains/getId.js'
import * as EntryPoint from './EntryPoint.js'
import * as SmartAccount from './SmartAccount.js'
import * as UserOperation from './UserOperation.js'

const abi = [
  .../*#__PURE__*/ Abi.from([
    'error ECDSAInvalidSignature()',
    'error ECDSAInvalidSignatureLength(uint256 length)',
    'error ECDSAInvalidSignatureS(bytes32 s)',
  ]),
  {
    inputs: [
      { name: 'index', type: 'uint256' },
      { name: 'error', type: 'bytes' },
    ],
    name: 'ExecuteError',
    type: 'error',
  },
  { stateMutability: 'payable', type: 'fallback' },
  .../*#__PURE__*/ Abi.from([
    'function entryPoint() pure returns (address)',
    'function execute(address target, uint256 value, bytes data)',
    'function executeBatch((address target, uint256 value, bytes data)[] calls)',
    'function getNonce() view returns (uint256)',
    'function isValidSignature(bytes32 hash, bytes signature) view returns (bytes4 magicValue)',
    'function onERC1155BatchReceived(address, address, uint256[], uint256[], bytes) returns (bytes4)',
    'function onERC1155Received(address, address, uint256, uint256, bytes) returns (bytes4)',
    'function onERC721Received(address, address, uint256, bytes) returns (bytes4)',
    'function supportsInterface(bytes4 id) pure returns (bool)',
    'function validateUserOp((address sender, uint256 nonce, bytes initCode, bytes callData, bytes32 accountGasLimits, uint256 preVerificationGas, bytes32 gasFees, bytes paymasterAndData, bytes signature) userOp, bytes32 userOpHash, uint256 missingAccountFunds) returns (uint256 validationData)',
    'receive() external payable',
  ]),
] as const

const execute = /*#__PURE__*/ AbiFunction.fromAbi(abi, 'execute')
const executeBatch = /*#__PURE__*/ AbiFunction.fromAbi(abi, 'executeBatch')

const implementationAddressV08 =
  '0xe6Cae83BdE06E4c305530e199D7217f42808555B' as const
const implementationAddressV09 =
  '0xa46cc63eBF4Bd77888AA327837d20b23A63a56B5' as const

const stubSignature =
  '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c' as const

/** A Simple7702 Smart Account backed by an ECDSA owner. */
export type Account<entryPoint extends EntryPointParameter = '0.8'> =
  SmartAccount.SmartAccount<Implementation<entryPoint>>

/** Simple7702 account implementation definition. */
export type Implementation<entryPoint extends EntryPointParameter = '0.8'> =
  SmartAccount.Implementation<
    entryPoint extends { abi: infer abi }
      ? abi
      : entryPoint extends '0.9'
        ? typeof EntryPoint.abiV09
        : typeof EntryPoint.abiV08,
    entryPoint extends string
      ? entryPoint
      : entryPoint extends { version: infer version extends EntryPoint.Version }
        ? version
        : EntryPoint.Version,
    {
      /** Simple7702 account ABI. */
      abi: typeof abi
      /** Account that owns and authorizes the delegation. */
      owner: viem_Account.PrivateKey
    },
    true
  >

/**
 * Creates a Simple7702 Smart Account for EntryPoint 0.8 or 0.9.
 *
 * @example
 * ```ts
 * import { Account } from 'viem'
 * import { Simple7702SmartAccount } from 'viem/account-abstraction'
 *
 * const account = await Simple7702SmartAccount.from({
 *   client,
 *   owner: Account.fromPrivateKey('0x…'),
 * })
 * ```
 *
 * @param options Account configuration.
 * @returns A Simple7702 Smart Account.
 */
export async function from<
  const entryPoint extends EntryPointParameter = '0.8',
>(options: from.Options<entryPoint>): Promise<from.ReturnType<entryPoint>> {
  const { client, getNonce, owner } = options
  const entryPoint_ =
    typeof options.entryPoint === 'object'
      ? options.entryPoint
      : options.entryPoint === '0.9'
        ? ({
            abi: EntryPoint.abiV09,
            address: EntryPoint.addressV09,
            version: '0.9',
          } as const)
        : ({
            abi: EntryPoint.abiV08,
            address: EntryPoint.addressV08,
            version: '0.8',
          } as const)
  const implementation =
    options.implementation ??
    (options.entryPoint === '0.9'
      ? implementationAddressV09
      : implementationAddressV08)

  return SmartAccount.from({
    authorization: { account: owner, address: implementation },
    client,
    entryPoint: entryPoint_,
    extend: { abi, owner },
    getNonce,

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

    getAddress() {
      return owner.address
    },

    getFactoryArgs() {
      return { factory: '0x7702', factoryData: '0x' }
    },

    getStubSignature() {
      return stubSignature
    },

    signMessage({ message }) {
      return owner.signMessage({ message })
    },

    signTypedData(typedData) {
      return owner.signTypedData(typedData)
    },

    async signUserOperation(options) {
      const chainId =
        options.chainId ?? client.chain?.id ?? (await getId(client))
      const { chainId: _, ...userOperation } = options
      const typedData = UserOperation.toTypedData(
        UserOperation.from(
          { ...userOperation, sender: owner.address },
          { signature: userOperation.signature ?? '0x' },
        ) as UserOperation.UserOperation<'0.8' | '0.9', true>,
        {
          chainId,
          entryPointAddress: entryPoint_.address,
        },
      )
      return owner.signTypedData(typedData)
    },
  }) as unknown as from.ReturnType<entryPoint>
}

export declare namespace from {
  /** Options for {@link from}. */
  type Options<entryPoint extends EntryPointParameter = '0.8'> = {
    /** Client used to read account and EntryPoint state. */
    client: Client.Client
    /** EntryPoint version. @default '0.8' */
    entryPoint?: entryPoint | EntryPointParameter | undefined
    /** Overrides the account nonce resolver. */
    getNonce?: Implementation<entryPoint>['getNonce'] | undefined
    /** Simple7702 implementation to delegate to. */
    implementation?: Address.Address | undefined
    /** Private-key account that owns and authorizes the delegation. */
    owner: viem_Account.PrivateKey
  }

  /** Simple7702 Smart Account returned by {@link from}. */
  type ReturnType<entryPoint extends EntryPointParameter = '0.8'> =
    Account<entryPoint>

  /** Errors thrown by {@link from}. */
  type ErrorType = SmartAccount.from.ErrorType | Errors.GlobalErrorType
}

type EntryPointParameter =
  | '0.8'
  | '0.9'
  | {
      abi: AbiType
      address: Address.Address
      version: EntryPoint.Version
    }
