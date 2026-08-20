import type { Address } from 'abitype'
import type * as Hex from 'ox/Hex'
import { MultisigConfig } from 'ox/tempo'
import type { Account } from '../../accounts/types.js'
import type { ReadContractReturnType } from '../../actions/public/readContract.js'
import { readContract } from '../../actions/public/readContract.js'
import { prepareTransactionRequest } from '../../actions/wallet/prepareTransactionRequest.js'
import {
  type SignTransactionParameters,
  type SignTransactionRequest,
  signTransaction,
} from '../../actions/wallet/signTransaction.js'
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
import * as TempoAccount from '../Account.js'
import * as Addresses from '../Addresses.js'
import type { ReadParameters, WriteParameters } from '../internal/types.js'
import { defineCall } from '../internal/utils.js'
import * as Operation from '../multisig/Operation.js'
import type * as Storage from '../Storage.js'
import * as Transaction from '../Transaction.js'

/**
 * Signs and submits an owner approval for a multisig transaction.
 *
 * The returned operation remains pending until the stored approvals reach the
 * configured threshold. The threshold-reaching approval broadcasts the final
 * transaction.
 *
 * @example
 * ```ts
 * const pending = await client.multisig.approveTransaction({
 *   account: owner_1,
 *   calls: [],
 *   multisig,
 * })
 * const success = await client.multisig.approveTransaction({
 *   ...pending.request,
 *   account: owner_2,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Transaction request, multisig identity, and owner account.
 * @returns The pending or successful multisig operation and prepared request.
 */
export async function approveTransaction<
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined = undefined,
  const request extends SignTransactionRequest<
    chain,
    chainOverride
  > = SignTransactionRequest<chain, chainOverride>,
>(
  client: Client<Transport, chain, account>,
  parameters: approveTransaction.Parameters<
    chain,
    account,
    chainOverride,
    request
  >,
): Promise<approveTransaction.ReturnValue<chain, chainOverride>> {
  const { request, serialized } = await prepareApproval(client, parameters)
  const value = await client.request({
    method: 'multisig_approveTransaction',
    params: [serialized],
  } as never)
  return { ...transactionOperation(value), request } as never
}

export declare namespace approveTransaction {
  /** Parameters for {@link approveTransaction}. */
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
    chainOverride extends Chain | undefined = Chain | undefined,
    request extends SignTransactionRequest<
      chain,
      chainOverride
    > = SignTransactionRequest<chain, chainOverride>,
  > =
    | SignTransactionParameters<chain, account, chainOverride, request>
    | WithMultisigAccount<
        SignTransactionParameters<chain, account, chainOverride, request>
      >

  /** Multisig identity accepted by an approval action. */
  export type Multisig =
    | Address
    | TempoAccount.MultisigAccount
    | MultisigConfig.Config

  /** Pending or successful multisig operation and its prepared request. */
  export type ReturnValue<
    chain extends Chain | undefined = Chain | undefined,
    chainOverride extends Chain | undefined = Chain | undefined,
  > = Operation.Transaction & {
    /** Prepared transaction request that subsequent owners must approve. */
    request: Request<chainOverride extends Chain ? chainOverride : chain>
  }

  /** Prepared multisig transaction request returned with an operation. */
  export type Request<chain extends Chain | undefined = Chain | undefined> =
    Transaction.TransactionRequestTempo & {
      /** Multisig account when it also signs the transaction locally. */
      account?: Account | Address | undefined
      /** Chain used to prepare the transaction. */
      chain?: chain | null | undefined
      /** Chain ID used to sign the transaction. */
      chainId: number
      /** Multisig sender address. */
      from: Address
      /** Prepared gas limit. */
      gas: bigint
      /** Prepared nonce. */
      nonce: number
    }
}

/**
 * Signs and synchronously submits an owner approval for a multisig transaction.
 *
 * The returned operation remains pending until the stored approvals reach the
 * configured threshold. The threshold-reaching approval waits for synchronous
 * transaction submission before returning a successful operation.
 *
 * @example
 * ```ts
 * const operation = await client.multisig.approveTransactionSync({
 *   account: owner,
 *   calls: [],
 *   multisig,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Transaction request, multisig identity, and owner account.
 * @returns The pending or successful multisig operation and prepared request.
 */
export async function approveTransactionSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
  const request extends SignTransactionRequest<chain, chainOverride>,
  chainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: approveTransactionSync.Parameters<
    chain,
    account,
    chainOverride,
    request
  >,
): Promise<approveTransactionSync.ReturnValue<chain, chainOverride>> {
  const { request, serialized } = await prepareApproval(client, parameters)
  const value = await client.request({
    method: 'multisig_approveTransactionSync',
    params: [serialized],
  } as never)
  return { ...transactionOperation(value), request } as never
}

export declare namespace approveTransactionSync {
  /** Parameters for {@link approveTransactionSync}. */
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
    chainOverride extends Chain | undefined = Chain | undefined,
    request extends SignTransactionRequest<
      chain,
      chainOverride
    > = SignTransactionRequest<chain, chainOverride>,
  > = approveTransaction.Parameters<chain, account, chainOverride, request>

  /** Pending or successful multisig operation and its prepared request. */
  export type ReturnValue<
    chain extends Chain | undefined = Chain | undefined,
    chainOverride extends Chain | undefined = Chain | undefined,
  > = approveTransaction.ReturnValue<chain, chainOverride>
}

/**
 * Checks whether an address is an initialized native multisig account.
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
 * const initialized = await Actions.multisig.isInitialized(client, {
 *   account: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns Whether the account is an initialized native multisig account.
 */
export async function isInitialized<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: isInitialized.Parameters,
): Promise<isInitialized.ReturnValue> {
  const { account, ...rest } = parameters
  return readContract(client, {
    ...rest,
    ...isInitialized.call({ account }),
  })
}

export namespace isInitialized {
  export type Parameters = ReadParameters & Args

  export type Args = {
    /** Account address. */
    account: Address
  }

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.nativeMultisig,
    'isMultisigAccount',
    never
  >

  /**
   * Defines a call to the precompile's `isMultisigAccount` function.
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
      functionName: 'isMultisigAccount',
    })
  }
}

/**
 * Gets the current configuration for an initialized native multisig account.
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
 * const config = await Actions.multisig.getConfig(client, {
 *   account: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The current version, threshold, and owners.
 */
export async function getConfig<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: getConfig.Parameters,
): Promise<getConfig.ReturnValue> {
  const { account, ...rest } = parameters
  return readContract(client, {
    ...rest,
    ...getConfig.call({ account }),
  })
}

export namespace getConfig {
  export type Parameters = ReadParameters & Args

  export type Args = {
    /** Initialized multisig account address. */
    account: Address
  }

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.nativeMultisig,
    'getConfig',
    never
  >

  /**
   * Defines a call to the `getConfig` function.
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
      functionName: 'getConfig',
    })
  }
}

/**
 * Gets a multisig operation.
 *
 * Reads the supplied local store when present. Otherwise, requests the operation
 * from the configured RPC endpoint.
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The multisig operation, or `null` when it is unknown.
 */
export async function getOperation(
  client: Client,
  parameters: getOperation.Parameters,
): Promise<getOperation.ReturnValue> {
  const { id, store } = parameters
  if (store) return await Operation.read(store, id)
  const value = await client.request({
    method: 'multisig_getOperation',
    params: [id],
  } as never)
  if (value === null) return null
  if (typeof value !== 'string') throw new Error('Invalid multisig operation.')
  return Operation.deserialize(value)
}

export namespace getOperation {
  export type Parameters = {
    /** Operation ID returned by a pending multisig submission. */
    id: Hex.Hex
    /** Local multisig store. */
    store?: Storage.Storage | undefined
  }

  export type ReturnValue = Operation.Operation | null
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
 * const account = Account.fromMultisig({ owners: [owner] })
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
    const { owners, threshold, ...rest } = parameters
    return (await action(client, {
      ...rest,
      ...updateConfig.call({ owners, threshold }),
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
   * import { Actions } from 'viem/tempo'
   *
   * const call = Actions.multisig.updateConfig.call({
   *   threshold: 1,
   *   owners: [{ owner: '0x...', weight: 1 }],
   * })
   * ```
   *
   * @param args - New multisig configuration.
   * @returns The call.
   */
  export function call(args: Args) {
    const config = MultisigConfig.from(args)
    return defineCall({
      address: Addresses.nativeMultisig,
      abi: Abis.nativeMultisig,
      args: [config.threshold, config.owners],
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
 * const { receipt } = await Actions.multisig.updateConfigSync(client, {
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
      receipt: Transaction.TransactionReceipt
    }
  >

  export type ErrorType = updateConfig.ErrorType
}

/** Deserializes a transaction operation returned by the multisig RPC. */
function transactionOperation(value: unknown): Operation.Transaction {
  if (typeof value !== 'string') throw new Error('Invalid multisig operation.')
  const operation = Operation.deserialize(value)
  if (operation.keyAuthorization)
    throw new Error('Expected a multisig transaction operation.')
  return operation
}

/** Prepares a transaction and serializes one owner's approval. */
async function prepareApproval(
  client: Client,
  parameters: {
    /** Owner account used to sign the prepared request. */
    account?: Account | Address | null | undefined
    /** Multisig account, config, or address. */
    multisig?: approveTransaction.Multisig | undefined
  },
) {
  const account = parameters.account ?? client.account
  const multisigAccount = (() => {
    if (
      typeof parameters.multisig === 'object' &&
      'source' in parameters.multisig &&
      parameters.multisig.source === 'multisig'
    )
      return parameters.multisig
    if (typeof account === 'object' && account.source === 'multisig')
      return account as TempoAccount.MultisigAccount
    if (parameters.multisig)
      return TempoAccount.fromMultisig(parameters.multisig)
    return undefined
  })()
  const multisig = multisigAccount
    ? (multisigAccount.config ?? multisigAccount.address)
    : undefined
  const prepared = await prepareTransactionRequest(client, {
    ...parameters,
    account: multisigAccount ?? account,
    multisig,
  } as never)
  const { account: _account, ...request_ } = prepared
  const request = {
    ...request_,
    from: request_.from!.toLowerCase() as Address,
  }
  const signature = await signTransaction(client, {
    ...request,
    account,
  } as never)
  const { chain: _chain, ...transaction } = request as typeof request &
    Transaction.TransactionSerializableTempo
  return {
    request,
    serialized: await serializeApproval({ signature, transaction }),
  }
}

/** Adds multisig-account input support without widening transaction requests. */
type WithMultisigAccount<parameters> = parameters extends unknown
  ? Omit<parameters, 'multisig'> & {
      /** Multisig account. */
      multisig: TempoAccount.MultisigAccount
    }
  : never

/** Serializes one approval or preserves an already-complete multisig envelope. */
// biome-ignore lint/correctness/noUnusedVariables: called by the approval actions above
async function serializeApproval(
  options: serializeApproval.Options,
): Promise<Hex.Hex> {
  const { signature, transaction } = options
  try {
    const envelope = Transaction.deserialize(
      signature as Transaction.TransactionSerializedTempo,
    )
    if (envelope.signature?.type === 'multisig') return signature
  } catch {
    // Individual owner approvals are not transaction envelopes.
  }
  return await Transaction.serialize({
    ...transaction,
    signatures: [...(transaction.signatures ?? []), signature],
  } as never)
}

declare namespace serializeApproval {
  /** Options for {@link serializeApproval}. */
  export type Options = {
    /** Serialized owner approval or complete multisig transaction. */
    signature: Hex.Hex
    /** Prepared Tempo transaction request. */
    transaction: Transaction.TransactionSerializableTempo
  }
}
