import type { Narrow } from 'abitype'
import * as AbiFunction from 'ox/AbiFunction'
import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
import * as Hex from 'ox/Hex'

import * as Account from '../../Account.js'
import type * as Capabilities from '../../Capabilities.js'
import type * as Chain from '../../Chain.js'
import type * as Client from '../../Client.js'
import { BaseError } from '../../Errors.js'
import * as RpcError from '../../RpcError.js'
import type { Compute } from '../../internal/types.js'
import type { Call, Calls } from '../internal/calls.js'
import { send as sendTransaction } from '../transaction/send.js'

/** Magic identifier appended to fallback call bundle ids. */
export const fallbackMagicIdentifier =
  '0x5792579257925792579257925792579257925792579257925792579257925792'
/** Magic identifier used for a failed transaction in a fallback bundle. */
export const fallbackTransactionErrorMagicIdentifier = Hex.fromNumber(0, {
  size: 32,
})

/**
 * Requests the connected wallet to send a batch of calls.
 *
 * @example
 * ```ts
 * import { Actions, Client, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: custom(window.ethereum!),
 * })
 * const { id } = await Actions.wallet.sendCalls(client, {
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   calls: [
 *     { data: '0xdeadbeef', to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8' },
 *     { to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', value: 69420n },
 *   ],
 * })
 * ```
 */
export async function sendCalls<
  const calls extends readonly unknown[],
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined = undefined,
  chainOverride extends Chain.Chain | undefined = undefined,
>(
  client: Client.Client<chain, account>,
  options: sendCalls.Options<chain, account, chainOverride, calls>,
): Promise<sendCalls.ReturnType> {
  const {
    account: account_ = client.account,
    chain = client.chain,
    experimental_fallback,
    experimental_fallbackDelay = 32,
    forceAtomic = false,
    id,
    version = '2.0.0',
  } = options

  const account = account_
    ? typeof account_ === 'string'
      ? Account.from(account_)
      : account_
    : null

  let capabilities = options.capabilities

  if (client.dataSuffix && !options.capabilities?.dataSuffix) {
    if (typeof client.dataSuffix === 'string')
      capabilities = {
        ...options.capabilities,
        dataSuffix: { value: client.dataSuffix, optional: true },
      }
    else
      capabilities = {
        ...options.capabilities,
        dataSuffix: {
          value: client.dataSuffix.value,
          ...(client.dataSuffix.required ? {} : { optional: true }),
        },
      }
  }

  const calls = (options.calls as readonly Call[]).map((call) => {
    const data = call.abi
      ? AbiFunction.encodeData(
          AbiFunction.fromAbi(call.abi, call.functionName, {
            args: call.args,
          }),
          call.args,
        )
      : call.data

    return {
      data: call.dataSuffix && data ? Hex.concat(data, call.dataSuffix) : data,
      to: call.to,
      value: call.value ? Hex.fromNumber(call.value) : undefined,
    }
  })

  try {
    const response = await client.request(
      {
        method: 'wallet_sendCalls',
        params: [
          {
            atomicRequired: forceAtomic,
            calls,
            capabilities,
            chainId: Hex.fromNumber(chain!.id),
            from: account?.address,
            id,
            version,
          },
        ],
      },
      { retryCount: 0 },
    )
    if (typeof response === 'string') return { id: response }
    return response
  } catch (err) {
    const error = err as Errors.BaseError & { details?: string | undefined }
    const details = (error.details ?? '').toLowerCase()

    // If the transport does not support EIP-5792, fall back to
    // `eth_sendTransaction`.
    if (
      experimental_fallback &&
      (error.name === 'RpcResponse.MethodNotFoundError' ||
        error.name === 'RpcResponse.MethodNotSupportedError' ||
        error.name === 'RpcError.UnknownRpcError' ||
        details.includes('does not exist / is not available') ||
        details.includes('missing or invalid. request()') ||
        details.includes('did not match any variant of untagged enum') ||
        details.includes('account upgraded to unsupported contract') ||
        details.includes('eip-7702 not supported') ||
        details.includes('unsupported wc_ method') ||
        // magic.link
        details.includes('feature toggled misconfigured') ||
        // Trust Wallet
        details.includes(
          'jsonrpcengine: response has no error or result for request',
        ))
    ) {
      if (capabilities) {
        const hasNonOptionalCapability = Object.values(capabilities).some(
          (capability) => !(capability as { optional?: boolean }).optional,
        )
        if (hasNonOptionalCapability)
          throw new UnsupportedNonOptionalCapabilityError()
      }
      if (forceAtomic && calls.length > 1)
        throw new AtomicityNotSupportedError()

      const results: PromiseSettledResult<Hex.Hex>[] = []
      for (const call of calls) {
        try {
          const value = await sendTransaction(client, {
            account,
            chain,
            data: call.data,
            to: call.to,
            value: call.value ? Hex.toBigInt(call.value) : undefined,
          } as never)
          results.push({ status: 'fulfilled', value })
        } catch (reason) {
          results.push({ reason, status: 'rejected' })
        }

        // Note: some browser wallets require a small delay between transactions
        // to prevent duplicate JSON-RPC requests.
        if (experimental_fallbackDelay > 0)
          await new Promise((resolve) =>
            setTimeout(resolve, experimental_fallbackDelay),
          )
      }

      if (results.every((r) => r.status === 'rejected'))
        throw (results[0] as PromiseRejectedResult).reason

      const hashes = results.map((result) => {
        if (result.status === 'fulfilled') return result.value
        return fallbackTransactionErrorMagicIdentifier
      })
      return {
        id: Hex.concat(
          ...hashes,
          Hex.fromNumber(chain!.id, { size: 32 }),
          fallbackMagicIdentifier,
        ),
      }
    }

    if (error instanceof RpcError.ExecutionError) throw error
    throw new RpcError.ExecutionError(err as Error, {
      account: account ?? undefined,
      chain: chain ?? undefined,
    })
  }
}

export declare namespace sendCalls {
  type Options<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
    account extends Account.Account | undefined = Account.Account | undefined,
    chainOverride extends Chain.Chain | undefined = Chain.Chain | undefined,
    calls extends readonly unknown[] = readonly unknown[],
  > = {
    /** Account (or address) the calls are sent from. @default client.account */
    account?: Account.Account | Address.Address | null | undefined
    /** Chain the calls target. @default client.chain */
    chain?: chainOverride | Chain.Chain | undefined
    /** The batch of calls to send. */
    calls: Calls<Narrow<calls>>
    /** Capabilities to request from the wallet. */
    capabilities?: Capabilities.Extract<'sendCalls', 'Request'> | undefined
    /**
     * Whether to fall back to `eth_sendTransaction` when the wallet does not
     * support EIP-5792.
     */
    experimental_fallback?: boolean | undefined
    /** Delay (in ms) between fallback transactions. @default 32 */
    experimental_fallbackDelay?: number | undefined
    /** Whether the calls must be executed atomically. @default false */
    forceAtomic?: boolean | undefined
    /** Identifier for the call batch. */
    id?: string | undefined
    /** EIP-5792 version. @default '2.0.0' */
    version?: string | undefined
  }

  type ReturnType = Compute<{
    capabilities?: Capabilities.Extract<'sendCalls', 'ReturnType'> | undefined
    id: string
  }>

  type ErrorType =
    | Account.from.ErrorType
    | AbiFunction.encodeData.ErrorType
    | AbiFunction.fromAbi.ErrorType
    | AtomicityNotSupportedError
    | RpcError.ExecutionError
    | UnsupportedNonOptionalCapabilityError
    | Errors.GlobalErrorType
}

/**
 * Thrown when the wallet does not support a capability that was not marked as
 * optional (EIP-5792 error code 5700).
 */
export class UnsupportedNonOptionalCapabilityError extends BaseError {
  override readonly name =
    'Actions.wallet.sendCalls.UnsupportedNonOptionalCapabilityError'
  readonly code = 5700 as const

  constructor() {
    super(
      'non-optional `capabilities` are not supported on fallback to `eth_sendTransaction`.',
    )
  }
}

/**
 * Thrown when the wallet does not support atomic execution but the request
 * requires it (EIP-5792 error code 5760).
 */
export class AtomicityNotSupportedError extends BaseError {
  override readonly name = 'Actions.wallet.sendCalls.AtomicityNotSupportedError'
  readonly code = 5760 as const

  constructor() {
    super(
      '`forceAtomic` is not supported on fallback to `eth_sendTransaction`.',
    )
  }
}
