import type { Address } from 'abitype'
import {
  type ParseAccountErrorType,
  parseAccount,
} from '../../accounts/utils/parseAccount.js'
import {
  type PrepareTransactionRequestErrorType,
  type PrepareTransactionRequestParameters,
  prepareTransactionRequest,
} from '../../actions/wallet/prepareTransactionRequest.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type {
  Account,
  DeriveAccount,
  GetAccountParameter,
} from '../../types/account.js'
import type {
  Chain,
  DeriveChain,
  GetChainParameter,
} from '../../types/chain.js'
import type { Hex } from '../../types/misc.js'
import type { Prettify, UnionOmit } from '../../types/utils.js'
import type { DepositTransactionParameters } from './depositTransaction.js'

export type BuildDepositTransactionParameters<
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
    gas?: bigint | undefined
    /** Value in wei to mint (deposit) on the L2. Debited from the caller's L1 balance. */
    mint?: bigint | undefined
    /** Value in wei sent with this transaction on the L2. Debited from the caller's L2 balance. */
    value?: bigint | undefined
  } & (
    | {
        /** Encoded contract method & arguments. */
        data?: Hex | undefined
        /** Whether or not this is a contract deployment transaction. */
        isCreation?: false | undefined
        /** L2 Transaction recipient. */
        to?: Address | undefined
      }
    | {
        /** Contract deployment bytecode. Required for contract deployment transactions. */
        data: Hex
        /** Whether or not this is a contract deployment transaction. */
        isCreation: true
        /** L2 Transaction recipient. Cannot exist for contract deployment transactions. */
        to?: undefined
      }
  )

export type BuildDepositTransactionReturnType<
  account extends Account | undefined = Account | undefined,
  accountOverride extends Account | Address | undefined =
    | Account
    | Address
    | undefined,
> = Prettify<
  UnionOmit<DepositTransactionParameters<Chain, account, Chain>, 'account'> & {
    account: DeriveAccount<account, accountOverride>
  }
>

export type BuildDepositTransactionErrorType =
  | ParseAccountErrorType
  | PrepareTransactionRequestErrorType
  | ErrorType

/**
 * Prepares parameters for a [deposit transaction](https://github.com/ethereum-optimism/optimism/blob/develop/specs/deposits.md) to be initiated on an L1.
 *
 * - Docs: https://viem.sh/op-stack/actions/buildDepositTransaction
 *
 * @param client - Client to use
 * @param parameters - {@link BuildDepositTransactionParameters}
 * @returns Parameters for `depositTransaction`. {@link DepositTransactionReturnType}
 *
 * @example
 * import { createWalletClient, http, parseEther } from 'viem'
 * import { base } from 'viem/chains'
 * import { publicActionsL2 } from 'viem/op-stack'
 * import { buildDepositTransaction } from 'viem/wallet'
 *
 * const client = createWalletClient({
 *   chain: base,
 *   transport: http(),
 * }).extend(publicActionsL2())
 *
 * const args = await buildDepositTransaction(client, {
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *   value: parseEther('1'),
 * })
 */
export async function buildDepositTransaction<
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined = undefined,
  accountOverride extends Account | Address | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  args: BuildDepositTransactionParameters<
    chain,
    account,
    chainOverride,
    accountOverride
  >,
): Promise<BuildDepositTransactionReturnType<account, accountOverride>> {
  const {
    account: account_,
    chain = client.chain,
    gas,
    data,
    isCreation,
    mint,
    to,
    value,
  } = args

  const account = account_ ? parseAccount(account_) : undefined

  const request = await prepareTransactionRequest(client, {
    account: mint ? undefined : account,
    chain,
    gas,
    data,
    parameters: ['gas'],
    to,
    value,
  } as PrepareTransactionRequestParameters)

  return {
    account,
    request: {
      data: request.data,
      gas: request.gas,
      mint,
      isCreation,
      to: request.to,
      value: request.value,
    },
    targetChain: chain,
  } as unknown as BuildDepositTransactionReturnType<account, accountOverride>
}
