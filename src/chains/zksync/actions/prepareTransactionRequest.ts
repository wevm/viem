import type { Address } from 'abitype'
import type { Account } from '../../../accounts/types.js'
import { parseAccount } from '../../../accounts/utils/parseAccount.js'
import { getChainId } from '../../../actions/index.js'
import { estimateGas } from '../../../actions/public/estimateGas.js'
import { getTransactionCount } from '../../../actions/public/getTransactionCount.js'
import {
  type PrepareTransactionRequestParameterType,
  type PrepareTransactionRequestParameters,
  type PrepareTransactionRequestReturnType,
  prepareTransactionRequest as prepareTransactionRequest_,
} from '../../../actions/wallet/prepareTransactionRequest.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import { AccountNotFoundError } from '../../../errors/account.js'
import { getAction } from '../../../utils/getAction.js'
import { type ChainEIP712, isEip712Transaction } from '../types.js'

export type {
  PrepareTransactionRequestParameterType,
  PrepareTransactionRequestParameters,
  PrepareTransactionRequestReturnType,
  PrepareTransactionRequestErrorType,
} from '../../../actions/wallet/prepareTransactionRequest.js'

/**
 * Prepares a transaction request for signing.
 *
 * - Docs: https://viem.sh/docs/zksync/actions/prepareEip712TransactionRequest.html
 *
 * @param args - {@link PrepareTransactionRequestParameters}
 * @returns The transaction request. {@link PrepareTransactionRequestReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { zkSync } from 'viem/chains'
 * import { prepareTransactionRequest } from 'viem/chains/zksync'
 *
 * const client = createWalletClient({
 *   chain: zkSync,
 *   transport: custom(window.ethereum),
 * })
 * const request = await prepareTransactionRequest(client, {
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   to: '0x0000000000000000000000000000000000000000',
 *   value: 1n,
 * })
 *
 * @example
 * // Account Hoisting
 * import { createWalletClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { zkSync } from 'viem/chains'
 * import { prepareTransactionRequest } from 'viem/chains/zksync'
 *
 * const client = createWalletClient({
 *   account: privateKeyToAccount('0x…'),
 *   chain: zkSync,
 *   transport: custom(window.ethereum),
 * })
 * const request = await prepareTransactionRequest(client, {
 *   to: '0x0000000000000000000000000000000000000000',
 *   value: 1n,
 * })
 */
export async function prepareTransactionRequest<
  TChain extends ChainEIP712 | undefined,
  TAccount extends Account | undefined,
  TParameterType extends PrepareTransactionRequestParameterType,
  TAccountOverride extends Account | Address | undefined = undefined,
  TChainOverride extends ChainEIP712 | undefined = undefined,
>(
  client: Client<Transport, TChain, TAccount>,
  args: PrepareTransactionRequestParameters<
    TChain,
    TAccount,
    TChainOverride,
    TAccountOverride,
    TParameterType
  >,
): Promise<
  PrepareTransactionRequestReturnType<
    TChain,
    TAccount,
    TChainOverride,
    TAccountOverride,
    TParameterType
  >
> {
  const {
    account: account_ = client.account,
    nonce,
    gas,
    parameters = ['fees', 'gas', 'nonce', 'type'],
  } = args
  if (!account_) throw new AccountNotFoundError()
  const account = parseAccount(account_)

  let chainId = 0
  if (args.chain?.id) {
    chainId = args.chain.id
  } else {
    chainId = await getAction(client, getChainId, 'getChainId')({})
  }
  const request = { ...args, from: account.address, chainId }

  if (nonce === undefined && account && parameters.includes('nonce'))
    request.nonce = await getAction(
      client,
      getTransactionCount,
      'getTransactionCount',
    )({
      address: account.address,
      blockTag: 'pending',
    })

  if (isEip712Transaction({ ...request })) {
    request.type = 'eip712' as any

    if (gas === undefined && parameters.includes('gas')) {
      request.gas = await getAction(
        client,
        estimateGas,
        'estimateGas',
      )({
        ...request,
        account: { address: account.address, type: 'json-rpc' },
      } as any)
    }

    return request as unknown as PrepareTransactionRequestReturnType<
      TChain,
      TAccount,
      TChainOverride,
      TAccountOverride,
      TParameterType
    >
  }

  return prepareTransactionRequest_(
    client,
    args as unknown as PrepareTransactionRequestParameters,
  ) as unknown as PrepareTransactionRequestReturnType<
    TChain,
    TAccount,
    TChainOverride,
    TAccountOverride,
    TParameterType
  >
}
