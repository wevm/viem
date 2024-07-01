import type { Account } from '../../accounts/types.js'
import { signTransaction as signTransaction_ } from '../../actions/wallet/signTransaction.js'
import type {
  SignTransactionErrorType as SignTransactionErrorType_,
  SignTransactionReturnType as SignTransactionReturnType_,
} from '../../actions/wallet/signTransaction.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { GetAccountParameter } from '../../types/account.js'
import type {
  ExtractChainFormatterParameters,
  GetChainParameter,
} from '../../types/chain.js'
import type { UnionOmit } from '../../types/utils.js'
import type { ChainEIP712 } from '../types/chain.js'
import type { TransactionRequestEIP712 } from '../types/transaction.js'
import { isEIP712Transaction } from '../utils/isEip712Transaction.js'
import { signEip712Transaction } from './signEip712Transaction.js'

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
  GetChainParameter<TChain, TChainOverride>

export type SignTransactionReturnType = SignTransactionReturnType_

export type SignTransactionErrorType = SignTransactionErrorType_

/**
 * Signs a transaction.
 *
 * - Docs: https://viem.sh/docs/zksync/actions/signTransaction
 *
 * @param args - {@link SignTransactionParameters}
 * @returns The signed serialized transaction. {@link SignTransactionReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { zkSync } from 'viem/chains'
 * import { signTransaction } from 'viem/zksync'
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
 * import { signTransaction } from 'viem/zksync'
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
  if (isEIP712Transaction(args)) return signEip712Transaction(client, args)
  return await signTransaction_(client, args as any)
}
