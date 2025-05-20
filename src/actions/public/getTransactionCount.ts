import type { Address } from 'abitype'

import type { Account } from '../../accounts/types.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { BlockTag } from '../../types/block.js'
import type { Chain } from '../../types/chain.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import {
  type HexToNumberErrorType,
  hexToNumber,
} from '../../utils/encoding/fromHex.js'
import {
  type NumberToHexErrorType,
  numberToHex,
} from '../../utils/encoding/toHex.js'

export type GetTransactionCountParameters = {
  /** The account address. */
  address: Address
} & (
  | {
      /** The block number. */
      blockNumber?: bigint | undefined
      blockTag?: undefined
    }
  | {
      blockNumber?: undefined
      /** The block tag. Defaults to 'latest'. */
      blockTag?: BlockTag | undefined
    }
)
export type GetTransactionCountReturnType = number

export type GetTransactionCountErrorType =
  | RequestErrorType
  | NumberToHexErrorType
  | HexToNumberErrorType
  | ErrorType

/**
 * Returns the number of [Transactions](https://viem.sh/docs/glossary/terms#transaction) an Account has sent.
 *
 * - Docs: https://viem.sh/docs/actions/public/getTransactionCount
 * - JSON-RPC Methods: [`eth_getTransactionCount`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gettransactioncount)
 *
 * @param client - Client to use
 * @param parameters - {@link GetTransactionCountParameters}
 * @returns The number of transactions an account has sent. {@link GetTransactionCountReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getTransactionCount } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const transactionCount = await getTransactionCount(client, {
 *   address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 * })
 */
export async function getTransactionCount<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  { address, blockTag = 'latest', blockNumber }: GetTransactionCountParameters,
): Promise<GetTransactionCountReturnType> {
  const count = await client.request(
    {
      method: 'eth_getTransactionCount',
      params: [
        address,
        typeof blockNumber === 'bigint' ? numberToHex(blockNumber) : blockTag,
      ],
    },
    {
      dedupe: Boolean(blockNumber),
    },
  )
  return hexToNumber(count)
}
