import type { Errors, Hex } from 'ox'
import { MultisigOperation } from 'ox/tempo'
import type * as Client from '../../../core/Client.js'

/**
 * Gets a coordinated multisig operation by its hash.
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
    method: 'multisig_getOperation',
    params: [parameters.hash],
  })
  return operation
    ? MultisigOperation.fromRpc(operation as MultisigOperation.Rpc)
    : null
}

export declare namespace getOperation {
  /** Parameters for {@link getOperation}. */
  export type Options = {
    /** Multisig operation hash. */
    hash: Hex.Hex
  }

  /** Return value for {@link getOperation}. */
  export type ReturnType = MultisigOperation.Operation | null

  /** Error type for {@link getOperation}. */
  export type ErrorType = Errors.GlobalErrorType
}
