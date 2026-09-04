export * from 'ox/erc4337/UserOperation'

import type { Narrow } from 'abitype'
import { type Hex, Signature } from 'ox'
import { UserOperation as ox_UserOperation } from 'ox/erc4337'

import type { Call, Calls } from '../core/actions/internal/calls.js'
import type {
  Assign,
  Compute,
  DistributiveOmit,
  OneOf,
  UnionPartialBy,
} from '../core/internal/types.js'
import type * as EntryPoint from './EntryPoint.js'

/** Instantiates a User Operation while preserving structured-signature inference. */
export function from<
  const userOperation extends
    | ox_UserOperation.UserOperation
    | ox_UserOperation.Packed,
  const signature extends Signature.Signature | Hex.Hex | undefined = undefined,
>(
  userOperation:
    | userOperation
    | ox_UserOperation.UserOperation
    | ox_UserOperation.Packed,
  options: from.Options<signature> = {},
): from.ReturnType<userOperation, signature> {
  const signature =
    typeof options.signature === 'object'
      ? Signature.toHex(options.signature)
      : options.signature
  return ox_UserOperation.from(userOperation, { signature }) as from.ReturnType<
    userOperation,
    signature
  >
}

export declare namespace from {
  /** Options for {@link from}. */
  export type Options<
    signature extends Signature.Signature | Hex.Hex | undefined = undefined,
  > = {
    /** Signature to attach. */
    signature?: signature | Signature.Signature | Hex.Hex | undefined
  }

  /** Return type of {@link from}. */
  export type ReturnType<
    userOperation extends
      | ox_UserOperation.UserOperation
      | ox_UserOperation.Packed =
      | ox_UserOperation.UserOperation
      | ox_UserOperation.Packed,
    signature extends Signature.Signature | Hex.Hex | undefined = undefined,
  > = Compute<
    Assign<
      userOperation,
      signature extends Signature.Signature | Hex.Hex
        ? Readonly<{ signature: Hex.Hex }>
        : object
    >
  >

  /** Errors thrown by {@link from}. */
  export type ErrorType = ox_UserOperation.from.ErrorType
}

type BaseRequest<entryPointVersion extends EntryPoint.Version> = UnionPartialBy<
  ox_UserOperation.UserOperation<entryPointVersion>,
  | 'callData'
  | 'callGasLimit'
  | 'maxFeePerGas'
  | 'maxPriorityFeePerGas'
  | 'nonce'
  | 'preVerificationGas'
  | 'sender'
  | 'signature'
  | 'verificationGasLimit'
>

/**
 * A partially formed User Operation request. Gas, fee, nonce, sender, and
 * signature fields can be prepared from the attached Smart Account and Client.
 */
export type Request<
  entryPointVersion extends EntryPoint.Version = EntryPoint.Version,
  calls extends readonly unknown[] = readonly Call[],
> = OneOf<
  | (DistributiveOmit<BaseRequest<entryPointVersion>, 'callData'> & {
      /** Encoded call data for the Smart Account. */
      callData: Hex.Hex
    })
  | (DistributiveOmit<BaseRequest<entryPointVersion>, 'callData'> & {
      /** Calls to encode for the Smart Account. */
      calls: Calls<Narrow<calls>>
    })
>
