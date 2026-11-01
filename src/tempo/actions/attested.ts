import type { Address } from 'abitype'
import * as PublicKey from 'ox/PublicKey'
import type { Account } from '../../accounts/types.js'
import { parseAccount } from '../../accounts/utils/parseAccount.js'
import { readContract } from '../../actions/public/readContract.js'
import type { WriteContractReturnType } from '../../actions/wallet/writeContract.js'
import { writeContract } from '../../actions/wallet/writeContract.js'
import { writeContractSync } from '../../actions/wallet/writeContractSync.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { zeroAddress } from '../../constants/address.js'
import type { BaseErrorType } from '../../errors/base.js'
import type { Chain } from '../../types/chain.js'
import type { GetEventArgs } from '../../types/contract.js'
import type { Log } from '../../types/log.js'
import type { Hex } from '../../types/misc.js'
import type { Compute } from '../../types/utils.js'
import { parseEventLogs } from '../../utils/abi/parseEventLogs.js'
import { numberToHex } from '../../utils/encoding/toHex.js'
import * as Abis from '../Abis.js'
import * as Addresses from '../Addresses.js'
import type * as Errors from '../errors.js'

import { withExecutionError } from '../internal/errors.js'
import type { ReadParameters, WriteParameters } from '../internal/types.js'
import { defineCall } from '../internal/utils.js'
import type { TransactionReceipt } from '../Transaction.js'

/**
 * Cancels a pending measurement or trust anchor of an attested signer policy. The policy owner or guardian calls it.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const hash = await Actions.attested.cancelProposal(client, {
 *   policyId: '0x...',
 *   entry: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function cancelProposal<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: cancelProposal.Parameters<chain, account>,
): Promise<cancelProposal.ReturnValue> {
  return cancelProposal.inner(writeContract, client, parameters)
}

export namespace cancelProposal {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** Whether `entry` is a trust anchor. Defaults to `false`, a measurement. */
    isAnchor?: boolean | undefined
    /** Pending measurement or trust anchor to cancel. */
    entry: Hex
    /** Policy ID. */
    policyId: Hex
  }

  export type ReturnValue = WriteContractReturnType

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType

  /** @internal */
  export async function inner<
    action extends typeof writeContract | typeof writeContractSync,
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    action: action,
    client: Client<Transport, chain, account>,
    parameters: Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const {
      account = client.account,
      chain = client.chain,
      entry,
      isAnchor,
      policyId,
      ...rest
    } = parameters

    if (!account) throw new Error('`account` is required')

    const call = cancelProposal.call({ entry, isAnchor, policyId })
    return withExecutionError(action)(client, {
      ...rest,
      account,
      chain,
      ...call,
    } as never) as never
  }

  /**
   * Defines a call to the `cancelProposal` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { entry, isAnchor = false, policyId } = args
    return defineCall({
      address: Addresses.attestedKeyRegistry,
      abi: Abis.attestedKeyRegistry,
      functionName: 'cancelProposal',
      args: [policyId, entry, isAnchor],
    })
  }

  /**
   * Extracts the `ProposalCancelled` event from logs.
   *
   * @param logs - The logs.
   * @returns The `ProposalCancelled` event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.attestedKeyRegistry,
      logs,
      eventName: 'ProposalCancelled',
      strict: true,
    })
    if (!log) throw new Error('`ProposalCancelled` event not found.')
    return log
  }
}

/**
 * Cancels a pending measurement or trust anchor of an attested signer policy. The policy owner or guardian calls it. Waits for the transaction receipt.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const { receipt, ...result } = await Actions.attested.cancelProposalSync(client, {
 *   policyId: '0x...',
 *   entry: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function cancelProposalSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: cancelProposalSync.Parameters<chain, account>,
): Promise<cancelProposalSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await cancelProposal.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  if ((receipt as TransactionReceipt).status === 'pending')
    return { receipt } as never
  const { args } = cancelProposal.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace cancelProposalSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = cancelProposal.Parameters<chain, account>

  export type Args = cancelProposal.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.attestedKeyRegistry,
      'ProposalCancelled',
      { IndexedOnly: false; Required: true }
    > & {
      receipt: TransactionReceipt
    }
  >

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType
}

/**
 * Computes the ID of the attested signer policy that `creator` creates with `salt`:
 * `keccak256(abi.encode(creator, salt))`, as the Attested Key Registry derives it.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const policyId = await Actions.attested.computePolicyId(client, {
 *   creator: '0x...',
 *   salt: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The policy ID.
 */
export async function computePolicyId<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: computePolicyId.Parameters,
): Promise<computePolicyId.ReturnValue> {
  const { creator, salt, ...rest } = parameters
  return await withExecutionError(readContract)(client, {
    ...rest,
    ...computePolicyId.call({ creator, salt }),
  })
}

export namespace computePolicyId {
  export type Parameters = ReadParameters & Args

  export type Args = {
    /** Account that creates the policy. */
    creator: Address
    /** Caller-chosen salt of the policy ID. */
    salt: Hex
  }

  export type ReturnValue = Hex

  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType

  /**
   * Defines a call to the `computePolicyId` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { creator, salt } = args
    return defineCall({
      address: Addresses.attestedKeyRegistry,
      abi: Abis.attestedKeyRegistry,
      functionName: 'computePolicyId',
      args: [creator, salt],
    })
  }
}

/**
 * Creates an attested signer policy. Its initial measurements are active at once. The policy ID is derived from the caller and `salt` (see {@link computePolicyId}).
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const hash = await Actions.attested.createPolicy(client, {
 *   salt: '0x...',
 *   scheme: 1,
 *   delay: 86_400,
 *   maxKeyLifetime: 3600,
 *   measurements: ['0x...'],
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function createPolicy<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: createPolicy.Parameters<chain, account>,
): Promise<createPolicy.ReturnValue> {
  return createPolicy.inner(writeContract, client, parameters)
}

export namespace createPolicy {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** Trust anchors, in the scheme's format. Defaults to none. */
    anchors?: readonly Hex[] | undefined
    /** Seconds before a proposed measurement becomes active. */
    delay: number
    /** Guardian, which can pause, remove, cancel, and revoke. Defaults to none. */
    guardian?: Address | undefined
    /** Longest registration of a program key, in seconds. */
    maxKeyLifetime: number
    /** Initial measurements, active at once. */
    measurements: readonly Hex[]
    /** Owner, which proposes measurements and changes settings. Defaults to the sender. */
    owner?: Address | undefined
    /** Caller-chosen salt of the policy ID. */
    salt: Hex
    /** Attestation scheme ID, such as `1` for AWS Nitro Enclaves (TIP-1162). */
    scheme: number
  }

  export type ReturnValue = WriteContractReturnType

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType

  /** @internal */
  export async function inner<
    action extends typeof writeContract | typeof writeContractSync,
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    action: action,
    client: Client<Transport, chain, account>,
    parameters: Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const {
      account = client.account,
      chain = client.chain,
      anchors,
      delay,
      guardian,
      maxKeyLifetime,
      measurements,
      owner,
      salt,
      scheme,
      ...rest
    } = parameters

    if (!account) throw new Error('`account` is required')

    const call = createPolicy.call({
      anchors,
      delay,
      guardian,
      maxKeyLifetime,
      measurements,
      owner: owner ?? parseAccount(account).address,
      salt,
      scheme,
    })
    return withExecutionError(action)(client, {
      ...rest,
      account,
      chain,
      ...call,
    } as never) as never
  }

  /**
   * Defines a call to the `createPolicy` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(
    args: Compute<Omit<Args, 'owner'> & { owner: Address }>,
  ) {
    const {
      anchors = [],
      delay,
      guardian = zeroAddress,
      maxKeyLifetime,
      measurements,
      owner,
      salt,
      scheme,
    } = args
    return defineCall({
      address: Addresses.attestedKeyRegistry,
      abi: Abis.attestedKeyRegistry,
      functionName: 'createPolicy',
      args: [
        salt,
        scheme,
        owner,
        guardian,
        BigInt(delay),
        BigInt(maxKeyLifetime),
        measurements,
        anchors,
      ],
    })
  }

  /**
   * Extracts the `PolicyCreated` event from logs.
   *
   * @param logs - The logs.
   * @returns The `PolicyCreated` event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.attestedKeyRegistry,
      logs,
      eventName: 'PolicyCreated',
      strict: true,
    })
    if (!log) throw new Error('`PolicyCreated` event not found.')
    return log
  }
}

/**
 * Creates an attested signer policy. Its initial measurements are active at once. The policy ID is derived from the caller and `salt` (see {@link computePolicyId}). Waits for the transaction receipt.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const { receipt, ...result } = await Actions.attested.createPolicySync(client, {
 *   salt: '0x...',
 *   scheme: 1,
 *   delay: 86_400,
 *   maxKeyLifetime: 3600,
 *   measurements: ['0x...'],
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function createPolicySync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: createPolicySync.Parameters<chain, account>,
): Promise<createPolicySync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await createPolicy.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  if ((receipt as TransactionReceipt).status === 'pending')
    return { receipt } as never
  const { args } = createPolicy.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace createPolicySync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = createPolicy.Parameters<chain, account>

  export type Args = createPolicy.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.attestedKeyRegistry,
      'PolicyCreated',
      { IndexedOnly: false; Required: true }
    > & {
      receipt: TransactionReceipt
    }
  >

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType
}

/**
 * Gets when a program key's registration in an attested signer policy expires.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const validUntil = await Actions.attested.getKeyValidUntil(client, {
 *   policyId: '0x...',
 *   programKey: '0x04...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns When the registration expires, in Unix seconds, or `0` if no key slot holds the key as current.
 */
export async function getKeyValidUntil<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: getKeyValidUntil.Parameters,
): Promise<getKeyValidUntil.ReturnValue> {
  const { policyId, programKey, ...rest } = parameters
  const validUntil = await withExecutionError(readContract)(client, {
    ...rest,
    ...getKeyValidUntil.call({ policyId, programKey }),
  })
  return Number(validUntil)
}

export namespace getKeyValidUntil {
  export type Parameters = ReadParameters & Args

  export type Args = {
    /** Policy ID. */
    policyId: Hex
    /** Program key: an uncompressed P256 public key. */
    programKey: Hex
  }

  export type ReturnValue = number

  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType

  /**
   * Defines a call to the `keyValidUntil` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { policyId, programKey } = args
    const { x, y } = PublicKey.fromHex(programKey)
    return defineCall({
      address: Addresses.attestedKeyRegistry,
      abi: Abis.attestedKeyRegistry,
      functionName: 'keyValidUntil',
      args: [
        policyId,
        numberToHex(x, { size: 32 }),
        numberToHex(y, { size: 32 }),
      ],
    })
  }
}

/**
 * Gets when a measurement becomes active in an attested signer policy.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const activeAt = await Actions.attested.getMeasurementActiveAt(client, {
 *   policyId: '0x...',
 *   measurement: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The activation time, in Unix seconds, or `0` if the policy does not list the measurement.
 */
export async function getMeasurementActiveAt<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: getMeasurementActiveAt.Parameters,
): Promise<getMeasurementActiveAt.ReturnValue> {
  const { measurement, policyId, ...rest } = parameters
  const activeAt = await withExecutionError(readContract)(client, {
    ...rest,
    ...getMeasurementActiveAt.call({ measurement, policyId }),
  })
  return Number(activeAt)
}

export namespace getMeasurementActiveAt {
  export type Parameters = ReadParameters & Args

  export type Args = {
    /** Measurement of a signer program. */
    measurement: Hex
    /** Policy ID. */
    policyId: Hex
  }

  export type ReturnValue = number

  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType

  /**
   * Defines a call to the `measurementActiveAt` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { measurement, policyId } = args
    return defineCall({
      address: Addresses.attestedKeyRegistry,
      abi: Abis.attestedKeyRegistry,
      functionName: 'measurementActiveAt',
      args: [policyId, measurement],
    })
  }
}

/**
 * Gets an attested signer policy's roles and settings.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const policy = await Actions.attested.getPolicy(client, {
 *   policyId: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The policy. Its `owner` is the zero address if the policy does not exist.
 */
export async function getPolicy<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: getPolicy.Parameters,
): Promise<getPolicy.ReturnValue> {
  const { policyId, ...rest } = parameters
  const [
    owner,
    guardian,
    scheme,
    paused,
    epoch,
    delay,
    pendingDelay,
    pendingDelayAt,
    maxKeyLifetime,
    pendingMaxKeyLifetime,
    pendingMaxKeyLifetimeAt,
  ] = await withExecutionError(readContract)(client, {
    ...rest,
    ...getPolicy.call({ policyId }),
  })
  return {
    delay: Number(delay),
    epoch: Number(epoch),
    guardian,
    maxKeyLifetime: Number(maxKeyLifetime),
    owner,
    paused,
    pendingDelay: Number(pendingDelay),
    pendingDelayAt: Number(pendingDelayAt),
    pendingMaxKeyLifetime: Number(pendingMaxKeyLifetime),
    pendingMaxKeyLifetimeAt: Number(pendingMaxKeyLifetimeAt),
    scheme,
  }
}

export namespace getPolicy {
  export type Parameters = ReadParameters & Args

  export type Args = {
    /** Policy ID. */
    policyId: Hex
  }

  export type ReturnValue = {
    /** Seconds before a proposed measurement becomes active. */
    delay: number
    /** Revocation counter. Each increment revokes every program key of the policy. */
    epoch: number
    /** Guardian, or the zero address for none. */
    guardian: Address
    /** Longest registration of a program key, in seconds. */
    maxKeyLifetime: number
    /** Owner, or the zero address if the policy does not exist. */
    owner: Address
    /** Whether the policy is paused. */
    paused: boolean
    /** Pending decreased delay, in seconds. */
    pendingDelay: number
    /** When the pending delay applies, in Unix seconds, or `0` for none. */
    pendingDelayAt: number
    /** Pending increased key lifetime cap, in seconds. */
    pendingMaxKeyLifetime: number
    /** When the pending key lifetime cap applies, in Unix seconds, or `0` for none. */
    pendingMaxKeyLifetimeAt: number
    /** Attestation scheme ID. */
    scheme: number
  }

  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType

  /**
   * Defines a call to the `policy` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { policyId } = args
    return defineCall({
      address: Addresses.attestedKeyRegistry,
      abi: Abis.attestedKeyRegistry,
      functionName: 'policy',
      args: [policyId],
    })
  }
}

/**
 * Pauses an attested signer policy. Registrations fail and attested signatures for the policy are rejected until it is unpaused. The policy owner or guardian calls it.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const hash = await Actions.attested.pause(client, {
 *   policyId: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function pause<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: pause.Parameters<chain, account>,
): Promise<pause.ReturnValue> {
  return pause.inner(writeContract, client, parameters)
}

export namespace pause {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** Policy ID. */
    policyId: Hex
  }

  export type ReturnValue = WriteContractReturnType

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType

  /** @internal */
  export async function inner<
    action extends typeof writeContract | typeof writeContractSync,
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    action: action,
    client: Client<Transport, chain, account>,
    parameters: Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const {
      account = client.account,
      chain = client.chain,
      policyId,
      ...rest
    } = parameters

    if (!account) throw new Error('`account` is required')

    const call = pause.call({ policyId })
    return withExecutionError(action)(client, {
      ...rest,
      account,
      chain,
      ...call,
    } as never) as never
  }

  /**
   * Defines a call to the `pause` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { policyId } = args
    return defineCall({
      address: Addresses.attestedKeyRegistry,
      abi: Abis.attestedKeyRegistry,
      functionName: 'pause',
      args: [policyId],
    })
  }

  /**
   * Extracts the `PolicyPaused` event from logs.
   *
   * @param logs - The logs.
   * @returns The `PolicyPaused` event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.attestedKeyRegistry,
      logs,
      eventName: 'PolicyPaused',
      strict: true,
    })
    if (!log) throw new Error('`PolicyPaused` event not found.')
    return log
  }
}

/**
 * Pauses an attested signer policy. Registrations fail and attested signatures for the policy are rejected until it is unpaused. The policy owner or guardian calls it. Waits for the transaction receipt.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const { receipt, ...result } = await Actions.attested.pauseSync(client, {
 *   policyId: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function pauseSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: pauseSync.Parameters<chain, account>,
): Promise<pauseSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await pause.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  if ((receipt as TransactionReceipt).status === 'pending')
    return { receipt } as never
  const { args } = pause.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace pauseSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = pause.Parameters<chain, account>

  export type Args = pause.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.attestedKeyRegistry,
      'PolicyPaused',
      { IndexedOnly: false; Required: true }
    > & {
      receipt: TransactionReceipt
    }
  >

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType
}

/**
 * Proposes a measurement for an attested signer policy. It becomes active after the policy's delay. The policy owner calls it.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const hash = await Actions.attested.proposeMeasurement(client, {
 *   policyId: '0x...',
 *   measurement: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function proposeMeasurement<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: proposeMeasurement.Parameters<chain, account>,
): Promise<proposeMeasurement.ReturnValue> {
  return proposeMeasurement.inner(writeContract, client, parameters)
}

export namespace proposeMeasurement {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** Measurement of the signer program to approve. */
    measurement: Hex
    /** Policy ID. */
    policyId: Hex
  }

  export type ReturnValue = WriteContractReturnType

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType

  /** @internal */
  export async function inner<
    action extends typeof writeContract | typeof writeContractSync,
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    action: action,
    client: Client<Transport, chain, account>,
    parameters: Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const {
      account = client.account,
      chain = client.chain,
      measurement,
      policyId,
      ...rest
    } = parameters

    if (!account) throw new Error('`account` is required')

    const call = proposeMeasurement.call({ measurement, policyId })
    return withExecutionError(action)(client, {
      ...rest,
      account,
      chain,
      ...call,
    } as never) as never
  }

  /**
   * Defines a call to the `proposeMeasurement` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { measurement, policyId } = args
    return defineCall({
      address: Addresses.attestedKeyRegistry,
      abi: Abis.attestedKeyRegistry,
      functionName: 'proposeMeasurement',
      args: [policyId, measurement],
    })
  }

  /**
   * Extracts the `MeasurementProposed` event from logs.
   *
   * @param logs - The logs.
   * @returns The `MeasurementProposed` event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.attestedKeyRegistry,
      logs,
      eventName: 'MeasurementProposed',
      strict: true,
    })
    if (!log) throw new Error('`MeasurementProposed` event not found.')
    return log
  }
}

/**
 * Proposes a measurement for an attested signer policy. It becomes active after the policy's delay. The policy owner calls it. Waits for the transaction receipt.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const { receipt, ...result } = await Actions.attested.proposeMeasurementSync(client, {
 *   policyId: '0x...',
 *   measurement: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function proposeMeasurementSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: proposeMeasurementSync.Parameters<chain, account>,
): Promise<proposeMeasurementSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await proposeMeasurement.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  if ((receipt as TransactionReceipt).status === 'pending')
    return { receipt } as never
  const { args } = proposeMeasurement.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace proposeMeasurementSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = proposeMeasurement.Parameters<chain, account>

  export type Args = proposeMeasurement.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.attestedKeyRegistry,
      'MeasurementProposed',
      { IndexedOnly: false; Required: true }
    > & {
      receipt: TransactionReceipt
    }
  >

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType
}

/**
 * Registers a program key into a key slot of an attested signer policy from an attestation document, ending the key the slot held. Anyone can call it, because the document authenticates itself.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const hash = await Actions.attested.registerKey(client, {
 *   policyId: '0x...',
 *   slot: 0,
 *   document: '0x...',
 *   programKey: '0x04...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function registerKey<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: registerKey.Parameters<chain, account>,
): Promise<registerKey.ReturnValue> {
  return registerKey.inner(writeContract, client, parameters)
}

export namespace registerKey {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** Attestation document, in the policy scheme's format. Its binding names the chain, registry, policy, slot, program key, and lifetime. */
    document: Hex
    /** Requested seconds until the registration expires, capped by the policy's `maxKeyLifetime`. The document's binding names it, so it must match the lifetime the document was requested for. Defaults to `0`, the cap. */
    lifetime?: number | undefined
    /** Policy ID. */
    policyId: Hex
    /** Program key: the uncompressed P256 public key that the signer program generated. */
    programKey: Hex
    /** Key slot to overwrite. */
    slot: number
  }

  export type ReturnValue = WriteContractReturnType

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType

  /** @internal */
  export async function inner<
    action extends typeof writeContract | typeof writeContractSync,
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    action: action,
    client: Client<Transport, chain, account>,
    parameters: Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const {
      account = client.account,
      chain = client.chain,
      document,
      lifetime,
      policyId,
      programKey,
      slot,
      ...rest
    } = parameters

    if (!account) throw new Error('`account` is required')

    const call = registerKey.call({
      document,
      lifetime,
      policyId,
      programKey,
      slot,
    })
    return withExecutionError(action)(client, {
      ...rest,
      account,
      chain,
      ...call,
    } as never) as never
  }

  /**
   * Defines a call to the `registerKey` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { document, lifetime = 0, policyId, programKey, slot } = args
    const { x, y } = PublicKey.fromHex(programKey)
    return defineCall({
      address: Addresses.attestedKeyRegistry,
      abi: Abis.attestedKeyRegistry,
      functionName: 'registerKey',
      args: [
        policyId,
        slot,
        document,
        numberToHex(x, { size: 32 }),
        numberToHex(y, { size: 32 }),
        BigInt(lifetime),
      ],
    })
  }

  /**
   * Extracts the `KeyRegistered` event from logs.
   *
   * @param logs - The logs.
   * @returns The `KeyRegistered` event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.attestedKeyRegistry,
      logs,
      eventName: 'KeyRegistered',
      strict: true,
    })
    if (!log) throw new Error('`KeyRegistered` event not found.')
    return log
  }
}

/**
 * Registers a program key into a key slot of an attested signer policy from an attestation document, ending the key the slot held. Anyone can call it, because the document authenticates itself. Waits for the transaction receipt.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const { receipt, ...result } = await Actions.attested.registerKeySync(client, {
 *   policyId: '0x...',
 *   slot: 0,
 *   document: '0x...',
 *   programKey: '0x04...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function registerKeySync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: registerKeySync.Parameters<chain, account>,
): Promise<registerKeySync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await registerKey.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  if ((receipt as TransactionReceipt).status === 'pending')
    return { receipt } as never
  const { args } = registerKey.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace registerKeySync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = registerKey.Parameters<chain, account>

  export type Args = registerKey.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.attestedKeyRegistry,
      'KeyRegistered',
      { IndexedOnly: false; Required: true }
    > & {
      receipt: TransactionReceipt
    }
  >

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType
}

/**
 * Removes a measurement from an attested signer policy and revokes every program key of the policy. The policy owner or guardian calls it.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const hash = await Actions.attested.removeMeasurement(client, {
 *   policyId: '0x...',
 *   measurement: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function removeMeasurement<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: removeMeasurement.Parameters<chain, account>,
): Promise<removeMeasurement.ReturnValue> {
  return removeMeasurement.inner(writeContract, client, parameters)
}

export namespace removeMeasurement {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** Measurement to remove. */
    measurement: Hex
    /** Policy ID. */
    policyId: Hex
  }

  export type ReturnValue = WriteContractReturnType

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType

  /** @internal */
  export async function inner<
    action extends typeof writeContract | typeof writeContractSync,
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    action: action,
    client: Client<Transport, chain, account>,
    parameters: Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const {
      account = client.account,
      chain = client.chain,
      measurement,
      policyId,
      ...rest
    } = parameters

    if (!account) throw new Error('`account` is required')

    const call = removeMeasurement.call({ measurement, policyId })
    return withExecutionError(action)(client, {
      ...rest,
      account,
      chain,
      ...call,
    } as never) as never
  }

  /**
   * Defines a call to the `removeMeasurement` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { measurement, policyId } = args
    return defineCall({
      address: Addresses.attestedKeyRegistry,
      abi: Abis.attestedKeyRegistry,
      functionName: 'removeMeasurement',
      args: [policyId, measurement],
    })
  }

  /**
   * Extracts the `MeasurementRemoved` event from logs.
   *
   * @param logs - The logs.
   * @returns The `MeasurementRemoved` event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.attestedKeyRegistry,
      logs,
      eventName: 'MeasurementRemoved',
      strict: true,
    })
    if (!log) throw new Error('`MeasurementRemoved` event not found.')
    return log
  }
}

/**
 * Removes a measurement from an attested signer policy and revokes every program key of the policy. The policy owner or guardian calls it. Waits for the transaction receipt.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const { receipt, ...result } = await Actions.attested.removeMeasurementSync(client, {
 *   policyId: '0x...',
 *   measurement: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function removeMeasurementSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: removeMeasurementSync.Parameters<chain, account>,
): Promise<removeMeasurementSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await removeMeasurement.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  if ((receipt as TransactionReceipt).status === 'pending')
    return { receipt } as never
  const { args } = removeMeasurement.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace removeMeasurementSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = removeMeasurement.Parameters<chain, account>

  export type Args = removeMeasurement.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.attestedKeyRegistry,
      'MeasurementRemoved',
      { IndexedOnly: false; Required: true }
    > & {
      receipt: TransactionReceipt
    }
  >

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType
}

/**
 * Revokes every program key of an attested signer policy. Approved signer programs register new keys afterwards. The policy owner or guardian calls it.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const hash = await Actions.attested.revokeKeys(client, {
 *   policyId: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function revokeKeys<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: revokeKeys.Parameters<chain, account>,
): Promise<revokeKeys.ReturnValue> {
  return revokeKeys.inner(writeContract, client, parameters)
}

export namespace revokeKeys {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** Policy ID. */
    policyId: Hex
  }

  export type ReturnValue = WriteContractReturnType

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType

  /** @internal */
  export async function inner<
    action extends typeof writeContract | typeof writeContractSync,
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    action: action,
    client: Client<Transport, chain, account>,
    parameters: Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const {
      account = client.account,
      chain = client.chain,
      policyId,
      ...rest
    } = parameters

    if (!account) throw new Error('`account` is required')

    const call = revokeKeys.call({ policyId })
    return withExecutionError(action)(client, {
      ...rest,
      account,
      chain,
      ...call,
    } as never) as never
  }

  /**
   * Defines a call to the `revokeKeys` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { policyId } = args
    return defineCall({
      address: Addresses.attestedKeyRegistry,
      abi: Abis.attestedKeyRegistry,
      functionName: 'revokeKeys',
      args: [policyId],
    })
  }

  /**
   * Extracts the `KeysRevoked` event from logs.
   *
   * @param logs - The logs.
   * @returns The `KeysRevoked` event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.attestedKeyRegistry,
      logs,
      eventName: 'KeysRevoked',
      strict: true,
    })
    if (!log) throw new Error('`KeysRevoked` event not found.')
    return log
  }
}

/**
 * Revokes every program key of an attested signer policy. Approved signer programs register new keys afterwards. The policy owner or guardian calls it. Waits for the transaction receipt.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const { receipt, ...result } = await Actions.attested.revokeKeysSync(client, {
 *   policyId: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function revokeKeysSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: revokeKeysSync.Parameters<chain, account>,
): Promise<revokeKeysSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await revokeKeys.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  if ((receipt as TransactionReceipt).status === 'pending')
    return { receipt } as never
  const { args } = revokeKeys.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace revokeKeysSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = revokeKeys.Parameters<chain, account>

  export type Args = revokeKeys.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.attestedKeyRegistry,
      'KeysRevoked',
      { IndexedOnly: false; Required: true }
    > & {
      receipt: TransactionReceipt
    }
  >

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType
}

/**
 * Changes the longest registration of a program key for an attested signer policy. A decrease applies at once, and an increase applies after the policy's delay. The policy owner calls it.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const hash = await Actions.attested.setMaxKeyLifetime(client, {
 *   policyId: '0x...',
 *   maxKeyLifetime: 3600,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function setMaxKeyLifetime<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: setMaxKeyLifetime.Parameters<chain, account>,
): Promise<setMaxKeyLifetime.ReturnValue> {
  return setMaxKeyLifetime.inner(writeContract, client, parameters)
}

export namespace setMaxKeyLifetime {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** Longest registration, in seconds. */
    maxKeyLifetime: number
    /** Policy ID. */
    policyId: Hex
  }

  export type ReturnValue = WriteContractReturnType

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType

  /** @internal */
  export async function inner<
    action extends typeof writeContract | typeof writeContractSync,
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    action: action,
    client: Client<Transport, chain, account>,
    parameters: Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const {
      account = client.account,
      chain = client.chain,
      maxKeyLifetime,
      policyId,
      ...rest
    } = parameters

    if (!account) throw new Error('`account` is required')

    const call = setMaxKeyLifetime.call({ maxKeyLifetime, policyId })
    return withExecutionError(action)(client, {
      ...rest,
      account,
      chain,
      ...call,
    } as never) as never
  }

  /**
   * Defines a call to the `setMaxKeyLifetime` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { maxKeyLifetime, policyId } = args
    return defineCall({
      address: Addresses.attestedKeyRegistry,
      abi: Abis.attestedKeyRegistry,
      functionName: 'setMaxKeyLifetime',
      args: [policyId, BigInt(maxKeyLifetime)],
    })
  }

  /**
   * Extracts the `MaxKeyLifetimeChanged` event from logs.
   *
   * @param logs - The logs.
   * @returns The `MaxKeyLifetimeChanged` event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.attestedKeyRegistry,
      logs,
      eventName: 'MaxKeyLifetimeChanged',
      strict: true,
    })
    if (!log) throw new Error('`MaxKeyLifetimeChanged` event not found.')
    return log
  }
}

/**
 * Changes the longest registration of a program key for an attested signer policy. A decrease applies at once, and an increase applies after the policy's delay. The policy owner calls it. Waits for the transaction receipt.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const { receipt, ...result } = await Actions.attested.setMaxKeyLifetimeSync(client, {
 *   policyId: '0x...',
 *   maxKeyLifetime: 3600,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function setMaxKeyLifetimeSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: setMaxKeyLifetimeSync.Parameters<chain, account>,
): Promise<setMaxKeyLifetimeSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await setMaxKeyLifetime.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  if ((receipt as TransactionReceipt).status === 'pending')
    return { receipt } as never
  const { args } = setMaxKeyLifetime.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace setMaxKeyLifetimeSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = setMaxKeyLifetime.Parameters<chain, account>

  export type Args = setMaxKeyLifetime.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.attestedKeyRegistry,
      'MaxKeyLifetimeChanged',
      { IndexedOnly: false; Required: true }
    > & {
      receipt: TransactionReceipt
    }
  >

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType
}

/**
 * Unpauses an attested signer policy. The policy owner calls it.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const hash = await Actions.attested.unpause(client, {
 *   policyId: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function unpause<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: unpause.Parameters<chain, account>,
): Promise<unpause.ReturnValue> {
  return unpause.inner(writeContract, client, parameters)
}

export namespace unpause {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** Policy ID. */
    policyId: Hex
  }

  export type ReturnValue = WriteContractReturnType

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType

  /** @internal */
  export async function inner<
    action extends typeof writeContract | typeof writeContractSync,
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    action: action,
    client: Client<Transport, chain, account>,
    parameters: Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const {
      account = client.account,
      chain = client.chain,
      policyId,
      ...rest
    } = parameters

    if (!account) throw new Error('`account` is required')

    const call = unpause.call({ policyId })
    return withExecutionError(action)(client, {
      ...rest,
      account,
      chain,
      ...call,
    } as never) as never
  }

  /**
   * Defines a call to the `unpause` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { policyId } = args
    return defineCall({
      address: Addresses.attestedKeyRegistry,
      abi: Abis.attestedKeyRegistry,
      functionName: 'unpause',
      args: [policyId],
    })
  }

  /**
   * Extracts the `PolicyPaused` event from logs.
   *
   * @param logs - The logs.
   * @returns The `PolicyPaused` event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.attestedKeyRegistry,
      logs,
      eventName: 'PolicyPaused',
      strict: true,
    })
    if (!log) throw new Error('`PolicyPaused` event not found.')
    return log
  }
}

/**
 * Unpauses an attested signer policy. The policy owner calls it. Waits for the transaction receipt.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const { receipt, ...result } = await Actions.attested.unpauseSync(client, {
 *   policyId: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function unpauseSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: unpauseSync.Parameters<chain, account>,
): Promise<unpauseSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await unpause.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  if ((receipt as TransactionReceipt).status === 'pending')
    return { receipt } as never
  const { args } = unpause.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace unpauseSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = unpause.Parameters<chain, account>

  export type Args = unpause.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.attestedKeyRegistry,
      'PolicyPaused',
      { IndexedOnly: false; Required: true }
    > & {
      receipt: TransactionReceipt
    }
  >

  // TODO: exhaustive error type
  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType
}
