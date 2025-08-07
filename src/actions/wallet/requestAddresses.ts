import type { Address } from 'abitype'

import type { Account } from '../../accounts/types.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Chain } from '../../types/chain.js'
import type { EIP1193RequestOptions } from '../../types/eip1193.js'
import { getAddress } from '../../utils/address/getAddress.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'

export type RequestAddressesParameters = {
  /** Request options. */
  requestOptions?: EIP1193RequestOptions | undefined
}

export type RequestAddressesReturnType = Address[]

export type RequestAddressesErrorType = RequestErrorType | ErrorType

/**
 * Requests a list of accounts managed by a wallet.
 *
 * - Docs: https://viem.sh/docs/actions/wallet/requestAddresses
 * - JSON-RPC Methods: [`eth_requestAccounts`](https://eips.ethereum.org/EIPS/eip-1102)
 *
 * Sends a request to the wallet, asking for permission to access the user's accounts. After the user accepts the request, it will return a list of accounts (addresses).
 *
 * This API can be useful for dapps that need to access the user's accounts in order to execute transactions or interact with smart contracts.
 *
 * @param client - Client to use
 * @param parameters - {@link RequestAddressesParameters}
 * @returns List of accounts managed by a wallet {@link RequestAddressesReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { requestAddresses } from 'viem/wallet'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const accounts = await requestAddresses(client)
 */
export async function requestAddresses<
  chain extends Chain | undefined,
  account extends Account | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  { requestOptions }: RequestAddressesParameters = {},
): Promise<RequestAddressesReturnType> {
  const addresses = await client.request(
    { method: 'eth_requestAccounts' },
    { dedupe: true, retryCount: 0, ...requestOptions },
  )
  return addresses.map((address) => getAddress(address))
}
