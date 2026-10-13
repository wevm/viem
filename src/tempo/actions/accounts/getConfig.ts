import type { Address, Errors } from 'ox'
import { AccountConfig } from 'ox/tempo'
import type * as Client from '../../../core/Client.js'

/**
 * Gets the current cached config for a configurable account.
 *
 * The coordinator reads the account's current onchain commitment and returns
 * the matching config from its store. It returns `null` when the config is not
 * cached.
 *
 * @example
 * ```ts
 * const config = await client.accounts.getConfig({
 *   address: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The config, or `null` when it is unknown.
 */
export async function getConfig(
  client: Client.Client,
  parameters: getConfig.Options,
): Promise<getConfig.ReturnType> {
  const config = await client.request({
    method: 'account_getConfig',
    params: [{ address: parameters.address }],
  })
  return config ? AccountConfig.fromRpc(config as AccountConfig.Rpc) : null
}

export declare namespace getConfig {
  /** Parameters for {@link getConfig}. */
  export type Options = {
    /** Configurable account address. */
    address: Address.Address
  }

  /** Return value for {@link getConfig}. */
  export type ReturnType = AccountConfig.Config | null

  /** Error type for {@link getConfig}. */
  export type ErrorType = Errors.GlobalErrorType
}
