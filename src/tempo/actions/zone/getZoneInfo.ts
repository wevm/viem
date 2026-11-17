import { Hex } from 'ox'
import type { Address, Errors } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'

/**
 * Returns the current zone metadata.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({ transport: http() })
 *
 * const info = await Actions.zone.getZoneInfo(client, {})
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns Zone metadata.
 */
export async function getZoneInfo<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: getZoneInfo.Options = {},
): Promise<getZoneInfo.ReturnType> {
  void options
  const info = (await client.request({
    method: 'zone_getZoneInfo',
    params: [],
  })) as getZoneInfo.RpcReturnType
  const tempoBlockNumber =
    info.tempoBlockNumber ??
    (
      (await client.request({
        method: 'zone_getDepositStatus',
        params: ['0x0'],
      })) as { zoneProcessedThrough: Hex.Hex }
    ).zoneProcessedThrough
  return {
    chainId: Hex.toNumber(info.chainId),
    sequencers: 'sequencers' in info ? info.sequencers : [info.sequencer],
    tempoBlockNumber: Hex.toBigInt(tempoBlockNumber),
    zoneId: Hex.toNumber(info.zoneId),
    zoneTokens: info.zoneTokens,
  }
}

export namespace getZoneInfo {
  export type Options = Record<string, never>
  export type RpcReturnType = {
    /** Zone chain ID. */
    chainId: Hex.Hex
    /** Latest Tempo block imported by the zone. */
    tempoBlockNumber?: Hex.Hex | undefined
    /** Zone ID. */
    zoneId: Hex.Hex
    /** Enabled zone token addresses. */
    zoneTokens: readonly Address.Address[]
  } & (
    | {
        /** Active sequencer addresses. */
        sequencers: readonly Address.Address[]
      }
    | {
        /** Active sequencer address. */
        sequencer: Address.Address
      }
  )
  export type ReturnType = {
    /** Zone chain ID. */
    chainId: number
    /** Active sequencer addresses. */
    sequencers: readonly Address.Address[]
    /** Latest Tempo block imported by the zone. */
    tempoBlockNumber: bigint
    /** Zone ID. */
    zoneId: number
    /** Enabled zone token addresses. */
    zoneTokens: readonly Address.Address[]
  }
  export type ErrorType = Errors.GlobalErrorType
}
