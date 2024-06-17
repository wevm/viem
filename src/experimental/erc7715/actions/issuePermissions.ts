import type { Address } from 'abitype'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { WalletIssuePermissionsReturnType } from '../../../types/eip1193.js'
import type { Hex } from '../../../types/misc.js'
import type { OneOf } from '../../../types/utils.js'
import { numberToHex } from '../../../utils/encoding/toHex.js'
import type { Permission } from '../types/permission.js'
import type { Signer } from '../types/signer.js'

export type IssuePermissionsParameters = {
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

export type IssuePermissionsReturnType = {
  /** Timestamp (in seconds) that specifies the time by which this session MUST expire. */
  expiry: number
  /** ERC-4337 Factory to deploy smart contract account. */
  factory?: Hex | undefined
  /** Calldata to use when calling the ERC-4337 Factory. */
  factoryData?: string | undefined
  /** Set of granted permissions. */
  grantedPermissions: Omit<Permission, 'required'>[]
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
 * - Docs: https://viem.sh/experimental/erc7715/issuePermissions
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { issuePermissions } from 'viem/experimental'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 *
 * const result = await issuePermissions(client, {
 *   expiry: 1716846083638,
 *   permissions: [
 *     {
 *       type: 'contract-call',
 *       data: {
 *         address: '0x0000000000000000000000000000000000000000',
 *       },
 *     },
 *     {
 *       type: 'native-token-limit',
 *       data: {
 *         amount: 69420n,
 *       },
 *       required: true,
 *     },
 *   ],
 * })
 */
export async function issuePermissions(
  client: Client<Transport>,
  parameters: IssuePermissionsParameters,
): Promise<IssuePermissionsReturnType> {
  const { expiry, permissions, signer } = parameters
  const result = await client.request(
    {
      method: 'wallet_issuePermissions',
      params: [parseParameters({ expiry, permissions, signer })],
    },
    { retryCount: 0 },
  )
  return parseResult(result) as IssuePermissionsReturnType
}

function parseParameters(parameters: IssuePermissionsParameters) {
  const { account, expiry, permissions, signer: signer_ } = parameters

  const signer = (() => {
    if (!account && !signer_) return undefined

    if (account) {
      // Address as signer.
      if (typeof account === 'string')
        return {
          type: 'account',
          data: {
            id: account,
          },
        }

      // Viem Account as signer.
      return {
        type: 'account',
        data: {
          id: account.address,
        },
      }
    }

    // ERC-7715 Signer as signer.
    return signer_
  })()

  return {
    expiry,
    permissions: permissions.map((permission) => ({
      ...permission,
      ...(permission.data && typeof permission.data === 'object'
        ? {
            data: {
              ...permission.data,
              ...('amount' in permission.data &&
              typeof permission.data.amount === 'bigint'
                ? { amount: numberToHex(permission.data.amount) }
                : {}),
            },
          }
        : {}),
      required: permission.required ?? false,
    })),
    ...(signer ? { signer } : {}),
  }
}

function parseResult(result: WalletIssuePermissionsReturnType) {
  return {
    expiry: result.expiry,
    ...(result.factory ? { factory: result.factory } : {}),
    ...(result.factoryData ? { factoryData: result.factoryData } : {}),
    grantedPermissions: result.grantedPermissions.map((permission) => ({
      ...permission,
      data: {
        ...permission.data,
        ...('amount' in permission.data
          ? { amount: BigInt(permission.data.amount) }
          : {}),
      },
    })),
    permissionsContext: result.permissionsContext,
    ...(result.signerData ? { signerData: result.signerData } : {}),
  }
}
