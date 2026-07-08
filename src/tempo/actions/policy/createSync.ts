import type { Address, Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import { create, type PolicyType } from './create.js'

/** Creates a TIP-403 transfer policy, and waits for the transaction to be confirmed. */
export async function createSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: createSync.Options<account>,
): Promise<createSync.ReturnType> {
  const { throwOnReceiptRevert = true } = options
  const receipt = await create.inner(writeSync, client, {
    ...options,
    throwOnReceiptRevert,
  })
  const { args } = create.extractEvent(receipt.logs)
  return {
    policyId: args.policyId,
    type: args.policyType === 0 ? 'whitelist' : 'blacklist',
    updater: args.updater,
    receipt,
  }
}

export namespace createSync {
  export type Args = create.Args
  export type Options<
    account extends Account.Account | undefined = Account.Account | undefined,
  > = create.Options<account>
  export type ReturnType = {
    /** Policy ID. */
    policyId: bigint
    /** Policy type. */
    type: PolicyType
    /** Address that created the policy. */
    updater: Address.Address
    /** Transaction receipt. */
    receipt: writeSync.ReturnType
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
