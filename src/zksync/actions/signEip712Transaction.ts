import type { Account } from '../../accounts/types.js'
import { parseAccount } from '../../accounts/utils/parseAccount.js'
import { getChainId } from '../../actions/public/getChainId.js'
import type {
  SignTransactionErrorType,
  SignTransactionReturnType,
} from '../../actions/wallet/signTransaction.js'
import { signTypedData } from '../../actions/wallet/signTypedData.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { AccountNotFoundError } from '../../errors/account.js'
import { BaseError } from '../../errors/base.js'
import type { GetAccountParameter } from '../../types/account.js'
import type {
  ExtractChainFormatterParameters,
  GetChainParameter,
} from '../../types/chain.js'
import type { UnionOmit } from '../../types/utils.js'
import { assertCurrentChain } from '../../utils/chain/assertCurrentChain.js'
import { getAction } from '../../utils/getAction.js'
import type { ChainEIP712 } from '../types/chain.js'
import type { TransactionRequestEIP712 } from '../types/transaction.js'
import {
  type AssertEip712RequestParameters,
  assertEip712Request,
} from '../utils/assertEip712Request.js'

type FormattedTransactionRequest<
  TChain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
> = ExtractChainFormatterParameters<
  TChain,
  'transactionRequest',
  TransactionRequestEIP712
>

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
  GetChainParameter<TChain, TChainOverride>

export type SignEip712TransactionReturnType = SignTransactionReturnType

export type SignEip712TransactionErrorType = SignTransactionErrorType

/**
 * Signs an EIP712 transaction.
 *
 * @param args - {@link SignTransactionParameters}
 * @returns The signed serialized transaction. {@link SignTransactionReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { zkSync } from 'viem/chains'
 * import { signEip712Transaction } from 'viem/zksync'
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
 * import { signEip712Transaction } from 'viem/zksync'
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
  TChainOverride extends ChainEIP712 | undefined,
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

  assertEip712Request({
    account,
    chain,
    ...(args as AssertEip712RequestParameters),
  })

  if (!chain?.custom?.getEip712Domain)
    throw new BaseError('`getEip712Domain` not found on chain.')
  if (!chain?.serializers?.transaction)
    throw new BaseError('transaction serializer not found on chain.')

  const chainId = await getAction(client, getChainId, 'getChainId')({})
  if (chain !== null)
    assertCurrentChain({
      currentChainId: chainId,
      chain: chain,
    })

  const eip712Domain = chain?.custom.getEip712Domain({
    ...transaction,
    chainId,
    from: account.address,
    type: 'eip712',
  })

  const customSignature = await signTypedData(client, {
    ...eip712Domain,
    account,
  })

  return chain?.serializers?.transaction(
    {
      chainId,
      ...transaction,
      customSignature,
      type: 'eip712' as any,
    },
    { r: '0x0', s: '0x0', v: 0n },
  ) as SignEip712TransactionReturnType
}
