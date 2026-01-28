import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { WalletGetGrantedExecutionPermissionsReturnType } from '../../../types/eip1193.js'
import { hexToNumber } from '../../../utils/index.js'
import type { RequestExecutionPermissionsReturnType } from './requestExecutionPermissions.js'

export type GetGrantedExecutionPermissionsReturnType =
  readonly RequestExecutionPermissionsReturnType[]

/**
 * Get the granted execution permissions for a wallet.
 *
 * - Docs: https://viem.sh/experimental/erc7715/getGrantedExecutionPermissions
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getGrantedExecutionPermissions } from 'viem/experimental'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 *
 * const result = await getGrantedExecutionPermissions(client)
 */

export async function getGrantedExecutionPermissions(
  client: Client<Transport>,
): Promise<GetGrantedExecutionPermissionsReturnType> {
  const result = await client.request({
    method: 'wallet_getGrantedExecutionPermissions',
    params: [],
  })

  return formatResponse(result) as GetGrantedExecutionPermissionsReturnType
}

function formatResponse(
  result: WalletGetGrantedExecutionPermissionsReturnType,
): GetGrantedExecutionPermissionsReturnType {
  return result.map((permission) => ({
    chainId: hexToNumber(permission.chainId),
    ...(permission.from ? { from: permission.from } : {}),
    to: permission.to,
    permission: permission.permission,
    ...(permission.rules ? { rules: permission.rules } : {}),
    context: permission.context,
    dependencies: permission.dependencies,
    delegationManager: permission.delegationManager,
  }))
}
