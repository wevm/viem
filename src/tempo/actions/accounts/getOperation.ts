import type { Errors, Hex } from 'ox'
import { AccountOperation } from 'ox/tempo'
import type * as Client from '../../../core/Client.js'

/**
 * Gets a coordinated account operation by its hash.
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The operation, or `null` when it is unknown.
 */
export async function getOperation(
  client: Client.Client,
  parameters: getOperation.Options,
): Promise<getOperation.ReturnType> {
  const operation = await client.request({
    method: 'account_getOperation',
    params: [parameters.hash],
  })
  return operation
    ? AccountOperation.fromRpc(operation as AccountOperation.Rpc)
    : null
}

export declare namespace getOperation {
  /** Parameters for {@link getOperation}. */
  export type Options = {
    /** Account operation hash. */
    hash: Hex.Hex
  }

  /** Return value for {@link getOperation}. */
  export type ReturnType = AccountOperation.Operation | null

  /** Error type for {@link getOperation}. */
  export type ErrorType = Errors.GlobalErrorType
}
