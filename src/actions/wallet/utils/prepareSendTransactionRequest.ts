import type { Address } from 'abitype'

import type { Account } from '../../../accounts/types.js'
import { parseAccount } from '../../../accounts/utils/parseAccount.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import { AccountNotFoundError } from '../../../errors/account.js'
import { BaseError } from '../../../errors/base.js'
import type { AuthorizationList } from '../../../types/authorization.js'
import type { Chain } from '../../../types/chain.js'
import type { Hex } from '../../../types/misc.js'
import type { RpcTransactionRequest } from '../../../types/rpc.js'
import type { TransactionRequest } from '../../../types/transaction.js'
import { recoverAuthorizationAddress } from '../../../utils/authorization/recoverAuthorizationAddress.js'
import { assertCurrentChain } from '../../../utils/chain/assertCurrentChain.js'
import { concat } from '../../../utils/data/concat.js'
import { extract } from '../../../utils/formatters/extract.js'
import { formatTransactionRequest } from '../../../utils/formatters/transactionRequest.js'
import { getAction } from '../../../utils/getAction.js'
import {
  type AssertRequestParameters,
  assertRequest,
} from '../../../utils/transaction/assertRequest.js'
import { getChainId } from '../../public/getChainId.js'

export type PrepareSendTransactionRequestParameters = {
  account?: Account | Address | null | undefined
  assertChainId?: boolean | undefined
  chain?: Chain | null | undefined
  dataSuffix?: Hex | undefined
  [key: string]: unknown
}

export type PrepareSendTransactionRequestReturnType<
  chain extends Chain | undefined,
> = {
  account: Account | null
  chain: chain | Chain | null | undefined
  request: RpcTransactionRequest
}

/** @internal */
export async function prepareSendTransactionRequest<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: PrepareSendTransactionRequestParameters,
  options: { docsPath: string },
): Promise<PrepareSendTransactionRequestReturnType<chain>> {
  const {
    account: account_ = client.account,
    assertChainId = true,
    chain = client.chain,
    accessList,
    authorizationList,
    blobs,
    data,
    dataSuffix = typeof client.dataSuffix === 'string'
      ? client.dataSuffix
      : client.dataSuffix?.value,
    gas,
    gasPrice,
    maxFeePerBlobGas,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce,
    type,
    value,
    ...rest
  } = parameters

  if (typeof account_ === 'undefined')
    throw new AccountNotFoundError({ docsPath: options.docsPath })
  const account = account_ ? parseAccount(account_) : null

  assertRequest(parameters as AssertRequestParameters)

  const to = await prepareSendTransactionRequest.resolveTo({
    authorizationList,
    to: parameters.to,
  })

  let chainId: number | undefined
  if (chain !== null) {
    chainId = await getAction(client, getChainId, 'getChainId')({})
    if (assertChainId)
      assertCurrentChain({
        currentChainId: chainId,
        chain,
      })
  }

  const chainFormat = (chain || client.chain)?.formatters?.transactionRequest
    ?.format
  const format = chainFormat || formatTransactionRequest

  const request = format(
    {
      ...extract(rest, { format: chainFormat }),
      accessList,
      account,
      authorizationList,
      blobs,
      chainId,
      data: dataSuffix
        ? concat([(data as Hex | undefined) ?? '0x', dataSuffix])
        : data,
      gas,
      gasPrice,
      maxFeePerBlobGas,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      to,
      type,
      value,
    } as TransactionRequest,
    'sendTransaction',
  ) as RpcTransactionRequest

  return { account, chain, request } as never
}

export namespace prepareSendTransactionRequest {
  export async function resolveTo(parameters: {
    authorizationList?: AuthorizationList | unknown
    to?: Address | null | unknown
  }): Promise<Address | undefined> {
    const { authorizationList, to } = parameters
    if (typeof to === 'string') return to as Address
    if (to === null) return undefined
    if (
      authorizationList &&
      Array.isArray(authorizationList) &&
      authorizationList.length > 0
    )
      return await recoverAuthorizationAddress({
        authorization: authorizationList[0],
      }).catch(() => {
        throw new BaseError(
          '`to` is required. Could not infer from `authorizationList`.',
        )
      })
    return undefined
  }
}
