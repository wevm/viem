import type { Address } from 'abitype'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { zeroAddress } from '../../constants/address.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { Hex } from '../../types/misc.js'
import { getActorConfig } from './getActorConfig.js'

export type IsActorParameters = {
  /** The account to check. */
  account: Address
  /** The 32-byte actor identifier (see `key.*(...).actorId`). */
  actorId: Hex
  /**
   * `AccountConfiguration` system contract. Defaults to the canonical
   * (enshrined) address, which is identical on every supported chain.
   */
  accountConfiguration?: Address | undefined
}

export type IsActorReturnType = boolean

/**
 * Reads whether an actor is currently authorized on an EIP-8130 account.
 *
 * The finalized Keystore system contract has no dedicated `isActor` view; actor
 * liveness is derived from {@link getActorConfig}, whose single resolver returns
 * the all-zero config (authenticator `0x0`) for any actor that is unknown,
 * revoked, disabled, or expired — and never reverts (including for an account
 * that has not been created yet). "Bound" therefore means a non-zero
 * authenticator. For the actor's full configuration, use {@link getActorConfig}.
 *
 * @example
 * ```ts
 * import { isActor, key } from 'viem/eip8130'
 *
 * const authorized = await isActor(client, {
 *   account: account.address,
 *   actorId: key.p256({ x, y }).actorId,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns Whether the actor is authorized.
 */
export async function isActor<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: IsActorParameters,
): Promise<IsActorReturnType> {
  const { account, actorId, accountConfiguration } = parameters

  const { authenticator } = await getActorConfig(client, {
    account,
    actorId,
    ...(accountConfiguration ? { accountConfiguration } : {}),
  })
  return authenticator !== zeroAddress
}
