import type { Address, Narrow } from 'abitype'
import { parseAccount } from '../../../accounts/utils/parseAccount.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { ErrorType } from '../../../errors/utils.js'
import type { Account, GetAccountParameter } from '../../../types/account.js'
import type { Call, Calls } from '../../../types/calls.js'
import type { ExtractCapabilities } from '../../../types/capabilities.js'
import type { Chain, DeriveChain } from '../../../types/chain.js'
import type { WalletSendCallsParameters } from '../../../types/eip1193.js'
import type { Prettify } from '../../../types/utils.js'
import { encodeFunctionData } from '../../../utils/abi/encodeFunctionData.js'
import type { RequestErrorType } from '../../../utils/buildRequest.js'
import { concat } from '../../../utils/data/concat.js'
import { numberToHex } from '../../../utils/encoding/toHex.js'

export type SendCallsParameters<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  calls extends readonly unknown[] = readonly unknown[],
  //
  _chain extends Chain | undefined = DeriveChain<chain, chainOverride>,
> = {
  chain?: chainOverride | Chain | undefined
  calls: Calls<Narrow<calls>, { gas?: bigint | undefined }>
  capabilities?: ExtractCapabilities<'sendCalls', 'Request'> | undefined
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
 * Requests the connected wallet to send a batch of calls with ERC-8132 gas limit override support.
 *
 * - Docs: https://viem.sh/experimental/erc8132/sendCalls
 * - JSON-RPC Methods: [`wallet_sendCalls`](https://eips.ethereum.org/EIPS/eip-5792)
 * - ERC-8132: https://github.com/ethereum/ERCs/pull/1485
 *
 * @param client - Client to use
 * @returns Transaction identifier. {@link SendCallsReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { sendCalls } from 'viem/experimental/erc8132'
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
 *       gas: 100000n, // ERC-8132 gas limit override
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
    chain = client.chain,
    forceAtomic = false,
    id,
    version = '2.0.0',
  } = parameters

  const account = account_ ? parseAccount(account_) : null

  let capabilities = parameters.capabilities

  if (client.dataSuffix && !parameters.capabilities?.dataSuffix) {
    if (typeof client.dataSuffix === 'string')
      capabilities = {
        ...parameters.capabilities,
        dataSuffix: { value: client.dataSuffix, optional: true },
      }
    else
      capabilities = {
        ...parameters.capabilities,
        dataSuffix: {
          value: client.dataSuffix.value,
          ...(client.dataSuffix.required ? {} : { optional: true }),
        },
      }
  }

  const calls = parameters.calls.map((call_: unknown) => {
    const call = call_ as Call & { gas?: bigint | undefined }

    const data = call.abi
      ? encodeFunctionData({
          abi: call.abi,
          functionName: call.functionName,
          args: call.args,
        })
      : call.data

    // Build call-level capabilities with gasLimitOverride if gas is specified
    const callCapabilities = call.gas
      ? {
          gasLimitOverride: {
            value: numberToHex(call.gas),
          },
        }
      : undefined

    return {
      capabilities: callCapabilities,
      data: call.dataSuffix && data ? concat([data, call.dataSuffix]) : data,
      to: call.to,
      value: call.value ? numberToHex(call.value) : undefined,
    }
  })

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
}
