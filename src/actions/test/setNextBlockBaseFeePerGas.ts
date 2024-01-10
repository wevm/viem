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

export type SetNextBlockBaseFeePerGasParameters = {
  /** Base fee per gas (in wei). */
  baseFeePerGas: bigint
}

export type SetNextBlockBaseFeePerGasErrorType = RequestErrorType | ErrorType

/**
 * Sets the next block's base fee per gas.
 *
 * - Docs: https://viem.sh/docs/actions/test/setNextBlockBaseFeePerGas
 *
 * @param client - Client to use
 * @param parameters – {@link SetNextBlockBaseFeePerGasParameters}
 *
 * @example
 * import { createTestClient, http, parseGwei } from 'viem'
 * import { foundry } from 'viem/chains'
 * import { setNextBlockBaseFeePerGas } from 'viem/test'
 *
 * const client = createTestClient({
 *   mode: 'anvil',
 *   chain: 'foundry',
 *   transport: http(),
 * })
 * await setNextBlockBaseFeePerGas(client, {
 *   baseFeePerGas: parseGwei('20'),
 * })
 */
export async function setNextBlockBaseFeePerGas<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client: TestClient<TestClientMode, Transport, TChain, TAccount, false>,
  { baseFeePerGas }: SetNextBlockBaseFeePerGasParameters,
) {
  await client.request({
    method: `${client.mode}_setNextBlockBaseFeePerGas`,
    params: [numberToHex(baseFeePerGas)],
  })
}
