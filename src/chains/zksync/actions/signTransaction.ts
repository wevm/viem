import type { Account } from '../../../accounts/types.js'
import {
  type ParseAccountErrorType,
  parseAccount,
} from '../../../accounts/utils/parseAccount.js'
import type { SignTransactionErrorType as SignTransactionErrorType_account } from '../../../accounts/utils/signTransaction.js'
import {
  type GetChainIdErrorType,
  getChainId,
} from '../../../actions/public/getChainId.js'
import { signTypedData } from '../../../actions/wallet/signTypedData.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import { AccountNotFoundError } from '../../../errors/account.js'
import type { ErrorType } from '../../../errors/utils.js'
import type { GetAccountParameter } from '../../../types/account.js'
import { type GetChain } from '../../../types/chain.js'
import { type RpcTransactionRequest } from '../../../types/rpc.js'
import type {
  TransactionRequest,
  TransactionSerializable,
  TransactionSerialized,
} from '../../../types/transaction.js'
import type { UnionOmit } from '../../../types/utils.js'
import type { RequestErrorType } from '../../../utils/buildRequest.js'
import {
  type AssertCurrentChainErrorType,
  assertCurrentChain,
} from '../../../utils/chain/assertCurrentChain.js'
import type { NumberToHexErrorType } from '../../../utils/encoding/toHex.js'
import {
  type FormattedTransactionRequest,
  formatTransactionRequest,
} from '../../../utils/formatters/transactionRequest.js'
import { getAction } from '../../../utils/getAction.js'
import { numberToHex } from '../../../utils/index.js'
import {
  type AssertRequestErrorType,
  assertRequest,
} from '../../../utils/transaction/assertRequest.js'
import { type ChainEIP712, isEip712Transaction } from '../types.js'

export type SignEip712TransactionParameters<
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

export type SignEip712TransactionReturnType = TransactionSerialized

export type SignEip712TransactionErrorType =
  | ParseAccountErrorType
  | AssertRequestErrorType
  | GetChainIdErrorType
  | AssertCurrentChainErrorType
  | SignTransactionErrorType_account
  | NumberToHexErrorType
  | RequestErrorType
  | ErrorType

/**
 * Signs a transaction.
 *
 * - Docs: https://viem.sh/docs/zksync/actions/signEip712Transaction.html
 * - JSON-RPC Methods:
 *   - JSON-RPC Accounts: [`eth_signTransaction`](https://ethereum.github.io/execution-apis/api-documentation/)
 *   - Local Accounts: Signs locally. No JSON-RPC request.
 *
 * @param args - {@link SignEip712TransactionParameters}
 * @returns The signed serialized tranasction. {@link SignEip712TransactionReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { zkSync } from 'viem/chains'
 * import { sign712Transaction } from 'viem/chains/zksync'
 *
 * const client = createWalletClient({
 *   chain: zkSync,
 *   transport: custom(window.ethereum),
 * })
 * const signature = await signEip712Transaction(client, {
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
 * import { sign712Transaction } from 'viem/chains/zksync'
 *
 * const client = createWalletClient({
 *   account: privateKeyToAccount('0x…'),
 *   chain: zkSync,
 *   transport: custom(window.ethereum),
 * })
 * const signature = await signEip712Transaction(client, {
 *   to: '0x0000000000000000000000000000000000000000',
 *   value: 1n,
 * })
 */
export async function signEip712Transaction<
  TChain extends ChainEIP712 | undefined,
  TAccount extends Account | undefined,
  TChainOverride extends ChainEIP712 | undefined = undefined,
>(
  client: Client<Transport, TChain, TAccount>,
  args: SignEip712TransactionParameters<TChain, TAccount, TChainOverride>,
): Promise<SignEip712TransactionReturnType> {
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
    ...args,
  })

  const chainId = await getAction(client, getChainId)({})
  if (chain !== null)
    assertCurrentChain({
      currentChainId: chainId,
      chain,
    })

  const formatters = chain?.formatters || client.chain?.formatters
  const format =
    formatters?.transactionRequest?.format || formatTransactionRequest

  if (
    client.chain?.eip712domain?.eip712domain &&
    client.chain?.serializers?.transaction &&
    isEip712Transaction(transaction as unknown as TransactionSerializable)
  ) {
    const eip712Domain = client.chain?.eip712domain?.eip712domain(
      transaction as unknown as TransactionSerializable,
    )

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
      } as unknown as TransactionSerializable,
      // Use this blank private key, probably we should change the code to be optional,
      // or option if it is EIP712.
      { r: '0x0', s: '0x0', v: 0n },
    )
  }

  if (account.type === 'local') {
    return account.signTransaction(
      {
        ...transaction,
        chainId,
      } as unknown as TransactionSerializable,
      { serializer: client.chain?.serializers?.transaction },
    ) as Promise<SignEip712TransactionReturnType>
  }

  // For EIP712 we don't need to ask MetaMask to sign it,
  return await client.request({
    method: 'eth_signTransaction',
    params: [
      {
        ...format(transaction as unknown as TransactionRequest),
        chainId: numberToHex(chainId),
        from: account.address,
      } as unknown as RpcTransactionRequest,
    ],
  })
}
