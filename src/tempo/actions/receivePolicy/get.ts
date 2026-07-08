import { Address as Address_ } from 'ox'
import type { Address, Errors } from 'ox'

import * as Account from '../../../core/Account.js'
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

/** TIP-403 policy type. */
type PolicyType = 'whitelist' | 'blacklist'

const policyTypes = ['whitelist', 'blacklist'] as const
const rejectAllPolicyId = 0n
const allowAllPolicyId = 1n
const zeroAddress = '0x0000000000000000000000000000000000000000'

/** Reference to a TIP-403 policy. */
export type PolicyRef = 'reject-all' | 'allow-all' | bigint

/** Claimer authorized to reclaim blocked funds. */
export type Claimer = 'sender' | 'self' | Address.Address

/** Gets the receive policy configured for an account. */
export async function get<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: get.Options,
): Promise<get.ReturnType> {
  const { account: account_ = client.account, ...rest } = options
  if (!account_) throw new Account.NotFoundError()
  const address = typeof account_ === 'string' ? account_ : account_.address
  const [
    hasReceivePolicy,
    senderPolicyId,
    senderPolicyType,
    tokenPolicyId,
    tokenPolicyType,
    recoveryAuthority,
  ] = await read(client, {
    ...rest,
    ...get.call({ account: address }),
  })
  return {
    hasReceivePolicy,
    senderPolicyId: toPolicyRef(senderPolicyId),
    senderPolicyType: policyTypes[senderPolicyType] ?? 'whitelist',
    tokenPolicyId: toPolicyRef(tokenPolicyId),
    tokenPolicyType: policyTypes[tokenPolicyType] ?? 'whitelist',
    claimer: toClaimer(recoveryAuthority, address),
    recoveryAuthority,
  }
}

export namespace get {
  export type Args = {
    /** Account (or address) whose receive policy is read. @default client.account */
    account?: Account.Account | Address.Address | undefined
  }
  export type CallArgs = {
    /** Account address. */
    account: Address.Address
  }
  export type Options = Omit<ReadParameters, 'account'> & Args
  export type ReturnType = {
    /** Whether the account has a receive policy configured. */
    hasReceivePolicy: boolean
    /** TIP-403 policy restricting which senders are allowed. */
    senderPolicyId: PolicyRef
    /** Type of the sender policy. */
    senderPolicyType: PolicyType
    /** TIP-403 policy restricting which tokens are allowed. */
    tokenPolicyId: PolicyRef
    /** Type of the token policy. */
    tokenPolicyType: PolicyType
    /** Who can reclaim funds blocked by this policy. */
    claimer: Claimer
    /** Raw recovery authority address. */
    recoveryAuthority: Address.Address
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /** Defines a call to the `receivePolicy` function. */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<CallArgs, Client.Client<chain>>
  ) {
    const [, args] = resolveCallParameters(parameters)
    return defineCall({
      abi: Abis.tip403Registry,
      address: Addresses.tip403Registry,
      args: [args.account],
      functionName: 'receivePolicy',
    })
  }
}

function toPolicyRef(id: bigint): PolicyRef {
  if (id === rejectAllPolicyId) return 'reject-all'
  if (id === allowAllPolicyId) return 'allow-all'
  return id
}

function toClaimer(
  recoveryAuthority: Address.Address,
  account: Address.Address,
): Claimer {
  if (recoveryAuthority === zeroAddress) return 'sender'
  if (Address_.isEqual(recoveryAuthority, account)) return 'self'
  return recoveryAuthority
}
