import type { Address } from 'abitype'
import {
  type GetBlockErrorType,
  getBlock,
} from '../../../actions/public/getBlock.js'
import {
  type GetProofErrorType,
  getProof,
} from '../../../actions/public/getProof.js'
import type { Client } from '../../../clients/createClient.js'
import type { ErrorType } from '../../../errors/utils.js'
import type { Chain, Transport } from '../../../index.js'
import type { Account, GetAccountParameter } from '../../../types/account.js'
import type { Hex } from '../../../types/misc.js'
import { contracts } from '../contracts.js'
import {
  type GetWithdrawalHashStorageSlotErrorType,
  getWithdrawalHashStorageSlot,
} from '../utils/getWithdrawalHashStorageSlot.js'
import type { GetWithdrawalMessagesReturnType } from '../utils/getWithdrawalMessages.js'
import type { GetL2OutputReturnType } from './getL2Output.js'

const outputRootProofVersion =
  '0x0000000000000000000000000000000000000000000000000000000000000000' as const

export type BuildProveWithdrawalParameters<
  account extends Account | undefined = Account | undefined,
  accountOverride extends Account | Address | undefined =
    | Account
    | Address
    | undefined,
> = GetAccountParameter<account, accountOverride, false> & {
  message: GetWithdrawalMessagesReturnType[number]
  output: GetL2OutputReturnType
}

// TODO(@jxom): Refactor to use ProveWithdrawalTransactionParameters.
export type BuildProveWithdrawalReturnType<
  account extends Account | undefined = Account | undefined,
  accountOverride extends Account | Address | undefined =
    | Account
    | Address
    | undefined,
> = GetAccountParameter<account, accountOverride> & {
  l2OutputIndex: bigint
  outputRootProof: {
    version: Hex
    stateRoot: Hex
    messagePasserStorageRoot: Hex
    latestBlockhash: Hex
  }
  withdrawalProof: Hex[]
  withdrawalTransaction: {
    data: Hex
    gasLimit: bigint
    nonce: bigint
    sender: Address
    target: Address
    value: bigint
  }
}

export type BuildProveWithdrawalErrorType =
  | GetBlockErrorType
  | GetProofErrorType
  | GetWithdrawalHashStorageSlotErrorType
  | ErrorType

/**
 * Builds the transaction that proves a withdrawal was initiated on an L2. Used in the Withdrawal flow.
 *
 * - Docs: https://viem.sh/op-stack/actions/buildProveWithdrawal.html
 *
 * @param client - Client to use
 * @param parameters - {@link BuildProveWithdrawalParameters}
 * @returns The prove withdraw transaction request. {@link BuildProveWithdrawalReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { optimism } from 'viem/chains'
 * import { buildProveWithdrawal } from 'viem/op-stack'
 *
 * const publicClientL2 = createPublicClient({
 *   chain: optimism,
 *   transport: http(),
 * })
 *
 * const request = await buildProveWithdrawal(publicClientL2, {
 *   message: { ... },
 *   output: { ... },
 * })
 */
export async function buildProveWithdrawal<
  chain extends Chain | undefined,
  account extends Account | undefined,
  accountOverride extends Account | Address | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  args: BuildProveWithdrawalParameters<account, accountOverride>,
): Promise<BuildProveWithdrawalReturnType<account, accountOverride>> {
  const { account, message, output } = args
  const { withdrawalHash, ...withdrawalTransaction } = message
  const { l2BlockNumber } = output

  const slot = getWithdrawalHashStorageSlot({ withdrawalHash })
  const [proof, block] = await Promise.all([
    getProof(client, {
      address: contracts.l2ToL1MessagePasser.address,
      storageKeys: [slot],
      blockNumber: l2BlockNumber,
    }),
    getBlock(client, {
      blockNumber: l2BlockNumber,
    }),
  ])

  return {
    account,
    l2OutputIndex: output.outputIndex,
    outputRootProof: {
      latestBlockhash: block.hash,
      messagePasserStorageRoot: proof.storageHash,
      stateRoot: block.stateRoot,
      version: outputRootProofVersion,
    },
    withdrawalProof: proof.storageProof[0].proof,
    withdrawalTransaction,
  } as BuildProveWithdrawalReturnType<account, accountOverride>
}
