import { getChainId } from '~viem/actions/index.js'
import type { Chain } from '~viem/index.js'
import type { Account } from '../../../accounts/types.js'
import { parseAccount } from '../../../accounts/utils/parseAccount.js'
import { estimateGas } from '../../../actions/public/estimateGas.js'
import { getTransactionCount } from '../../../actions/public/getTransactionCount.js'
import {
  type PrepareTransactionRequestParameters,
  type PrepareTransactionRequestReturnType,
  prepareTransactionRequest as originalPrepareTransactionRequest,
} from '../../../actions/wallet/prepareTransactionRequest.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import { AccountNotFoundError } from '../../../errors/account.js'
import { getAction } from '../../../utils/getAction.js'
import { type ChainEIP712, isEip712Transaction } from '../types.js'

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
 * import { prepareEip712TransactionRequest } from 'viem/chains/zksync'
 *
 * const client = createWalletClient({
 *   account: privateKeyToAccount('0x…'),
 *   chain: zkSync,
 *   transport: custom(window.ethereum),
 * })
 * const request = await prepareEip712TransactionRequest(client, {
 *   to: '0x0000000000000000000000000000000000000000',
 *   value: 1n,
 * })
 */
export async function prepareTransactionRequest<
  TChain extends ChainEIP712 | undefined,
  TAccount extends Account | undefined,
  TChainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, TChain, TAccount>,
  argsIncoming: PrepareTransactionRequestParameters<
    TChain,
    TAccount,
    TChainOverride
  >,
): Promise<
  PrepareTransactionRequestReturnType<TChain, TAccount, TChainOverride>
> {
  const args = {
    ...argsIncoming,
    account: argsIncoming.account || client.account,
    chain: argsIncoming.chain || client.chain,
  }

  if (!args.account) throw new AccountNotFoundError()
  const account = parseAccount(args.account)

  const chainId = await getAction(client, getChainId, 'getChainId')({})
  const request = { ...args, from: account.address, chainId }

  if (args.nonce === undefined) {
    request.nonce = await getAction(
      client,
      getTransactionCount,
      'getTransactionCount',
    )({
      address: account.address,
      blockTag: 'pending',
    })
  }

  if (isEip712Transaction({ ...request })) {
    request.type = 'eip712'

    if (request.gas === undefined) {
      request.gas = await getAction(
        client,
        estimateGas<TChain, TAccount>,
        'estimateGas',
      )({
        ...request,
        type: 'eip712',
      })
    }

    return request
  }

  return originalPrepareTransactionRequest(client, args)
}
