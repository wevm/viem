import type { Address } from 'abitype'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { BlockTag } from '../../types/block.js'
import type { Chain } from '../../types/chain.js'
import type { EIP1193RequestOptions } from '../../types/eip1193.js'
import type { Hash } from '../../types/misc.js'
import type { Proof } from '../../types/proof.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import {
  type NumberToHexErrorType,
  numberToHex,
} from '../../utils/encoding/toHex.js'
import {
  type FormatProofErrorType,
  formatProof,
} from '../../utils/formatters/proof.js'

export type GetProofParameters = {
  /** Account address. */
  address: Address
  /** Array of storage-keys that should be proofed and included. */
  storageKeys: Hash[]
  /** Request options. */
  requestOptions?: EIP1193RequestOptions | undefined
} & (
  | {
      /** The block number. */
      blockNumber?: bigint | undefined
      blockTag?: undefined
    }
  | {
      blockNumber?: undefined
      /**
       * The block tag.
       * @default 'latest'
       */
      blockTag?: BlockTag | undefined
    }
)

export type GetProofReturnType = Proof

export type GetProofErrorType =
  | NumberToHexErrorType
  | FormatProofErrorType
  | RequestErrorType
  | ErrorType

/**
 * Returns the account and storage values of the specified account including the Merkle-proof.
 *
 * - Docs: https://viem.sh/docs/actions/public/getProof
 * - JSON-RPC Methods:
 *   - Calls [`eth_getProof`](https://eips.ethereum.org/EIPS/eip-1186)
 *
 * @param client - Client to use
 * @param parameters - {@link GetProofParameters}
 * @returns Proof data. {@link GetProofReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getProof } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const block = await getProof(client, {
 *  address: '0x...',
 *  storageKeys: ['0x...'],
 * })
 */
export async function getProof<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  {
    address,
    blockNumber,
    blockTag: blockTag_,
    storageKeys,
    requestOptions,
  }: GetProofParameters,
): Promise<GetProofReturnType> {
  const blockTag = blockTag_ ?? 'latest'

  const blockNumberHex =
    blockNumber !== undefined ? numberToHex(blockNumber) : undefined

  const proof = await client.request(
    {
      method: 'eth_getProof',
      params: [address, storageKeys, blockNumberHex || blockTag],
    },
    requestOptions,
  )

  return formatProof(proof)
}
