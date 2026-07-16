import type { Address } from 'abitype'

import { readContract } from '../../../actions/public/readContract.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import type { Hex } from '../../../types/misc.js'
import { accountConfigurationAbi } from '../abis.js'
import { accountConfigAddress as defaultAccountConfigAddress } from '../constants.js'

export type IsActor8130Parameters = {
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

export type IsActor8130ReturnType = boolean

/**
 * Reads whether an actor is currently authorized on an EIP-8130 account, from
 * the `AccountConfiguration` system contract (`isActor`). For the actor's full
 * configuration, use {@link getActorConfig8130}.
 *
 * @example
 * ```ts
 * import { isActor8130, key } from 'viem/experimental/eip8130'
 *
 * const authorized = await isActor8130(client, {
 *   account: account.address,
 *   actorId: key.p256({ x, y }).actorId,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns Whether the actor is authorized.
 */
export async function isActor8130<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: IsActor8130Parameters,
): Promise<IsActor8130ReturnType> {
  const {
    account,
    actorId,
    accountConfiguration = defaultAccountConfigAddress,
  } = parameters

  return readContract(client, {
    address: accountConfiguration,
    abi: accountConfigurationAbi,
    functionName: 'isActor',
    args: [account, actorId],
  })
}
