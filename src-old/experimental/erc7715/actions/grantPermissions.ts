import type { Address } from 'abitype'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { WalletGrantPermissionsReturnType } from '../../../types/eip1193.js'
import type { Hex } from '../../../types/misc.js'
import type { OneOf } from '../../../types/utils.js'
import { numberToHex, parseAccount } from '../../../utils/index.js'
import type { Permission } from '../types/permission.js'
import type { Signer } from '../types/signer.js'

export type GrantPermissionsParameters = {
  /** Timestamp (in seconds) that specifies the time by which this session MUST expire. */
  expiry: number
  /** Set of permissions to grant to the user. */
  permissions: readonly Permission[]
} & OneOf<
  | {
      /** Signer to assign the permissions to. */
      signer?: Signer | undefined
    }
  | {
      /** Account to assign the permissions to. */
      account?: Address | Account | undefined
    }
>

export type GrantPermissionsReturnType = {
  /** Timestamp (in seconds) that specifies the time by which this session MUST expire. */
  expiry: number
  /** ERC-4337 Factory to deploy smart contract account. */
  factory?: Hex | undefined
  /** Calldata to use when calling the ERC-4337 Factory. */
  factoryData?: string | undefined
  /** Set of granted permissions. */
  grantedPermissions: readonly Permission[]
  /** Permissions identifier. */
  permissionsContext: string
  /** Signer attached to the permissions. */
  signerData?:
    | {
        userOpBuilder?: Hex | undefined
        submitToAddress?: Hex | undefined
      }
    | undefined
}

/**
 * Request permissions from a wallet to perform actions on behalf of a user.
 *
 * - Docs: https://viem.sh/experimental/erc7715/grantPermissions
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { grantPermissions } from 'viem/experimental'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 *
 * const result = await grantPermissions(client, {
 *   expiry: 1716846083638,
 *   permissions: [
 *     {
 *       type: 'native-token-transfer',
 *       data: {
 *         ticker: 'ETH',
 *       },
 *       policies: [
 *         {
 *           type: 'token-allowance',
 *           data: {
 *             allowance: parseEther('1'),
 *           },
 *         }
 *       ],
 *       required: true,
 *     },
 *   ],
 * })
 */
export async function grantPermissions(
  client: Client<Transport>,
  parameters: GrantPermissionsParameters,
): Promise<GrantPermissionsReturnType> {
  const { account, expiry, permissions, signer } = parameters
  const result = await client.request(
    {
      method: 'wallet_grantPermissions',
      params: [
        formatParameters({ account, expiry, permissions, signer } as any),
      ],
    },
    { retryCount: 0 },
  )
  return formatRequest(result) as GrantPermissionsReturnType
}

function formatParameters(parameters: GrantPermissionsParameters) {
  const { expiry, permissions, signer: signer_ } = parameters

  const account = parameters.account
    ? parseAccount(parameters.account)
    : undefined

  const signer = (() => {
    if (!account && !signer_) return undefined

    // JSON-RPC Account as signer.
    if (account?.type === 'json-rpc')
      return {
        type: 'wallet',
      }

    // Local Account as signer.
    if (account?.type === 'local')
      return {
        type: 'account',
        data: {
          id: account.address,
        },
      }

    // ERC-7715 Signer as signer.
    return signer_
  })()

  return {
    expiry,
    permissions: permissions.map((permission) => ({
      ...permission,
      policies: permission.policies.map((policy) => {
        const data = (() => {
          if (policy.type === 'token-allowance')
            return {
              allowance: numberToHex(policy.data.allowance),
            }
          if (policy.type === 'gas-limit')
            return {
              limit: numberToHex(policy.data.limit),
            }
          return policy.data
        })()

        return {
          data,
          type:
            typeof policy.type === 'string' ? policy.type : policy.type.custom,
        }
      }),
      required: permission.required ?? false,
      type:
        typeof permission.type === 'string'
          ? permission.type
          : permission.type.custom,
    })),
    ...(signer ? { signer } : {}),
  }
}

function formatRequest(result: WalletGrantPermissionsReturnType) {
  return {
    expiry: result.expiry,
    ...(result.factory ? { factory: result.factory } : {}),
    ...(result.factoryData ? { factoryData: result.factoryData } : {}),
    grantedPermissions: result.grantedPermissions.map((permission) => ({
      ...permission,
      policies: permission.policies.map((policy) => {
        const data = (() => {
          if (policy.type === 'token-allowance')
            return {
              allowance: BigInt((policy.data as any).allowance),
            }
          if (policy.type === 'gas-limit')
            return {
              limit: BigInt((policy.data as any).limit),
            }
          return policy.data
        })()

        return {
          data,
          type: policy.type,
        }
      }),
    })),
    permissionsContext: result.permissionsContext,
    ...(result.signerData ? { signerData: result.signerData } : {}),
  }
}
