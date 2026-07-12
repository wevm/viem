import type { Address, Errors } from 'ox'
import type { ReceivePolicyReceipt } from 'ox/tempo'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { read } from '../../../core/actions/contract/read.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'
import type { ReadParameters } from '../../internal/types.js'
import {
  type CallParameters,
  defineCall,
  resolveCallParameters,
} from '../../internal/utils.js'

const blockedReasons = ['none', 'tokenFilter', 'receivePolicy'] as const

/** Reason an inbound transfer or mint was blocked by a receive policy. */
export type BlockedReason = ReceivePolicyReceipt.BlockedReason

/** Checks whether a transfer or mint to a receiver is allowed by the receiver's receive policy. */
export async function validate<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: validate.Options,
): Promise<validate.ReturnType> {
  const { receiver, sender, token, ...rest } = options
  const [authorized, blockedReason] = await read(client, {
    ...rest,
    ...validate.call({ receiver, sender, token }),
  })
  return {
    authorized,
    blockedReason: blockedReasons[blockedReason] ?? 'none',
  }
}

export namespace validate {
  export type Args = {
    /** Receiver address. */
    receiver: Address.Address
    /** Sender address. */
    sender: Address.Address
    /** Token address. */
    token: Address.Address
  }
  export type Options = ReadParameters & Args
  export type ReturnType = {
    /** Whether the transfer is authorized. */
    authorized: boolean
    /** Reason the transfer would be blocked. */
    blockedReason: BlockedReason
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /** Defines a call to the `validateReceivePolicy` function. */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [, args] = resolveCallParameters(parameters)
    const { receiver, sender, token } = args
    return defineCall({
      abi: Abis.tip403Registry,
      address: Addresses.tip403Registry,
      args: [token, sender, receiver],
      functionName: 'validateReceivePolicy',
    })
  }
}
