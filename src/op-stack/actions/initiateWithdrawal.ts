import type { Address } from 'abitype'
import {
  type WriteContractErrorType,
  type WriteContractParameters,
  writeContract,
} from '../../actions/wallet/writeContract.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Account, GetAccountParameter } from '../../types/account.js'
import type {
  Chain,
  DeriveChain,
  GetChainParameter,
} from '../../types/chain.js'
import type { Hash } from '../../types/misc.js'
import type { UnionEvaluate, UnionOmit } from '../../types/utils.js'
import type { FormattedTransactionRequest } from '../../utils/formatters/transactionRequest.js'
import { l2ToL1MessagePasserAbi } from '../abis.js'
import { contracts } from '../contracts.js'
import type { WithdrawalRequest } from '../types/withdrawal.js'
import {
  type EstimateInitiateWithdrawalGasErrorType,
  type EstimateInitiateWithdrawalGasParameters,
  estimateInitiateWithdrawalGas,
} from './estimateInitiateWithdrawalGas.js'

export type InitiateWithdrawalParameters<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  _derivedChain extends Chain | undefined = DeriveChain<chain, chainOverride>,
> = UnionEvaluate<
  UnionOmit<
    FormattedTransactionRequest<_derivedChain>,
    | 'accessList'
    | 'data'
    | 'from'
    | 'gas'
    | 'gasPrice'
    | 'to'
    | 'type'
    | 'value'
  >
> &
  GetAccountParameter<account, Account | Address> &
  GetChainParameter<chain, chainOverride> & {
    /**
     * Gas limit for transaction execution on the L2.
     * `null` to skip gas estimation & defer calculation to signer.
     */
    gas?: bigint | null
    /** Withdrawal request. Supplied to the L2ToL1MessagePasser `initiateWithdrawal` method. */
    request: WithdrawalRequest
  }
export type InitiateWithdrawalReturnType = Hash
export type InitiateWithdrawalErrorType =
  | EstimateInitiateWithdrawalGasErrorType
  | WriteContractErrorType
  | ErrorType

/**
 * Initiates a [withdrawal](https://community.optimism.io/docs/protocol/withdrawal-flow/#withdrawal-initiating-transaction) on an L2 to the L1.
 *
 * Internally performs a contract write to the [`initiateWithdrawal` function](https://github.com/ethereum-optimism/optimism/blob/283f0aa2e3358ced30ff7cbd4028c0c0c3faa140/packages/contracts-bedrock/src/L2/L2ToL1MessagePasser.sol#L73)
 * on the [Optimism L2ToL1MessagePasser predeploy contract](https://github.com/ethereum-optimism/optimism/blob/283f0aa2e3358ced30ff7cbd4028c0c0c3faa140/packages/contracts-bedrock/src/L2/L2ToL1MessagePasser.sol).
 *
 * - Docs: https://viem.sh/op-stack/actions/initiateWithdrawal
 *
 * @param client - Client to use
 * @param parameters - {@link InitiateWithdrawalParameters}
 * @returns The L2 transaction hash. {@link InitiateWithdrawalReturnType}
 *
 * @example
 * import { createWalletClient, custom, parseEther } from 'viem'
 * import { base, mainnet } from 'viem/chains'
 * import { initiateWithdrawal } from 'viem/op-stack'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 *
 * const hash = await initiateWithdrawal(client, {
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   args: {
 *     gas: 21_000n,
 *     to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *     value: parseEther('1'),
 *   },
 * })
 *
 * @example
 * // Account Hoisting
 * import { createWalletClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { base, mainnet } from 'viem/chains'
 * import { initiateWithdrawal } from 'viem/op-stack'
 *
 * const client = createWalletClient({
 *   account: privateKeyToAccount('0x…'),
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const hash = await initiateWithdrawal(client, {
 *   request: {
 *     gas: 21_000n,
 *     to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *     value: parseEther('1'),
 *   },
 * })
 */
export async function initiateWithdrawal<
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: InitiateWithdrawalParameters<chain, account, chainOverride>,
) {
  const {
    account,
    chain = client.chain,
    gas,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce,
    request: { data = '0x', gas: l1Gas, to, value },
  } = parameters

  const gas_ =
    typeof gas !== 'number' && gas !== null
      ? await estimateInitiateWithdrawalGas(
          client,
          parameters as EstimateInitiateWithdrawalGasParameters,
        )
      : undefined

  return writeContract(client, {
    account: account!,
    abi: l2ToL1MessagePasserAbi,
    address: contracts.l2ToL1MessagePasser.address,
    chain,
    functionName: 'initiateWithdrawal',
    args: [to, l1Gas, data],
    gas: gas_,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce,
    value,
  } satisfies WriteContractParameters as any)
}
