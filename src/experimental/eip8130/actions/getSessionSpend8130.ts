import type { Address } from 'abitype'

import { readContract } from '../../../actions/public/readContract.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import type { Hex } from '../../../types/misc.js'
import { getAction } from '../../../utils/getAction.js'
import {
  sessionPolicyAbi,
  sessionPolicyAddress,
  type SessionPolicyTokenLimit,
} from '../policies.js'

export type GetSessionSpend8130Parameters = {
  /** The session policy binding commitment (see `defineSessionPolicy().commitment`). */
  commitment: Hex
  /**
   * The committed token limit whose usage to read — the exact `{ token, limit,
   * period }` from the binding's `SessionPolicyConfig`.
   *
   * base/eip-8130#43 dropped on-chain config storage: `getCurrentSpend` now takes
   * the token limit explicitly (usage is meaningful only when this matches the
   * limit the account signed). Use the zero address for the native-ETH cap.
   */
  tokenLimit: SessionPolicyTokenLimit
  /**
   * `SessionPolicy` contract. Defaults to the reference Base Sepolia deployment.
   */
  sessionPolicy?: Address | undefined
}

export type GetSessionSpend8130ReturnType = {
  /** The spend cap per period (atomic units) — echoes the supplied `tokenLimit.limit`. */
  allowance: bigint
  /** Period length in seconds. `0` = one-time (never resets). */
  period: number
  /** Amount already spent in the current period (atomic units). */
  spent: bigint
  /** Remaining budget in the current period (`allowance - spent`, clamped at `0`). */
  remaining: bigint
  /** Unix timestamp (seconds) the current period started (`0` if never spent). */
  periodStart: number
  /** Unix timestamp (seconds) the current period ends (`0` if one-time / unused). */
  periodEnd: number
}

/**
 * Reads the live spend / remaining budget for a session key against a specific
 * committed token limit from the reference `SessionPolicy` contract
 * (`getCurrentSpend`). Use it to render a "remaining budget" view for a
 * policy-gated key.
 *
 * @example
 * ```ts
 * import { getSessionSpend8130 } from 'viem/experimental/eip8130'
 *
 * // Pass the exact token limit from the binding's config.
 * const { allowance, spent, remaining, periodEnd } = await getSessionSpend8130(
 *   client,
 *   {
 *     commitment: session.commitment,
 *     tokenLimit: { token: usdc, limit: parseUnits('100', 6), period: 604800n },
 *   },
 * )
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The session key's limit and current-period spend for the token.
 */
export async function getSessionSpend8130<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: GetSessionSpend8130Parameters,
): Promise<GetSessionSpend8130ReturnType> {
  const {
    commitment,
    tokenLimit,
    sessionPolicy = sessionPolicyAddress,
  } = parameters

  const read = getAction(client, readContract, 'readContract')

  const allowance = tokenLimit.limit
  const period = Number(tokenLimit.period ?? 0n)

  const usage = await read({
    address: sessionPolicy,
    abi: sessionPolicyAbi,
    functionName: 'getCurrentSpend',
    args: [
      commitment,
      {
        token: tokenLimit.token,
        limit: tokenLimit.limit,
        period,
      },
    ],
  })

  const spent = usage.spend
  const remaining = allowance > spent ? allowance - spent : 0n

  return {
    allowance,
    period,
    spent,
    remaining,
    periodStart: usage.start,
    periodEnd: usage.end,
  }
}
