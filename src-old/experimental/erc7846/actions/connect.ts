import type { Address } from 'abitype'
import {
  type RequestAddressesErrorType,
  requestAddresses,
} from '../../../actions/wallet/requestAddresses.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { BaseError } from '../../../errors/base.js'
import type { ExtractCapabilities } from '../../../types/capabilities.js'
import type { Chain } from '../../../types/chain.js'
import type { Prettify } from '../../../types/utils.js'
import type { RequestErrorType } from '../../../utils/buildRequest.js'
import { numberToHex } from '../../../utils/encoding/toHex.js'

export type ConnectParameters = Prettify<{
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
 * - Docs: https://viem.sh/experimental/erc7846/connect
 * - JSON-RPC Methods: [`wallet_connect`](https://github.com/ethereum/ERCs/blob/abd1c9f4eda2d6ad06ade0e3af314637a27d1ee7/ERCS/erc-7846.md)
 *
 * @param client - Client to use
 * @param parameters - {@link ConnectParameters}
 * @returns List of accounts managed by a wallet {@link ConnectReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { connect } from 'viem/experimental/erc7846'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const response = await connect(client)
 */
export async function connect<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: ConnectParameters = {},
): Promise<ConnectReturnType> {
  const capabilities = formatRequestCapabilities(parameters.capabilities)

  const response = await (async () => {
    try {
      return await client.request(
        { method: 'wallet_connect', params: [{ capabilities, version: '1' }] },
        { dedupe: true, retryCount: 0 },
      )
    } catch (e) {
      const error = e as BaseError

      // If the wallet does not support `wallet_connect`, and has no
      // capabilities, attempt to use `eth_requestAccounts` instead.
      if (
        !parameters.capabilities &&
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
      capabilities: formatResponseCapabilities(account.capabilities),
    })),
  }
}

function formatRequestCapabilities(
  capabilities: ExtractCapabilities<'connect', 'Request'> | undefined,
) {
  const {
    unstable_addSubAccount,
    unstable_getSubAccounts: getSubAccounts,
    unstable_signInWithEthereum,
    ...rest
  } = capabilities ?? {}

  const addSubAccount = unstable_addSubAccount
    ? {
        ...unstable_addSubAccount,
        account: {
          ...unstable_addSubAccount.account,
          ...(unstable_addSubAccount.account.chainId
            ? {
                chainId: numberToHex(unstable_addSubAccount.account.chainId),
              }
            : {}),
        },
      }
    : undefined

  const { chainId, expirationTime, issuedAt, notBefore } =
    unstable_signInWithEthereum ?? {}
  const signInWithEthereum = unstable_signInWithEthereum
    ? {
        ...unstable_signInWithEthereum,
        chainId: numberToHex(chainId!),
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
    : undefined

  return {
    ...rest,
    ...(addSubAccount
      ? {
          addSubAccount,
        }
      : {}),
    ...(getSubAccounts
      ? {
          getSubAccounts,
        }
      : {}),
    ...(signInWithEthereum
      ? {
          signInWithEthereum,
        }
      : {}),
  }
}

function formatResponseCapabilities(
  capabilities: ExtractCapabilities<'connect', 'ReturnType'> | undefined,
) {
  return Object.entries(capabilities ?? {}).reduce(
    (capabilities, [key, value]) => {
      const k = (() => {
        if (key === 'signInWithEthereum') return 'unstable_signInWithEthereum'
        if (key === 'subAccounts') return 'unstable_subAccounts'
        return key
      })()
      capabilities[k] = value
      return capabilities
    },
    {} as Record<string, unknown>,
  )
}
