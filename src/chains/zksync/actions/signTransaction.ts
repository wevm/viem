import type { Account } from '../../../accounts/types.js'
import { parseAccount } from '../../../accounts/utils/parseAccount.js'
import { signTransaction as signTransactionOriginal } from '../../../actions/index.js'
import { getChainId } from '../../../actions/public/getChainId.js'
import type {
  SignTransactionParameters as OriginalSignTransactionParameters,
  SignTransactionReturnType,
} from '../../../actions/wallet/signTransaction.js'
import { signTypedData } from '../../../actions/wallet/signTypedData.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import { AccountNotFoundError } from '../../../errors/account.js'
import type { GetAccountParameter } from '../../../types/account.js'
import type {
  ExtractChainFormatterParameters,
  GetChain,
} from '../../../types/chain.js'
import type { UnionOmit } from '../../../types/utils.js'
import { assertCurrentChain } from '../../../utils/chain/assertCurrentChain.js'
import { getAction } from '../../../utils/getAction.js'
import {
  type AssertRequestParameters,
  assertRequest,
} from '../../../utils/transaction/assertRequest.js'
import {
  type ChainEIP712,
  type TransactionRequestEIP712,
  isEip712Transaction,
} from '../types.js'

type FormattedTransactionRequest<
  TChain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
> = ExtractChainFormatterParameters<
  TChain,
  'transactionRequest',
  TransactionRequestEIP712
>

export type SignTransactionParameters<
  TChain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  TAccount extends Account | undefined = Account | undefined,
  TChainOverride extends ChainEIP712 | undefined = ChainEIP712 | undefined,
> = UnionOmit<
  FormattedTransactionRequest<
    TChainOverride extends ChainEIP712 ? TChainOverride : TChain
  >,
  'from'
> &
  GetAccountParameter<TAccount> &
  GetChain<TChain, TChainOverride>

/**
 * Signs a transaction.
 *
 * - Docs: https://viem.sh/docs/zksync/actions/signTransaction.html
 * - JSON-RPC Methods:
 *   - JSON-RPC Accounts: [`eth_signTransaction`](https://ethereum.github.io/execution-apis/api-documentation/)
 *   - Local Accounts: Signs locally. No JSON-RPC request.
 *
 * @param args - {@link SignTransactionParameters}
 * @returns The signed serialized tranasction. {@link SignTransactionReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { zkSync } from 'viem/chains'
 * import { signTransaction } from 'viem/chains/zksync'
 *
 * const client = createWalletClient({
 *   chain: zkSync,
 *   transport: custom(window.ethereum),
 * })
 * const signature = await signTransaction(client, {
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
 * import { signTransaction } from 'viem/chains/zksync'
 *
 * const client = createWalletClient({
 *   account: privateKeyToAccount('0x…'),
 *   chain: zkSync,
 *   transport: custom(window.ethereum),
 * })
 * const signature = await signTransaction(client, {
 *   to: '0x0000000000000000000000000000000000000000',
 *   value: 1n,
 * })
 */
export async function signTransaction<
  TChain extends ChainEIP712 | undefined,
  TAccount extends Account | undefined,
  TChainOverride extends ChainEIP712 | undefined,
>(
  client: Client<Transport, TChain, TAccount>,
  args: SignTransactionParameters<TChain, TAccount, TChainOverride>,
): Promise<SignTransactionReturnType> {
  const {
    account: account_ = client.account,
    chain = client.chain,
    ...transaction
  } = args

  if (!account_)
    throw new AccountNotFoundError({
      docsPath: '/docs/actions/wallet/signTransaction',
    })
  const account = parseAccount(account_)

  assertRequest({
    account,
    ...(args as AssertRequestParameters),
  })

  // Handle EIP712 transactions
  if (
    client.chain?.custom.eip712domain?.eip712domain &&
    client.chain?.serializers?.transaction &&
    isEip712Transaction({ ...transaction, type: args.type ?? '' })
  ) {
    const chainId = await getAction(client, getChainId)({})
    if (chain !== null)
      assertCurrentChain({
        currentChainId: chainId,
        chain: chain,
      })

    const eip712Domain = client.chain?.custom.eip712domain?.eip712domain({
      ...transaction,
      from: account.address,
      type: 'eip712',
    })

    const customSignature = await signTypedData(client, {
      ...eip712Domain,
      account: account,
    })

    // If we have the customSignature we can sign the transaction, doesn't matter if account type
    // is `local` or `json-rpc`.
    return client.chain?.serializers?.transaction(
      {
        chainId,
        ...transaction,
        customSignature,
        type: 'eip712',
      },
      // Use this blank private key, probably we should change the code to be optional,
      // or option if it is EIP712.
      { r: '0x0', s: '0x0', v: 0n },
    )
  }

  return await signTransactionOriginal(
    client,
    args as OriginalSignTransactionParameters,
  )
}
