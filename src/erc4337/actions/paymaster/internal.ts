import {
  Authorization,
  Hex,
  type Address,
  type RpcSchema as ox_RpcSchema,
} from 'ox'

import type { PartialBy } from '../../../core/internal/types.js'
import type * as EntryPoint from '../../EntryPoint.js'
import type * as UserOperation from '../../UserOperation.js'

export type Options<
  entryPointVersion extends EntryPoint.Version = EntryPoint.Version,
> = Operation<entryPointVersion> & {
  /** Paymaster service-specific context. */
  context?: unknown | undefined
  /** Chain ID for the User Operation. */
  chainId: number
  /** EntryPoint address for the User Operation. */
  entryPointAddress: Address.Address
}

export type PaymasterFields<
  entryPointVersion extends EntryPoint.Version = EntryPoint.Version,
  bigintType = bigint,
> = entryPointVersion extends '0.6'
  ? {
      /** Paymaster address and data. */
      paymasterAndData: Hex.Hex
    }
  : entryPointVersion extends '0.9'
    ? {
        /** Paymaster contract address. */
        paymaster: Address.Address
        /** Data supplied to the Paymaster contract. */
        paymasterData: Hex.Hex
        /** Gas allocated for the Paymaster post-operation code. */
        paymasterPostOpGasLimit?: bigintType | undefined
        /** Paymaster signature provided independently from account signing. */
        paymasterSignature?: Hex.Hex | undefined
        /** Gas allocated for the Paymaster validation code. */
        paymasterVerificationGasLimit?: bigintType | undefined
      }
    : {
        /** Paymaster contract address. */
        paymaster: Address.Address
        /** Data supplied to the Paymaster contract. */
        paymasterData: Hex.Hex
        /** Gas allocated for the Paymaster post-operation code. */
        paymasterPostOpGasLimit?: bigintType | undefined
        /** Gas allocated for the Paymaster validation code. */
        paymasterVerificationGasLimit?: bigintType | undefined
      }

export type StubPaymasterFields<
  entryPointVersion extends EntryPoint.Version = EntryPoint.Version,
  bigintType = bigint,
> = entryPointVersion extends '0.6'
  ? {
      /** Paymaster address and data. */
      paymasterAndData: Hex.Hex
    }
  : entryPointVersion extends '0.9'
    ? {
        /** Paymaster contract address. */
        paymaster: Address.Address
        /** Data supplied to the Paymaster contract. */
        paymasterData: Hex.Hex
        /** Gas allocated for the Paymaster post-operation code. */
        paymasterPostOpGasLimit: bigintType
        /** Paymaster signature provided independently from account signing. */
        paymasterSignature?: Hex.Hex | undefined
        /** Gas allocated for the Paymaster validation code. */
        paymasterVerificationGasLimit?: bigintType | undefined
      }
    : {
        /** Paymaster contract address. */
        paymaster: Address.Address
        /** Data supplied to the Paymaster contract. */
        paymasterData: Hex.Hex
        /** Gas allocated for the Paymaster post-operation code. */
        paymasterPostOpGasLimit: bigintType
        /** Gas allocated for the Paymaster validation code. */
        paymasterVerificationGasLimit?: bigintType | undefined
      }

type RpcResult<
  entryPointVersion extends EntryPoint.Version = EntryPoint.Version,
  stub extends boolean = boolean,
> = (stub extends true
  ? StubPaymasterFields<entryPointVersion, Hex.Hex>
  : PaymasterFields<entryPointVersion, Hex.Hex>) &
  (stub extends true
    ? {
        isFinal?: boolean | undefined
        sponsor?:
          | {
              icon?: string | undefined
              name: string
            }
          | undefined
      }
    : {})

export type RpcSchema<
  entryPointVersion extends EntryPoint.Version = EntryPoint.Version,
> = ox_RpcSchema.From<
  | {
      Request: {
        method: 'pm_getPaymasterData'
        params: [
          userOperation: RpcOperation<entryPointVersion>,
          entryPoint: Address.Address,
          chainId: Hex.Hex,
          context: unknown,
        ]
      }
      ReturnType: RpcResult<entryPointVersion, false>
    }
  | {
      Request: {
        method: 'pm_getPaymasterStubData'
        params: [
          userOperation: RpcOperation<entryPointVersion>,
          entryPoint: Address.Address,
          chainId: Hex.Hex,
          context: unknown,
        ]
      }
      ReturnType: RpcResult<entryPointVersion, true>
    }
>

export function toRpc<
  entryPointVersion extends EntryPoint.Version = EntryPoint.Version,
>(operation: Operation<entryPointVersion>): RpcOperation<entryPointVersion> {
  const rpc = {
    callData: operation.callData,
    callGasLimit: Hex.fromNumber(operation.callGasLimit ?? 0n),
    nonce: Hex.fromNumber(operation.nonce),
    preVerificationGas: Hex.fromNumber(operation.preVerificationGas ?? 0n),
    sender: operation.sender,
    verificationGasLimit: Hex.fromNumber(operation.verificationGasLimit ?? 0n),
    ...('authorization' in operation && operation.authorization !== undefined
      ? { eip7702Auth: Authorization.toRpc(operation.authorization) }
      : {}),
    ...('factory' in operation && operation.factory !== undefined
      ? { factory: operation.factory }
      : {}),
    ...('factoryData' in operation && operation.factoryData !== undefined
      ? { factoryData: operation.factoryData }
      : {}),
    ...('initCode' in operation && operation.initCode !== undefined
      ? { initCode: operation.initCode }
      : {}),
    ...(operation.maxFeePerGas !== undefined
      ? { maxFeePerGas: Hex.fromNumber(operation.maxFeePerGas) }
      : {}),
    ...(operation.maxPriorityFeePerGas !== undefined
      ? {
          maxPriorityFeePerGas: Hex.fromNumber(operation.maxPriorityFeePerGas),
        }
      : {}),
    ...('paymaster' in operation && operation.paymaster !== undefined
      ? { paymaster: operation.paymaster }
      : {}),
    ...('paymasterAndData' in operation &&
    operation.paymasterAndData !== undefined
      ? { paymasterAndData: operation.paymasterAndData }
      : {}),
    ...('paymasterData' in operation && operation.paymasterData !== undefined
      ? { paymasterData: operation.paymasterData }
      : {}),
    ...('paymasterPostOpGasLimit' in operation &&
    operation.paymasterPostOpGasLimit !== undefined
      ? {
          paymasterPostOpGasLimit: Hex.fromNumber(
            operation.paymasterPostOpGasLimit,
          ),
        }
      : {}),
    ...('paymasterSignature' in operation &&
    operation.paymasterSignature !== undefined
      ? { paymasterSignature: operation.paymasterSignature }
      : {}),
    ...('paymasterVerificationGasLimit' in operation &&
    operation.paymasterVerificationGasLimit !== undefined
      ? {
          paymasterVerificationGasLimit: Hex.fromNumber(
            operation.paymasterVerificationGasLimit,
          ),
        }
      : {}),
    ...(operation.signature !== undefined
      ? { signature: operation.signature }
      : {}),
  }

  return rpc as unknown as RpcOperation<entryPointVersion>
}

export declare namespace toRpc {
  type ErrorType = Authorization.toRpc.ErrorType | Hex.fromNumber.ErrorType
}

export type Operation<
  entryPointVersion extends EntryPoint.Version = EntryPoint.Version,
> = entryPointVersion extends '0.6'
  ? PartialOperation<UserOperation.V06<false>>
  : entryPointVersion extends '0.7'
    ? PartialOperation<UserOperation.V07<false>>
    : entryPointVersion extends '0.8'
      ? PartialOperation<UserOperation.V08<false>>
      : entryPointVersion extends '0.9'
        ? PartialOperation<UserOperation.V09<false>>
        : never

type PartialOperation<operation extends UserOperation.UserOperation> =
  PartialBy<
    operation,
    Exclude<keyof operation, 'callData' | 'nonce' | 'sender'>
  >

type RpcOperation<
  entryPointVersion extends EntryPoint.Version = EntryPoint.Version,
> = entryPointVersion extends '0.6'
  ? PartialBy<
      UserOperation.RpcV06<false>,
      'maxFeePerGas' | 'maxPriorityFeePerGas'
    >
  : entryPointVersion extends '0.7'
    ? PartialBy<
        UserOperation.RpcV07<false>,
        'maxFeePerGas' | 'maxPriorityFeePerGas'
      >
    : entryPointVersion extends '0.8'
      ? PartialBy<
          UserOperation.RpcV08<false>,
          'maxFeePerGas' | 'maxPriorityFeePerGas'
        >
      : entryPointVersion extends '0.9'
        ? PartialBy<
            UserOperation.RpcV09<false>,
            'maxFeePerGas' | 'maxPriorityFeePerGas'
          >
        : never
