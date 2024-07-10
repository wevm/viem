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
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
> = ExtractChainFormatterParameters<
  chain,
  'transactionRequest',
  TransactionRequestEIP712
>

export type SignTransactionParameters<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends ChainEIP712 | undefined = ChainEIP712 | undefined,
> = UnionOmit<
  FormattedTransactionRequest<
    chainOverride extends ChainEIP712 ? chainOverride : chain
  >,
  'from'
> &
  GetAccountParameter<account> &
  GetChainParameter<chain, chainOverride>

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
  chain extends ChainEIP712 | undefined,
  account extends Account | undefined,
  chainOverride extends ChainEIP712 | undefined,
>(
  client: Client<Transport, chain, account>,
  args: SignTransactionParameters<chain, account, chainOverride>,
): Promise<SignTransactionReturnType> {
  if (isEIP712Transaction(args)) return signEip712Transaction(client, args)
  return await signTransaction_(client, args as any)
}
