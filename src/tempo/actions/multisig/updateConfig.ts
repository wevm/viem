import type { Address, Errors } from 'ox'
import { AbiEvent } from 'ox'
import { MultisigConfig } from 'ox/tempo'
import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { write } from '../../../core/actions/contract/write.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import * as Abis from '../../Abis.js'
import { fromMultisig, type MultisigAccount } from '../../Account.js'
import * as Addresses from '../../Addresses.js'
import type { WriteParameters } from '../../internal/types.js'
import { defineCall, dispatchWrite } from '../../internal/utils.js'
import { getConfig } from './getConfig.js'

/**
 * Replaces the current configuration for a native multisig account.
 *
 * The transaction must be authorized directly by the account's current owner
 * quorum. Local owner-signing flows can include {@link updateConfig.call} in a
 * prepared transaction before collecting approvals.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { Actions as CoreActions } from 'viem'
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
 * const client = Client.create({
 *   chain: tempoLocalnet,
 *   transport: http(),
 * })
 *
 * await CoreActions.transaction.sendSync(client, {
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
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  parameters: updateConfig.Options,
): Promise<updateConfig.ReturnType> {
  return updateConfig.inner(write, client, parameters)
}

export namespace updateConfig {
  export type Options = WriteParameters & {
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
    parameters: Options,
  ): Promise<dispatchWrite.ReturnType<action>> {
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
        'source' in accountValue &&
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
      if (typeof accountValue === 'string')
        return accountValue as Address.Address
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
    return dispatchWrite(action, client, {
      ...rest,
      ...(resolvedAccount ? { account: resolvedAccount } : {}),
      ...updateConfig.call({ currentConfig, nextConfig }),
    })
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
  export function extractEvent(logs: readonly AbiEvent.extractLogs.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.nativeMultisig, logs, {
      eventName: 'MultisigConfigUpdated',
      strict: true,
    })
    if (!log) throw new Error('`MultisigConfigUpdated` event not found.')
    return log
  }
}
