import type { Abi } from 'abitype'
import type { Address } from 'ox'

import type * as Account from '../core/Account.js'
import type * as Chain from '../core/Chain.js'
import type * as Client from '../core/Client.js'
import type {
  ContractFunctionArgs,
  ContractFunctionName,
} from '../core/actions/internal/contract.js'
import * as l1 from './actions/l1/index.js'
import * as l2 from './actions/l2/index.js'

/** OP Stack L1 actions bound under `client.opStack`. */
export type L1Decorator<
  account extends Account.Account | undefined = Account.Account | undefined,
> = {
  /** OP Stack L1 actions. */
  opStack: {
    /**
     * Prepares an L2 withdrawal request for submission.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem'
     * import { mainnet } from 'viem/chains'
     * import { opStackL1Actions } from 'viem/op-stack'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(opStackL1Actions())
     * const withdrawal = await client.opStack.buildInitiateWithdrawal({
     *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
     *   value: 1n,
     * })
     * ```
     *
     * @param options - Options.
     * @returns The prepared withdrawal parameters.
     */
    buildInitiateWithdrawal: <
      const accountOverride extends
        | Account.Account
        | Address.Address
        | undefined = undefined,
    >(
      options: l1.buildInitiateWithdrawal.Options<accountOverride>,
    ) => Promise<l1.buildInitiateWithdrawal.ReturnType<accountOverride>>
    /**
     * Deposits an L1 transaction onto an OP Stack L2.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem'
     * import { mainnet, optimism } from 'viem/chains'
     * import { opStackL1Actions } from 'viem/op-stack'
     *
     * const client = Client.create({
     *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(opStackL1Actions())
     * const hash = await client.opStack.depositTransaction({
     *   request: {
     *     gas: 21_000n,
     *     to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
     *     value: 1n,
     *   },
     *   targetChain: optimism,
     * })
     * ```
     *
     * @param options - Options.
     * @returns The L1 transaction hash.
     */
    depositTransaction: (
      options: l1.depositTransaction.Options<account>,
    ) => Promise<l1.depositTransaction.ReturnType>
    /**
     * Estimates gas to deposit an L1 transaction onto an OP Stack L2.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem'
     * import { mainnet, optimism } from 'viem/chains'
     * import { opStackL1Actions } from 'viem/op-stack'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(opStackL1Actions())
     * const gas = await client.opStack.estimateDepositTransactionGas({
     *   request: {
     *     gas: 21_000n,
     *     to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
     *     value: 1n,
     *   },
     *   targetChain: optimism,
     * })
     * ```
     *
     * @param options - Options.
     * @returns The estimated L1 gas.
     */
    estimateDepositTransactionGas: (
      options: l1.estimateDepositTransactionGas.Options,
    ) => Promise<l1.estimateDepositTransactionGas.ReturnType>
    /**
     * Estimates gas to finalize an OP Stack withdrawal on L1.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem'
     * import { mainnet, optimism } from 'viem/chains'
     * import { type Withdrawal, opStackL1Actions } from 'viem/op-stack'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(opStackL1Actions())
     * declare const withdrawal: Withdrawal.Withdrawal
     * const gas = await client.opStack.estimateFinalizeWithdrawalGas({
     *   targetChain: optimism,
     *   withdrawal,
     * })
     * ```
     *
     * @param options - Options.
     * @returns The estimated L1 gas.
     */
    estimateFinalizeWithdrawalGas: (
      options: l1.estimateFinalizeWithdrawalGas.Options,
    ) => Promise<l1.estimateFinalizeWithdrawalGas.ReturnType>
    /**
     * Estimates gas to prove an OP Stack withdrawal on L1.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem'
     * import { mainnet } from 'viem/chains'
     * import { opStackL1Actions } from 'viem/op-stack'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(opStackL1Actions())
     * declare const options: Parameters<
     *   typeof client.opStack.estimateProveWithdrawalGas
     * >[0]
     * const gas = await client.opStack.estimateProveWithdrawalGas(options)
     * ```
     *
     * @param options - Options.
     * @returns The estimated L1 gas.
     */
    estimateProveWithdrawalGas: (
      options: l1.estimateProveWithdrawalGas.Options,
    ) => Promise<l1.estimateProveWithdrawalGas.ReturnType>
    /**
     * Finalizes an OP Stack withdrawal on L1.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem'
     * import { mainnet, optimism } from 'viem/chains'
     * import { type Withdrawal, opStackL1Actions } from 'viem/op-stack'
     *
     * const client = Client.create({
     *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(opStackL1Actions())
     * declare const withdrawal: Withdrawal.Withdrawal
     * const hash = await client.opStack.finalizeWithdrawal({
     *   targetChain: optimism,
     *   withdrawal,
     * })
     * ```
     *
     * @param options - Options.
     * @returns The L1 transaction hash.
     */
    finalizeWithdrawal: (
      options: l1.finalizeWithdrawal.Options<account>,
    ) => Promise<l1.finalizeWithdrawal.ReturnType>
    /**
     * Retrieves a respected dispute game after an L2 position.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem'
     * import { mainnet, optimism } from 'viem/chains'
     * import { opStackL1Actions } from 'viem/op-stack'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(opStackL1Actions())
     * const game = await client.opStack.getGame({
     *   l2BlockNumber: 123n,
     *   targetChain: optimism,
     * })
     * ```
     *
     * @param options - Options.
     * @returns The selected dispute game.
     */
    getGame: (options: l1.getGame.Options) => Promise<l1.getGame.ReturnType>
    /**
     * Retrieves recent respected dispute games for an OP Stack L2.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem'
     * import { mainnet, optimism } from 'viem/chains'
     * import { opStackL1Actions } from 'viem/op-stack'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(opStackL1Actions())
     * const games = await client.opStack.getGames({
     *   targetChain: optimism,
     * })
     * ```
     *
     * @param options - Options.
     * @returns The recent respected dispute games.
     */
    getGames: (options: l1.getGames.Options) => Promise<l1.getGames.ReturnType>
    /**
     * Retrieves the L2 output covering a block number.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem'
     * import { mainnet, optimism } from 'viem/chains'
     * import { opStackL1Actions } from 'viem/op-stack'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(opStackL1Actions())
     * const output = await client.opStack.getL2Output({
     *   l2BlockNumber: 123n,
     *   targetChain: optimism,
     * })
     * ```
     *
     * @param options - Options.
     * @returns The L2 output proposal or dispute-game claim.
     */
    getL2Output: (
      options: l1.getL2Output.Options,
    ) => Promise<l1.getL2Output.ReturnType>
    /**
     * Retrieves the Optimism Portal semantic version.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem'
     * import { mainnet, optimism } from 'viem/chains'
     * import { opStackL1Actions } from 'viem/op-stack'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(opStackL1Actions())
     * const version = await client.opStack.getPortalVersion({
     *   targetChain: optimism,
     * })
     * ```
     *
     * @param options - Options.
     * @returns The parsed semantic version.
     */
    getPortalVersion: (
      options: l1.getPortalVersion.Options,
    ) => Promise<l1.getPortalVersion.ReturnType>
    /**
     * Returns the remaining time before a withdrawal can be finalized.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem'
     * import { mainnet, optimism } from 'viem/chains'
     * import { opStackL1Actions } from 'viem/op-stack'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(opStackL1Actions())
     * const time = await client.opStack.getTimeToFinalize({
     *   targetChain: optimism,
     *   withdrawalHash:
     *     '0x0000000000000000000000000000000000000000000000000000000000000000',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The remaining finalization delay.
     */
    getTimeToFinalize: (
      options: l1.getTimeToFinalize.Options,
    ) => Promise<l1.getTimeToFinalize.ReturnType>
    /**
     * Returns the time until the next dispute game is expected.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem'
     * import { mainnet, optimism } from 'viem/chains'
     * import { opStackL1Actions } from 'viem/op-stack'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(opStackL1Actions())
     * const time = await client.opStack.getTimeToNextGame({
     *   l2BlockNumber: 123n,
     *   targetChain: optimism,
     * })
     * ```
     *
     * @param options - Options.
     * @returns The estimated wait for the next dispute game.
     */
    getTimeToNextGame: (
      options: l1.getTimeToNextGame.Options,
    ) => Promise<l1.getTimeToNextGame.ReturnType>
    /**
     * Returns the time until an L2 output is expected.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem'
     * import { mainnet, optimism } from 'viem/chains'
     * import { opStackL1Actions } from 'viem/op-stack'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(opStackL1Actions())
     * const time = await client.opStack.getTimeToNextL2Output({
     *   l2BlockNumber: 123n,
     *   targetChain: optimism,
     * })
     * ```
     *
     * @param options - Options.
     * @returns The estimated wait for the next L2 output.
     */
    getTimeToNextL2Output: (
      options: l1.getTimeToNextL2Output.Options,
    ) => Promise<l1.getTimeToNextL2Output.ReturnType>
    /**
     * Returns the time until a withdrawal can be proved.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem'
     * import { mainnet, optimism } from 'viem/chains'
     * import {
     *   type TransactionReceipt,
     *   opStackL1Actions,
     * } from 'viem/op-stack'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(opStackL1Actions())
     * declare const receipt: TransactionReceipt.TransactionReceipt
     * const time = await client.opStack.getTimeToProve({
     *   receipt,
     *   targetChain: optimism,
     * })
     * ```
     *
     * @param options - Options.
     * @returns The estimated wait before the withdrawal can be proved.
     */
    getTimeToProve: (
      options: l1.getTimeToProve.Options,
    ) => Promise<l1.getTimeToProve.ReturnType>
    /**
     * Returns the current lifecycle status of an OP Stack withdrawal.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem'
     * import { mainnet, optimism } from 'viem/chains'
     * import {
     *   type TransactionReceipt,
     *   opStackL1Actions,
     * } from 'viem/op-stack'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(opStackL1Actions())
     * declare const receipt: TransactionReceipt.TransactionReceipt
     * const status = await client.opStack.getWithdrawalStatus({
     *   receipt,
     *   targetChain: optimism,
     * })
     * ```
     *
     * @param options - Options.
     * @returns The withdrawal lifecycle status.
     */
    getWithdrawalStatus: (
      options: l1.getWithdrawalStatus.Options,
    ) => Promise<l1.getWithdrawalStatus.ReturnType>
    /**
     * Proves an OP Stack withdrawal on L1.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem'
     * import { mainnet } from 'viem/chains'
     * import { opStackL1Actions } from 'viem/op-stack'
     *
     * const client = Client.create({
     *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(opStackL1Actions())
     * declare const options: Parameters<
     *   typeof client.opStack.proveWithdrawal
     * >[0]
     * const hash = await client.opStack.proveWithdrawal(options)
     * ```
     *
     * @param options - Options.
     * @returns The L1 transaction hash.
     */
    proveWithdrawal: (
      options: l1.proveWithdrawal.Options<account>,
    ) => Promise<l1.proveWithdrawal.ReturnType>
    /**
     * Waits for the next dispute game covering an L2 position.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem'
     * import { mainnet, optimism } from 'viem/chains'
     * import { opStackL1Actions } from 'viem/op-stack'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(opStackL1Actions())
     * const game = await client.opStack.waitForNextGame({
     *   l2BlockNumber: 123n,
     *   targetChain: optimism,
     * })
     * ```
     *
     * @param options - Options.
     * @returns The next dispute game.
     */
    waitForNextGame: (
      options: l1.waitForNextGame.Options,
    ) => Promise<l1.waitForNextGame.ReturnType>
    /**
     * Waits for the next output covering an L2 block.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem'
     * import { mainnet, optimism } from 'viem/chains'
     * import { opStackL1Actions } from 'viem/op-stack'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(opStackL1Actions())
     * const output = await client.opStack.waitForNextL2Output({
     *   l2BlockNumber: 123n,
     *   targetChain: optimism,
     * })
     * ```
     *
     * @param options - Options.
     * @returns The next L2 output.
     */
    waitForNextL2Output: (
      options: l1.waitForNextL2Output.Options,
    ) => Promise<l1.waitForNextL2Output.ReturnType>
    /**
     * Waits until an OP Stack withdrawal can be finalized.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem'
     * import { mainnet, optimism } from 'viem/chains'
     * import { opStackL1Actions } from 'viem/op-stack'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(opStackL1Actions())
     * await client.opStack.waitToFinalize({
     *   targetChain: optimism,
     *   withdrawalHash:
     *     '0x0000000000000000000000000000000000000000000000000000000000000000',
     * })
     * ```
     *
     * @param options - Options.
     * @returns A promise that resolves when finalization is available.
     */
    waitToFinalize: (
      options: l1.waitToFinalize.Options,
    ) => Promise<l1.waitToFinalize.ReturnType>
    /**
     * Waits until an OP Stack withdrawal can be proved.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem'
     * import { mainnet, optimism } from 'viem/chains'
     * import {
     *   type TransactionReceipt,
     *   opStackL1Actions,
     * } from 'viem/op-stack'
     *
     * const client = Client.create({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(opStackL1Actions())
     * declare const receipt: TransactionReceipt.TransactionReceipt
     * const proof = await client.opStack.waitToProve({
     *   receipt,
     *   targetChain: optimism,
     * })
     * ```
     *
     * @param options - Options.
     * @returns The data required to prove the withdrawal.
     */
    waitToProve: (
      options: l1.waitToProve.Options,
    ) => Promise<l1.waitToProve.ReturnType>
  }
}

/** OP Stack L2 actions bound under `client.opStack`. */
export type L2Decorator<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
  account extends Account.Account | undefined = Account.Account | undefined,
> = {
  /** OP Stack L2 actions. */
  opStack: {
    /**
     * Prepares parameters for depositing a transaction from L1 to L2.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem'
     * import { optimism } from 'viem/chains'
     * import { opStackL2Actions } from 'viem/op-stack'
     *
     * const client = Client.create({
     *   chain: optimism,
     *   transport: http(),
     * }).extend(opStackL2Actions())
     * const deposit = await client.opStack.buildDepositTransaction({
     *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
     *   value: 1n,
     * })
     * ```
     *
     * @param options - Options.
     * @returns The prepared deposit parameters.
     */
    buildDepositTransaction: <
      const chainOverride extends Chain.Chain | undefined = undefined,
      const accountOverride extends
        | Account.Account
        | Address.Address
        | undefined = undefined,
    >(
      options: l2.buildDepositTransaction.Options<
        chainOverride,
        accountOverride
      >,
    ) => Promise<
      l2.buildDepositTransaction.ReturnType<
        chain,
        chainOverride,
        accountOverride
      >
    >
    /**
     * Builds the parameters required to prove an L2 withdrawal on L1.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem'
     * import { optimism } from 'viem/chains'
     * import { opStackL2Actions } from 'viem/op-stack'
     *
     * const client = Client.create({
     *   chain: optimism,
     *   transport: http(),
     * }).extend(opStackL2Actions())
     * declare const options: Parameters<
     *   typeof client.opStack.buildProveWithdrawal
     * >[0]
     * const proof = await client.opStack.buildProveWithdrawal(options)
     * ```
     *
     * @param options - Options.
     * @returns The parameters required to prove the withdrawal on L1.
     */
    buildProveWithdrawal: <
      const chainOverride extends Chain.Chain | undefined = undefined,
      const accountOverride extends
        | Account.Account
        | Address.Address
        | undefined = undefined,
    >(
      options: l2.buildProveWithdrawal.Options<chainOverride, accountOverride>,
    ) => Promise<
      l2.buildProveWithdrawal.ReturnType<
        chain,
        account,
        chainOverride,
        accountOverride
      >
    >
    /**
     * Estimates the L1 data fee required to execute an L2 contract write.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem'
     * import { optimism } from 'viem/chains'
     * import { opStackL2Actions } from 'viem/op-stack'
     * import { Abi } from 'viem/utils'
     *
     * const client = Client.create({
     *   chain: optimism,
     *   transport: http(),
     * }).extend(opStackL2Actions())
     * const fee = await client.opStack.estimateContractL1Fee({
     *   abi: Abi.from(['function mint()']),
     *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
     *   functionName: 'mint',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The L1 data fee in wei.
     */
    estimateContractL1Fee: <
      const abi extends Abi | readonly unknown[],
      functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
      const args extends ContractFunctionArgs<
        abi,
        'nonpayable' | 'payable',
        functionName
      >,
    >(
      options: l2.estimateContractL1Fee.Options<abi, functionName, args>,
    ) => Promise<l2.estimateContractL1Fee.ReturnType>
    /**
     * Estimates the L1 data gas required to execute an L2 contract write.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem'
     * import { optimism } from 'viem/chains'
     * import { opStackL2Actions } from 'viem/op-stack'
     * import { Abi } from 'viem/utils'
     *
     * const client = Client.create({
     *   chain: optimism,
     *   transport: http(),
     * }).extend(opStackL2Actions())
     * const gas = await client.opStack.estimateContractL1Gas({
     *   abi: Abi.from(['function mint()']),
     *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
     *   functionName: 'mint',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The L1 data gas.
     */
    estimateContractL1Gas: <
      const abi extends Abi | readonly unknown[],
      functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
      const args extends ContractFunctionArgs<
        abi,
        'nonpayable' | 'payable',
        functionName
      >,
    >(
      options: l2.estimateContractL1Gas.Options<abi, functionName, args>,
    ) => Promise<l2.estimateContractL1Gas.ReturnType>
    /**
     * Estimates the total fee required to execute an L2 contract write.
     *
     * Requires an Isthmus-compatible `GasPriceOracle.getOperatorFee` implementation.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem'
     * import { optimism } from 'viem/chains'
     * import { opStackL2Actions } from 'viem/op-stack'
     * import { Abi } from 'viem/utils'
     *
     * const client = Client.create({
     *   chain: optimism,
     *   transport: http(),
     * }).extend(opStackL2Actions())
     * const fee = await client.opStack.estimateContractTotalFee({
     *   abi: Abi.from(['function mint()']),
     *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
     *   functionName: 'mint',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The total L1 and L2 fee in wei.
     */
    estimateContractTotalFee: <
      const abi extends Abi | readonly unknown[],
      functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
      const args extends ContractFunctionArgs<
        abi,
        'nonpayable' | 'payable',
        functionName
      >,
    >(
      options: l2.estimateContractTotalFee.Options<abi, functionName, args>,
    ) => Promise<l2.estimateContractTotalFee.ReturnType>
    /**
     * Estimates the total gas required to execute an L2 contract write.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem'
     * import { optimism } from 'viem/chains'
     * import { opStackL2Actions } from 'viem/op-stack'
     * import { Abi } from 'viem/utils'
     *
     * const client = Client.create({
     *   chain: optimism,
     *   transport: http(),
     * }).extend(opStackL2Actions())
     * const gas = await client.opStack.estimateContractTotalGas({
     *   abi: Abi.from(['function mint()']),
     *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
     *   functionName: 'mint',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The total L1 and L2 gas.
     */
    estimateContractTotalGas: <
      const abi extends Abi | readonly unknown[],
      functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
      const args extends ContractFunctionArgs<
        abi,
        'nonpayable' | 'payable',
        functionName
      >,
    >(
      options: l2.estimateContractTotalGas.Options<abi, functionName, args>,
    ) => Promise<l2.estimateContractTotalGas.ReturnType>
    /**
     * Estimates gas required to initiate an L2 withdrawal.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem'
     * import { optimism } from 'viem/chains'
     * import { opStackL2Actions } from 'viem/op-stack'
     *
     * const client = Client.create({
     *   chain: optimism,
     *   transport: http(),
     * }).extend(opStackL2Actions())
     * const gas = await client.opStack.estimateInitiateWithdrawalGas({
     *   request: {
     *     gas: 21_000n,
     *     to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
     *     value: 1n,
     *   },
     * })
     * ```
     *
     * @param options - Options.
     * @returns The estimated L2 gas.
     */
    estimateInitiateWithdrawalGas: (
      options: l2.estimateInitiateWithdrawalGas.Options<chain>,
    ) => Promise<l2.estimateInitiateWithdrawalGas.ReturnType>
    /**
     * Estimates the L1 data fee for an L2 transaction.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem'
     * import { optimism } from 'viem/chains'
     * import { opStackL2Actions } from 'viem/op-stack'
     *
     * const client = Client.create({
     *   chain: optimism,
     *   transport: http(),
     * }).extend(opStackL2Actions())
     * const fee = await client.opStack.estimateL1Fee({
     *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
     *   value: 1n,
     * })
     * ```
     *
     * @param options - Options.
     * @returns The L1 data fee in wei.
     */
    estimateL1Fee: (
      options: l2.estimateL1Fee.Options,
    ) => Promise<l2.estimateL1Fee.ReturnType>
    /**
     * Estimates the L1 data gas for an L2 transaction.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem'
     * import { optimism } from 'viem/chains'
     * import { opStackL2Actions } from 'viem/op-stack'
     *
     * const client = Client.create({
     *   chain: optimism,
     *   transport: http(),
     * }).extend(opStackL2Actions())
     * const gas = await client.opStack.estimateL1Gas({
     *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
     *   value: 1n,
     * })
     * ```
     *
     * @param options - Options.
     * @returns The L1 data gas.
     */
    estimateL1Gas: (
      options: l2.estimateL1Gas.Options,
    ) => Promise<l2.estimateL1Gas.ReturnType>
    /**
     * Estimates the operator fee for an L2 transaction.
     *
     * Requires an Isthmus-compatible `GasPriceOracle.getOperatorFee` implementation.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem'
     * import { optimism } from 'viem/chains'
     * import { opStackL2Actions } from 'viem/op-stack'
     *
     * const client = Client.create({
     *   chain: optimism,
     *   transport: http(),
     * }).extend(opStackL2Actions())
     * const fee = await client.opStack.estimateOperatorFee({
     *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
     *   value: 1n,
     * })
     * ```
     *
     * @param options - Options.
     * @returns The operator fee in wei.
     */
    estimateOperatorFee: (
      options: l2.estimateOperatorFee.Options,
    ) => Promise<l2.estimateOperatorFee.ReturnType>
    /**
     * Estimates the total fee for an L2 transaction.
     *
     * Requires an Isthmus-compatible `GasPriceOracle.getOperatorFee` implementation.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem'
     * import { optimism } from 'viem/chains'
     * import { opStackL2Actions } from 'viem/op-stack'
     *
     * const client = Client.create({
     *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
     *   chain: optimism,
     *   transport: http(),
     * }).extend(opStackL2Actions())
     * const fee = await client.opStack.estimateTotalFee({
     *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
     *   value: 1n,
     * })
     * ```
     *
     * @param options - Options.
     * @returns The total transaction fee in wei.
     */
    estimateTotalFee: (
      options: l2.estimateTotalFee.Options,
    ) => Promise<l2.estimateTotalFee.ReturnType>
    /**
     * Estimates the total gas for an L2 transaction.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem'
     * import { optimism } from 'viem/chains'
     * import { opStackL2Actions } from 'viem/op-stack'
     *
     * const client = Client.create({
     *   chain: optimism,
     *   transport: http(),
     * }).extend(opStackL2Actions())
     * const gas = await client.opStack.estimateTotalGas({
     *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
     *   value: 1n,
     * })
     * ```
     *
     * @param options - Options.
     * @returns The total L1 and L2 gas.
     */
    estimateTotalGas: (
      options: l2.estimateTotalGas.Options,
    ) => Promise<l2.estimateTotalGas.ReturnType>
    /**
     * Returns the current L1 base fee reported on L2.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem'
     * import { optimism } from 'viem/chains'
     * import { opStackL2Actions } from 'viem/op-stack'
     *
     * const client = Client.create({
     *   chain: optimism,
     *   transport: http(),
     * }).extend(opStackL2Actions())
     * const baseFee = await client.opStack.getL1BaseFee({})
     * ```
     *
     * @param options - Options.
     * @returns The L1 base fee in wei.
     */
    getL1BaseFee: (
      options?: l2.getL1BaseFee.Options,
    ) => Promise<l2.getL1BaseFee.ReturnType>
    /**
     * Initiates a withdrawal from L2 to L1.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem'
     * import { optimism } from 'viem/chains'
     * import { opStackL2Actions } from 'viem/op-stack'
     *
     * const client = Client.create({
     *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
     *   chain: optimism,
     *   transport: http(),
     * }).extend(opStackL2Actions())
     * const hash = await client.opStack.initiateWithdrawal({
     *   request: {
     *     gas: 21_000n,
     *     to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
     *     value: 1n,
     *   },
     * })
     * ```
     *
     * @param options - Options.
     * @returns The L2 transaction hash.
     */
    initiateWithdrawal: (
      options: l2.initiateWithdrawal.Options<chain, account>,
    ) => Promise<l2.initiateWithdrawal.ReturnType>
  }
}

/**
 * Creates OP Stack L1 actions for a Client extension.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { mainnet, optimism } from 'viem/chains'
 * import { opStackL1Actions } from 'viem/op-stack'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http(),
 * }).extend(opStackL1Actions())
 * const version = await client.opStack.getPortalVersion({
 *   targetChain: optimism,
 * })
 * ```
 *
 * @returns A Client extender that adds OP Stack L1 actions under `opStack`.
 */
export function opStackL1Actions() {
  return <
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
  ): L1Decorator<account> => ({
    opStack: {
      buildInitiateWithdrawal: (options) =>
        l1.buildInitiateWithdrawal(client, options),
      depositTransaction: (options) => l1.depositTransaction(client, options),
      estimateDepositTransactionGas: (options) =>
        l1.estimateDepositTransactionGas(client, options),
      estimateFinalizeWithdrawalGas: (options) =>
        l1.estimateFinalizeWithdrawalGas(client, options),
      estimateProveWithdrawalGas: (options) =>
        l1.estimateProveWithdrawalGas(client, options),
      finalizeWithdrawal: (options) => l1.finalizeWithdrawal(client, options),
      getGame: (options) => l1.getGame(client, options),
      getGames: (options) => l1.getGames(client, options),
      getL2Output: (options) => l1.getL2Output(client, options),
      getPortalVersion: (options) => l1.getPortalVersion(client, options),
      getTimeToFinalize: (options) => l1.getTimeToFinalize(client, options),
      getTimeToNextGame: (options) => l1.getTimeToNextGame(client, options),
      getTimeToNextL2Output: (options) =>
        l1.getTimeToNextL2Output(client, options),
      getTimeToProve: (options) => l1.getTimeToProve(client, options),
      getWithdrawalStatus: (options) => l1.getWithdrawalStatus(client, options),
      proveWithdrawal: (options) => l1.proveWithdrawal(client, options),
      waitForNextGame: (options) => l1.waitForNextGame(client, options),
      waitForNextL2Output: (options) => l1.waitForNextL2Output(client, options),
      waitToFinalize: (options) => l1.waitToFinalize(client, options),
      waitToProve: (options) => l1.waitToProve(client, options),
    },
  })
}

/**
 * Creates OP Stack L2 actions for a Client extension.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { optimism } from 'viem/chains'
 * import { opStackL2Actions } from 'viem/op-stack'
 *
 * const client = Client.create({
 *   chain: optimism,
 *   transport: http(),
 * }).extend(opStackL2Actions())
 * const baseFee = await client.opStack.getL1BaseFee()
 * ```
 *
 * @returns A Client extender that adds OP Stack L2 actions under `opStack`.
 */
export function opStackL2Actions() {
  return <
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
  ): L2Decorator<chain, account> => ({
    opStack: {
      buildDepositTransaction: (options) =>
        l2.buildDepositTransaction(client, options),
      buildProveWithdrawal: (options) =>
        l2.buildProveWithdrawal(client, options),
      estimateContractL1Fee: (options) =>
        l2.estimateContractL1Fee(client, options),
      estimateContractL1Gas: (options) =>
        l2.estimateContractL1Gas(client, options),
      estimateContractTotalFee: (options) =>
        l2.estimateContractTotalFee(client, options),
      estimateContractTotalGas: (options) =>
        l2.estimateContractTotalGas(client, options),
      estimateInitiateWithdrawalGas: (options) =>
        l2.estimateInitiateWithdrawalGas(client, options),
      estimateL1Fee: (options) => l2.estimateL1Fee(client, options),
      estimateL1Gas: (options) => l2.estimateL1Gas(client, options),
      estimateOperatorFee: (options) => l2.estimateOperatorFee(client, options),
      estimateTotalFee: (options) => l2.estimateTotalFee(client, options),
      estimateTotalGas: (options) => l2.estimateTotalGas(client, options),
      getL1BaseFee: (options) => l2.getL1BaseFee(client, options),
      initiateWithdrawal: (options) => l2.initiateWithdrawal(client, options),
    },
  })
}
