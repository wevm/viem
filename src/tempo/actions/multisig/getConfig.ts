import type { Address, Errors } from 'ox'
import { MultisigConfig } from 'ox/tempo'
import type * as Client from '../../../core/Client.js'

/**
 * Gets the current cached config for a multisig account.
 *
 * The coordinator reads the account's current onchain commitment and returns
 * the matching config from its store. It returns `null` when the config is not
 * cached.
 *
 * @example
 * ```ts
 * const config = await client.multisig.getConfig({
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
    method: 'multisig_getConfig',
    params: [{ address: parameters.address }],
  })
  return config ? MultisigConfig.fromRpc(config as MultisigConfig.Rpc) : null
}

export declare namespace getConfig {
  /** Parameters for {@link getConfig}. */
  export type Options = {
    /** Multisig account address. */
    address: Address.Address
  }

  /** Return value for {@link getConfig}. */
  export type ReturnType = MultisigConfig.Config | null

  /** Error type for {@link getConfig}. */
  export type ErrorType = Errors.GlobalErrorType
}
