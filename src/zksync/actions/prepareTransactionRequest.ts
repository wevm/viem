import type { Address } from 'abitype'
import type { Account } from '../../accounts/types.js'
import { type EstimateGasParameters, estimateGas } from '../../actions/index.js'
import type {
  PrepareTransactionRequestParameters,
  PrepareTransactionRequestRequest,
  PrepareTransactionRequestReturnType,
} from '../../actions/wallet/prepareTransactionRequest.js'
import { prepareTransactionRequest as prepareTransactionRequest_ } from '../../actions/wallet/prepareTransactionRequest.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { parseAccount } from '../../utils/accounts.js'
import type { SmartAccount } from '../accounts/toSmartAccount.js'
import type { ChainEIP712 } from '../types/chain.js'
import { isSmartAccount } from '../utils/isSmartAccount.js'

/**
 * Prepares a transaction request for signing with optional estimate gas parameter where real wallet is used for estimation for account abstraction.
 *
 * @param args - {@link PrepareTransactionRequestParameters}
 * @returns The transaction request. {@link PrepareTransactionRequestReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { prepareTransactionRequest } from 'viem/zksync'
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
 * import { mainnet } from 'viem/chains'
 * import { prepareTransactionRequest } from 'viem/zksync'
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
  const request extends PrepareTransactionRequestRequest<
    TChain,
    TChainOverride
  >,
  TAccountOverride extends Account | Address | undefined = undefined,
  TChainOverride extends ChainEIP712 | undefined = undefined,
>(
  client: Client<Transport, TChain, TAccount>,
  args: PrepareTransactionRequestParameters<
    TChain,
    TAccount,
    TChainOverride,
    TAccountOverride,
    request
  >,
): Promise<
  PrepareTransactionRequestReturnType<
    TChain,
    TAccount,
    TChainOverride,
    TAccountOverride,
    request
  >
> {
  const account = args.account ? parseAccount(args.account) : undefined

  if (
    (await client.request({
      method: 'eth_getCode',
      params: [account!.address, 'latest'],
    })) !== '0x'
  ) {
    if (!isSmartAccount(account!)) {
      throw new Error(
        'The account cannot be used to estimate gas costs because the address is not a valid wallet address, and addressAccount is absent from the smart account.',
      )
    }

    const smartAccount = account as SmartAccount
    args.gas = await estimateGas(client, {
      ...(args as EstimateGasParameters),
      account: smartAccount.walletAccount,
    })
  }

  return await prepareTransactionRequest_(client, args)
}
