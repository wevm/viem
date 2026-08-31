import type { Address } from 'abitype'
import type * as Hex from 'ox/Hex'
import type * as RpcSchema from 'ox/RpcSchema'
import {
  MultisigConfig,
  MultisigOperation,
  type RpcSchemaTempo,
} from 'ox/tempo'
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
import type { Compute } from '../../types/utils.js'
import { parseEventLogs } from '../../utils/abi/parseEventLogs.js'
import * as Abis from '../Abis.js'
import { fromMultisig, type MultisigAccount } from '../Account.js'
import * as Addresses from '../Addresses.js'
import type { ReadParameters, WriteParameters } from '../internal/types.js'
import { defineCall } from '../internal/utils.js'
import type * as Transaction from '../Transaction.js'

/**
 * Gets the current cached config for a multisig account.
 *
 * The coordinator reads the account's current onchain commitment and returns
 * the matching config from its store. It returns `null` when the config is not
 * cached.
 *
 * @example
 * ```ts
 * const config = await client.multisig.getConfig({
 *   address: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The config, or `null` when it is unknown.
 */
export async function getConfig(
  client: Client,
  parameters: getConfig.Parameters,
): Promise<getConfig.ReturnValue> {
  const config = await client.request<{
    Method: 'multisig_getConfig'
    Parameters: [{ address: Address }]
    ReturnType: MultisigConfig.Rpc | null
  }>({
    method: 'multisig_getConfig',
    params: [{ address: parameters.address }],
  })
  return config ? MultisigConfig.fromRpc(config) : null
}

export declare namespace getConfig {
  /** Parameters for {@link getConfig}. */
  export type Parameters = {
    /** Multisig account address. */
    address: Address
  }

  /** Return value for {@link getConfig}. */
  export type ReturnValue = MultisigConfig.Config | null

  /** Error type for {@link getConfig}. */
  export type ErrorType = BaseErrorType
}

/**
 * Gets the current configuration commitment for a native multisig account.
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
 * const commitment = await Actions.multisig.getConfigCommitment(client, {
 *   account: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The current configuration commitment, or zero when no config has
 * been committed.
 */
export async function getConfigCommitment<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: getConfigCommitment.Parameters,
): Promise<getConfigCommitment.ReturnValue> {
  const { account, ...rest } = parameters
  return readContract(client, {
    ...rest,
    ...getConfigCommitment.call({ account }),
  })
}

export namespace getConfigCommitment {
  export type Parameters = ReadParameters & Args

  export type Args = {
    /** Initialized multisig account address. */
    account: Address
  }

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.nativeMultisig,
    'getConfigCommitment',
    never
  >

  /**
   * Defines a call to the `getConfigCommitment` function.
   *
   * Can be passed to [`multicall`](https://viem.sh/docs/contract/multicall).
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    return defineCall({
      address: Addresses.nativeMultisig,
      abi: Abis.nativeMultisig,
      args: [args.account],
      functionName: 'getConfigCommitment',
    })
  }
}

/**
 * Gets a coordinated multisig operation by its hash.
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The operation, or `null` when it is unknown.
 */
export async function getOperation(
  client: Client,
  parameters: getOperation.Parameters,
): Promise<getOperation.ReturnValue> {
  type multisig_getOperation = Extract<
    RpcSchema.ToViem<RpcSchemaTempo.Multisig>[number],
    { Method: 'multisig_getOperation' }
  >
  const operation = await client.request<multisig_getOperation>({
    method: 'multisig_getOperation',
    params: [parameters.hash],
  })
  return operation ? MultisigOperation.fromRpc(operation) : null
}

export declare namespace getOperation {
  /** Parameters for {@link getOperation}. */
  export type Parameters = {
    /** Multisig operation hash. */
    hash: Hex.Hex
  }

  /** Return value for {@link getOperation}. */
  export type ReturnValue = MultisigOperation.Operation | null

  /** Error type for {@link getOperation}. */
  export type ErrorType = BaseErrorType
}

/**
 * Replaces the current configuration for a native multisig account.
 *
 * The transaction must be authorized directly by the account's current owner
 * quorum. Local owner-signing flows can include {@link updateConfig.call} in a
 * prepared transaction before collecting approvals.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { sendTransactionSync } from 'viem/actions'
 * import { tempoLocalnet } from 'viem/chains'
 * import { Account, Actions } from 'viem/tempo'
 *
 * const owner = Account.fromSecp256k1(
 *   '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
 * )
 * const account = Account.fromMultisig({
 *   address: 'infer',
 *   owners: [owner],
 * })
 * const client = createClient({
 *   chain: tempoLocalnet,
 *   transport: http(),
 * })
 *
 * await sendTransactionSync(client, {
 *   account,
 *   to: account.address,
 * })
 *
 * const hash = await Actions.multisig.updateConfig(client, {
 *   account,
 *   nextConfig: {
 *     owners: [{ owner: owner.address, weight: 1 }],
 *     threshold: 1,
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function updateConfig<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: updateConfig.Parameters<chain, account>,
): Promise<updateConfig.ReturnValue> {
  return updateConfig.inner(writeContract, client, parameters)
}

export namespace updateConfig {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & {
    /** Complete current config. Inferred from the account or coordinator when omitted. */
    currentConfig?: MultisigConfig.Config | undefined
    /** Replacement owners and threshold. */
    nextConfig: Pick<MultisigConfig.Config, 'owners' | 'threshold'>
  }

  export type Args = {
    /** Complete current config. */
    currentConfig: MultisigConfig.Config
    /** Replacement owners and threshold. */
    nextConfig: Pick<MultisigConfig.Config, 'owners' | 'threshold'>
  }

  export type ReturnValue = WriteContractReturnType

  // TODO: exhaustive error type
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
    const {
      account: account_,
      currentConfig: currentConfig_,
      nextConfig,
      ...rest
    } = parameters
    const accountValue = account_ ?? client.account
    const account = (() => {
      if (
        typeof accountValue === 'object' &&
        accountValue.source === 'multisig'
      )
        return accountValue as MultisigAccount
      return undefined
    })()
    const config = (() => {
      if (currentConfig_) return currentConfig_
      if (account?.config) return account.config
      return undefined
    })()
    const address = (() => {
      if (account) return account.address
      if (typeof accountValue === 'string') return accountValue as Address
      if (accountValue) return accountValue.address
      return undefined
    })()
    const currentConfig = await (async () => {
      if (config) return MultisigConfig.from(config)
      if (!address)
        throw new Error(
          'A multisig account address or current config is required.',
        )
      const cachedConfig = await getConfig(client, { address })
      if (!cachedConfig)
        throw new Error(
          `No current multisig config is cached for account ${address}. Provide the current config.`,
        )
      return cachedConfig
    })()
    const resolvedAccount = (() => {
      if (account) return { ...account, config: currentConfig }
      if (typeof accountValue === 'object') return accountValue
      if (address) return fromMultisig({ address, ...currentConfig })
      return undefined
    })()
    return (await action(client, {
      ...rest,
      ...(resolvedAccount ? { account: resolvedAccount } : {}),
      ...updateConfig.call({ currentConfig, nextConfig }),
    } as never)) as never
  }

  /**
   * Defines a call to the `updateConfig` function.
   *
   * Can be passed as a parameter to:
   * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate gas
   * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the update
   * - [`sendCalls`](https://viem.sh/docs/actions/wallet/sendCalls): include the update in a call batch
   *
   * @example
   * ```ts
   * import { Actions, type MultisigConfig } from 'viem/tempo'
   *
   * declare const currentConfig: MultisigConfig.Config
   *
   * const call = Actions.multisig.updateConfig.call({
   *   currentConfig,
   *   nextConfig: {
   *     owners: [{ owner: '0x...', weight: 1 }],
   *     threshold: 1,
   *   },
   * })
   * ```
   *
   * @param args - Current and replacement multisig configurations.
   * @returns The call.
   */
  export function call(args: Args) {
    const currentConfig = MultisigConfig.from(args.currentConfig)
    const nextConfig = MultisigConfig.from({
      owners: args.nextConfig.owners,
      salt: currentConfig.salt,
      threshold: args.nextConfig.threshold,
      version: currentConfig.version + 1n,
    })
    return defineCall({
      address: Addresses.nativeMultisig,
      abi: Abis.nativeMultisig,
      args: [currentConfig, nextConfig.threshold, nextConfig.owners],
      functionName: 'updateConfig',
    })
  }

  /**
   * Extracts the `MultisigConfigUpdated` event from logs.
   *
   * @param logs - Transaction logs.
   * @returns The configuration update event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.nativeMultisig,
      logs,
      eventName: 'MultisigConfigUpdated',
      strict: true,
    })
    if (!log) throw new Error('`MultisigConfigUpdated` event not found.')
    return log
  }
}

/**
 * Replaces a native multisig configuration and waits for confirmation.
 *
 * @example
 * ```ts
 * import { createWalletClient, custom, type EIP1193Provider } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions, type MultisigConfig } from 'viem/tempo'
 *
 * declare const provider: EIP1193Provider
 * declare const currentConfig: MultisigConfig.Config
 *
 * const client = createWalletClient({
 *   account: '0x...',
 *   chain: tempo,
 *   transport: custom(provider),
 * })
 *
 * const { receipt } = await Actions.multisig.updateConfigSync(client, {
 *   currentConfig,
 *   nextConfig: {
 *     owners: [{ owner: '0x...', weight: 1 }],
 *     threshold: 1,
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The updated configuration event and transaction receipt.
 */
export async function updateConfigSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: updateConfigSync.Parameters<chain, account>,
): Promise<updateConfigSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await updateConfig.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  if ((receipt as Transaction.TransactionReceipt).status === 'pending')
    return { receipt } as never
  const { args } = updateConfig.extractEvent(receipt.logs)
  return {
    account: args.account,
    config: MultisigConfig.from({
      owners: args.owners,
      salt: args.salt,
      threshold: args.threshold,
      version: args.version,
    }),
    receipt,
  } as never
}

export namespace updateConfigSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = updateConfig.Parameters<chain, account>

  export type Args = updateConfig.Args

  export type ReturnValue = Compute<{
    account: Address
    config: MultisigConfig.Config
    receipt: Transaction.TransactionReceipt
  }>

  export type ErrorType = updateConfig.ErrorType
}
