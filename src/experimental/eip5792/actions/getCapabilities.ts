import type { Address } from 'abitype'

import { parseAccount } from '../../../accounts/utils/parseAccount.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import { AccountNotFoundError } from '../../../errors/account.js'
import type { ErrorType } from '../../../errors/utils.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import type {
  WalletCapabilities,
  WalletCapabilitiesRecord,
} from '../../../types/eip1193.js'
import type { Prettify } from '../../../types/utils.js'
import type { RequestErrorType } from '../../../utils/buildRequest.js'

export type GetCapabilitiesParameters = {
  account?: Account | Address | undefined
}

export type GetCapabilitiesReturnType = Prettify<
  WalletCapabilitiesRecord<WalletCapabilities, number>
>

export type GetCapabilitiesErrorType = RequestErrorType | ErrorType

/**
 * Extract capabilities that a connected wallet supports (e.g. paymasters, session keys, etc).
 *
 * - Docs: https://viem.sh/experimental/eip5792/getCapabilities
 * - JSON-RPC Methods: [`wallet_getCapabilities`](https://eips.ethereum.org/EIPS/eip-5792)
 *
 * @param client - Client to use
 * @returns The wallet's capabilities. {@link GetCapabilitiesReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getCapabilities } from 'viem/wallet'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const capabilities = await getCapabilities(client)
 */
export async function getCapabilities<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: GetCapabilitiesParameters = {},
): Promise<GetCapabilitiesReturnType> {
  const account_raw = parameters?.account ?? client.account

  if (!account_raw) throw new AccountNotFoundError()
  const account = parseAccount(account_raw)

  const capabilities_raw = await client.request({
    method: 'wallet_getCapabilities',
    params: [account.address],
  })

  const capabilities = {} as WalletCapabilitiesRecord<
    WalletCapabilities,
    number
  >
  for (const [key, value] of Object.entries(capabilities_raw))
    capabilities[Number(key)] = value
  return capabilities
}
