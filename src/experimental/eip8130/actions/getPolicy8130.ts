import type { Address } from 'abitype'

import { readContract } from '../../../actions/public/readContract.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import type { Hex } from '../../../types/misc.js'
import { accountConfigurationAbi } from '../abis.js'
import { accountConfigAddress as defaultAccountConfigAddress } from '../constants.js'

export type GetPolicy8130Parameters = {
  /** The account whose actor policy to read. */
  account: Address
  /** The 32-byte actor identifier (see `key.*(...).actorId`). */
  actorId: Hex
  /**
   * `AccountConfiguration` system contract. Defaults to the canonical
   * (enshrined) address, which is identical on every supported chain.
   */
  accountConfiguration?: Address | undefined
}

export type GetPolicy8130ReturnType = {
  /** Policy manager the actor is gated to (the zero address when unset). */
  target: Address
  /** 32-byte policy commitment stored on the actor. */
  commitment: Hex
}

/**
 * Reads the policy binding for an actor (manager, commitment) from
 * the `AccountConfiguration` system contract (`getPolicy`). Use it to resolve a
 * session key's policy commitment for {@link getSessionSpend8130}.
 *
 * @example
 * ```ts
 * import { getPolicy8130, getSessionSpend8130, key } from 'viem/experimental/eip8130'
 *
 * const { commitment } = await getPolicy8130(client, {
 *   account: account.address,
 *   actorId: key.p256({ x, y }).actorId,
 * })
 * const spend = await getSessionSpend8130(client, { commitment, token: usdc })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The actor's policy binding.
 */
export async function getPolicy8130<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: GetPolicy8130Parameters,
): Promise<GetPolicy8130ReturnType> {
  const {
    account,
    actorId,
    accountConfiguration = defaultAccountConfigAddress,
  } = parameters

  const [target, commitment] = await readContract(client, {
    address: accountConfiguration,
    abi: accountConfigurationAbi,
    functionName: 'getPolicy',
    args: [account, actorId],
  })

  return { target, commitment }
}
