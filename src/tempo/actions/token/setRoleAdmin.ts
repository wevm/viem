import { AbiEvent } from 'ox'
import type { Errors, Log } from 'ox'
import { TokenRole } from 'ox/tempo'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import type { simulate as simulateContract } from '../../../core/actions/contract/simulate.js'
import { write } from '../../../core/actions/contract/write.js'
import type { writeSync } from '../../../core/actions/contract/writeSync.js'
import * as Abis from '../../Abis.js'
import type { TokenParameter, WriteParameters } from '../../internal/types.js'
import {
  type CallParameters,
  defineCall,
  dispatchWrite,
  estimateWrite,
  pickWriteParameters,
  resolveCallParameters,
  resolveToken,
  simulateWrite,
} from '../../internal/utils.js'

/**
 * Sets the admin role for a specific role in a TIP-20 token.
 *
 * @example
 * ```ts
 * import { Account, Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromSecp256k1('0x…'),
 *   transport: http(),
 * })
 *
 * const hash = await Actions.token.setRoleAdmin(client, {
 *   adminRole: 'admin',
 *   role: 'issuer',
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function setRoleAdmin<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: setRoleAdmin.Options,
): Promise<setRoleAdmin.ReturnType> {
  return setRoleAdmin.inner(write, client, options)
}

export namespace setRoleAdmin {
  export type Args = {
    /** New admin role. */
    adminRole: TokenRole.TokenRole
    /** Role to set admin for. */
    role: TokenRole.TokenRole
  } & TokenParameter
  export type Options = WriteParameters & Args
  export type ReturnType = write.ReturnType
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /** @internal */
  export async function inner<
    action extends typeof write | typeof writeSync,
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    action: action,
    client: Client.Client<chain, account>,
    options: setRoleAdmin.Options,
  ): Promise<dispatchWrite.ReturnType<action>> {
    return dispatchWrite(action, client, {
      ...options,
      ...setRoleAdmin.call(client, options),
    })
  }

  /**
   * Defines a call to the `setRoleAdmin` function.
   *
   * Can be passed to any action that accepts a contract call. The token is
   * selected by `token`, which is a TIP-20 token contract address.
   *
   * @param parameters - Client (optional), followed by the call arguments.
   * @returns The call.
   */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [client, args] = resolveCallParameters(parameters)
    const { adminRole, role, token } = args
    const roleHash = TokenRole.serialize(role)
    const adminRoleHash = TokenRole.serialize(adminRole)
    return defineCall({
      abi: Abis.tip20,
      address: resolveToken(client, { token }).address,
      args: [roleHash, adminRoleHash],
      functionName: 'setRoleAdmin',
    })
  }

  /**
   * Estimates the gas required.
   *
   * @param client - Client.
   * @param options - Options.
   * @returns The gas estimate.
   */
  export async function estimateGas<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: setRoleAdmin.Options,
  ): Promise<bigint> {
    return estimateWrite(client, {
      ...pickWriteParameters(options),
      ...setRoleAdmin.call(client, options),
    })
  }

  /**
   * Simulates the call.
   *
   * @param client - Client.
   * @param options - Options.
   * @returns The simulation result and write request.
   */
  export async function simulate<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: setRoleAdmin.Options,
  ): Promise<simulateContract.ReturnType<typeof Abis.tip20, 'setRoleAdmin'>> {
    return simulateWrite(client, {
      ...pickWriteParameters(options),
      ...setRoleAdmin.call(client, options),
    })
  }

  /**
   * Extracts the `RoleAdminUpdated` event from logs.
   *
   * @param logs - The logs.
   * @returns The `RoleAdminUpdated` event.
   */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip20, logs, {
      eventName: 'RoleAdminUpdated',
      strict: true,
    })
    if (!log) throw new Error('`RoleAdminUpdated` event not found.')
    return log
  }
}
