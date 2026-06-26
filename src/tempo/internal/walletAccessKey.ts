import type { Address } from 'abitype'
import * as AbiItem from 'ox/AbiItem'
import { KeyAuthorization } from 'ox/tempo'
import type { Hex } from '../../types/misc.js'
import { numberToHex } from '../../utils/encoding/toHex.js'
import { resolveAccessKey } from '../Account.js'

export type WalletAuthorizeAccessKeyParameters = {
  /** Access key to authorize. Omit to let the wallet generate and store one. */
  accessKey?: resolveAccessKey.Parameters | undefined
  /** Chain ID. Defaults to the active chain. */
  chainId?: number | bigint | undefined
  /** Unix timestamp when the key expires. */
  expiry: number
  /** Key type to request when the wallet generates the access key. */
  keyType?: ReturnType<typeof resolveAccessKey>['keyType'] | undefined
  /** Spending limits per token. */
  limits?:
    | { token: Address; limit: bigint; period?: number | undefined }[]
    | undefined
  /** Call scopes restricting which contracts/selectors this key can call. */
  scopes?: KeyAuthorization.Scope[] | undefined
  /** Optional funding prompt to show after approval. */
  showDeposit?:
    | boolean
    | {
        amount?: string | undefined
        displayName?: string | undefined
        token?: Address | string | undefined
      }
    | undefined
}

export type WalletAuthorizeAccessKeyRpcParameters = {
  address?: Address | undefined
  chainId?: Hex | undefined
  expiry: number
  keyType?: ReturnType<typeof resolveAccessKey>['keyType'] | undefined
  limits?:
    | { token: Address; limit: Hex; period?: number | undefined }[]
    | undefined
  scopes?:
    | {
        address: Address
        selector?: Hex | undefined
        recipients?: readonly Address[] | undefined
      }[]
    | undefined
  showDeposit?: WalletAuthorizeAccessKeyParameters['showDeposit']
}

function formatWalletKeyAuthorization(
  parameters: Pick<
    WalletAuthorizeAccessKeyParameters,
    'accessKey' | 'chainId' | 'expiry' | 'limits' | 'scopes'
  >,
) {
  const { accessKey, chainId, expiry, limits, scopes } = parameters
  if (!accessKey) return undefined
  const { accessKeyAddress, keyType } = resolveAccessKey(accessKey)
  return KeyAuthorization.from({
    address: accessKeyAddress,
    chainId:
      typeof chainId !== 'undefined'
        ? typeof chainId === 'bigint'
          ? chainId
          : BigInt(chainId)
        : 0n,
    expiry,
    limits,
    scopes,
    type: keyType,
  })
}

function formatWalletAuthorizeAccessKeyChainId(
  chainId: number | bigint | undefined,
) {
  if (typeof chainId === 'undefined') return undefined
  return typeof chainId === 'bigint' ? chainId : BigInt(chainId)
}

function formatWalletKeyAuthorizationScopes(
  scopes: readonly KeyAuthorization.Scope[] | undefined,
) {
  return scopes?.map((scope) => ({
    address: scope.address,
    ...(scope.selector
      ? {
          selector: scope.selector.startsWith('0x')
            ? (scope.selector as Hex)
            : AbiItem.getSelector(scope.selector),
        }
      : {}),
    ...(scope.recipients && scope.recipients.length > 0
      ? { recipients: scope.recipients }
      : {}),
  }))
}

export function formatWalletAuthorizeAccessKeyParameters(
  parameters: WalletAuthorizeAccessKeyParameters,
  options: {
    defaultChainId?: number | bigint | undefined
    includeShowDeposit?: boolean | undefined
  } = {},
): WalletAuthorizeAccessKeyRpcParameters {
  const {
    accessKey,
    chainId = options.defaultChainId,
    expiry,
    keyType,
    limits,
    scopes,
    showDeposit,
  } = parameters
  const keyAuthorization = formatWalletKeyAuthorization({
    accessKey,
    chainId,
    expiry,
    limits,
    scopes,
  })
  const chainId_ =
    typeof chainId !== 'undefined'
      ? (keyAuthorization?.chainId ??
        formatWalletAuthorizeAccessKeyChainId(chainId))
      : undefined
  const limits_ = keyAuthorization?.limits ?? limits
  const scopes_ = keyAuthorization?.scopes ?? scopes

  return {
    expiry,
    ...(keyAuthorization
      ? {
          address: keyAuthorization.address,
          keyType: keyAuthorization.type,
        }
      : keyType
        ? { keyType }
        : {}),
    ...(typeof chainId_ !== 'undefined'
      ? { chainId: numberToHex(chainId_) }
      : {}),
    ...(limits_
      ? {
          limits: limits_.map(({ token, limit, period }) => ({
            token,
            limit: numberToHex(limit),
            ...(typeof period !== 'undefined' ? { period } : {}),
          })),
        }
      : {}),
    ...(scopes_ ? { scopes: formatWalletKeyAuthorizationScopes(scopes_) } : {}),
    ...(options.includeShowDeposit && showDeposit !== undefined
      ? { showDeposit }
      : {}),
  }
}

export function formatWalletKeyAuthorizationResponse(
  keyAuthorization: KeyAuthorization.Rpc | KeyAuthorization.Signed,
) {
  if ('keyId' in keyAuthorization)
    return KeyAuthorization.fromRpc(keyAuthorization) as KeyAuthorization.Signed
  return keyAuthorization
}
