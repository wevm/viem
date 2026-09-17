import type { Address } from 'abitype'
import { MultisigConfig } from 'ox/tempo'
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
import type { GetEventArgs } from '../../types/contract.js'
import type { Log } from '../../types/log.js'
import type { Compute } from '../../types/utils.js'
import { parseEventLogs } from '../../utils/abi/parseEventLogs.js'
import * as Abis from '../Abis.js'
import * as Addresses from '../Addresses.js'
import type { ReadParameters, WriteParameters } from '../internal/types.js'
import { defineCall } from '../internal/utils.js'
import type { TransactionReceipt } from '../Transaction.js'

/**
 * Gets the stored configuration commitment for a native multisig account.
 *
 * Returns zero for an uninitialized account. The full configuration must be retained by the caller.
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
 * const config = await Actions.multisig.getConfigCommitment(client, {
 *   account: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The current configuration commitment.
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
    /** Multisig account address. */
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
 * declare const factory: `0x${string}`
 * const account = Account.fromMultisig({ owners: [owner] }, { factory })
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
 *   current: account.config,
 *   threshold: 1,
 *   owners: [{ owner: owner.address, weight: 1 }],
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
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** Complete current configuration. */
    current: MultisigConfig.Config
    /** New multisig owners and their weights. */
    owners: MultisigConfig.Config['owners']
    /** New signature weight required to authorize the account. */
    threshold: MultisigConfig.Config['threshold']
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
    const { current, owners, threshold, ...rest } = parameters
    return (await action(client, {
      ...rest,
      ...updateConfig.call({ current, owners, threshold }),
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
   * declare const current: MultisigConfig.Config
   * const call = Actions.multisig.updateConfig.call({
   *   current,
   *   threshold: 1,
   *   owners: [{ owner: '0x...', weight: 1 }],
   * })
   * ```
   *
   * @param args - New multisig configuration.
   * @returns The call.
   */
  export function call(args: Args) {
    const config = MultisigConfig.from({ ...args, salt: args.current.salt })
    return defineCall({
      address: Addresses.nativeMultisig,
      abi: Abis.nativeMultisig,
      args: [args.current, config.threshold, config.owners],
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
 * import { Actions } from 'viem/tempo'
 *
 * declare const provider: EIP1193Provider
 *
 * const client = createWalletClient({
 *   account: '0x...',
 *   chain: tempo,
 *   transport: custom(provider),
 * })
 *
 * declare const current: import('viem/tempo').MultisigConfig.Config
 * const { receipt } = await Actions.multisig.updateConfigSync(client, {
 *   current,
 *   threshold: 1,
 *   owners: [{ owner: '0x...', weight: 1 }],
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
  const { args } = updateConfig.extractEvent(receipt.logs)
  return { ...args, receipt } as never
}

export namespace updateConfigSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = updateConfig.Parameters<chain, account>

  export type Args = updateConfig.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.nativeMultisig,
      'MultisigConfigUpdated',
      { IndexedOnly: false; Required: true }
    > & {
      receipt: TransactionReceipt
    }
  >

  export type ErrorType = updateConfig.ErrorType
}
