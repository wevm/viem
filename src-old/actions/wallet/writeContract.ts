import type { Abi, Address } from 'abitype'

import type { Account } from '../../accounts/types.js'
import {
  type ParseAccountErrorType,
  parseAccount,
} from '../../accounts/utils/parseAccount.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import {
  AccountNotFoundError,
  type AccountNotFoundErrorType,
} from '../../errors/account.js'
import type { BaseError } from '../../errors/base.js'
import type { ErrorType } from '../../errors/utils.js'
import type { GetAccountParameter } from '../../types/account.js'
import type {
  Chain,
  DeriveChain,
  GetChainParameter,
} from '../../types/chain.js'
import type {
  ContractFunctionArgs,
  ContractFunctionName,
  ContractFunctionParameters,
} from '../../types/contract.js'
import type { Hex } from '../../types/misc.js'
import type { Prettify, UnionEvaluate, UnionOmit } from '../../types/utils.js'
import {
  type EncodeFunctionDataErrorType,
  type EncodeFunctionDataParameters,
  encodeFunctionData,
} from '../../utils/abi/encodeFunctionData.js'
import {
  type GetContractErrorReturnType,
  getContractError,
} from '../../utils/errors/getContractError.js'
import type { FormattedTransactionRequest } from '../../utils/formatters/transactionRequest.js'
import { getAction } from '../../utils/getAction.js'
import type { GetMutabilityAwareValue } from '../public/simulateContract.js'
import {
  type SendTransactionErrorType,
  type SendTransactionReturnType,
  sendTransaction,
} from './sendTransaction.js'
import type { sendTransactionSync } from './sendTransactionSync.js'

export type WriteContractParameters<
  abi extends Abi | readonly unknown[] = Abi,
  functionName extends ContractFunctionName<
    abi,
    'nonpayable' | 'payable'
  > = ContractFunctionName<abi, 'nonpayable' | 'payable'>,
  args extends ContractFunctionArgs<
    abi,
    'nonpayable' | 'payable',
    functionName
  > = ContractFunctionArgs<abi, 'nonpayable' | 'payable', functionName>,
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  ///
  allFunctionNames = ContractFunctionName<abi, 'nonpayable' | 'payable'>,
  derivedChain extends Chain | undefined = DeriveChain<chain, chainOverride>,
> = ContractFunctionParameters<
  abi,
  'nonpayable' | 'payable',
  functionName,
  args,
  false,
  allFunctionNames
> &
  GetChainParameter<chain, chainOverride> &
  Prettify<
    GetAccountParameter<account, Account | Address, true, true> &
      GetMutabilityAwareValue<
        abi,
        'nonpayable' | 'payable',
        functionName,
        FormattedTransactionRequest<derivedChain>['value'],
        args
      > & {
        /** Data to append to the end of the calldata. Useful for adding a ["domain" tag](https://opensea.notion.site/opensea/Seaport-Order-Attributions-ec2d69bf455041a5baa490941aad307f). */
        dataSuffix?: Hex | undefined
      }
  > &
  UnionEvaluate<
    UnionOmit<
      FormattedTransactionRequest<derivedChain>,
      'data' | 'from' | 'to' | 'value'
    >
  >

export type WriteContractReturnType = SendTransactionReturnType

export type WriteContractErrorType =
  | EncodeFunctionDataErrorType
  | AccountNotFoundErrorType
  | ParseAccountErrorType
  | GetContractErrorReturnType<SendTransactionErrorType>
  | ErrorType

/**
 * Executes a write function on a contract.
 *
 * - Docs: https://viem.sh/docs/contract/writeContract
 * - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/contracts_writing-to-contracts
 *
 * A "write" function on a Solidity contract modifies the state of the blockchain. These types of functions require gas to be executed, and hence a [Transaction](https://viem.sh/docs/glossary/terms) is needed to be broadcast in order to change the state.
 *
 * Internally, uses a [Wallet Client](https://viem.sh/docs/clients/wallet) to call the [`sendTransaction` action](https://viem.sh/docs/actions/wallet/sendTransaction) with [ABI-encoded `data`](https://viem.sh/docs/contract/encodeFunctionData).
 *
 * __Warning: The `write` internally sends a transaction – it does not validate if the contract write will succeed (the contract may throw an error). It is highly recommended to [simulate the contract write with `contract.simulate`](https://viem.sh/docs/contract/writeContract#usage) before you execute it.__
 *
 * @param client - Client to use
 * @param parameters - {@link WriteContractParameters}
 * @returns A [Transaction Hash](https://viem.sh/docs/glossary/terms#hash). {@link WriteContractReturnType}
 *
 * @example
 * import { createWalletClient, custom, parseAbi } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { writeContract } from 'viem/contract'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const hash = await writeContract(client, {
 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *   abi: parseAbi(['function mint(uint32 tokenId) nonpayable']),
 *   functionName: 'mint',
 *   args: [69420],
 * })
 *
 * @example
 * // With Validation
 * import { createWalletClient, http, parseAbi } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { simulateContract, writeContract } from 'viem/contract'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const { request } = await simulateContract(client, {
 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *   abi: parseAbi(['function mint(uint32 tokenId) nonpayable']),
 *   functionName: 'mint',
 *   args: [69420],
 * }
 * const hash = await writeContract(client, request)
 */
export async function writeContract<
  chain extends Chain | undefined,
  account extends Account | undefined,
  const abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
  args extends ContractFunctionArgs<
    abi,
    'nonpayable' | 'payable',
    functionName
  >,
  chainOverride extends Chain | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: WriteContractParameters<
    abi,
    functionName,
    args,
    chain,
    account,
    chainOverride
  >,
): Promise<WriteContractReturnType> {
  return writeContract.internal(
    client,
    sendTransaction,
    'sendTransaction',
    parameters,
  ) as never
}

export namespace writeContract {
  export async function internal<
    chain extends Chain | undefined,
    account extends Account | undefined,
    const abi extends Abi | readonly unknown[],
    functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
    args extends ContractFunctionArgs<
      abi,
      'nonpayable' | 'payable',
      functionName
    >,
    chainOverride extends Chain | undefined,
  >(
    client: Client<Transport, chain, account>,
    actionFn: typeof sendTransaction | typeof sendTransactionSync,
    name: 'sendTransaction' | 'sendTransactionSync',
    parameters: WriteContractParameters<
      abi,
      functionName,
      args,
      chain,
      account,
      chainOverride
    >,
  ) {
    const {
      abi,
      account: account_ = client.account,
      address,
      args,
      functionName,
      ...request
    } = parameters as WriteContractParameters

    if (typeof account_ === 'undefined')
      throw new AccountNotFoundError({
        docsPath: '/docs/contract/writeContract',
      })
    const account = account_ ? parseAccount(account_) : null

    const data = encodeFunctionData({
      abi,
      args,
      functionName,
    } as EncodeFunctionDataParameters)

    try {
      return await getAction(
        client,
        actionFn as never,
        name,
      )({
        data,
        to: address,
        account,
        ...request,
      })
    } catch (error) {
      throw getContractError(error as BaseError, {
        abi,
        address,
        args,
        docsPath: '/docs/contract/writeContract',
        functionName,
        sender: account?.address,
      })
    }
  }
}
