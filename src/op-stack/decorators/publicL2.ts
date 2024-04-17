import type { Abi, Address } from 'abitype'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type {
  ContractFunctionArgs,
  ContractFunctionName,
} from '../../types/contract.js'
import {
  type BuildDepositTransactionParameters,
  type BuildDepositTransactionReturnType,
  buildDepositTransaction,
} from '../actions/buildDepositTransaction.js'
import {
  type BuildProveWithdrawalParameters,
  type BuildProveWithdrawalReturnType,
  buildProveWithdrawal,
} from '../actions/buildProveWithdrawal.js'
import {
  type EstimateContractL1FeeParameters,
  type EstimateContractL1FeeReturnType,
  estimateContractL1Fee,
} from '../actions/estimateContractL1Fee.js'
import {
  type EstimateContractL1GasParameters,
  type EstimateContractL1GasReturnType,
  estimateContractL1Gas,
} from '../actions/estimateContractL1Gas.js'
import {
  type EstimateContractTotalFeeParameters,
  type EstimateContractTotalFeeReturnType,
  estimateContractTotalFee,
} from '../actions/estimateContractTotalFee.js'
import {
  type EstimateContractTotalGasParameters,
  type EstimateContractTotalGasReturnType,
  estimateContractTotalGas,
} from '../actions/estimateContractTotalGas.js'
import {
  type EstimateInitiateWithdrawalGasParameters,
  type EstimateInitiateWithdrawalGasReturnType,
  estimateInitiateWithdrawalGas,
} from '../actions/estimateInitiateWithdrawalGas.js'
import {
  type EstimateL1FeeParameters,
  type EstimateL1FeeReturnType,
  estimateL1Fee,
} from '../actions/estimateL1Fee.js'
import {
  type EstimateL1GasParameters,
  type EstimateL1GasReturnType,
  estimateL1Gas,
} from '../actions/estimateL1Gas.js'
import {
  type EstimateTotalFeeParameters,
  type EstimateTotalFeeReturnType,
  estimateTotalFee,
} from '../actions/estimateTotalFee.js'
import {
  type EstimateTotalGasParameters,
  type EstimateTotalGasReturnType,
  estimateTotalGas,
} from '../actions/estimateTotalGas.js'
import {
  type GetL1BaseFeeParameters,
  type GetL1BaseFeeReturnType,
  getL1BaseFee,
} from '../actions/getL1BaseFee.js'

export type PublicActionsL2<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
> = {
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
   *
   * const client = createWalletClient({
   *   chain: base,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const args = await client.buildDepositTransaction({
   *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
   *   value: parseEther('1'),
   * })
   */
  buildDepositTransaction: <
    chainOverride extends Chain | undefined = undefined,
    accountOverride extends Account | Address | undefined = undefined,
  >(
    parameters: BuildDepositTransactionParameters<
      chain,
      account,
      chainOverride,
      accountOverride
    >,
  ) => Promise<BuildDepositTransactionReturnType<account, accountOverride>>
  /**
   * Builds the transaction that proves a withdrawal was initiated on an L2. Used in the Withdrawal flow.
   *
   * - Docs: https://viem.sh/op-stack/actions/buildProveWithdrawal
   *
   * @param client - Client to use
   * @param parameters - {@link BuildProveWithdrawalParameters}
   * @returns The prove withdraw transaction request. {@link BuildProveWithdrawalReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { optimism } from 'viem/chains'
   * import { publicActionsL2 } from 'viem/op-stack'
   *
   * const publicClientL2 = createPublicClient({
   *   chain: optimism,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const args = await publicClientL2.buildProveWithdrawal({
   *   output: { ... },
   *   withdrawal: { ... },
   * })
   */
  buildProveWithdrawal: <
    chainOverride extends Chain | undefined = undefined,
    accountOverride extends Account | Address | undefined = undefined,
  >(
    parameters: BuildProveWithdrawalParameters<
      chain,
      account,
      chainOverride,
      accountOverride
    >,
  ) => Promise<
    BuildProveWithdrawalReturnType<
      chain,
      account,
      chainOverride,
      accountOverride
    >
  >
  /**
   * Estimates the L1 data fee required to execute an L2 contract write.
   *
   * @param client - Client to use
   * @param parameters - {@link EstimateContractL1FeeParameters}
   * @returns The gas estimate (in wei). {@link EstimateContractL1FeeReturnType}
   *
   * @example
   * import { createPublicClient, http, parseAbi } from 'viem'
   * import { optimism } from 'viem/chains'
   * import { publicActionsL2 } from 'viem/op-stack'
   *
   * const client = createPublicClient({
   *   chain: optimism,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const l1Fee = await client.estimateContractL1Fee({
   *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
   *   abi: parseAbi(['function mint() public']),
   *   functionName: 'mint',
   *   account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
   * })
   */
  estimateContractL1Fee: <
    const abi extends Abi | readonly unknown[],
    functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
    args extends ContractFunctionArgs<abi, 'pure' | 'view', functionName>,
    chainOverride extends Chain | undefined = undefined,
  >(
    parameters: EstimateContractL1FeeParameters<
      abi,
      functionName,
      args,
      chain,
      account,
      chainOverride
    >,
  ) => Promise<EstimateContractL1FeeReturnType>
  /**
   * Estimates the L1 data gas required to successfully execute a contract write function call.
   *
   * @param client - Client to use
   * @param parameters - {@link EstimateContractL1GasParameters}
   * @returns The gas estimate (in wei). {@link EstimateContractL1GasReturnType}
   *
   * @example
   * import { createPublicClient, http, parseAbi } from 'viem'
   * import { optimism } from 'viem/chains'
   * import { publicActionsL2 } from 'viem/op-stack'
   *
   * const client = createPublicClient({
   *   chain: optimism,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const l1Gas = await client.estimateContractL1Gas({
   *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
   *   abi: parseAbi(['function mint() public']),
   *   functionName: 'mint',
   *   account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
   * })
   */
  estimateContractL1Gas: <
    const abi extends Abi | readonly unknown[],
    functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
    args extends ContractFunctionArgs<abi, 'pure' | 'view', functionName>,
    chainOverride extends Chain | undefined = undefined,
  >(
    parameters: EstimateContractL1GasParameters<
      abi,
      functionName,
      args,
      chain,
      account,
      chainOverride
    >,
  ) => Promise<EstimateContractL1GasReturnType>
  /**
   * Estimates the L1 + L2 fee to execute an L2 contract write.
   *
   * @param client - Client to use
   * @param parameters - {@link EstimateContractTotalFeeParameters}
   * @returns The gas estimate (in wei). {@link EstimateContractTotalFeeReturnType}
   *
   * @example
   * import { createPublicClient, http, parseAbi } from 'viem'
   * import { optimism } from 'viem/chains'
   * import { publicActionsL2 } from 'viem/op-stack'
   *
   * const client = createPublicClient({
   *   chain: optimism,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const totalFee = await client.estimateContractTotalFee({
   *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
   *   abi: parseAbi(['function mint() public']),
   *   functionName: 'mint',
   *   account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
   * })
   */
  estimateContractTotalFee: <
    const abi extends Abi | readonly unknown[],
    functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
    args extends ContractFunctionArgs<abi, 'pure' | 'view', functionName>,
    chainOverride extends Chain | undefined = undefined,
  >(
    parameters: EstimateContractTotalFeeParameters<
      abi,
      functionName,
      args,
      chain,
      account,
      chainOverride
    >,
  ) => Promise<EstimateContractTotalFeeReturnType>
  /**
   * Estimates the L1 data gas + L2 gas required to successfully execute a contract write function call.
   *
   * @param client - Client to use
   * @param parameters - {@link EstimateContractTotalGasParameters}
   * @returns The gas estimate (in wei). {@link EstimateContractTotalGasReturnType}
   *
   * @example
   * import { createPublicClient, http, parseAbi } from 'viem'
   * import { optimism } from 'viem/chains'
   * import { publicActionsL2 } from 'viem/op-stack'
   *
   * const client = createPublicClient({
   *   chain: optimism,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const totalGas = await client.estimateContractTotalGas({
   *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
   *   abi: parseAbi(['function mint() public']),
   *   functionName: 'mint',
   *   account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
   * })
   */
  estimateContractTotalGas: <
    const abi extends Abi | readonly unknown[],
    functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
    args extends ContractFunctionArgs<abi, 'pure' | 'view', functionName>,
    chainOverride extends Chain | undefined = undefined,
  >(
    parameters: EstimateContractTotalGasParameters<
      abi,
      functionName,
      args,
      chain,
      account,
      chainOverride
    >,
  ) => Promise<EstimateContractTotalGasReturnType>
  /**
   * Estimates gas required to initiate a [withdrawal](https://community.optimism.io/docs/protocol/withdrawal-flow/#withdrawal-initiating-transaction) on an L2 to the L1.
   *
   * - Docs: https://viem.sh/op-stack/actions/estimateInitiateWithdrawalGas
   *
   * @param client - Client to use
   * @param parameters - {@link EstimateInitiateWithdrawalGasParameters}
   * @returns The gas required. {@link EstimateInitiateWithdrawalGasReturnType}
   *
   * @example
   * import { createPublicClient, http, parseEther } from 'viem'
   * import { base, mainnet } from 'viem/chains'
   * import { publicActionsL2 } from 'viem/op-stack'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const hash = await client.estimateInitiateWithdrawalGas({
   *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   *   request: {
   *     gas: 21_000n,
   *     to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
   *     value: parseEther('1'),
   *   },
   * })
   */
  estimateInitiateWithdrawalGas: <
    chainOverride extends Chain | undefined = undefined,
  >(
    parameters: EstimateInitiateWithdrawalGasParameters<
      chain,
      account,
      chainOverride
    >,
  ) => Promise<EstimateInitiateWithdrawalGasReturnType>
  /**
   * Estimates the L1 data fee required to execute an L2 transaction.
   *
   * @param client - Client to use
   * @param parameters - {@link EstimateL1FeeParameters}
   * @returns The fee (in wei). {@link EstimateL1FeeReturnType}
   *
   * @example
   * import { createPublicClient, http, parseEther } from 'viem'
   * import { optimism } from 'viem/chains'
   * import { publicActionsL2 } from 'viem/op-stack'
   *
   * const client = createPublicClient({
   *   chain: optimism,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const l1Fee = await client.estimateL1Fee({
   *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
   *   value: parseEther('1'),
   * })
   */
  estimateL1Fee: <chainOverride extends Chain | undefined = undefined>(
    parameters: EstimateL1FeeParameters<chain, account, chainOverride>,
  ) => Promise<EstimateL1FeeReturnType>

  /**
   * Get the L1 basefee
   *
   * @param client - Client to use
   * @param parameters - {@link GetL1BaseFeeParameters}
   * @returns The fee (in wei). {@link GetL1BaseFeeReturnType}
   *
   * @example
   * import { createPublicClient, http, parseEther } from 'viem'
   * import { optimism } from 'viem/chains'
   * import { publicActionsL2 } from 'viem/op-stack'
   *
   * const client = createPublicClient({
   *   chain: optimism,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const l1BaseFee = await client.getL1BaseFee()
   */
  getL1BaseFee: <chainOverride extends Chain | undefined = undefined>(
    parameters?: GetL1BaseFeeParameters<chain, chainOverride> | undefined,
  ) => Promise<GetL1BaseFeeReturnType>
  /**
   * Estimates the amount of L1 data gas required to execute an L2 transaction.
   *
   * @param client - Client to use
   * @param parameters - {@link EstimateL1GasParameters}
   * @returns The gas estimate. {@link EstimateL1GasReturnType}
   *
   * @example
   * import { createPublicClient, http, parseEther } from 'viem'
   * import { optimism } from 'viem/chains'
   * import { publicActionsL2 } from 'viem/op-stack'
   *
   * const client = createPublicClient({
   *   chain: optimism,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const l1Gas = await client.estimateL1Gas({
   *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
   *   value: parseEther('1'),
   * })
   */
  estimateL1Gas: <chainOverride extends Chain | undefined = undefined>(
    parameters: EstimateL1GasParameters<chain, account, chainOverride>,
  ) => Promise<EstimateL1GasReturnType>
  /**
   * Estimates the L1 data fee + L2 fee to execute an L2 transaction.
   *
   * @param client - Client to use
   * @param parameters - {@link EstimateTotalFeeParameters}
   * @returns The gas estimate. {@link EstimateTotalFeeReturnType}
   *
   * @example
   * import { createPublicClient, http, parseEther } from 'viem'
   * import { optimism } from 'viem/chains'
   * import { publicActionsL2 } from 'viem/op-stack'
   *
   * const client = createPublicClient({
   *   chain: optimism,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const totalFee = await client.estimateTotalFee({
   *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
   *   value: parseEther('1'),
   * })
   */
  estimateTotalFee: <chainOverride extends Chain | undefined = undefined>(
    parameters: EstimateTotalFeeParameters<chain, account, chainOverride>,
  ) => Promise<EstimateTotalFeeReturnType>
  /**
   * Estimates the total amount of combined L1 data gas + L2 gas required to execute an L2 transaction.
   *
   * @param client - Client to use
   * @param parameters - {@link EstimateTotalGasParameters}
   * @returns The gas estimate. {@link EstimateTotalGasReturnType}
   *
   * @example
   * import { createPublicClient, http, parseEther } from 'viem'
   * import { optimism } from 'viem/chains'
   * import { publicActionsL2 } from 'viem/op-stack'
   *
   * const client = createPublicClient({
   *   chain: optimism,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const totalGas = await client.estimateTotalGas({
   *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
   *   value: parseEther('1'),
   * })
   */
  estimateTotalGas: <chainOverride extends Chain | undefined = undefined>(
    parameters: EstimateTotalGasParameters<chain, account, chainOverride>,
  ) => Promise<EstimateTotalGasReturnType>
}

/**
 * A suite of Public Actions for suited for development with Layer 2 (OP Stack) chains.
 *
 * - Docs: https://viem.sh/op-stack/client
 *
 * @example
 * import { publicActionsL2 } from 'viem/op-stack'
 * import { optimism } from 'viem/chains'
 * import { buildDepositTransaction } from 'viem/wallet'
 *
 * export const opStackPublicClientL2 = createPublicClient({
 *   chain: optimism,
 *   transport: http(),
 * }).extend(publicActionsL2())
 */
export function publicActionsL2() {
  return <
    TTransport extends Transport,
    TChain extends Chain | undefined = Chain | undefined,
    TAccount extends Account | undefined = Account | undefined,
  >(
    client: Client<TTransport, TChain, TAccount>,
  ): PublicActionsL2<TChain, TAccount> => {
    return {
      buildDepositTransaction: (args) => buildDepositTransaction(client, args),
      buildProveWithdrawal: (args) => buildProveWithdrawal(client, args),
      estimateContractL1Fee: (args) => estimateContractL1Fee(client, args),
      estimateContractL1Gas: (args) => estimateContractL1Gas(client, args),
      estimateContractTotalFee: (args) =>
        estimateContractTotalFee(client, args),
      estimateContractTotalGas: (args) =>
        estimateContractTotalGas(client, args),
      estimateInitiateWithdrawalGas: (args) =>
        estimateInitiateWithdrawalGas(client, args),
      estimateL1Fee: (args) => estimateL1Fee(client, args),
      getL1BaseFee: (args) => getL1BaseFee(client, args),
      estimateL1Gas: (args) => estimateL1Gas(client, args),
      estimateTotalFee: (args) => estimateTotalFee(client, args),
      estimateTotalGas: (args) => estimateTotalGas(client, args),
    }
  }
}
