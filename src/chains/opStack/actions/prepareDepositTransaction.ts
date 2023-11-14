import type { Address } from 'abitype'
import {
  type PrepareTransactionRequestParameters,
  prepareTransactionRequest,
} from '../../../actions/index.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { ErrorType } from '../../../errors/utils.js'
import type { Account, GetAccountParameter } from '../../../types/account.js'
import type {
  Chain,
  DeriveChain,
  GetChainParameter,
} from '../../../types/chain.js'
import type { Hex } from '../../../types/misc.js'
import type { UnionOmit } from '../../../types/utils.js'
import type { Prettify } from '../../index.js'
import type { DepositTransactionParameters } from './depositTransaction.js'

export type PrepareDepositTransactionParameters<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  accountOverride extends Account | Address | undefined =
    | Account
    | Address
    | undefined,
  _derivedChain extends Chain | undefined = DeriveChain<chain, chainOverride>,
> = GetAccountParameter<account, accountOverride, false> &
  GetChainParameter<chain, chainOverride> & {
    /** Gas limit for transaction execution on the L2. */
    gas?: bigint
    /** Value in wei sent with this transaction on the L2. */
    value?: bigint
  } & (
    | {
        /** Encoded contract method & arguments. */
        data?: Hex
        /** Whether or not this is a contract deployment transaction. */
        isCreation?: false
        /** L2 Transaction recipient. */
        to?: Address
      }
    | {
        /** Contract deployment bytecode. Required for contract deployment transactions. */
        data: Hex
        /** Whether or not this is a contract deployment transaction. */
        isCreation: true
        /** L2 Transaction recipient. Cannot exist for contract deployment transactions. */
        to?: never
      }
  )

export type PrepareDepositTransactionReturnType<
  account extends Account | undefined = Account | undefined,
  accountOverride extends Account | Address | undefined =
    | Account
    | Address
    | undefined,
> = Prettify<
  UnionOmit<DepositTransactionParameters<Chain, account, Chain>, 'account'> &
    GetAccountParameter<account, accountOverride>
>

export type PrepareDepositTransactionErrorType = ErrorType

/**
 * Initiates a [deposit transaction](https://github.com/ethereum-optimism/optimism/blob/develop/specs/deposits.md) on an L1, which executes a transaction on L2.
 *
 * Internally performs a contract write to the [`depositTransaction` function](https://github.com/ethereum-optimism/optimism/blob/develop/packages/contracts-bedrock/src/L1/OptimismPortal.sol#L378)
 * on the [Optimism Portal contract](https://github.com/ethereum-optimism/optimism/blob/develop/packages/contracts-bedrock/src/L1/OptimismPortal.sol).
 *
 * - Docs: https://viem.sh/op-stack/actions/depositTransaction.html
 *
 * @param client - Client to use
 * @param parameters - {@link PrepareDepositTransactionParameters}
 * @returns The L1 transaction hash. {@link DepositTransactionReturnType}
 *
 * @example
 * import { createWalletClient, custom, parseEther } from 'viem'
 * import { base, mainnet } from 'viem/chains'
 * import { walletActionsL1 } from 'viem/op-stack'
 * import { depositTransaction } from 'viem/wallet'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * }).extend(walletActionsL1())
 *
 * const hash = await depositTransaction(client, {
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   args: {
 *     gas: 21_000n,
 *     to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *     value: parseEther('1'),
 *   },
 *   targetChain: base,
 * })
 *
 * @example
 * // Account Hoisting
 * import { createWalletClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { base, mainnet } from 'viem/chains'
 * import { walletActionsL1 } from 'viem/op-stack'
 * import { depositTransaction } from 'viem/wallet'
 *
 * const client = createWalletClient({
 *   account: privateKeyToAccount('0x…'),
 *   chain: mainnet,
 *   transport: http(),
 * }).extend(walletActionsL1())
 *
 * const hash = await depositTransaction(client, {
 *   args: {
 *     gas: 21_000n,
 *     to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *     value: parseEther('1'),
 *   },
 *   targetChain: base,
 * })
 */
export async function prepareDepositTransaction<
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined = undefined,
  accountOverride extends Account | Address | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  args: PrepareDepositTransactionParameters<
    chain,
    account,
    chainOverride,
    accountOverride
  >,
): Promise<PrepareDepositTransactionReturnType<account, accountOverride>> {
  const {
    account,
    chain = client.chain,
    gas,
    data,
    isCreation,
    to,
    value,
  } = args

  const request = await prepareTransactionRequest(client, {
    account,
    chain,
    gas,
    data,
    parameters: ['gas'],
    to,
    value,
  } as PrepareTransactionRequestParameters)

  return {
    account: request.account,
    args: {
      data: request.data,
      gas: request.gas,
      isCreation,
      to: request.to,
      value: request.value,
    },
    targetChain: chain,
  } as PrepareDepositTransactionReturnType<account, accountOverride>
}
