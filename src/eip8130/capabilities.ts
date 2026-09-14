import type { Hex } from '../types/misc.js'
import { numberToHex } from '../utils/encoding/toHex.js'

/**
 * ERC-7715 permission types `fulfillGrantPermissions` can lower to a
 * `SessionPolicy`. `custom` is intentionally excluded (it cannot be safely
 * lowered), and gas is settled by the payer layer, not the session policy.
 */
export const supportedPermissionTypes = [
  'native-token-transfer',
  'erc20-token-transfer',
  'contract-call',
] as const

/** ERC-7715 policy types the session-policy mapping enforces. */
export const supportedPolicyTypes = ['token-allowance', 'rate-limit'] as const

/** ERC-7715 signer types accepted for a grant (a session key address). */
export const supportedSignerTypes = ['account', 'key'] as const

/** ERC-7895 sub-account owner key types `fulfillAddSubAccount` accepts. */
export const supportedSubAccountKeyTypes = [
  'address',
  'p256',
  'webcrypto-p256',
  'webauthn-p256',
] as const

export type Eip8130Capabilities = {
  /** EIP-8130 batches account changes + calls atomically in one transaction. */
  atomic: { status: 'supported' }
  /** ERC-7715 `wallet_grantPermissions` support (session keys / subscriptions). */
  permissions: {
    supported: true
    signerTypes: readonly string[]
    permissionTypes: readonly string[]
    policyTypes: readonly string[]
  }
  /** ERC-7895 `wallet_addSubAccount` support. */
  unstable_addSubAccount: {
    supported: true
    keyTypes: readonly string[]
  }
  /** ERC-8168 payer / paymaster sponsorship, when the wallet exposes it. */
  paymasterService?: { supported: boolean } | undefined
}

export type Eip8130CapabilitiesParameters = {
  /**
   * Advertise ERC-8168 payer / paymaster sponsorship (`paymasterService`).
   * @default false
   */
  paymasterService?: boolean | undefined
  /** Override the advertised ERC-7715 signer types. */
  signerTypes?: readonly string[] | undefined
  /** Override the advertised ERC-7715 permission types. */
  permissionTypes?: readonly string[] | undefined
  /** Override the advertised ERC-7715 policy types. */
  policyTypes?: readonly string[] | undefined
  /** Override the advertised ERC-7895 sub-account key types. */
  subAccountKeyTypes?: readonly string[] | undefined
}

/**
 * Builds the EIP-8130 wallet capabilities advertised via EIP-5792
 * `wallet_getCapabilities`, describing exactly what the adapters in this module
 * support: atomic batches, ERC-7715 grants (`fulfillGrantPermissions`), and
 * ERC-7895 sub-accounts (`fulfillAddSubAccount`).
 *
 * A wallet returns this (per chain — see {@link eip8130CapabilitiesByChain}) so
 * a dApp can discover, before requesting, which permission / policy / key types
 * it can rely on.
 *
 * @example
 * import { eip8130Capabilities } from 'viem/eip8130'
 *
 * // In a wallet's `wallet_getCapabilities` handler:
 * const capabilities = eip8130Capabilities({ paymasterService: true })
 */
export function eip8130Capabilities(
  parameters: Eip8130CapabilitiesParameters = {},
): Eip8130Capabilities {
  const {
    paymasterService,
    signerTypes = supportedSignerTypes,
    permissionTypes = supportedPermissionTypes,
    policyTypes = supportedPolicyTypes,
    subAccountKeyTypes = supportedSubAccountKeyTypes,
  } = parameters

  return {
    atomic: { status: 'supported' },
    permissions: {
      supported: true,
      signerTypes,
      permissionTypes,
      policyTypes,
    },
    unstable_addSubAccount: {
      supported: true,
      keyTypes: subAccountKeyTypes,
    },
    ...(paymasterService !== undefined
      ? { paymasterService: { supported: paymasterService } }
      : {}),
  }
}

/**
 * The same {@link eip8130Capabilities} keyed by chain id (hex), matching the
 * `wallet_getCapabilities` return shape (a per-chain record). EIP-8130
 * capabilities are identical across supported chains, so every chain maps to
 * the same descriptor.
 *
 * @example
 * import { eip8130CapabilitiesByChain } from 'viem/eip8130'
 *
 * const capabilities = eip8130CapabilitiesByChain([8453, 84532])
 * // { '0x2105': { ... }, '0x14a34': { ... } }
 */
export function eip8130CapabilitiesByChain(
  chainIds: readonly (number | Hex)[],
  parameters: Eip8130CapabilitiesParameters = {},
): Record<Hex, Eip8130Capabilities> {
  const capabilities = eip8130Capabilities(parameters)
  const record: Record<Hex, Eip8130Capabilities> = {}
  for (const chainId of chainIds) {
    const key = typeof chainId === 'number' ? numberToHex(chainId) : chainId
    record[key] = capabilities
  }
  return record
}
