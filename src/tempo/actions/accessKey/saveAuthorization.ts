import type { Errors } from 'ox'
import { KeyAuthorization } from 'ox/tempo'
import type * as Client from '../../../core/Client.js'

/**
 * Saves a signed key authorization to a relay with key authorization storage.
 *
 * The relay attaches the authorization to the access key's next transaction until
 * the key is active onchain. Use this for authorizations signed outside
 * `signAuthorization`, such as on another device. Requires a relay running the
 * `Relay.keyAuthorization` plugin.
 *
 * @example
 * ```ts
 * import { Actions, Client, http, withRelay } from 'viem/tempo'
 *
 * const client = Client.create({
 *   transport: withRelay(http(), http('https://relay.example.com'), {
 *     keyAuthorization: true,
 *   }),
 * })
 *
 * await Actions.accessKey.saveAuthorization(client, { keyAuthorization })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 */
export async function saveAuthorization(
  client: Client.Client,
  options: saveAuthorization.Options,
): Promise<saveAuthorization.ReturnType> {
  await client.request({
    method: 'relay_saveKeyAuthorization',
    params: [KeyAuthorization.toRpc(options.keyAuthorization)],
  })
}

export declare namespace saveAuthorization {
  /** Options for {@link saveAuthorization}. */
  export type Options = {
    /** Signed key authorization to save. */
    keyAuthorization: KeyAuthorization.Signed
  }

  /** Return value for {@link saveAuthorization}. */
  export type ReturnType = void

  /** Error type for {@link saveAuthorization}. */
  export type ErrorType = Errors.GlobalErrorType
}
