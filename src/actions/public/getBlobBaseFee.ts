import type { Account } from '../../accounts/types.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Chain } from '../../types/chain.js'
import type { EIP1193RequestOptions } from '../../types/eip1193.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'

export type GetBlobBaseFeeParameters = {
  /** Request options. */
  requestOptions?: EIP1193RequestOptions | undefined
}

export type GetBlobBaseFeeReturnType = bigint

export type GetBlobBaseFeeErrorType = RequestErrorType | ErrorType

/**
 * Returns the base fee per blob gas in wei.
 *
 * - Docs: https://viem.sh/docs/actions/public/getBlobBaseFee
 * - JSON-RPC Methods: [`eth_blobBaseFee`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_blobBaseFee)
 *
 * @param client - Client to use
 * @returns The blob base fee (in wei). {@link GetBlobBaseFeeReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getBlobBaseFee } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const blobBaseFee = await getBlobBaseFee(client)
 */
export async function getBlobBaseFee<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  { requestOptions }: GetBlobBaseFeeParameters = {},
): Promise<GetBlobBaseFeeReturnType> {
  const baseFee = await client.request(
    {
      method: 'eth_blobBaseFee',
    },
    requestOptions,
  )
  return BigInt(baseFee)
}
