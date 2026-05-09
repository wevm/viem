import type { Address } from 'abitype'

import type { Account } from '../../accounts/types.js'
import {
  type ParseAccountErrorType,
  parseAccount,
} from '../../accounts/utils/parseAccount.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { BlockTag } from '../../types/block.js'
import type { Chain } from '../../types/chain.js'
import type { RpcTransactionRequest } from '../../types/rpc.js'
import type { AccessList, TransactionRequest } from '../../types/transaction.js'
import type { ExactPartial, Prettify, UnionOmit } from '../../types/utils.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import {
  type NumberToHexErrorType,
  numberToHex,
} from '../../utils/encoding/toHex.js'
import {
  type GetCallErrorReturnType,
  getCallError,
} from '../../utils/errors/getCallError.js'
import { extract } from '../../utils/formatters/extract.js'
import {
  type FormatTransactionRequestErrorType,
  type FormattedTransactionRequest,
  formatTransactionRequest,
} from '../../utils/formatters/transactionRequest.js'
import type {
  AssertRequestErrorType,
  AssertRequestParameters,
} from '../../utils/transaction/assertRequest.js'
import { assertRequest } from '../../utils/transaction/assertRequest.js'

export type CreateAccessListParameters<
  chain extends Chain | undefined = Chain | undefined,
> = UnionOmit<
  FormattedTransactionRequest<chain>,
  'from' | 'nonce' | 'accessList'
> & {
  /** Account attached to the call (msg.sender). */
  account?: Account | Address | undefined
} & (
    | {
        /** The balance of the account at a block number. */
        blockNumber?: bigint | undefined
        blockTag?: undefined
      }
    | {
        blockNumber?: undefined
        /**
         * The balance of the account at a block tag.
         * @default 'latest'
         */
        blockTag?: BlockTag | undefined
      }
  )

export type CreateAccessListReturnType = Prettify<{
  accessList: AccessList
  gasUsed: bigint
}>

export type CreateAccessListErrorType = GetCallErrorReturnType<
  | ParseAccountErrorType
  | AssertRequestErrorType
  | NumberToHexErrorType
  | FormatTransactionRequestErrorType
  | RequestErrorType
>

/**
 * Creates an EIP-2930 access list.
 *
 * - Docs: https://viem.sh/docs/actions/public/createAccessList
 * - JSON-RPC Methods: `eth_createAccessList`
 *
 * @param client - Client to use
 * @param parameters - {@link CreateAccessListParameters}
 * @returns The access list. {@link CreateAccessListReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { createAccessList } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const data = await createAccessList(client, {
 *   account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
 *   data: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 * })
 */
export async function createAccessList<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  args: CreateAccessListParameters<chain>,
): Promise<CreateAccessListReturnType> {
  const {
    account: account_ = client.account,
    blockNumber,
    blockTag = 'latest',
    blobs,
    data,
    gas,
    gasPrice,
    maxFeePerBlobGas,
    maxFeePerGas,
    maxPriorityFeePerGas,
    to,
    value,
    ...rest
  } = args
  const account = account_ ? parseAccount(account_) : undefined

  try {
    assertRequest(args as AssertRequestParameters)

    const blockNumberHex =
      typeof blockNumber === 'bigint' ? numberToHex(blockNumber) : undefined
    const block = blockNumberHex || blockTag

    const chainFormat = client.chain?.formatters?.transactionRequest?.format
    const format = chainFormat || formatTransactionRequest

    const request = format(
      {
        // Pick out extra data that might exist on the chain's transaction request type.
        ...extract(rest, { format: chainFormat }),
        account,
        blobs,
        data,
        gas,
        gasPrice,
        maxFeePerBlobGas,
        maxFeePerGas,
        maxPriorityFeePerGas,
        to,
        value,
      } as TransactionRequest,
      'createAccessList',
    ) as TransactionRequest

    const response = await client.request({
      method: 'eth_createAccessList',
      params: [request as ExactPartial<RpcTransactionRequest>, block],
    })
    return {
      accessList: response.accessList,
      gasUsed: BigInt(response.gasUsed),
    }
  } catch (err) {
    throw getCallError(err as ErrorType, {
      ...args,
      account,
      chain: client.chain,
    })
  }
}
