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
  return {
    chainId: Hex.toNumber(info.chainId),
    sequencer: info.sequencer,
    zoneId: Hex.toNumber(info.zoneId),
    zoneTokens: info.zoneTokens,
  }
}

export namespace getZoneInfo {
  export type Options = Record<string, never>
  export type RpcReturnType = {
    chainId: Hex.Hex
    sequencer: Address.Address
    zoneId: Hex.Hex
    zoneTokens: readonly Address.Address[]
  }
  export type ReturnType = {
    chainId: number
    sequencer: Address.Address
    zoneId: number
    zoneTokens: readonly Address.Address[]
  }
  export type ErrorType = Errors.GlobalErrorType
}
