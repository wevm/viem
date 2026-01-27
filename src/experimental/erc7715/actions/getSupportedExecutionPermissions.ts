import type { WalletGetSupportedExecutionPermissionsReturnType } from 'types/eip1193.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import { hexToNumber } from '../../../utils/index.js'

export type GetSupportedExecutionPermissionsReturnType = Record<
  string,
  {
    /**
     * The chain IDs that the permission is supported on.
     */
    chainIds: readonly number[]
    /**
     * The rule types that can be applied to the permission.
     */
    ruleTypes: readonly string[]
  }
>

/**
 * Get the supported execution permissions for a wallet.
 *
 * - Docs: https://viem.sh/experimental/erc7715/getSupportedExecutionPermissions
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getSupportedExecutionPermissions } from 'viem/experimental'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 *
 * const result = await getSupportedExecutionPermissions(client)
 */

export async function getSupportedExecutionPermissions(
  client: Client<Transport>,
): Promise<GetSupportedExecutionPermissionsReturnType> {
  const result = await client.request({
    method: 'wallet_getSupportedExecutionPermissions',
    params: [],
  })

  return formatRequest(result) as GetSupportedExecutionPermissionsReturnType
}

function formatRequest(
  result: WalletGetSupportedExecutionPermissionsReturnType,
) {
  return Object.fromEntries(
    Object.entries(result).map(([key, value]) => [
      key,
      {
        chainIds: value.chainIds.map((hex) => hexToNumber(hex)),
        ruleTypes: value.ruleTypes,
      },
    ]),
  )
}
