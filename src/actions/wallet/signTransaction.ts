import type { Account } from '../../accounts/types.js'
import {
  type ParseAccountErrorType,
  parseAccount,
} from '../../accounts/utils/parseAccount.js'
import type { SignTransactionErrorType as SignTransactionErrorType_account } from '../../accounts/utils/signTransaction.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { AccountNotFoundError } from '../../errors/account.js'
import type { ErrorType } from '../../errors/utils.js'
import type { GetAccountParameter } from '../../types/account.js'
import type { Chain, GetChain } from '../../types/chain.js'
import { type RpcTransactionRequest } from '../../types/rpc.js'
import type {
  TransactionRequest,
  TransactionSerializable,
  TransactionSerialized,
} from '../../types/transaction.js'
import type { UnionOmit } from '../../types/utils.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import {
  type AssertCurrentChainErrorType,
  assertCurrentChain,
} from '../../utils/chain/assertCurrentChain.js'
import type { NumberToHexErrorType } from '../../utils/encoding/toHex.js'
import {
  type FormattedTransactionRequest,
  formatTransactionRequest,
} from '../../utils/formatters/transactionRequest.js'
import { getAction } from '../../utils/getAction.js'
import { numberToHex } from '../../utils/index.js'
import {
  type AssertRequestErrorType,
  assertRequest,
} from '../../utils/transaction/assertRequest.js'
import { type GetChainIdErrorType, getChainId } from '../public/getChainId.js'
import { signTypedData } from './signTypedData.js'

export type SignTransactionParameters<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
  TChainOverride extends Chain | undefined = Chain | undefined,
> = UnionOmit<
  FormattedTransactionRequest<
    TChainOverride extends Chain ? TChainOverride : TChain
  >,
  'from'
> &
  GetAccountParameter<TAccount> &
  GetChain<TChain, TChainOverride>

export type SignTransactionReturnType = TransactionSerialized

export type SignTransactionErrorType =
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
 * - Docs: https://viem.sh/docs/actions/wallet/signTransaction.html
 * - JSON-RPC Methods:
 *   - JSON-RPC Accounts: [`eth_signTransaction`](https://ethereum.github.io/execution-apis/api-documentation/)
 *   - Local Accounts: Signs locally. No JSON-RPC request.
 *
 * @param args - {@link SignTransactionParameters}
 * @returns The signed serialized tranasction. {@link SignTransactionReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { signTransaction } from 'viem/actions'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
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
 * import { mainnet } from 'viem/chains'
 * import { signTransaction } from 'viem/actions'
 *
 * const client = createWalletClient({
 *   account: privateKeyToAccount('0x…'),
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const signature = await signTransaction(client, {
 *   to: '0x0000000000000000000000000000000000000000',
 *   value: 1n,
 * })
 */
export async function signTransaction<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
  TChainOverride extends Chain | undefined = undefined,
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

  // ---
  // We need a way to fill the custom signature before signing the transaction.
  // This need to be sloted between sendTransaction and signTransaction.

  // We need a better way to check this, probably improve how EIP712 type are detected.
  // One of the ways is to instead of have all fields in the "root" of the transaction,
  // we can have the eip712Meta field, and every transaction with this is marked as
  // type: 'eip712' and need to be signed with typed data previous to sign the
  // transaction.

  // Without eip712, we need a external function to indicate if it is EIP712 transaction or not,
  // defined in the chain ts file.
  // Eg. isEip712Transaction: (transaction) => zkSyncSerializers.isEIP712(transaction)
  if (
    chainId &&
    client.chain?.eip712domain?.isEip712Domain &&
    client.chain?.eip712domain?.eip712domain &&
    client.chain?.serializers?.transaction &&
    client.chain?.eip712domain?.isEip712Domain({ ...args, chainId: chainId })
  ) {
    const eip712Domain = client.chain?.eip712domain?.eip712domain(transaction)

    const customSignature = await signTypedData(client, {
      ...eip712Domain,
      account: account,
    })

    transaction.customSignature = customSignature

    // If we have the customSignature we can sign the transaction, doesn't matter if account type
    // is `local` or `json-rpc`.
    return client.chain?.serializers?.transaction(
      { chainId, ...transaction } as unknown as TransactionSerializableEIP712,
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
    ) as Promise<SignTransactionReturnType>
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
