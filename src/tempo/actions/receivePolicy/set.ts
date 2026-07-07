import * as AbiEvent from 'ox/AbiEvent'
import * as Address_ from 'ox/Address'
import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
import * as VirtualAddress from 'ox/tempo/VirtualAddress'
import type * as Log from 'ox/Log'

import * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { write } from '../../../core/actions/contract/write.js'
import type { writeSync } from '../../../core/actions/contract/writeSync.js'
import type { simulate as simulateContract } from '../../../core/actions/contract/simulate.js'
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
import type { Claimer, PolicyRef } from './get.js'

const rejectAllPolicyId = 0n
const allowAllPolicyId = 1n
const tip20Prefix = '0x20c000000000000000000000'
const zeroAddress = '0x0000000000000000000000000000000000000000'
const systemPrecompiles = [
  Addresses.accountKeychain,
  Addresses.accountRegistrar,
  Addresses.addressRegistry,
  Addresses.feeManager,
  Addresses.nonceManager,
  Addresses.receivePolicyGuard,
  Addresses.signatureVerifier,
  Addresses.stablecoinDex,
  Addresses.tip20ChannelReserve,
  Addresses.tip20Factory,
  Addresses.tip403Registry,
  Addresses.validator,
] as const

/** Sets the receive policy for the calling account. */
export async function set<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: set.Options,
): Promise<set.ReturnType> {
  return set.inner(write, client, options)
}

export namespace set {
  export type Args = {
    /** Who can reclaim funds blocked by this policy. @default 'sender' */
    claimer?: Claimer | undefined
    /** TIP-403 policy restricting which senders are allowed. @default 'allow-all' */
    senderPolicyId?: PolicyRef | undefined
    /** TIP-403 policy restricting which tokens are allowed. @default 'allow-all' */
    tokenPolicyId?: PolicyRef | undefined
  }
  export type CallArgs = {
    /** Resolved recovery authority. */
    recoveryAuthority: Address.Address
    /** Resolved TIP-403 sender policy id. */
    senderPolicyId: bigint
    /** Resolved TIP-403 token filter id. */
    tokenFilterId: bigint
  }
  export type Options = WriteParameters & Args
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
    options: Options,
  ): Promise<dispatchWrite.ReturnType<action>> {
    return dispatchWrite(action, client, {
      ...options,
      ...set.call(client, options),
    })
  }

  /** Defines a call to the `setReceivePolicy` function. */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args | CallArgs, Client.Client<chain>>
  ) {
    const [client, args] = resolveCallParameters(parameters)
    const callArgs =
      'recoveryAuthority' in args
        ? args
        : (() => {
            const account = client?.account
            if (!account) throw new Account.NotFoundError()
            const address =
              typeof account === 'string' ? account : account.address
            return {
              recoveryAuthority: resolveClaimer(
                args.claimer ?? 'sender',
                address,
              ),
              senderPolicyId: resolvePolicyRef(
                args.senderPolicyId ?? 'allow-all',
              ),
              tokenFilterId: resolvePolicyRef(
                args.tokenPolicyId ?? 'allow-all',
              ),
            }
          })()
    const { recoveryAuthority, senderPolicyId, tokenFilterId } = callArgs
    return defineCall({
      abi: Abis.tip403Registry,
      address: Addresses.tip403Registry,
      args: [senderPolicyId, tokenFilterId, recoveryAuthority],
      functionName: 'setReceivePolicy',
    })
  }

  /** Estimates the gas required to set the receive policy. */
  export async function estimateGas<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(client: Client.Client<chain, account>, options: Options): Promise<bigint> {
    return estimateWrite(client, {
      ...pickWriteParameters(options),
      ...set.call(client, options),
    })
  }

  /** Simulates setting the receive policy. */
  export async function simulate<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: Options,
  ): Promise<
    simulateContract.ReturnType<typeof Abis.tip403Registry, 'setReceivePolicy'>
  > {
    return simulateWrite(client, {
      ...pickWriteParameters(options),
      ...set.call(client, options),
    })
  }

  /** Extracts the `ReceivePolicyUpdated` event from logs. */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip403Registry, logs, {
      eventName: 'ReceivePolicyUpdated',
      strict: true,
    })
    if (!log) throw new Error('`ReceivePolicyUpdated` event not found.')
    return log
  }
}

function resolvePolicyRef(ref: PolicyRef): bigint {
  if (ref === 'reject-all') return rejectAllPolicyId
  if (ref === 'allow-all') return allowAllPolicyId
  return ref
}

function resolveClaimer(
  claimer: Claimer,
  self: Address.Address,
): Address.Address {
  const recoveryAuthority =
    claimer === 'sender' ? zeroAddress : claimer === 'self' ? self : claimer
  assertValidRecoveryAuthority(recoveryAuthority)
  return recoveryAuthority
}

function assertValidRecoveryAuthority(recoveryAuthority: Address.Address) {
  if (Address_.isEqual(recoveryAuthority, zeroAddress)) return
  if (VirtualAddress.isVirtual(recoveryAuthority))
    throw new Error('Recovery authority cannot be a TIP-1022 virtual address.')
  if (recoveryAuthority.toLowerCase().startsWith(tip20Prefix))
    throw new Error('Recovery authority cannot be a TIP-20 token address.')
  if (
    systemPrecompiles.some((address) =>
      Address_.isEqual(address, recoveryAuthority),
    )
  )
    throw new Error('Recovery authority cannot be a Tempo system precompile.')
}
