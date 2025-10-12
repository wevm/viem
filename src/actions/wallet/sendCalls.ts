import type { Address, Narrow } from 'abitype'
import { parseAccount } from '../../accounts/utils/parseAccount.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { BaseError } from '../../errors/base.js'
import {
  AtomicityNotSupportedError,
  UnsupportedNonOptionalCapabilityError,
} from '../../errors/rpc.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Account, GetAccountParameter } from '../../types/account.js'
import type { Call, Calls } from '../../types/calls.js'
import type { ExtractCapabilities } from '../../types/capabilities.js'
import type { Chain, DeriveChain } from '../../types/chain.js'
import type { WalletSendCallsParameters } from '../../types/eip1193.js'
import type { Hex } from '../../types/misc.js'
import type { Prettify } from '../../types/utils.js'
import { encodeFunctionData } from '../../utils/abi/encodeFunctionData.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import { concat } from '../../utils/data/concat.js'
import { hexToBigInt } from '../../utils/encoding/fromHex.js'
import { numberToHex } from '../../utils/encoding/toHex.js'
import { getTransactionError } from '../../utils/errors/getTransactionError.js'
import { sendTransaction } from './sendTransaction.js'

export const fallbackMagicIdentifier =
  '0x5792579257925792579257925792579257925792579257925792579257925792'
export const fallbackTransactionErrorMagicIdentifier = numberToHex(0, {
  size: 32,
})

export type SendCallsParameters<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  calls extends readonly unknown[] = readonly unknown[],
  //
  _chain extends Chain | undefined = DeriveChain<chain, chainOverride>,
> = {
  chain?: chainOverride | Chain | undefined
  calls: Calls<Narrow<calls>>
  capabilities?: ExtractCapabilities<'sendCalls', 'Request'> | undefined
  experimental_fallback?: boolean | undefined
  experimental_fallbackDelay?: number | undefined
  forceAtomic?: boolean | undefined
  id?: string | undefined
  version?: WalletSendCallsParameters[number]['version'] | undefined
} & GetAccountParameter<account, Account | Address, false, true>

export type SendCallsReturnType = Prettify<{
  capabilities?: ExtractCapabilities<'sendCalls', 'ReturnType'> | undefined
  id: string
}>

export type SendCallsErrorType = RequestErrorType | ErrorType

/**
 * Requests the connected wallet to send a batch of calls.
 *
 * - Docs: https://viem.sh/docs/actions/wallet/sendCalls
 * - JSON-RPC Methods: [`wallet_sendCalls`](https://eips.ethereum.org/EIPS/eip-5792)
 *
 * @param client - Client to use
 * @returns Transaction identifier. {@link SendCallsReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { sendCalls } from 'viem/actions'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const id = await sendCalls(client, {
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   calls: [
 *     {
 *       data: '0xdeadbeef',
 *       to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *     },
 *     {
 *       to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *       value: 69420n,
 *     },
 *   ],
 * })
 */
export async function sendCalls<
  const calls extends readonly unknown[],
  chain extends Chain | undefined,
  account extends Account | undefined = undefined,
  chainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: SendCallsParameters<chain, account, chainOverride, calls>,
): Promise<SendCallsReturnType> {
  const {
    account: account_ = client.account,
    capabilities,
    chain = client.chain,
    experimental_fallback,
    experimental_fallbackDelay = 32,
    forceAtomic = false,
    id,
    version = '2.0.0',
  } = parameters

  const account = account_ ? parseAccount(account_) : null

  const calls = parameters.calls.map((call_: unknown) => {
    const call = call_ as Call

    const data = call.abi
      ? encodeFunctionData({
          abi: call.abi,
          functionName: call.functionName,
          args: call.args,
        })
      : call.data

    return {
      data: call.dataSuffix && data ? concat([data, call.dataSuffix]) : data,
      to: call.to,
      value: call.value ? numberToHex(call.value) : undefined,
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
            chainId: numberToHex(chain!.id),
            from: account?.address,
            id,
            version,
          },
        ],
      },
      { retryCount: 0 },
    )
    if (typeof response === 'string') return { id: response }
    return response as never
  } catch (err) {
    const error = err as BaseError

    // If the transport does not support EIP-5792, fall back to
    // `eth_sendTransaction`.
    if (
      experimental_fallback &&
      (error.name === 'MethodNotFoundRpcError' ||
        error.name === 'MethodNotSupportedRpcError' ||
        error.name === 'UnknownRpcError' ||
        error.details
          .toLowerCase()
          .includes('does not exist / is not available') ||
        error.details.toLowerCase().includes('missing or invalid. request()') ||
        error.details
          .toLowerCase()
          .includes('did not match any variant of untagged enum') ||
        error.details
          .toLowerCase()
          .includes('account upgraded to unsupported contract') ||
        error.details.toLowerCase().includes('eip-7702 not supported') ||
        error.details.toLowerCase().includes('unsupported wc_ method') ||
        // magic.link
        error.details
          .toLowerCase()
          .includes('feature toggled misconfigured') ||
        // Trust Wallet
        error.details
          .toLowerCase()
          .includes(
            'jsonrpcengine: response has no error or result for request',
          ))
    ) {
      if (capabilities) {
        const hasNonOptionalCapability = Object.values(capabilities).some(
          (capability) => !capability.optional,
        )
        if (hasNonOptionalCapability) {
          const message =
            'non-optional `capabilities` are not supported on fallback to `eth_sendTransaction`.'
          throw new UnsupportedNonOptionalCapabilityError(
            new BaseError(message, {
              details: message,
            }),
          )
        }
      }
      if (forceAtomic && calls.length > 1) {
        const message =
          '`forceAtomic` is not supported on fallback to `eth_sendTransaction`.'
        throw new AtomicityNotSupportedError(
          new BaseError(message, {
            details: message,
          }),
        )
      }

      const promises: Promise<Hex>[] = []
      for (const call of calls) {
        const promise = sendTransaction(client, {
          account,
          chain,
          data: call.data,
          to: call.to,
          value: call.value ? hexToBigInt(call.value) : undefined,
        })
        promises.push(promise)

        // Note: some browser wallets require a small delay between transactions
        // to prevent duplicate JSON-RPC requests.
        if (experimental_fallbackDelay > 0)
          await new Promise((resolve) =>
            setTimeout(resolve, experimental_fallbackDelay),
          )
      }

      const results = await Promise.allSettled(promises)
      if (results.every((r) => r.status === 'rejected')) throw results[0].reason

      const hashes = results.map((result) => {
        if (result.status === 'fulfilled') return result.value
        return fallbackTransactionErrorMagicIdentifier
      })
      return {
        id: concat([
          ...hashes,
          numberToHex(chain!.id, { size: 32 }),
          fallbackMagicIdentifier,
        ]),
      }
    }

    throw getTransactionError(err as BaseError, {
      ...parameters,
      account,
      chain: parameters.chain!,
    })
  }
}
