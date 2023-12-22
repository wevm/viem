import type {
  Chain,
  SignTransactionParameters,
  SignTransactionReturnType,
} from '~viem/index.js'
import type { Account } from '../../../accounts/types.js'
import { parseAccount } from '../../../accounts/utils/parseAccount.js'
import { getChainId } from '../../../actions/public/getChainId.js'
import { signTypedData } from '../../../actions/wallet/signTypedData.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import { AccountNotFoundError } from '../../../errors/account.js'
import { assertCurrentChain } from '../../../utils/chain/assertCurrentChain.js'
import { formatTransactionRequest } from '../../../utils/formatters/transactionRequest.js'
import { getAction } from '../../../utils/getAction.js'
import { numberToHex } from '../../../utils/index.js'
import { assertRequest } from '../../../utils/transaction/assertRequest.js'
import { type ChainEIP712, isEip712Transaction } from '../types.js'

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
  TChainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, TChain, TAccount>,
  argsIncoming: SignTransactionParameters<TChain, TAccount, TChainOverride>,
): Promise<SignTransactionReturnType> {
  const args = {
    ...argsIncoming,
    account: argsIncoming.account || client.account,
    chain: argsIncoming.chain || client.chain,
  }

  if (!args.account)
    throw new AccountNotFoundError({
      docsPath: '/docs/actions/wallet/signTransaction',
    })
  const account = parseAccount(args.account)

  assertRequest<TChain, TAccount, TChainOverride>(args)

  const chainId = await getAction(client, getChainId, 'getChainId')({})
  if (args.chain !== null)
    assertCurrentChain({
      currentChainId: chainId,
      chain: args.chain,
    })

  const formatters = args.chain?.formatters || client.chain?.formatters
  const format =
    formatters?.transactionRequest?.format || formatTransactionRequest

  if (
    client.chain?.custom.eip712domain?.eip712domain &&
    client.chain?.serializers?.transaction &&
    isEip712Transaction({ ...args, chainId })
  ) {
    const eip712Domain = client.chain?.custom.eip712domain?.eip712domain({
      ...args,
      type: 'eip712',
      from: account.address,
      gasPrice: undefined,
    })

    const customSignature = await signTypedData(client, {
      ...eip712Domain,
      account: account,
    })

    // If we have the customSignature we can sign the transaction, doesn't matter if account type
    // is `local` or `json-rpc`.
    return client.chain?.serializers?.transaction(
      {
        ...args,
        chainId,
        type: 'eip712',
        from: account.address,
        customSignature,
        gasPrice: undefined,
      },
      // Use this blank private key, probably we should change the code to be optional,
      // or option if it is EIP712.
      { r: '0x0', s: '0x0', v: 0n },
    )
  }

  if (account.type === 'local') {
    return account.signTransaction(
      {
        ...args,
        chainId,
        // TODO: I am suspicious that we actually don't want to override the type here.
        type: 'eip712',
        from: account.address,
        gasPrice: undefined,
      },
      { serializer: client.chain?.serializers?.transaction },
    )
  }

  // For EIP712 we don't need to ask MetaMask to sign it,
  return await client.request({
    method: 'eth_signTransaction',
    params: [
      {
        ...format(args),
        chainId: numberToHex(chainId),
        from: account.address,
      },
    ],
  })
}
