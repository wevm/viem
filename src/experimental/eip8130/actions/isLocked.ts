import type { Address } from 'abitype'

import { readContract } from '../../../actions/public/readContract.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import { accountConfigurationAbi } from '../abis.js'
import { accountConfigAddress as defaultAccountConfigAddress } from '../constants.js'

export type IsLockedParameters = {
  /** The account to check. */
  account: Address
  /**
   * `AccountConfiguration` system contract. Defaults to the canonical
   * (enshrined) address, which is identical on every supported chain.
   */
  accountConfiguration?: Address | undefined
}

export type IsLockedReturnType = boolean

/**
 * Reads whether an EIP-8130 account is currently locked, from the
 * `AccountConfiguration` system contract (`isLocked`). For the full status
 * (unlock timing, delay), use {@link getLockStatus}.
 *
 * @example
 * ```ts
 * import { isLocked } from 'viem/experimental/eip8130'
 *
 * const locked = await isLocked(client, { account: account.address })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns Whether the account is locked.
 */
export async function isLocked<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: IsLockedParameters,
): Promise<IsLockedReturnType> {
  const { account, accountConfiguration = defaultAccountConfigAddress } =
    parameters

  return readContract(client, {
    address: accountConfiguration,
    abi: accountConfigurationAbi,
    functionName: 'isLocked',
    args: [account],
  })
}
