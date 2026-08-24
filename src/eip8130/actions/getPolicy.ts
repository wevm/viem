import type { Address } from 'abitype'

import { readContract } from '../../actions/public/readContract.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { Hex } from '../../types/misc.js'
import { accountConfigurationAbi } from '../abis.js'
import { keystoreAddress } from '../constants.js'

export type GetPolicyParameters = {
  /** The account whose actor policy to read. */
  account: Address
  /** The 32-byte actor identifier (see `key.*(...).actorId`). */
  actorId: Hex
}

export type GetPolicyReturnType = {
  /** Policy manager the actor is gated to (the zero address when unset). */
  target: Address
  /** 32-byte policy commitment stored on the actor. */
  commitment: Hex
}

/**
 * Reads the policy binding for an actor (manager, commitment) from the finalized
 * Keystore system contract via its combined `getActor` read (one call returns
 * the actor config plus its policy manager and commitment). Use it to resolve a
 * session key's policy commitment for {@link getSessionSpend}. The manager and
 * commitment are non-zero only for a live, policy-gated actor.
 *
 * @example
 * ```ts
 * import { getPolicy, getSessionSpend, key } from 'viem/eip8130'
 *
 * const { commitment } = await getPolicy(client, {
 *   account: account.address,
 *   actorId: key.p256({ x, y }).actorId,
 * })
 * const spend = await getSessionSpend(client, { commitment, token: usdc })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The actor's policy binding.
 */
export async function getPolicy<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: GetPolicyParameters,
): Promise<GetPolicyReturnType> {
  const { account, actorId } = parameters

  // The finalized Keystore exposes a single combined read that returns the actor
  // config plus its policy manager and commitment; `policyManager` and
  // `policyCommitment` are zero for a non-live / ungated actor.
  const [, policyManager, policyCommitment] = await readContract(client, {
    address: keystoreAddress,
    abi: accountConfigurationAbi,
    functionName: 'getActor',
    args: [account, actorId],
  })

  return { target: policyManager, commitment: policyCommitment }
}
