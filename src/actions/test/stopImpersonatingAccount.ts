import type { Address } from 'abitype'

import type {
  TestClient,
  TestClientMode,
} from '../../clients/createTestClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'

export type StopImpersonatingAccountParameters = {
  /** The account to impersonate. */
  address: Address
}

export type StopImpersonatingAccountErrorType = RequestErrorType | ErrorType

/**
 * Stop impersonating an account after having previously used [`impersonateAccount`](https://viem.sh/docs/actions/test/impersonateAccount.html).
 *
 * - Docs: https://viem.sh/docs/actions/test/stopImpersonatingAccount.html
 *
 * @param client - Client to use
 * @param parameters – {@link StopImpersonatingAccountParameters}
 *
 * @example
 * import { createTestClient, http } from 'viem'
 * import { foundry } from 'viem/chains'
 * import { stopImpersonatingAccount } from 'viem/test'
 *
 * const client = createTestClient({
 *   mode: 'anvil',
 *   chain: 'foundry',
 *   transport: http(),
 * })
 * await stopImpersonatingAccount(client, {
 *   address: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
 * })
 */
export async function stopImpersonatingAccount<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client: TestClient<TestClientMode, Transport, TChain, TAccount, false>,
  { address }: StopImpersonatingAccountParameters,
) {
  await client.request({
    method: `${client.mode}_stopImpersonatingAccount`,
    params: [address],
  })
}
