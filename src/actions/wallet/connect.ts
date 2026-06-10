import type { Address } from 'abitype'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { BaseError } from '../../errors/base.js'
import type { ExtractCapabilities } from '../../types/capabilities.js'
import type {
  Chain,
  ChainWalletConnectCapabilityFormatter,
  ChainWalletConnectRequest,
} from '../../types/chain.js'
import type { Prettify } from '../../types/utils.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import { numberToHex } from '../../utils/encoding/toHex.js'
import {
  type RequestAddressesErrorType,
  requestAddresses,
} from './requestAddresses.js'

export type ConnectParameters<
  chain extends Chain | undefined = Chain | undefined,
> = Prettify<{
  /** Chain to connect on. Defaults to the active chain. */
  chain?: chain | Chain | undefined
  capabilities?: ExtractCapabilities<'connect', 'Request'> | undefined
}>

export type ConnectReturnType = Prettify<{
  accounts: readonly {
    address: Address
    capabilities?: ExtractCapabilities<'connect', 'ReturnType'> | undefined
  }[]
}>

export type ConnectErrorType = RequestErrorType | RequestAddressesErrorType

/**
 * Requests to connect account(s) with optional capabilities.
 *
 * - Docs: https://viem.sh/docs/actions/wallet/connect
 * - JSON-RPC Methods: [`wallet_connect`](https://github.com/ethereum/ERCs/blob/abd1c9f4eda2d6ad06ade0e3af314637a27d1ee7/ERCS/erc-7846.md)
 *
 * @param client - Client to use
 * @param parameters - {@link ConnectParameters}
 * @returns List of accounts managed by a wallet {@link ConnectReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { connect } from 'viem/actions'
 * import { mainnet } from 'viem/chains'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const response = await connect(client)
 */
export async function connect<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: ConnectParameters<chain> = {},
): Promise<ConnectReturnType> {
  const chain = parameters.chain ?? client.chain
  const walletConnect = chain?.walletConnect
  const capabilities = formatRequestCapabilities(parameters.capabilities, {
    chain,
    client,
  })
  const request = walletConnect?.formatRequest?.(
    {
      ...(capabilities ? { capabilities } : {}),
      version: '1',
    },
    { chain, client },
  ) ?? {
    ...(capabilities ? { capabilities } : {}),
    version: '1',
  }

  const response = await (async () => {
    try {
      return await client.request<{
        Method: 'wallet_connect'
        Parameters: [ChainWalletConnectRequest]
        ReturnType: {
          accounts?: readonly {
            address: Address
            capabilities?: Record<string, unknown> | undefined
          }[]
        }
      }>(
        { method: 'wallet_connect', params: [request] },
        { dedupe: true, retryCount: 0 },
      )
    } catch (e) {
      const error = e as BaseError

      // If the wallet does not support `wallet_connect`, and has no
      // capabilities, attempt to use `eth_requestAccounts` instead.
      if (
        !parameters.capabilities &&
        walletConnect?.fallback !== false &&
        (error.name === 'InvalidInputRpcError' ||
          error.name === 'InvalidParamsRpcError' ||
          error.name === 'MethodNotFoundRpcError' ||
          error.name === 'MethodNotSupportedRpcError' ||
          error.name === 'UnsupportedProviderMethodError')
      ) {
        const addresses = await requestAddresses(client)
        return {
          accounts: addresses.map((address) => ({
            address,
            capabilities: {},
          })),
        }
      }

      throw error
    }
  })()

  return {
    ...response,
    accounts: (response.accounts ?? []).map((account) => ({
      ...account,
      capabilities: formatResponseCapabilities(account.capabilities, {
        chain,
        client,
      }),
    })),
  }
}

const requestCapabilityFormatters = {
  unstable_addSubAccount: {
    key: 'addSubAccount',
    format(capability) {
      const { account, ...rest } = capability as {
        account: { chainId?: number | undefined }
      }
      return {
        ...rest,
        account: {
          ...account,
          ...(account.chainId
            ? {
                chainId: numberToHex(account.chainId),
              }
            : {}),
        },
      }
    },
  },
  unstable_getSubAccounts: {
    key: 'getSubAccounts',
    format: (capability) => capability || undefined,
  },
  unstable_signInWithEthereum: {
    key: 'signInWithEthereum',
    format(capability) {
      const { chainId, expirationTime, issuedAt, notBefore, ...rest } =
        capability as {
          chainId: number
          expirationTime?: Date | undefined
          issuedAt?: Date | undefined
          notBefore?: Date | undefined
        }
      return {
        ...rest,
        chainId: numberToHex(chainId),
        ...(expirationTime
          ? {
              expirationTime: expirationTime.toISOString(),
            }
          : {}),
        ...(issuedAt
          ? {
              issuedAt: issuedAt.toISOString(),
            }
          : {}),
        ...(notBefore
          ? {
              notBefore: notBefore.toISOString(),
            }
          : {}),
      }
    },
  },
} satisfies Record<string, ChainWalletConnectCapabilityFormatter>

const responseCapabilityFormatters = {
  signInWithEthereum: {
    key: 'unstable_signInWithEthereum',
  },
  subAccounts: {
    key: 'unstable_subAccounts',
  },
} satisfies Record<string, ChainWalletConnectCapabilityFormatter>

function formatRequestCapabilities(
  capabilities: ExtractCapabilities<'connect', 'Request'> | undefined,
  context: { chain?: Chain | undefined; client: Client },
) {
  if (!capabilities) return undefined
  return formatCapabilities(capabilities, {
    context,
    formatters: {
      ...requestCapabilityFormatters,
      ...context.chain?.walletConnect?.capabilities?.request,
    },
  })
}

function formatResponseCapabilities(
  capabilities: Record<string, unknown> | undefined,
  context: { chain?: Chain | undefined; client: Client },
) {
  return formatCapabilities(capabilities ?? {}, {
    context,
    formatters: {
      ...responseCapabilityFormatters,
      ...context.chain?.walletConnect?.capabilities?.response,
    },
  }) as ExtractCapabilities<'connect', 'ReturnType'>
}

function formatCapabilities(
  capabilities: Record<string, unknown>,
  options: {
    context: { chain?: Chain | undefined; client: Client }
    formatters: Record<string, ChainWalletConnectCapabilityFormatter>
  },
) {
  return Object.entries(capabilities).reduce(
    (capabilities, [key, value]) => {
      const formatter = options.formatters[key]
      const value_ = formatter?.format
        ? formatter.format(value, { ...options.context, key })
        : value
      if (typeof value_ === 'undefined') return capabilities
      capabilities[formatter?.key ?? key] = value_
      return capabilities
    },
    {} as Record<string, unknown>,
  )
}
