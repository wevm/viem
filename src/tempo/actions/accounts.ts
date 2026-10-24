import type { Address } from 'abitype'
import type * as Hex from 'ox/Hex'
import type * as RpcSchema from 'ox/RpcSchema'
import { AccountConfig, AccountOperation, type RpcSchemaTempo } from 'ox/tempo'
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
import type { Compute, OneOf, UnionOmit } from '../../types/utils.js'
import { parseEventLogs } from '../../utils/abi/parseEventLogs.js'
import * as Abis from '../Abis.js'
import { type ConfigurableAccount, fromConfig } from '../Account.js'
import * as Addresses from '../Addresses.js'
import type * as Errors from '../errors.js'
import { withExecutionError } from '../internal/errors.js'
import type { ReadParameters, WriteParameters } from '../internal/types.js'
import { defineCall } from '../internal/utils.js'
import type * as Transaction from '../Transaction.js'

/**
 * Derives a configurable account address from an initial config with the
 * configurable account precompile.
 *
 * The precompile validates the config and derives the address with the chain's
 * recovery factory. To derive the address locally, use
 * `AccountConfig.getAddress` or `Account.fromConfig({ address: 'infer' })`.
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
 * const address = await Actions.accounts.deriveAccount(client, {
 *   owners: [{ owner: '0x...', weight: 1 }],
 *   threshold: 1,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The configurable account address.
 */
export async function deriveAccount<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: deriveAccount.Parameters,
): Promise<deriveAccount.ReturnValue> {
  const { owners, salt, threshold, ...rest } = parameters
  return withExecutionError(readContract)(client, {
    ...rest,
    ...deriveAccount.call({ owners, salt, threshold }),
  })
}

export namespace deriveAccount {
  export type Parameters = ReadParameters & Args

  export type Args = {
    /** Weighted owners. Normalized into canonical address order. */
    owners: AccountConfig.Config['owners']
    /** Caller-chosen 32-byte salt. Defaults to the zero salt. */
    salt?: Hex.Hex | undefined
    /** Minimum total owner weight required for authorization. */
    threshold: number
  }

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.configurableAccount,
    'deriveAccount',
    never
  >

  /**
   * Defines a call to the `deriveAccount` function.
   *
   * Can be passed to [`multicall`](https://viem.sh/docs/contract/multicall).
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { owners, salt, threshold } = AccountConfig.from(args)
    return defineCall({
      address: Addresses.configurableAccount,
      abi: Abis.configurableAccount,
      args: [salt, threshold, owners],
      functionName: 'deriveAccount',
    })
  }

  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType
}

/**
 * Gets the current cached config for a configurable account.
 *
 * The coordinator reads the account's current onchain commitment and returns
 * the matching config from its store. It returns `null` when the config is not
 * cached.
 *
 * @example
 * ```ts
 * const config = await client.accounts.getConfig({
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
    Method: 'account_getConfig'
    Parameters: [{ address: Address }]
    ReturnType: AccountConfig.Rpc | null
  }>({
    method: 'account_getConfig',
    params: [{ address: parameters.address }],
  })
  return config ? AccountConfig.fromRpc(config) : null
}

export declare namespace getConfig {
  /** Parameters for {@link getConfig}. */
  export type Parameters = {
    /** Configurable account address. */
    address: Address
  }

  /** Return value for {@link getConfig}. */
  export type ReturnValue = AccountConfig.Config | null

  /** Error type for {@link getConfig}. */
  export type ErrorType = BaseErrorType
}

/**
 * Gets the current configuration commitment for a configurable account.
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
 * const commitment = await Actions.accounts.getConfigCommitment(client, {
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
  return withExecutionError(readContract)(client, {
    ...rest,
    ...getConfigCommitment.call({ account }),
  })
}

export namespace getConfigCommitment {
  export type Parameters = ReadParameters & Args

  export type Args = {
    /** Initialized configurable account address. */
    account: Address
  }

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.configurableAccount,
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
      address: Addresses.configurableAccount,
      abi: Abis.configurableAccount,
      args: [args.account],
      functionName: 'getConfigCommitment',
    })
  }

  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType
}

/**
 * Gets a coordinated account operation by its hash.
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The operation, or `null` when it is unknown.
 */
export async function getOperation(
  client: Client,
  parameters: getOperation.Parameters,
): Promise<getOperation.ReturnValue> {
  type account_getOperation = Extract<
    RpcSchema.ToViem<RpcSchemaTempo.Account>[number],
    { Method: 'account_getOperation' }
  >
  const operation = await client.request<account_getOperation>({
    method: 'account_getOperation',
    params: [parameters.hash],
  })
  return operation ? AccountOperation.fromRpc(operation) : null
}

export declare namespace getOperation {
  /** Parameters for {@link getOperation}. */
  export type Parameters = {
    /** Account operation hash. */
    hash: Hex.Hex
  }

  /** Return value for {@link getOperation}. */
  export type ReturnValue = AccountOperation.Operation | null

  /** Error type for {@link getOperation}. */
  export type ErrorType = BaseErrorType
}

/**
 * Replaces the current configuration for a configurable account.
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
 * const account = Account.fromConfig({
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
 * const hash = await Actions.accounts.updateConfig(client, {
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
    currentConfig?: AccountConfig.Config | undefined
    /** Replacement owners and threshold. */
    nextConfig: Pick<AccountConfig.Config, 'owners' | 'threshold'>
  }

  export type Args = {
    /** Complete current config. */
    currentConfig: AccountConfig.Config
    /** Replacement owners and threshold. */
    nextConfig: Pick<AccountConfig.Config, 'owners' | 'threshold'>
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
      account: account_,
      currentConfig: currentConfig_,
      nextConfig,
      ...rest
    } = parameters
    const accountValue = account_ ?? client.account
    const account = (() => {
      if (
        typeof accountValue === 'object' &&
        accountValue.source === 'configurable'
      )
        return accountValue as ConfigurableAccount
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
      if (config) return AccountConfig.from(config)
      if (!address)
        throw new Error(
          'A configurable account address or current config is required.',
        )
      const cachedConfig = await getConfig(client, { address })
      if (!cachedConfig)
        throw new Error(
          `No current account config is cached for account ${address}. Provide the current config.`,
        )
      return cachedConfig
    })()
    const resolvedAccount = (() => {
      if (account) return { ...account, config: currentConfig }
      if (typeof accountValue === 'object') return accountValue
      if (address) return fromConfig({ address, ...currentConfig })
      return undefined
    })()
    return (await withExecutionError(action)(client, {
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
   * import { Actions, type AccountConfig } from 'viem/tempo'
   *
   * declare const currentConfig: AccountConfig.Config
   *
   * const call = Actions.accounts.updateConfig.call({
   *   currentConfig,
   *   nextConfig: {
   *     owners: [{ owner: '0x...', weight: 1 }],
   *     threshold: 1,
   *   },
   * })
   * ```
   *
   * @param args - Current and replacement account configurations.
   * @returns The call.
   */
  export function call(args: Args) {
    const currentConfig = AccountConfig.from(args.currentConfig)
    const nextConfig = AccountConfig.update(currentConfig, args.nextConfig)
    return defineCall({
      address: Addresses.configurableAccount,
      abi: Abis.configurableAccount,
      args: [currentConfig, nextConfig.threshold, nextConfig.owners],
      functionName: 'updateConfig',
    })
  }

  /**
   * Extracts the `ConfigurableAccountConfigUpdated` event from logs.
   *
   * @param logs - Transaction logs.
   * @returns The configuration update event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.configurableAccount,
      logs,
      eventName: 'ConfigurableAccountConfigUpdated',
      strict: true,
    })
    if (!log)
      throw new Error('`ConfigurableAccountConfigUpdated` event not found.')
    return log
  }
}

/**
 * Replaces a configurable account configuration and waits for confirmation.
 *
 * @example
 * ```ts
 * import { createWalletClient, custom, type EIP1193Provider } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions, type AccountConfig } from 'viem/tempo'
 *
 * declare const provider: EIP1193Provider
 * declare const currentConfig: AccountConfig.Config
 *
 * const client = createWalletClient({
 *   account: '0x...',
 *   chain: tempo,
 *   transport: custom(provider),
 * })
 *
 * const { receipt } = await Actions.accounts.updateConfigSync(client, {
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
    config: AccountConfig.from({
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
    config: AccountConfig.Config
    receipt: Transaction.TransactionReceipt
  }>

  export type ErrorType = updateConfig.ErrorType
}

/**
 * Upgrades an existing account to a configurable account in place
 * ([TIP-1113](https://tips.sh/1113)).
 *
 * The account keeps its address and installs `owners` and `threshold`. The
 * root key must sign the upgrade, which is sent as the transaction's only
 * call. After the upgrade, the root key can no longer sign for the account.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempoLocalnet } from 'viem/chains'
 * import { Account, Actions } from 'viem/tempo'
 *
 * const root = Account.fromSecp256k1('0x...')
 * const client = createClient({
 *   chain: tempoLocalnet,
 *   transport: http(),
 * })
 *
 * const hash = await Actions.accounts.upgrade(client, {
 *   account: root,
 *   owners: [{ owner: '0x...', weight: 1 }],
 *   threshold: 1,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function upgrade<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: upgrade.Parameters<chain, account>,
): Promise<upgrade.ReturnValue> {
  return upgrade.inner(writeContract, client, parameters)
}

export namespace upgrade {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = UnionOmit<WriteParameters<chain, account>, 'keyAuthorization' | 'owner'> &
    Args

  export type Args = Pick<AccountConfig.Config, 'owners' | 'threshold'>

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
    const { owners, threshold, ...rest } = parameters
    for (const key of [
      'authorizationList',
      'calls',
      'data',
      'keyAuthorization',
      'to',
    ])
      if ((rest as Record<string, unknown>)[key] !== undefined)
        throw new Error(
          `\`${key}\` is not supported: the upgrade must be the only call, without authorizations.`,
        )
    const account = rest.account ?? client.account
    if (typeof account === 'object') {
      if (account.source === 'configurable')
        throw new Error('The account is already a configurable account.')
      if (account.source === 'accessKey')
        throw new Error(
          'The root key must sign the upgrade, not an access key.',
        )
    }
    // Always send a Tempo envelope, so relays recognize and cache the upgrade.
    return (await withExecutionError(action)(client, {
      ...rest,
      ...upgrade.call({ owners, threshold }),
      type: 'tempo',
    } as never)) as never
  }

  /**
   * Defines a call to the `upgradeAccount` function.
   *
   * The call must be the only call in a transaction signed by the account's
   * root key.
   *
   * @example
   * ```ts
   * import { Actions } from 'viem/tempo'
   *
   * const call = Actions.accounts.upgrade.call({
   *   owners: [{ owner: '0x...', weight: 1 }],
   *   threshold: 1,
   * })
   * ```
   *
   * @param args - Owners and threshold to install.
   * @returns The call.
   */
  export function call(args: Args) {
    const { owners, threshold } = AccountConfig.from(args)
    return defineCall({
      address: Addresses.configurableAccount,
      abi: Abis.configurableAccount,
      args: [threshold, owners],
      functionName: 'upgradeAccount',
    })
  }

  /**
   * Extracts the `AccountUpgraded` event from logs.
   *
   * @param logs - Transaction logs.
   * @returns The account upgrade event.
   */
  export function extractEvent(logs: Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.configurableAccount,
      logs,
      eventName: 'AccountUpgraded',
      strict: true,
    })
    if (!log) throw new Error('`AccountUpgraded` event not found.')
    return log
  }
}

/**
 * Upgrades an existing account to a configurable account in place
 * ([TIP-1113](https://tips.sh/1113)) and waits for confirmation.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempoLocalnet } from 'viem/chains'
 * import { Account, Actions } from 'viem/tempo'
 *
 * const root = Account.fromSecp256k1('0x...')
 * const client = createClient({
 *   chain: tempoLocalnet,
 *   transport: http(),
 * })
 *
 * const { config } = await Actions.accounts.upgradeSync(client, {
 *   account: root,
 *   owners: [{ owner: '0x...', weight: 1 }],
 *   threshold: 1,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The installed configuration, its commitment, and the transaction receipt.
 */
export async function upgradeSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: upgradeSync.Parameters<chain, account>,
): Promise<upgradeSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await upgrade.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  // Pending and (with `throwOnReceiptRevert: false`) reverted receipts carry no upgrade event.
  if ((receipt as Transaction.TransactionReceipt).status !== 'success')
    return { receipt } as never
  const { args } = upgrade.extractEvent(receipt.logs)
  return {
    account: args.account,
    commitment: args.commitment,
    config: AccountConfig.from({
      owners: args.owners,
      salt: args.salt,
      threshold: args.threshold,
      version: 1n,
    }),
    receipt,
  } as never
}

export namespace upgradeSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = upgrade.Parameters<chain, account>

  export type Args = upgrade.Args

  /** Pending and reverted receipts carry no installed configuration. */
  export type ReturnValue = OneOf<
    | {
        account: Address
        commitment: Hex.Hex
        config: AccountConfig.Config
        receipt: Transaction.TransactionReceipt
      }
    | { receipt: Transaction.TransactionReceipt }
  >

  export type ErrorType = upgrade.ErrorType
}

/**
 * Verifies a configurable account signature against the account's current
 * configuration with the signature verifier precompile.
 *
 * Returns `false` when the signature is for another account or a config that
 * is not the account's current config. Throws when the signature is malformed
 * or its approvals do not reach quorum.
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
 * const valid = await Actions.accounts.verifyHash(client, {
 *   account: '0x...',
 *   hash: '0x...',
 *   signature: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns Whether the signature is valid for the account.
 */
export async function verifyHash<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: verifyHash.Parameters,
): Promise<verifyHash.ReturnValue> {
  const { account, hash, signature, ...rest } = parameters
  return withExecutionError(readContract)(client, {
    ...rest,
    ...verifyHash.call({ account, hash, signature }),
  })
}

export namespace verifyHash {
  export type Parameters = ReadParameters & Args

  export type Args = {
    /** Configurable account address the signature is expected to belong to. */
    account: Address
    /** Original message hash that was signed. */
    hash: Hex.Hex
    /** Configurable account signature envelope. */
    signature: Hex.Hex
  }

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.signatureVerifier,
    'verifyConfigurableAccount',
    never
  >

  /**
   * Defines a call to the `verifyConfigurableAccount` function on the
   * signature verifier precompile.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { account, hash, signature } = args
    return defineCall({
      address: Addresses.signatureVerifier,
      abi: Abis.signatureVerifier,
      args: [account, hash, signature],
      functionName: 'verifyConfigurableAccount',
    })
  }

  export type ErrorType = Errors.ExecutionErrorType | BaseErrorType
}
