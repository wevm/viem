import type { Abi, Address } from 'abitype'
import type { KeyAuthorization } from 'ox/tempo'
import type { Account } from '../../accounts/types.js'
import { parseAccount } from '../../accounts/utils/parseAccount.js'
import { formatCallsStatus } from '../../actions/wallet/getCallsStatus.js'
import type {
  SendCallsErrorType,
  SendCallsParameters,
} from '../../actions/wallet/sendCalls.js'
import type { SendCallsSyncReturnType } from '../../actions/wallet/sendCallsSync.js'
import {
  type SendTransactionSyncErrorType,
  type SendTransactionSyncParameters,
  type SendTransactionSyncRequest,
  type SendTransactionSyncReturnType,
  sendTransactionSync as sendTransactionSync_core,
} from '../../actions/wallet/sendTransactionSync.js'
import { prepareSendCallsRequest } from '../../actions/wallet/utils/prepareSendCallsRequest.js'
import { prepareSendTransactionRequest } from '../../actions/wallet/utils/prepareSendTransactionRequest.js'
import { prepareWriteContractRequest } from '../../actions/wallet/utils/prepareWriteContractRequest.js'
import type {
  WriteContractSyncErrorType,
  WriteContractSyncParameters,
  WriteContractSyncReturnType,
} from '../../actions/wallet/writeContractSync.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { AccountNotFoundError } from '../../errors/account.js'
import type { BaseError } from '../../errors/base.js'
import { BundleFailedError } from '../../errors/calls.js'
import { TransactionReceiptRevertedError } from '../../errors/transaction.js'
import type { ErrorType as CoreErrorType } from '../../errors/utils.js'
import type { Chain } from '../../types/chain.js'
import type {
  ContractFunctionArgs,
  ContractFunctionName,
} from '../../types/contract.js'
import type { WalletGetCallsStatusReturnType } from '../../types/eip1193.js'
import type { RpcTransactionReceipt } from '../../types/rpc.js'
import type { OneOf, UnionOmit } from '../../types/utils.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import { getContractError } from '../../utils/errors/getContractError.js'
import { getTransactionError } from '../../utils/errors/getTransactionError.js'
import type { FormattedTransactionReceipt } from '../../utils/formatters/transactionReceipt.js'
import { formatTransactionReceipt } from '../../utils/formatters/transactionReceipt.js'
import { resolveAccessKey } from '../Account.js'
import {
  formatWalletAuthorizeAccessKeyParameters,
  formatWalletKeyAuthorizationResponse,
  type WalletAuthorizeAccessKeyParameters,
  type WalletAuthorizeAccessKeyRpcParameters,
} from '../internal/walletAccessKey.js'
import type { TransactionReceipt } from '../Transaction.js'

function formatReceipt<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  receipt: RpcTransactionReceipt | FormattedTransactionReceipt<chain>,
  chain_?: Chain | null | undefined,
): FormattedTransactionReceipt<chain> {
  if (
    typeof (receipt as FormattedTransactionReceipt<chain>).blockNumber ===
    'bigint'
  )
    return receipt as FormattedTransactionReceipt<chain>
  const format =
    (chain_ || client.chain)?.formatters?.transactionReceipt?.format ||
    formatTransactionReceipt
  return format(
    receipt as RpcTransactionReceipt,
  ) as FormattedTransactionReceipt<chain>
}

function resolveWalletAddress<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  address?: Address | undefined,
) {
  if (address) return address
  if (!client.account)
    throw new AccountNotFoundError({
      docsPath: '/docs/tempo/actions/wallet/revokeAccessKey',
    })
  return parseAccount(client.account).address
}

function resolveAccessKeyAddress(
  accessKey: Address | resolveAccessKey.Parameters,
) {
  if (typeof accessKey === 'string') return accessKey
  return resolveAccessKey(accessKey).accessKeyAddress
}

/**
 * Creates, signs, and sends a new Tempo transaction synchronously.
 *
 * @example
 * ```ts
 * import { createWalletClient, custom } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createWalletClient({
 *   account: '0x...',
 *   chain: tempo,
 *   transport: custom(window.ethereum),
 * })
 *
 * const receipt = await Actions.wallet.sendTransactionSync(client, {
 *   to: '0x...',
 *   feeToken: '0x20c0000000000000000000000000000000000001',
 *   type: 'tempo',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt.
 */
export async function sendTransactionSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
  const request extends SendTransactionSyncRequest<chain, chainOverride>,
  chainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: sendTransactionSync.Parameters<
    chain,
    account,
    chainOverride,
    request
  >,
): Promise<sendTransactionSync.ReturnValue<chain>> {
  const throwOnReceiptRevert = parameters.throwOnReceiptRevert ?? true
  const parameters_ = { ...parameters, throwOnReceiptRevert }
  const account_ =
    parameters.account === null ? null : (parameters.account ?? client.account)
  if (typeof account_ === 'undefined')
    return sendTransactionSync_core(client, parameters_ as never) as never

  const account = account_ ? parseAccount(account_) : null
  if (account && account.type !== 'json-rpc')
    return sendTransactionSync_core(client, parameters_ as never) as never

  try {
    const { request } = await prepareSendTransactionRequest(
      client,
      parameters_ as never,
      { docsPath: '/docs/tempo/actions/wallet/sendTransactionSync' },
    )
    const receipt = await client.request<{
      Method: 'eth_sendTransactionSync'
      Parameters:
        | [transaction: typeof request]
        | [transaction: typeof request, timeout: number]
      ReturnType: RpcTransactionReceipt
    }>(
      {
        method: 'eth_sendTransactionSync',
        params:
          typeof parameters_.timeout === 'number'
            ? [request, parameters_.timeout]
            : [request],
      },
      { retryCount: 0 },
    )
    const formatted = formatReceipt(client, receipt, parameters_.chain)
    if (formatted.status === 'reverted' && throwOnReceiptRevert)
      throw new TransactionReceiptRevertedError({ receipt: formatted })
    return formatted as never
  } catch (err) {
    throw getTransactionError(err as BaseError, {
      ...parameters_,
      account,
      chain: parameters_.chain || undefined,
    })
  }
}

export declare namespace sendTransactionSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
    chainOverride extends Chain | undefined = Chain | undefined,
    request extends SendTransactionSyncRequest<
      chain,
      chainOverride
    > = SendTransactionSyncRequest<chain, chainOverride>,
  > = SendTransactionSyncParameters<chain, account, chainOverride, request>

  export type ReturnValue<chain extends Chain | undefined = Chain | undefined> =
    SendTransactionSyncReturnType<chain>

  export type ErrorType = SendTransactionSyncErrorType
}

/**
 * Executes a write function on a contract using Tempo's sync transaction RPC.
 *
 * @example
 * ```ts
 * import { parseAbi, createWalletClient, custom } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createWalletClient({
 *   account: '0x...',
 *   chain: tempo,
 *   transport: custom(window.ethereum),
 * })
 *
 * const receipt = await Actions.wallet.writeContractSync(client, {
 *   address: '0x...',
 *   abi: parseAbi(['function mint(uint256 tokenId)']),
 *   args: [1n],
 *   functionName: 'mint',
 *   feeToken: '0x20c0000000000000000000000000000000000001',
 *   type: 'tempo',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt.
 */
export async function writeContractSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
  const abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
  args extends ContractFunctionArgs<
    abi,
    'nonpayable' | 'payable',
    functionName
  >,
  chainOverride extends Chain | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: writeContractSync.Parameters<
    abi,
    functionName,
    args,
    chain,
    account,
    chainOverride
  >,
): Promise<writeContractSync.ReturnValue<chain>> {
  const { abi, account, address, args, functionName, request } =
    prepareWriteContractRequest(client, parameters as never, {
      docsPath: '/docs/tempo/actions/wallet/writeContractSync',
    })

  try {
    return (await sendTransactionSync(client, request as never)) as never
  } catch (error) {
    throw getContractError(error as BaseError, {
      abi,
      address,
      args,
      docsPath: '/docs/tempo/actions/wallet/writeContractSync',
      functionName,
      sender: account?.address,
    })
  }
}

export declare namespace writeContractSync {
  export type Parameters<
    abi extends Abi | readonly unknown[] = Abi,
    functionName extends ContractFunctionName<
      abi,
      'nonpayable' | 'payable'
    > = ContractFunctionName<abi, 'nonpayable' | 'payable'>,
    args extends ContractFunctionArgs<
      abi,
      'nonpayable' | 'payable',
      functionName
    > = ContractFunctionArgs<abi, 'nonpayable' | 'payable', functionName>,
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
    chainOverride extends Chain | undefined = Chain | undefined,
  > = WriteContractSyncParameters<
    abi,
    functionName,
    args,
    chain,
    account,
    chainOverride
  >

  export type ReturnValue<chain extends Chain | undefined = Chain | undefined> =
    WriteContractSyncReturnType<chain>

  export type ErrorType = WriteContractSyncErrorType
}

/**
 * Requests the connected wallet to send a batch of calls synchronously.
 *
 * @example
 * ```ts
 * import { createWalletClient, custom } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createWalletClient({
 *   account: '0x...',
 *   chain: tempo,
 *   transport: custom(window.ethereum),
 * })
 *
 * const status = await Actions.wallet.sendCallsSync(client, {
 *   calls: [{ to: '0x...', value: 1n }],
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns Calls status.
 */
export async function sendCallsSync<
  const calls extends readonly unknown[],
  chain extends Chain | undefined,
  account extends Account | undefined = undefined,
  chainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: sendCallsSync.Parameters<chain, account, chainOverride, calls>,
): Promise<sendCallsSync.ReturnValue> {
  const { request } = prepareSendCallsRequest(client, parameters)
  const response = await client.request<{
    Method: 'wallet_sendCallsSync'
    Parameters:
      | [request: typeof request]
      | [request: typeof request, timeout: number]
    ReturnType: WalletGetCallsStatusReturnType
  }>(
    {
      method: 'wallet_sendCallsSync',
      params:
        typeof parameters.timeout === 'number'
          ? [request, parameters.timeout]
          : [request],
    },
    { retryCount: 0 },
  )
  const status = formatCallsStatus(response)
  if (parameters.throwOnFailure && status.status === 'failure')
    throw new BundleFailedError(status)
  return status
}

export declare namespace sendCallsSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
    chainOverride extends Chain | undefined = Chain | undefined,
    calls extends readonly unknown[] = readonly unknown[],
  > = UnionOmit<
    SendCallsParameters<chain, account, chainOverride, calls>,
    'experimental_fallback' | 'experimental_fallbackDelay'
  > & {
    /** Whether to throw an error if the call bundle failed. */
    throwOnFailure?: boolean | undefined
    /** Timeout (ms) to pass to `wallet_sendCallsSync`. */
    timeout?: number | undefined
  }

  export type ReturnValue = SendCallsSyncReturnType

  export type ErrorType = SendCallsErrorType
}

/**
 * Authorizes an access key through the connected wallet.
 *
 * @example
 * ```ts
 * import { createWalletClient, custom } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createWalletClient({
 *   chain: tempo,
 *   transport: custom(window.ethereum),
 * })
 *
 * const { keyAuthorization, rootAddress } =
 *   await Actions.wallet.authorizeAccessKey(client, {
 *     accessKey: { address: '0x...', type: 'p256' },
 *     expiry: Math.floor(Date.now() / 1000) + 86_400,
 *     limits: [
 *       {
 *         token: '0x20c0000000000000000000000000000000000001',
 *         limit: 100_000_000n,
 *       },
 *     ],
 *     scopes: [{ address: '0x20c0000000000000000000000000000000000001' }],
 *   })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The signed key authorization and root account address.
 */
export async function authorizeAccessKey<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: authorizeAccessKey.Parameters,
): Promise<authorizeAccessKey.ReturnValue> {
  const rpcParameters = formatWalletAuthorizeAccessKeyParameters(parameters, {
    defaultChainId: client.chain?.id,
    includeShowDeposit: true,
  }) as authorizeAccessKey.RpcParameters
  const response = await client.request<{
    Method: 'wallet_authorizeAccessKey'
    Parameters: [authorizeAccessKey.RpcParameters]
    ReturnType: authorizeAccessKey.RpcReturnType<chain>
  }>(
    {
      method: 'wallet_authorizeAccessKey',
      params: [rpcParameters],
    },
    { retryCount: 0 },
  )
  return {
    ...response,
    keyAuthorization: formatWalletKeyAuthorizationResponse(
      response.keyAuthorization,
    ),
  }
}

export declare namespace authorizeAccessKey {
  export type Parameters = WalletAuthorizeAccessKeyParameters

  export type RpcParameters = WalletAuthorizeAccessKeyRpcParameters

  export type RpcReturnType<_chain extends Chain | undefined> = {
    keyAuthorization: KeyAuthorization.Rpc
    rootAddress: Address
  }

  export type ReturnValue = {
    keyAuthorization: KeyAuthorization.Signed
    rootAddress: Address
  }

  export type ErrorType = RequestErrorType | CoreErrorType
}

/**
 * Revokes an access key through the connected wallet.
 *
 * @example
 * ```ts
 * import { createWalletClient, custom } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createWalletClient({
 *   account: '0x...',
 *   chain: tempo,
 *   transport: custom(window.ethereum),
 * })
 *
 * await Actions.wallet.revokeAccessKey(client, {
 *   accessKey: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns Nothing.
 */
export async function revokeAccessKey<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: revokeAccessKey.Parameters,
): Promise<revokeAccessKey.ReturnValue> {
  const { accessKey, address, ...rest } = parameters
  const rpcParameters: revokeAccessKey.RpcParameters = {
    ...rest,
    accessKeyAddress: resolveAccessKeyAddress(accessKey),
    address: resolveWalletAddress(client, address),
  }
  return await client.request<{
    Method: 'wallet_revokeAccessKey'
    Parameters: [revokeAccessKey.RpcParameters]
    ReturnType: revokeAccessKey.RpcReturnType<chain>
  }>(
    {
      method: 'wallet_revokeAccessKey',
      params: [rpcParameters],
    },
    { retryCount: 0 },
  )
}

export declare namespace revokeAccessKey {
  export type Parameters = {
    /** Address of the account that owns the access key. Defaults to the client account. */
    address?: Address | undefined
    /** Access key to revoke. */
    accessKey: Address | resolveAccessKey.Parameters
  }

  export type RpcParameters = {
    address: Address
    accessKeyAddress: Address
  }

  export type RpcReturnType<_chain extends Chain | undefined> = ReturnValue

  export type ReturnValue = undefined

  export type ErrorType = RequestErrorType | CoreErrorType
}

/**
 * Transfers a TIP-20 token. Discriminated on `editable`:
 *
 * - omitted or `false` (default): read-only. Uses an access key when
 *   one matches (signs without showing the wallet UI), otherwise falls
 *   back to a confirm dialog the user has to approve.
 * - `true`: editable. Opens the wallet send UI with the supplied fields
 *   pre-filled for the user to confirm or edit before signing.
 *
 * @example
 * ```ts
 * import { createClient, custom } from 'viem'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   transport: custom(window.ethereum),
 * })
 *
 * // Read-only (no UI when an access key matches)
 * const { receipt } = await Actions.wallet.transfer(client, {
 *   amount: '1.5',
 *   to: '0x...',
 *   token: '0x...',
 * })
 *
 * // Editable (opens wallet UI)
 * await Actions.wallet.transfer(client, {
 *   editable: true,
 *   token: 'pathUSD',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The submitted transfer receipt and chain ID.
 */
export async function transfer<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: transfer.Parameters,
): Promise<transfer.ReturnValue> {
  return client.request<{
    Method: 'wallet_transfer'
    Parameters: [transfer.Parameters]
    ReturnType: transfer.ReturnValue
  }>(
    {
      method: 'wallet_transfer',
      params: [parameters],
    },
    { retryCount: 0 },
  )
}

export declare namespace transfer {
  /**
   * Read-only variant — uses an access key when one matches, otherwise
   * shows a confirm dialog.
   */
  type ReadOnly = {
    /** Human-readable amount to transfer (for example, `"1.5"`). */
    amount: string
    /**
     * Skip the editable wallet UI. The wallet still shows a confirm
     * dialog when no matching access key is available.
     * @default false
     */
    editable?: false | undefined
    /**
     * Address to transfer tokens from. Defaults to the active account. When
     * set to a different address, the call uses `transferFrom` and requires
     * the active account to have an allowance from `from`.
     */
    from?: Address | undefined
    /**
     * UTF-8 memo (max 32 bytes) to attach to the transfer.
     */
    memo?: string | undefined
    /** Recipient address. */
    to: Address
    /**
     * Token to transfer, accepted as either a contract address or a curated
     * tokenlist symbol (case-insensitive, for example `"pathUsd"`). Symbols
     * are resolved against the curated tokenlist on the active chain.
     */
    token: Address | string
  }

  /** Editable variant — opens the wallet send UI with optional pre-filled fields. */
  type Editable = {
    /** Human-readable amount to pre-fill (for example, `"1.5"`). */
    amount?: string | undefined
    /** Show the wallet UI for the user to confirm or edit. */
    editable: true
    /**
     * UTF-8 memo (max 32 bytes) to attach to the transfer.
     */
    memo?: string | undefined
    /** Recipient address to pre-fill. */
    to?: Address | undefined
    /**
     * Token to pre-fill, accepted as either a contract address or a curated
     * tokenlist symbol (case-insensitive, for example `"pathUsd"`). Symbols
     * are resolved against the curated tokenlist on the active chain. Omit
     * to let the user choose.
     */
    token?: Address | string | undefined
  }

  export type Parameters = {
    /** Chain id. Defaults to the active chain. */
    chainId?: number | undefined
    /**
     * Fee payer override. `false` to disable the wallet's default fee payer,
     * a URL string to use a custom fee payer service.
     */
    feePayer?: boolean | string | undefined
  } & OneOf<ReadOnly | Editable>

  export type ReturnValue = {
    /** Chain ID the transfer was submitted to. */
    chainId: number
    /** Receipt of the submitted transfer. */
    receipt: TransactionReceipt
  }

  export type ErrorType = RequestErrorType | CoreErrorType
}

/**
 * Opens the wallet swap flow with optional pre-filled swap fields.
 *
 * @example
 * ```ts
 * import { createClient, custom } from 'viem'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   transport: custom(window.ethereum),
 * })
 *
 * const { receipt } = await Actions.wallet.swap(client, {
 *   amount: '1.5',
 *   token: '0x...',
 *   type: 'sell',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The submitted swap receipt.
 */
export async function swap<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: swap.Parameters = {},
): Promise<swap.ReturnValue> {
  return client.request<{
    Method: 'wallet_swap'
    Parameters: [swap.Parameters]
    ReturnType: swap.ReturnValue
  }>(
    {
      method: 'wallet_swap',
      params: [parameters],
    },
    { retryCount: 0 },
  )
}

export declare namespace swap {
  export type Parameters = {
    /** Human-readable amount to pre-fill (for example, "1.5"). */
    amount?: string | undefined
    /**
     * Other side of the swap pair. For buys, this is the token to sell.
     * For sells, this is the token to buy.
     */
    pairToken?: Address | undefined
    /** Maximum allowed slippage as a decimal fraction, for example `0.05`. */
    slippage?: number | undefined
    /** Token to buy or sell. Omit to let the user choose. */
    token?: Address | undefined
    /** Whether the amount is an exact buy or sell amount. */
    type?: 'buy' | 'sell' | undefined
  }

  export type ReturnValue = {
    /** Receipt of the submitted swap. */
    receipt: TransactionReceipt
  }

  export type ErrorType = RequestErrorType | CoreErrorType
}

/**
 * Opens the wallet deposit flow with optional pre-filled deposit fields.
 *
 * @example
 * ```ts
 * import { createClient, custom } from 'viem'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   transport: custom(window.ethereum),
 * })
 *
 * const result = await Actions.wallet.deposit(client, {
 *   amount: '1.5',
 *   token: 'pathUsd',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns Receipts for onchain deposit operations, when applicable.
 */
export async function deposit<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: deposit.Parameters = {},
): Promise<deposit.ReturnValue> {
  return client.request<{
    Method: 'wallet_deposit'
    Parameters: [deposit.Parameters]
    ReturnType: deposit.ReturnValue
  }>(
    {
      method: 'wallet_deposit',
      params: [parameters],
    },
    { retryCount: 0 },
  )
}

export declare namespace deposit {
  export type Parameters = {
    /** Deposit address to pre-fill. */
    address?: Address | undefined
    /** Human-readable amount to pre-fill (for example, "1.5"). */
    amount?: string | undefined
    /** Source chain ID to pre-fill. */
    chainId?: number | undefined
    /** Human-readable account display name. */
    displayName?: string | undefined
    /**
     * Token to pre-fill, accepted as either a contract address or a supported
     * deposit token symbol. Omit to let the user choose.
     */
    token?: Address | string | undefined
  }

  export type ReturnValue =
    | {
        /** Receipts of any onchain operations performed during the deposit. */
        receipts?: readonly TransactionReceipt[] | undefined
      }
    | undefined

  export type ErrorType = RequestErrorType | CoreErrorType
}
