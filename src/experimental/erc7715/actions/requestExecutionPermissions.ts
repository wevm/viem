import type { Address } from 'abitype'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { WalletRequestExecutionPermissionsReturnType } from '../../../types/eip1193.js'
import type { Hex } from '../../../types/misc.js'
import { hexToNumber, numberToHex } from '../../../utils/index.js'
import type { Permission } from '../types/permission.js'
import type { Rule } from '../types/rules.js'

export type RequestExecutionPermissionsParameters = {
  /** Permission to grant to the user. */
  permission: Permission
  /** Address to that will be granted the permissions. */
  to: Address
  chainId: number
  /** Address that will grant the permissions. */
  from?: Address | undefined
  /** Set of rules to apply to the permissions. */
  rules?: readonly Rule[] | undefined
}

export type RequestExecutionPermissionsReturnType =
  RequestExecutionPermissionsParameters & {
    context: Hex
    dependencies: readonly {
      factory: Address
      factoryData: Hex
    }[]
    delegationManager: Hex
  }

/**
 * Request permissions from a wallet to perform actions on behalf of a user.
 *
 * - Docs: https://viem.sh/experimental/erc7715/grantPermissions
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { requestExecutionPermissions } from 'viem/experimental'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 *
 * const result = await requestExecutionPermissions(client, [{
 *   chainId: 1,
 *   to: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
 *   permission: {
 *     type: 'native-token-allowance',
 *     isAdjustmentAllowed: false,
 *     data: {
 *       allowance: '0x1DCD6500',
 *     },
 *   },
 * }])
 */
export async function requestExecutionPermissions(
  client: Client<Transport>,
  parameters: readonly RequestExecutionPermissionsParameters[],
): Promise<readonly RequestExecutionPermissionsReturnType[]> {
  const result = await client.request({
    method: 'wallet_requestExecutionPermissions',
    params: parameters.map(formatParameters),
  })
  return result.map(formatRespone) as RequestExecutionPermissionsReturnType[]
}

function formatParameters(parameters: RequestExecutionPermissionsParameters) {
  const { from, to, chainId, permission, rules } = parameters

  return {
    chainId: numberToHex(chainId),
    permission,
    to,
    ...(from ? { from } : undefined),
    ...(rules ? { rules } : {}),
  }
}

function formatRespone(result: WalletRequestExecutionPermissionsReturnType) {
  return {
    chainId: hexToNumber(result.chainId),
    from: result.from ? result.from : undefined,
    to: result.to,
    permission: result.permission,
    ...(result.rules ? { rules: result.rules } : {}),
    context: result.context,
    dependencies: result.dependencies,
    delegationManager: result.delegationManager,
  }
}
