import type { Address, Errors } from 'ox'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import * as Contract from '../../../core/Contract.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'
import type { ReadParameters } from '../../internal/types.js'

/**
 * Gets metadata and configuration for a zone portal.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempoModerato } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({
 *   chain: tempoModerato,
 *   transport: http(),
 * })
 *
 * const info = await Actions.zone.getPortalInfo(client, {
 *   zoneId: 7,
 * })
 * ```
 *
 * @param client - Public client connected to the parent Tempo chain.
 * @param parameters - Zone portal parameters.
 * @returns The portal metadata and configuration.
 */
export async function getPortalInfo<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  parameters: getPortalInfo.Options,
): Promise<getPortalInfo.ReturnType> {
  const { portalAddress: portalAddress_, zoneId, ...rest } = parameters
  const portal = Contract.from({
    abi: Abis.zonePortal,
    address: portalAddress_ ?? Addresses.zonePortal(zoneId),
    client,
  })
  const [
    admin,
    enabledTokenCount,
    messenger,
    pauseExpiry,
    paused,
    pendingAdmin,
    sequencerCount,
    sequencerSetVersion,
    sequencerThreshold,
    verifier,
  ] = await Promise.all([
    portal.read.admin(rest),
    portal.read.enabledTokenCount(rest),
    portal.read.messenger(rest),
    portal.read.pauseExpiry(rest),
    portal.read.paused(rest),
    portal.read.pendingAdmin(rest),
    portal.read.sequencerCount(rest),
    portal.read.sequencerSetVersion(rest),
    portal.read.sequencerThreshold(rest),
    portal.read.verifier(rest),
  ])
  const [sequencers, enabledTokens] = await Promise.all([
    Promise.all(
      Array.from({ length: Number(sequencerCount) }, (_, index) =>
        portal.read.sequencerAt([BigInt(index)], rest),
      ),
    ),
    Promise.all(
      Array.from({ length: Number(enabledTokenCount) }, (_, index) =>
        portal.read.enabledTokenAt([BigInt(index)], rest),
      ),
    ),
  ])

  return {
    admin,
    enabledTokens,
    messenger,
    pauseExpiry,
    paused,
    pendingAdmin,
    sequencers,
    sequencerSetVersion,
    sequencerThreshold,
    verifier,
  }
}

export namespace getPortalInfo {
  export type Options = ReadParameters & Args

  export type Args = {
    /** Zone portal address. @default derived from `zoneId`. */
    portalAddress?: Address.Address | undefined
    /** Zone ID (e.g. `7`). */
    zoneId: number
  }

  export type ReturnType = {
    /** Portal governance admin. */
    admin: Address.Address
    /** Tokens enabled for deposits into the zone. */
    enabledTokens: readonly Address.Address[]
    /** Zone messenger assigned to the portal. */
    messenger: Address.Address
    /** Timestamp when the current emergency pause expires. */
    pauseExpiry: bigint
    /** Whether the portal is paused. */
    paused: boolean
    /** Pending governance admin. */
    pendingAdmin: Address.Address
    /** Active sequencer addresses. */
    sequencers: readonly Address.Address[]
    /** Version of the active sequencer set. */
    sequencerSetVersion: bigint
    /** Number of sequencers required to attest to a settlement. */
    sequencerThreshold: number
    /** Settlement verifier assigned to the portal. */
    verifier: Address.Address
  }

  export type ErrorType = Errors.GlobalErrorType
}
