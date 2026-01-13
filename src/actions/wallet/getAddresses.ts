import type { Address } from 'abitype'

import type { Account } from '../../accounts/types.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Chain } from '../../types/chain.js'
import type { EIP1193RequestOptions } from '../../types/eip1193.js'
import {
  type ChecksumAddressErrorType,
  checksumAddress,
} from '../../utils/address/getAddress.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'

export type GetAddressesParameters = {
  /** Request options. */
  requestOptions?: EIP1193RequestOptions | undefined
}

export type GetAddressesReturnType = Address[]

export type GetAddressesErrorType =
  | RequestErrorType
  | ChecksumAddressErrorType
  | ErrorType

/**
 * Returns a list of account addresses owned by the wallet or client.
 *
 * - Docs: https://viem.sh/docs/actions/wallet/getAddresses
 * - JSON-RPC Methods: [`eth_accounts`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_accounts)
 *
 * @param client - Client to use
 * @param parameters - {@link GetAddressesParameters}
 * @returns List of account addresses owned by the wallet or client. {@link GetAddressesReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getAddresses } from 'viem/wallet'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const accounts = await getAddresses(client)
 */
export async function getAddresses<
  chain extends Chain | undefined,
  account extends Account | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  { requestOptions }: GetAddressesParameters = {},
): Promise<GetAddressesReturnType> {
  if (client.account?.type === 'local') return [client.account.address]
  const addresses = await client.request(
    { method: 'eth_accounts' },
    { dedupe: true, ...requestOptions },
  )
  return addresses.map((address) => checksumAddress(address))
}
