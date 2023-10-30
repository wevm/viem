import type { Address } from 'abitype'

import type { Account } from '../../accounts/types.js'
import {
  type ParseAccountErrorType,
  parseAccount,
} from '../../accounts/utils/parseAccount.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { multicall3Abi } from '../../constants/abis.js'
import { aggregate3Signature } from '../../constants/contract.js'
import { BaseError } from '../../errors/base.js'
import {
  ChainDoesNotSupportContract,
  ClientChainNotConfiguredError,
} from '../../errors/chain.js'
import {
  RawContractError,
  type RawContractErrorType,
} from '../../errors/contract.js'
import type { ErrorType } from '../../errors/utils.js'
import type { BlockTag } from '../../types/block.js'
import type { Chain } from '../../types/chain.js'
import type { Hex } from '../../types/misc.js'
import type { RpcTransactionRequest } from '../../types/rpc.js'
import type { TransactionRequest } from '../../types/transaction.js'
import type { UnionOmit } from '../../types/utils.js'
import {
  type DecodeFunctionResultErrorType,
  decodeFunctionResult,
} from '../../utils/abi/decodeFunctionResult.js'
import {
  type EncodeFunctionDataErrorType,
  encodeFunctionData,
} from '../../utils/abi/encodeFunctionData.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import {
  type GetChainContractAddressErrorType,
  getChainContractAddress,
} from '../../utils/chain/getChainContractAddress.js'
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
import {
  type CreateBatchSchedulerErrorType,
  createBatchScheduler,
} from '../../utils/promise/createBatchScheduler.js'
import { assertRequest } from '../../utils/transaction/assertRequest.js'
import type {
  AssertRequestErrorType,
  AssertRequestParameters,
} from '../../utils/transaction/assertRequest.js'

export type FormattedCall<
  TChain extends Chain | undefined = Chain | undefined,
> = FormattedTransactionRequest<TChain>

export type CallParameters<
  TChain extends Chain | undefined = Chain | undefined,
> = UnionOmit<FormattedCall<TChain>, 'from'> & {
  account?: Account | Address
  batch?: boolean
} & (
    | {
        /** The balance of the account at a block number. */
        blockNumber?: bigint
        blockTag?: never
      }
    | {
        blockNumber?: never
        /**
         * The balance of the account at a block tag.
         * @default 'latest'
         */
        blockTag?: BlockTag
      }
  )

export type CallReturnType = { data: Hex | undefined }

export type CallErrorType = GetCallErrorReturnType<
  | ParseAccountErrorType
  | AssertRequestErrorType
  | NumberToHexErrorType
  | FormatTransactionRequestErrorType
  | ScheduleMulticallErrorType
  | RequestErrorType
>

/**
 * Executes a new message call immediately without submitting a transaction to the network.
 *
 * - Docs: https://viem.sh/docs/actions/public/call.html
 * - JSON-RPC Methods: [`eth_call`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_call)
 *
 * @param client - Client to use
 * @param parameters - {@link CallParameters}
 * @returns The call data. {@link CallReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { call } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const data = await call(client, {
 *   account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
 *   data: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 * })
 */
export async function call<TChain extends Chain | undefined>(
  client: Client<Transport, TChain>,
  args: CallParameters<TChain>,
): Promise<CallReturnType> {
  const {
    account: account_ = client.account,
    batch = Boolean(client.batch?.multicall),
    blockNumber,
    blockTag = 'latest',
    accessList,
    data,
    gas,
    gasPrice,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce,
    to,
    value,
    ...rest
  } = args
  const account = account_ ? parseAccount(account_) : undefined

  try {
    assertRequest(args as AssertRequestParameters)

    const blockNumberHex = blockNumber ? numberToHex(blockNumber) : undefined
    const block = blockNumberHex || blockTag

    const chainFormat = client.chain?.formatters?.transactionRequest?.format
    const format = chainFormat || formatTransactionRequest

    const request = format({
      // Pick out extra data that might exist on the chain's transaction request type.
      ...extract(rest, { format: chainFormat }),
      from: account?.address,
      accessList,
      data,
      gas,
      gasPrice,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      to,
      value,
    } as TransactionRequest) as TransactionRequest

    if (batch && shouldPerformMulticall({ request })) {
      try {
        return await scheduleMulticall(client, {
          ...request,
          blockNumber,
          blockTag,
        } as unknown as ScheduleMulticallParameters<TChain>)
      } catch (err) {
        if (
          !(err instanceof ClientChainNotConfiguredError) &&
          !(err instanceof ChainDoesNotSupportContract)
        )
          throw err
      }
    }

    const response = await client.request({
      method: 'eth_call',
      params: block
        ? [request as Partial<RpcTransactionRequest>, block]
        : [request as Partial<RpcTransactionRequest>],
    })
    if (response === '0x') return { data: undefined }
    return { data: response }
  } catch (err) {
    const data = getRevertErrorData(err)
    const { offchainLookup, offchainLookupSignature } = await import(
      '../../utils/ccip.js'
    )
    if (data?.slice(0, 10) === offchainLookupSignature && to) {
      return { data: await offchainLookup(client, { data, to }) }
    }
    throw getCallError(err as ErrorType, {
      ...args,
      account,
      chain: client.chain,
    })
  }
}

// We only want to perform a scheduled multicall if:
// - The request has calldata,
// - The request has a target address,
// - The target address is not already the aggregate3 signature,
// - The request has no other properties (`nonce`, `gas`, etc cannot be sent with a multicall).
function shouldPerformMulticall({ request }: { request: TransactionRequest }) {
  const { data, to, ...request_ } = request
  if (!data) return false
  if (data.startsWith(aggregate3Signature)) return false
  if (!to) return false
  if (
    Object.values(request_).filter((x) => typeof x !== 'undefined').length > 0
  )
    return false
  return true
}

type ScheduleMulticallParameters<TChain extends Chain | undefined> = Pick<
  CallParameters<TChain>,
  'blockNumber' | 'blockTag'
> & {
  data: Hex
  multicallAddress?: Address
  to: Address
}

export type ScheduleMulticallErrorType =
  | GetChainContractAddressErrorType
  | NumberToHexErrorType
  | CreateBatchSchedulerErrorType
  | EncodeFunctionDataErrorType
  | DecodeFunctionResultErrorType
  | RawContractErrorType
  | ErrorType

async function scheduleMulticall<TChain extends Chain | undefined>(
  client: Client<Transport>,
  args: ScheduleMulticallParameters<TChain>,
) {
  const { batchSize = 1024, wait = 0 } =
    typeof client.batch?.multicall === 'object' ? client.batch.multicall : {}
  const {
    blockNumber,
    blockTag = 'latest',
    data,
    multicallAddress: multicallAddress_,
    to,
  } = args

  let multicallAddress = multicallAddress_
  if (!multicallAddress) {
    if (!client.chain) throw new ClientChainNotConfiguredError()

    multicallAddress = getChainContractAddress({
      blockNumber,
      chain: client.chain,
      contract: 'multicall3',
    })
  }

  const blockNumberHex = blockNumber ? numberToHex(blockNumber) : undefined
  const block = blockNumberHex || blockTag

  const { schedule } = createBatchScheduler({
    id: `${client.uid}.${block}`,
    wait,
    shouldSplitBatch(args) {
      const size = args.reduce((size, { data }) => size + (data.length - 2), 0)
      return size > batchSize * 2
    },
    fn: async (
      requests: {
        data: Hex
        to: Address
      }[],
    ) => {
      const calls = requests.map((request) => ({
        allowFailure: true,
        callData: request.data,
        target: request.to,
      }))

      const calldata = encodeFunctionData({
        abi: multicall3Abi,
        args: [calls],
        functionName: 'aggregate3',
      })

      const data = await client.request({
        method: 'eth_call',
        params: [
          {
            data: calldata,
            to: multicallAddress,
          },
          block,
        ],
      })

      return decodeFunctionResult({
        abi: multicall3Abi,
        args: [calls],
        functionName: 'aggregate3',
        data: data || '0x',
      })
    },
  })

  const [{ returnData, success }] = await schedule({ data, to })

  if (!success) throw new RawContractError({ data: returnData })
  if (returnData === '0x') return { data: undefined }
  return { data: returnData }
}

export type GetRevertErrorDataErrorType = ErrorType

export function getRevertErrorData(err: unknown) {
  if (!(err instanceof BaseError)) return undefined
  const error = err.walk() as RawContractError
  return typeof error.data === 'object' ? error.data.data : error.data
}
