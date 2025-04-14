import type { Address } from 'abitype'
import type { Account } from '../../accounts/types.js'
import {
  type ParseAccountErrorType,
  parseAccount,
} from '../../accounts/utils/parseAccount.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { BaseError } from '../../errors/base.js'
import type { BlockTag } from '../../types/block.js'
import type { Chain } from '../../types/chain.js'
import type { StateOverride } from '../../types/stateOverride.js'
import type { TransactionRequest } from '../../types/transaction.js'
import type { UnionOmit } from '../../types/utils.js'
import {
  type RecoverAuthorizationAddressErrorType,
  recoverAuthorizationAddress,
} from '../../utils/authorization/recoverAuthorizationAddress.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import {
  type NumberToHexErrorType,
  numberToHex,
} from '../../utils/encoding/toHex.js'
import {
  type GetEstimateGasErrorReturnType,
  getEstimateGasError,
} from '../../utils/errors/getEstimateGasError.js'
import { extract } from '../../utils/formatters/extract.js'
import {
  type FormattedTransactionRequest,
  formatTransactionRequest,
} from '../../utils/formatters/transactionRequest.js'
import { serializeStateOverride } from '../../utils/stateOverride.js'
import {
  type AssertRequestErrorType,
  type AssertRequestParameters,
  assertRequest,
} from '../../utils/transaction/assertRequest.js'
import {
  type PrepareTransactionRequestParameters,
  prepareTransactionRequest,
} from '../wallet/prepareTransactionRequest.js'
import { getBalance } from './getBalance.js'

export type EstimateGasParameters<
  chain extends Chain | undefined = Chain | undefined,
> = UnionOmit<FormattedEstimateGas<chain>, 'from'> & {
  account?: Account | Address | undefined
  stateOverride?: StateOverride | undefined
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
type FormattedEstimateGas<chain extends Chain | undefined = Chain | undefined> =
  FormattedTransactionRequest<chain>

export type EstimateGasReturnType = bigint

export type EstimateGasErrorType = GetEstimateGasErrorReturnType<
  | ParseAccountErrorType
  | NumberToHexErrorType
  | RequestErrorType
  | RecoverAuthorizationAddressErrorType
  | AssertRequestErrorType
>

/**
 * Estimates the gas necessary to complete a transaction without submitting it to the network.
 *
 * - Docs: https://viem.sh/docs/actions/public/estimateGas
 * - JSON-RPC Methods: [`eth_estimateGas`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_estimategas)
 *
 * @param client - Client to use
 * @param parameters - {@link EstimateGasParameters}
 * @returns The gas estimate (in wei). {@link EstimateGasReturnType}
 *
 * @example
 * import { createPublicClient, http, parseEther } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { estimateGas } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const gasEstimate = await estimateGas(client, {
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *   value: parseEther('1'),
 * })
 */
export async function estimateGas<
  chain extends Chain | undefined,
  account extends Account | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  args: EstimateGasParameters<chain>,
): Promise<EstimateGasReturnType> {
  const { account: account_ = client.account } = args
  const account = account_ ? parseAccount(account_) : undefined

  try {
    const {
      accessList,
      authorizationList,
      blobs,
      blobVersionedHashes,
      blockNumber,
      blockTag,
      data,
      gas,
      gasPrice,
      maxFeePerBlobGas,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      value,
      stateOverride,
      ...rest
    } = (await prepareTransactionRequest(client, {
      ...args,
      parameters:
        // Some RPC Providers do not compute versioned hashes from blobs. We will need
        // to compute them.
        account?.type === 'local' ? undefined : ['blobVersionedHashes'],
    } as PrepareTransactionRequestParameters)) as EstimateGasParameters

    const blockNumberHex = blockNumber ? numberToHex(blockNumber) : undefined
    const block = blockNumberHex || blockTag

    const rpcStateOverride = serializeStateOverride(stateOverride)

    const to = await (async () => {
      // If `to` exists on the parameters, use that.
      if (rest.to) return rest.to

      // If no `to` exists, and we are sending a EIP-7702 transaction, use the
      // address of the first authorization in the list.
      if (authorizationList && authorizationList.length > 0)
        return await recoverAuthorizationAddress({
          authorization: authorizationList[0],
        }).catch(() => {
          throw new BaseError(
            '`to` is required. Could not infer from `authorizationList`',
          )
        })

      // Otherwise, we are sending a deployment transaction.
      return undefined
    })()

    assertRequest(args as AssertRequestParameters)

    const chainFormat = client.chain?.formatters?.transactionRequest?.format
    const format = chainFormat || formatTransactionRequest

    const request = format({
      // Pick out extra data that might exist on the chain's transaction request type.
      ...extract(rest, { format: chainFormat }),
      from: account?.address,
      accessList,
      authorizationList,
      blobs,
      blobVersionedHashes,
      data,
      gas,
      gasPrice,
      maxFeePerBlobGas,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      to,
      value,
    } as TransactionRequest)

    function estimateGas_rpc(parameters: {
      block: any
      request: any
      rpcStateOverride: any
    }) {
      const { block, request, rpcStateOverride } = parameters
      return client.request({
        method: 'eth_estimateGas',
        params: rpcStateOverride
          ? [request, block ?? 'latest', rpcStateOverride]
          : block
            ? [request, block]
            : [request],
      })
    }

    let estimate = BigInt(
      await estimateGas_rpc({ block, request, rpcStateOverride }),
    )

    // TODO(7702): Remove this once https://github.com/ethereum/execution-apis/issues/561 is resolved.
    //       Authorization list schema is not implemented on JSON-RPC spec yet, so we need to
    //       manually estimate the gas.
    if (authorizationList) {
      const value = await getBalance(client, { address: request.from })
      const estimates = await Promise.all(
        authorizationList.map(async (authorization) => {
          const { address } = authorization
          const estimate = await estimateGas_rpc({
            block,
            request: {
              authorizationList: undefined,
              data,
              from: account?.address,
              to: address,
              value: numberToHex(value),
            },
            rpcStateOverride,
          }).catch(() => 100_000n)
          return 2n * BigInt(estimate)
        }),
      )
      estimate += estimates.reduce((acc, curr) => acc + curr, 0n)
    }

    return estimate
  } catch (err) {
    throw getEstimateGasError(err as BaseError, {
      ...args,
      account,
      chain: client.chain,
    })
  }
}
