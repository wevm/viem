import { Address as Address_ } from 'ox'
import type { Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import type { Claimer, PolicyRef } from './get.js'
import { set } from './set.js'

type SetEvent = ReturnType<typeof set.extractEvent>

const rejectAllPolicyId = 0n
const allowAllPolicyId = 1n
const zeroAddress = '0x0000000000000000000000000000000000000000'

/** Sets the receive policy for the calling account and waits for the transaction to be confirmed. */
export async function setSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: setSync.Options,
): Promise<setSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await set.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
  const { tokenFilterId, ...args } = set.extractEvent(receipt.logs).args
  return {
    ...args,
    senderPolicyId: toPolicyRef(args.senderPolicyId),
    tokenPolicyId: toPolicyRef(tokenFilterId),
    claimer: toClaimer(args.recoveryAuthority, args.account),
    receipt,
  }
}

export namespace setSync {
  export type Args = set.Args
  export type Options = set.Options
  export type ReturnType = Omit<
    SetEvent['args'],
    'senderPolicyId' | 'tokenFilterId'
  > & {
    /** TIP-403 policy restricting which senders are allowed. */
    senderPolicyId: PolicyRef
    /** TIP-403 policy restricting which tokens are allowed. */
    tokenPolicyId: PolicyRef
    /** Who can reclaim funds blocked by this policy. */
    claimer: Claimer
    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}

function toPolicyRef(id: bigint): PolicyRef {
  if (id === rejectAllPolicyId) return 'reject-all'
  if (id === allowAllPolicyId) return 'allow-all'
  return id
}

function toClaimer(
  recoveryAuthority: Address_.Address,
  account: Address_.Address,
): Claimer {
  if (recoveryAuthority === zeroAddress) return 'sender'
  if (Address_.isEqual(recoveryAuthority, account)) return 'self'
  return recoveryAuthority
}
