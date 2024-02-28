import type { Address } from 'abitype'
import {
  type ReadContractErrorType,
  readContract,
} from '../../../actions/public/readContract.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import { ContractFunctionRevertedError } from '../../../errors/contract.js'
import type { ErrorType } from '../../../errors/utils.js'
import type { Account } from '../../../types/account.js'
import type {
  Chain,
  DeriveChain,
  GetChainParameter,
} from '../../../types/chain.js'
import { type Hex } from '../../../types/misc.js'
import type { TransactionReceipt } from '../../../types/transaction.js'
import { encodeAbiParameters, keccak256 } from '../../../utils/index.js'
import { portal2Abi, portalAbi } from '../abis.js'
import { ReceiptContainsNoWithdrawalsError } from '../errors/withdrawal.js'
import type { GetContractAddressParameter } from '../types/contract.js'
import {
  type GetWithdrawalsErrorType,
  getWithdrawals,
} from '../utils/getWithdrawals.js'
import {
  type GetDisputeGameParameters,
  getDisputeGame,
} from './getDisputeGame.js'
import { type GetL2OutputErrorType, getL2Output } from './getL2Output.js'
import { getPortalVersion } from './getPortalVersion.js'
import {
  type GetTimeToFinalizeErrorType,
  getTimeToFinalize,
} from './getTimeToFinalize.js'

/**
 * @internal
 * Portal.checkWithdrawal error messages
 * We check to see if a withdrawal is finalized by calling `portal.checkWithdrawal` and checking the revert message.
 * @see https://github.com/ethereum-optimism/optimism/blob/develop/packages/contracts-bedrock/src/L1/OptimismPortal2.sol#L431
 */
const finalizedWithdrawalMessages = [
  'OptimismPortal: dispute game has been blacklisted',
  'OptimismPortal: withdrawal has not been proven yet',
  'OptimismPortal: withdrawal timestamp less than dispute game creation timestamp',
  'OptimismPortal: proven withdrawal has not matured yet',
  'OptimismPortal: output proposal has not been finalized yet',
  'OptimismPortal: invalid game type',
  'OptimismPortal: dispute game created before respected game type was updated',
  'OptimismPortal: output proposal in air-gap',
  'OptimismPortal: withdrawal has already been finalized',
] as const

type CheckWithdrawalRevertMessage = (typeof finalizedWithdrawalMessages)[number]

/**
 * @internal
 * Hashes withdrawal data into a transaction hash
 * keccak256(abi.encode(_tx.nonce, _tx.sender, _tx.target, _tx.value, _tx.gasLimit, _tx.data));
 * @see https://github.com/ethereum-optimism/optimism/blob/develop/packages/contracts-bedrock/src/libraries/Hashing.sol#L106
 */
export const hashWithdrawal = ({
  nonce,
  sender,
  target,
  value,
  gasLimit,
  data,
}: {
  nonce: bigint
  sender: Address
  target: Address
  value: bigint
  gasLimit: bigint
  data: Hex
}) => {
  return keccak256(
    encodeAbiParameters(
      [
        { name: 'nonce', type: 'uint256' },
        { name: 'sender', type: 'address' },
        { name: 'target', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'gasLimit', type: 'uint256' },
        { name: 'data', type: 'bytes' },
      ],
      [nonce, sender, target, value, gasLimit, data],
    ),
  )
}

export type GetWithdrawalStatusParameters<
  chain extends Chain | undefined = Chain | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  _derivedChain extends Chain | undefined = DeriveChain<chain, chainOverride>,
> = GetChainParameter<chain, chainOverride> &
  GetContractAddressParameter<
    _derivedChain,
    'l2OutputOracle' | 'portal' | 'disputeGameFactory'
  > & {
    receipt: TransactionReceipt
    /**
     * The version of the optimism protocol being used determined by the  `portal` contract.
     * If not provided, the version will be determined at runtime via reading `portal.version`
     * on the contract
     */
    portalVersion?: 2 | 3
  }
export type GetWithdrawalStatusReturnType =
  | 'waiting-to-prove'
  | 'ready-to-prove'
  | 'waiting-to-finalize'
  | 'ready-to-finalize'
  | 'finalized'
export type GetWithdrawalStatusErrorType =
  | GetL2OutputErrorType
  | GetTimeToFinalizeErrorType
  | GetWithdrawalsErrorType
  | ReadContractErrorType
  | ErrorType

/**
 * Returns the current status of a withdrawal. Used for the [Withdrawal](/op-stack/guides/withdrawals) flow.
 *
 * - Docs: https://viem.sh/op-stack/actions/getWithdrawalStatus
 *
 * @param client - Client to use
 * @param parameters - {@link GetWithdrawalStatusParameters}
 * @returns Status of the withdrawal. {@link GetWithdrawalStatusReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { getBlockNumber } from 'viem/actions'
 * import { mainnet, optimism } from 'viem/chains'
 * import { getWithdrawalStatus } from 'viem/op-stack'
 *
 * const publicClientL1 = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const publicClientL2 = createPublicClient({
 *   chain: optimism,
 *   transport: http(),
 * })
 *
 * const receipt = await publicClientL2.getTransactionReceipt({ hash: '0x...' })
 * const status = await getWithdrawalStatus(publicClientL1, {
 *   receipt,
 *   targetChain: optimism
 * })
 */
export async function getWithdrawalStatus<
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: GetWithdrawalStatusParameters<chain, chainOverride>,
): Promise<GetWithdrawalStatusReturnType> {
  const { chain = client.chain, receipt, targetChain } = parameters

  const portalAddress = (() => {
    if (parameters.portalAddress) return parameters.portalAddress
    if (chain) return targetChain!.contracts.portal[chain.id].address
    return Object.values(targetChain!.contracts.portal)[0].address
  })()

  const [withdrawal] = getWithdrawals(receipt)

  if (!withdrawal)
    throw new ReceiptContainsNoWithdrawalsError({
      hash: receipt.transactionHash,
    })

  // we are eagerly fetching dispute game results but they are expected to fail if portal version is < 3
  const [portalVersion, checkWithdrawalResult, disputeGameResult] =
    await Promise.allSettled([
      await getPortalVersion(client, parameters as any),
      // To check if the withdrawal is ready to finalize we check the revert message of checkWithdrawal.
      // If it doesn't revert it's ready to finalize
      readContract(client, {
        abi: portal2Abi,
        address: portalAddress,
        functionName: 'checkWithdrawal',
        args: [hashWithdrawal(withdrawal)],
      }),
      getDisputeGame(client, {
        ...parameters,
        portalAddress: portalAddress,
        chain,
        targetChain: targetChain as any,
      } as unknown as GetDisputeGameParameters),
    ])

  if (portalVersion.status === 'rejected') throw portalVersion.reason

  // If we are on a legacy version of optimism, we need to use legacy contracts to resolve message status
  if (portalVersion.value.major === 2) {
    const [outputResult, proveResult, finalizedResult, timeToFinalizeResult] =
      await Promise.allSettled([
        getL2Output(client, {
          ...parameters,
          l2BlockNumber: receipt.blockNumber,
        }),
        readContract(client, {
          abi: portalAbi,
          address: portalAddress,
          functionName: 'provenWithdrawals',
          args: [withdrawal.withdrawalHash],
        }),
        readContract(client, {
          abi: portalAbi,
          address: portalAddress,
          functionName: 'finalizedWithdrawals',
          args: [withdrawal.withdrawalHash],
        }),
        getTimeToFinalize(client, {
          ...parameters,
          withdrawalHash: withdrawal.withdrawalHash,
        }),
      ])

    // If the L2 Output is not processed yet (ie. the actions throws), this means
    // that the withdrawal is not ready to prove.
    if (outputResult.status === 'rejected') {
      const error = outputResult.reason as GetL2OutputErrorType
      if (
        error.cause instanceof ContractFunctionRevertedError &&
        error.cause.data?.args?.[0] ===
          'L2OutputOracle: cannot get output for a block that has not been proposed'
      )
        return 'waiting-to-prove'
      throw error
    }
    if (proveResult.status === 'rejected') throw proveResult.reason
    if (finalizedResult.status === 'rejected') throw finalizedResult.reason
    if (timeToFinalizeResult.status === 'rejected')
      throw timeToFinalizeResult.reason

    const [_, proveTimestamp] = proveResult.value
    if (!proveTimestamp) return 'ready-to-prove'

    const finalized = finalizedResult.value
    if (finalized) return 'finalized'

    const { seconds } = timeToFinalizeResult.value
    return seconds > 0 ? 'waiting-to-finalize' : 'ready-to-finalize'
  }

  // if it didn't reject it's ready to prove
  if (checkWithdrawalResult.status !== 'rejected') return 'ready-to-finalize'

  const revertMessage: CheckWithdrawalRevertMessage =
    checkWithdrawalResult.reason.cause?.data?.args?.[0]

  if (
    !(
      checkWithdrawalResult.reason.cause instanceof
      ContractFunctionRevertedError
    )
  )
    throw checkWithdrawalResult.reason
  if (!finalizedWithdrawalMessages.includes(revertMessage))
    throw checkWithdrawalResult.reason

  switch (revertMessage) {
    case 'OptimismPortal: withdrawal has not been proven yet':
      if (disputeGameResult.status === 'rejected')
        throw disputeGameResult.reason
      if (disputeGameResult.value === null) return 'waiting-to-prove'
      return 'ready-to-prove'
    case 'OptimismPortal: withdrawal has already been finalized':
      return 'finalized'
    case 'OptimismPortal: output proposal has not been finalized yet':
    case 'OptimismPortal: proven withdrawal has not matured yet':
    case 'OptimismPortal: invalid game type':
    case 'OptimismPortal: output proposal in air-gap':
    case 'OptimismPortal: dispute game has been blacklisted':
    case 'OptimismPortal: withdrawal timestamp less than dispute game creation timestamp':
    case 'OptimismPortal: dispute game created before respected game type was updated':
      return 'waiting-to-finalize'
    default:
      throw new Error(
        `Unknown revert message ${
          revertMessage satisfies never
        } from checkWithdrawal`,
      )
  }
}
