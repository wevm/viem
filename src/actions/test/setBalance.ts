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
import { numberToHex } from '../../utils/encoding/toHex.js'

export type SetBalanceParameters = {
  /** The account address. */
  address: Address
  /** Amount (in wei) to set */
  value: bigint
}

export type SetBalanceErrorType = RequestErrorType | ErrorType

/**
 * Modifies the balance of an account.
 *
 * - Docs: https://viem.sh/docs/actions/test/setBalance
 *
 * @param client - Client to use
 * @param parameters – {@link SetBalanceParameters}
 *
 * @example
 * import { createTestClient, http, parseEther } from 'viem'
 * import { foundry } from 'viem/chains'
 * import { setBalance } from 'viem/test'
 *
 * const client = createTestClient({
 *   mode: 'anvil',
 *   chain: 'foundry',
 *   transport: http(),
 * })
 * await setBalance(client, {
 *   address: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
 *   value: parseEther('1'),
 * })
 */
export async function setBalance<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client: TestClient<TestClientMode, Transport, TChain, TAccount, false>,
  { address, value }: SetBalanceParameters,
) {
  if (client.mode === 'ganache')
    await client.request({
      method: 'evm_setAccountBalance',
      params: [address, numberToHex(value)],
    })
  else
    await client.request({
      method: `${client.mode}_setBalance`,
      params: [address, numberToHex(value)],
    })
}
