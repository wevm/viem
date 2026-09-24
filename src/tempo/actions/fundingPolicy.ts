import type { Address } from 'abitype'
import { FundingPolicy } from 'ox/tempo'
import type { Account } from '../../accounts/types.js'
import type { ReadContractReturnType } from '../../actions/public/readContract.js'
import { readContract } from '../../actions/public/readContract.js'
import type { WriteContractReturnType } from '../../actions/wallet/writeContract.js'
import { writeContract } from '../../actions/wallet/writeContract.js'
import { writeContractSync } from '../../actions/wallet/writeContractSync.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { BaseErrorType } from '../../errors/base.js'
import type { Chain } from '../../types/chain.js'
import type { Log } from '../../types/log.js'
import type { Hex } from '../../types/misc.js'
import { parseEventLogs } from '../../utils/abi/parseEventLogs.js'
import { isAddressEqual } from '../../utils/address/isAddressEqual.js'
import * as Abis from '../Abis.js'
import * as Addresses from '../Addresses.js'
import type { ReadParameters, WriteParameters } from '../internal/types.js'
import { defineCall } from '../internal/utils.js'
import type { TransactionReceipt } from '../Transaction.js'

/**
 * Creates a funding policy and stores a commitment to its rules.
 * The full rules are emitted in `PolicyCreated` and must be retained for later discovery.
 *
 * @example
 * ```ts
 * import { Actions, Addresses, FundingSource } from 'viem/tempo'
 *
 * const hash = await Actions.fundingPolicy.createPolicy(client, {
 *   admins: ['0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbb'],
 *   rules: {
 *     maxSlippageBps: 100,
 *     sources: {
 *       [Addresses.pathUsd]: [{
 *         to: Addresses.dexFundingSource,
 *         data: FundingSource.encodeData({ tokenIn: Addresses.alphaUsd }),
 *       }],
 *     },
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Policy administrators and rules.
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
  export type Args = {
    /** Accounts permitted to update this policy. */
    admins: readonly Address[]
    /** Source routes and maximum aggregate slippage. */
    rules: FundingPolicy.Rules
  }

  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type ReturnValue = WriteContractReturnType
  export type ErrorType = BaseErrorType

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
    const { admins, rules, ...rest } = parameters
    return action(client, {
      ...rest,
      ...call({ admins, rules }),
    } as never) as never
  }

  /**
   * Defines the `createPolicy` call, preserving source order within each route.
   *
   * @param args - Administrators and rules.
   * @returns The contract call.
   */
  export function call(args: Args) {
    return defineCall({
      address: Addresses.fundingPolicy,
      abi: Abis.fundingPolicy,
      functionName: 'createPolicy',
      args: [
        args.admins,
        {
          maxSlippageBps: args.rules.maxSlippageBps,
          routes: FundingPolicy.toRoutes(args.rules),
        },
      ],
    })
  }

  /**
   * Extracts `PolicyCreated` from funding policy logs.
   *
   * @param logs - Transaction logs.
   * @returns The policy creation event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.fundingPolicy,
      eventName: 'PolicyCreated',
      logs: logs.filter((log) =>
        isAddressEqual(log.address, Addresses.fundingPolicy),
      ),
      strict: true,
    })
    if (!log) throw new Error('`PolicyCreated` event not found.')
    return log
  }
}

/**
 * Creates a funding policy and returns its ID and rules hash from `PolicyCreated`.
 *
 * @param client - Client.
 * @param parameters - Policy administrators and rules.
 * @returns The policy creation event and transaction receipt.
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
  return { ...createPolicy.extractEvent(receipt.logs).args, receipt } as never
}

export namespace createPolicySync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = createPolicy.Parameters<chain, account>
  export type ReturnValue = {
    policyId: bigint
    updater: Address
    rulesHash: Hex
    rules: {
      maxSlippageBps: number
      routes: readonly FundingPolicy.Route[]
    }
    receipt: TransactionReceipt
  }
  export type ErrorType = BaseErrorType
}

/**
 * Gets a funding policy's administrators and current rules hash.
 * The full rules are not stored in policy state.
 *
 * @param client - Client.
 * @param parameters - Policy ID and optional block selection.
 * @returns The administrators and rules hash.
 */
export async function getPolicy<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: getPolicy.Parameters,
): Promise<getPolicy.ReturnValue> {
  const { policyId, ...rest } = parameters
  return readContract(client, { ...rest, ...getPolicy.call({ policyId }) })
}

export namespace getPolicy {
  export type Args = { /** Policy ID. */ policyId: bigint }
  export type Parameters = ReadParameters & Args
  export type ReturnValue = ReadContractReturnType<
    typeof Abis.fundingPolicy,
    'getPolicy',
    never
  >
  export type ErrorType = BaseErrorType

  /**
   * Defines the `getPolicy` call.
   *
   * @param args - Policy ID.
   * @returns The contract call.
   */
  export function call(args: Args) {
    return defineCall({
      address: Addresses.fundingPolicy,
      abi: Abis.fundingPolicy,
      functionName: 'getPolicy',
      args: [args.policyId],
    })
  }
}

/**
 * Checks whether a funding policy ID exists.
 *
 * @param client - Client.
 * @param parameters - Policy ID and optional block selection.
 * @returns Whether the policy exists.
 */
export async function policyExists<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: policyExists.Parameters,
): Promise<policyExists.ReturnValue> {
  const { policyId, ...rest } = parameters
  return readContract(client, { ...rest, ...policyExists.call({ policyId }) })
}

export namespace policyExists {
  export type Args = { /** Policy ID. */ policyId: bigint }
  export type Parameters = ReadParameters & Args
  export type ReturnValue = ReadContractReturnType<
    typeof Abis.fundingPolicy,
    'policyExists',
    never
  >
  export type ErrorType = BaseErrorType

  /**
   * Defines the `policyExists` call.
   *
   * @param args - Policy ID.
   * @returns The contract call.
   */
  export function call(args: Args) {
    return defineCall({
      address: Addresses.fundingPolicy,
      abi: Abis.fundingPolicy,
      functionName: 'policyExists',
      args: [args.policyId],
    })
  }
}

/**
 * Gets the next funding policy ID. The next successful creation consumes this ID.
 *
 * @param client - Client.
 * @param parameters - Optional block selection.
 * @returns The next policy ID.
 */
export async function policyIdCounter<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: policyIdCounter.Parameters = {},
): Promise<policyIdCounter.ReturnValue> {
  return readContract(client, { ...parameters, ...policyIdCounter.call() })
}

export namespace policyIdCounter {
  export type Parameters = ReadParameters
  export type ReturnValue = ReadContractReturnType<
    typeof Abis.fundingPolicy,
    'policyIdCounter',
    never
  >
  export type ErrorType = BaseErrorType

  /**
   * Defines the `policyIdCounter` call.
   *
   * @returns The contract call.
   */
  export function call() {
    return defineCall({
      address: Addresses.fundingPolicy,
      abi: Abis.fundingPolicy,
      functionName: 'policyIdCounter',
      args: [],
    })
  }
}

/**
 * Replaces a funding policy's rules. The caller must be a current administrator.
 * This changes the rules hash, invalidating earlier rules bytes for discovery.
 *
 * @param client - Client.
 * @param parameters - Policy ID and replacement rules.
 * @returns The transaction hash.
 */
export async function setRules<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: setRules.Parameters<chain, account>,
): Promise<setRules.ReturnValue> {
  return setRules.inner(writeContract, client, parameters)
}

export namespace setRules {
  export type Args = {
    /** Policy ID. */
    policyId: bigint
    /** Replacement rules. */
    rules: FundingPolicy.Rules
  }
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args
  export type ReturnValue = WriteContractReturnType
  export type ErrorType = BaseErrorType

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
    const { policyId, rules, ...rest } = parameters
    return action(client, {
      ...rest,
      ...call({ policyId, rules }),
    } as never) as never
  }

  /**
   * Defines the `setRules` call with canonical route order.
   *
   * @param args - Policy ID and replacement rules.
   * @returns The contract call.
   */
  export function call(args: Args) {
    return defineCall({
      address: Addresses.fundingPolicy,
      abi: Abis.fundingPolicy,
      functionName: 'setRules',
      args: [
        args.policyId,
        {
          maxSlippageBps: args.rules.maxSlippageBps,
          routes: FundingPolicy.toRoutes(args.rules),
        },
      ],
    })
  }

  /**
   * Extracts `PolicyRulesUpdated` from funding policy logs.
   *
   * @param logs - Transaction logs.
   * @returns The rules update event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.fundingPolicy,
      eventName: 'PolicyRulesUpdated',
      logs: logs.filter((log) =>
        isAddressEqual(log.address, Addresses.fundingPolicy),
      ),
      strict: true,
    })
    if (!log) throw new Error('`PolicyRulesUpdated` event not found.')
    return log
  }
}

/**
 * Replaces funding policy rules and returns the updated commitment.
 *
 * @param client - Client.
 * @param parameters - Policy ID and replacement rules.
 * @returns The rules update event and transaction receipt.
 */
export async function setRulesSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: setRulesSync.Parameters<chain, account>,
): Promise<setRulesSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await setRules.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  if ((receipt as TransactionReceipt).status === 'pending')
    return { receipt } as never
  return { ...setRules.extractEvent(receipt.logs).args, receipt } as never
}

export namespace setRulesSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = setRules.Parameters<chain, account>
  export type ReturnValue = {
    policyId: bigint
    updater: Address
    rulesHash: Hex
    rules: { maxSlippageBps: number; routes: readonly FundingPolicy.Route[] }
    receipt: TransactionReceipt
  }
  export type ErrorType = BaseErrorType
}

/**
 * Replaces a funding policy's administrators without changing its rules hash.
 * The caller must be a current administrator.
 *
 * @param client - Client.
 * @param parameters - Policy ID and replacement administrators.
 * @returns The transaction hash.
 */
export async function setAdmins<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: setAdmins.Parameters<chain, account>,
): Promise<setAdmins.ReturnValue> {
  return setAdmins.inner(writeContract, client, parameters)
}

export namespace setAdmins {
  export type Args = {
    /** Replacement policy administrators. */
    admins: readonly Address[]
    /** Policy ID. */
    policyId: bigint
  }
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args
  export type ReturnValue = WriteContractReturnType
  export type ErrorType = BaseErrorType

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
    const { admins, policyId, ...rest } = parameters
    return action(client, {
      ...rest,
      ...call({ admins, policyId }),
    } as never) as never
  }

  /**
   * Defines the `setAdmins` call.
   *
   * @param args - Policy ID and replacement administrators.
   * @returns The contract call.
   */
  export function call(args: Args) {
    return defineCall({
      address: Addresses.fundingPolicy,
      abi: Abis.fundingPolicy,
      functionName: 'setAdmins',
      args: [args.policyId, args.admins],
    })
  }

  /**
   * Extracts `PolicyAdminsUpdated` from funding policy logs.
   *
   * @param logs - Transaction logs.
   * @returns The administrator update event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.fundingPolicy,
      eventName: 'PolicyAdminsUpdated',
      logs: logs.filter((log) =>
        isAddressEqual(log.address, Addresses.fundingPolicy),
      ),
      strict: true,
    })
    if (!log) throw new Error('`PolicyAdminsUpdated` event not found.')
    return log
  }
}

/**
 * Replaces funding policy administrators and returns the emitted update.
 *
 * @param client - Client.
 * @param parameters - Policy ID and replacement administrators.
 * @returns The administrator update event and transaction receipt.
 */
export async function setAdminsSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: setAdminsSync.Parameters<chain, account>,
): Promise<setAdminsSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await setAdmins.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  if ((receipt as TransactionReceipt).status === 'pending')
    return { receipt } as never
  return { ...setAdmins.extractEvent(receipt.logs).args, receipt } as never
}

export namespace setAdminsSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = setAdmins.Parameters<chain, account>
  export type ReturnValue = {
    policyId: bigint
    updater: Address
    admins: readonly Address[]
    receipt: TransactionReceipt
  }
  export type ErrorType = BaseErrorType
}
