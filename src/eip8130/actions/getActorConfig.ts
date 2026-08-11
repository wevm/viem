import type { Address } from 'abitype'

import { readContract } from '../../actions/public/readContract.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { Hex } from '../../types/misc.js'
import { accountConfigurationAbi } from '../abis.js'
import {
  actorScope,
  accountConfigAddress as defaultAccountConfigAddress,
} from '../constants.js'

export type GetActorConfigParameters = {
  /** The account whose actor to read. */
  account: Address
  /** The 32-byte actor identifier (see `key.*(...).actorId`). */
  actorId: Hex
  /**
   * `AccountConfiguration` system contract. Defaults to the canonical
   * (enshrined) address, which is identical on every supported chain.
   */
  accountConfiguration?: Address | undefined
}

export type GetActorConfigReturnType = {
  /** Authenticator contract address (or protocol sentinel) for the actor. */
  authenticator: Address
  /** Permission bitmask (see `actorScope`). `0` = unrestricted. */
  scope: number
  /** Actor expiry (unix seconds). `0` = no expiry. */
  expiry: number
  /** Whether the actor is policy-gated (derived from the `SCOPE_POLICY` bit in `scope`). */
  hasPolicy: boolean
}

/**
 * Reads an actor's configuration (authenticator, scope, expiry, policy type)
 * from the `AccountConfiguration` system contract (`getActorConfig`). Use it to
 * inspect owners / session keys, e.g. to enrich a "sign with" picker.
 *
 * @example
 * ```ts
 * import { getActorConfig, key } from 'viem/eip8130'
 *
 * const config = await getActorConfig(client, {
 *   account: account.address,
 *   actorId: key.p256({ x, y }).actorId,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The actor's configuration.
 */
export async function getActorConfig<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: GetActorConfigParameters,
): Promise<GetActorConfigReturnType> {
  const {
    account,
    actorId,
    accountConfiguration = defaultAccountConfigAddress,
  } = parameters

  const config = await readContract(client, {
    address: accountConfiguration,
    abi: accountConfigurationAbi,
    functionName: 'getActorConfig',
    args: [account, actorId],
  })

  return {
    authenticator: config.authenticator,
    scope: config.scope,
    expiry: config.expiry,
    hasPolicy: (config.scope & actorScope.policy) !== 0,
  }
}
