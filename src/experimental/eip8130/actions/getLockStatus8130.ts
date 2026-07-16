import type { Address } from 'abitype'

import { readContract } from '../../../actions/public/readContract.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import { accountConfigurationAbi } from '../abis.js'
import { accountConfigAddress as defaultAccountConfigAddress } from '../constants.js'

export type GetLockStatus8130Parameters = {
  /** The account whose lock status to read. */
  account: Address
  /**
   * `AccountConfiguration` system contract. Defaults to the canonical
   * (enshrined) address, which is identical on every supported chain.
   */
  accountConfiguration?: Address | undefined
}

export type GetLockStatus8130ReturnType = {
  /** Whether the account is currently locked. */
  locked: boolean
  /** Whether an unlock has been initiated (the delay is counting down). */
  hasInitiatedUnlock: boolean
  /** Unix timestamp (seconds) at which an initiated unlock takes effect (`0` if none). */
  unlocksAt: number
  /** The configured unlock delay in seconds. */
  unlockDelay: number
}

/**
 * Reads the full lock status of an EIP-8130 account from the
 * `AccountConfiguration` system contract (`getLockStatus`).
 *
 * @example
 * ```ts
 * import { getLockStatus8130 } from 'viem/experimental/eip8130'
 *
 * const { locked, hasInitiatedUnlock, unlocksAt, unlockDelay } =
 *   await getLockStatus8130(client, { account: account.address })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The account's lock status.
 */
export async function getLockStatus8130<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: GetLockStatus8130Parameters,
): Promise<GetLockStatus8130ReturnType> {
  const { account, accountConfiguration = defaultAccountConfigAddress } =
    parameters

  const [locked, hasInitiatedUnlock, unlocksAt, unlockDelay] =
    await readContract(client, {
      address: accountConfiguration,
      abi: accountConfigurationAbi,
      functionName: 'getLockStatus',
      args: [account],
    })

  return { locked, hasInitiatedUnlock, unlocksAt, unlockDelay }
}
