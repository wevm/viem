import type { Address } from 'ox'
import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { read } from '../../../core/actions/contract/read.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'
import type { ReadParameters } from '../../internal/types.js'
import { defineCall } from '../../internal/utils.js'

/**
 * Gets the current configuration commitment for a native multisig account.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const commitment = await Actions.multisig.getConfigCommitment(client, {
 *   account: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The current configuration commitment, or zero when no config has
 * been committed.
 */
export async function getConfigCommitment<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  parameters: getConfigCommitment.Options,
): Promise<getConfigCommitment.ReturnType> {
  const { account, ...rest } = parameters
  return read(client, {
    ...rest,
    ...getConfigCommitment.call({ account }),
  })
}

export namespace getConfigCommitment {
  export type Options = ReadParameters & Args

  export type Args = {
    /** Initialized multisig account address. */
    account: Address.Address
  }

  export type ReturnType = read.ReturnType<
    typeof Abis.nativeMultisig,
    'getConfigCommitment',
    never
  >

  /**
   * Defines a call to the `getConfigCommitment` function.
   *
   * Can be passed to [`multicall`](https://viem.sh/docs/contract/multicall).
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    return defineCall({
      address: Addresses.nativeMultisig,
      abi: Abis.nativeMultisig,
      args: [args.account],
      functionName: 'getConfigCommitment',
    })
  }
}
