import * as AbiEvent from 'ox/AbiEvent'
import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
import type * as Log from 'ox/Log'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import type { simulate as simulateContract } from '../../../core/actions/contract/simulate.js'
import { write } from '../../../core/actions/contract/write.js'
import type { writeSync } from '../../../core/actions/contract/writeSync.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'
import type { WriteParameters } from '../../internal/types.js'
import {
  type CallParameters,
  defineCall,
  dispatchWrite,
  estimateWrite,
  pickWriteParameters,
  resolveCallParameters,
  simulateWrite,
} from '../../internal/utils.js'

/** Policy type. */
export type PolicyType = 'blacklist' | 'whitelist'

const policyTypeMap = { whitelist: 0, blacklist: 1 } as const

/** Creates a TIP-403 transfer policy. */
export async function create<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: create.Options<account>,
): Promise<create.ReturnType> {
  return create.inner(write, client, options)
}

export namespace create {
  export type Args = {
    /** Optional accounts to initialize the policy with. */
    addresses?: readonly Address.Address[] | undefined
    /** Policy admin address. */
    admin: Address.Address
    /** Policy type. */
    type: PolicyType
  }
  export type Options<
    account extends Account.Account | undefined = Account.Account | undefined,
  > = WriteParameters &
    Omit<Args, 'admin'> &
    (account extends Account.Account
      ? { admin?: Account.Account | Address.Address | undefined }
      : { admin: Account.Account | Address.Address })
  export type ReturnType = write.ReturnType
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /** @internal */
  export async function inner<
    action extends typeof write | typeof writeSync,
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    action: action,
    client: Client.Client<chain, account>,
    options: Options<account>,
  ): Promise<dispatchWrite.ReturnType<action>> {
    const {
      account = client.account,
      admin: admin_ = client.account,
      chain = client.chain,
    } = options
    const admin = admin_ ? resolveAdmin(admin_) : undefined
    if (!admin) throw new Error('admin is required.')

    return dispatchWrite(action, client, {
      ...options,
      account,
      chain,
      ...create.call(client, { ...options, admin }),
    })
  }

  /** Defines a call to the `createPolicy` or `createPolicyWithAccounts` function. */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [, args] = resolveCallParameters(parameters)
    const { addresses, admin, type } = args
    const callArgs = addresses
      ? ({
          args: [admin, policyTypeMap[type], addresses],
          functionName: 'createPolicyWithAccounts',
        } as const)
      : ({
          args: [admin, policyTypeMap[type]],
          functionName: 'createPolicy',
        } as const)
    return defineCall({
      abi: Abis.tip403Registry,
      address: Addresses.tip403Registry,
      ...callArgs,
    })
  }

  /** Estimates the gas required to create a TIP-403 transfer policy. */
  export async function estimateGas<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: Options<account>,
  ): Promise<bigint> {
    const { admin: admin_ = client.account } = options
    const admin = admin_ ? resolveAdmin(admin_) : undefined
    if (!admin) throw new Error('admin is required.')
    return estimateWrite(client, {
      ...pickWriteParameters(options),
      ...create.call(client, { ...options, admin }),
    })
  }

  /** Simulates creating a TIP-403 transfer policy. */
  export async function simulate<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: Options<account>,
  ): Promise<
    simulateContract.ReturnType<
      typeof Abis.tip403Registry,
      'createPolicy' | 'createPolicyWithAccounts'
    >
  > {
    const { admin: admin_ = client.account } = options
    const admin = admin_ ? resolveAdmin(admin_) : undefined
    if (!admin) throw new Error('admin is required.')
    return simulateWrite(client, {
      ...pickWriteParameters(options),
      ...create.call(client, { ...options, admin }),
    })
  }

  /** Extracts the `PolicyCreated` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip403Registry, logs, {
      eventName: 'PolicyCreated',
      strict: true,
    })
    if (!log) throw new Error('`PolicyCreated` event not found.')
    return log
  }
}

function resolveAdmin(admin: Account.Account | Address.Address) {
  if (typeof admin === 'string') return admin
  return admin.address
}
