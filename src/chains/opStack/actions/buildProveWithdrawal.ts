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
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { ErrorType } from '../../../errors/utils.js'
import type {
  Account,
  DeriveAccount,
  GetAccountParameter,
} from '../../../types/account.js'
import type {
  Chain,
  DeriveChain,
  GetChainParameter,
} from '../../../types/chain.js'
import { type Hex } from '../../../types/misc.js'
import type { Prettify } from '../../../types/utils.js'
import { fromRlp } from '../../../utils/encoding/fromRlp.js'
import { toRlp } from '../../../utils/encoding/toRlp.js'
import { keccak256 } from '../../../utils/hash/keccak256.js'
import { contracts } from '../contracts.js'
import type { Withdrawal } from '../types/withdrawal.js'
import {
  type GetWithdrawalHashStorageSlotErrorType,
  getWithdrawalHashStorageSlot,
} from '../utils/getWithdrawalHashStorageSlot.js'
import type { GetL2OutputReturnType } from './getL2Output.js'
import type { ProveWithdrawalParameters } from './proveWithdrawal.js'

const outputRootProofVersion =
  '0x0000000000000000000000000000000000000000000000000000000000000000' as const

export type BuildProveWithdrawalParameters<
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
    withdrawal: Withdrawal
    output: GetL2OutputReturnType
  }

export type BuildProveWithdrawalReturnType<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  accountOverride extends Account | Address | undefined =
    | Account
    | Address
    | undefined,
> = Prettify<
  Pick<
    ProveWithdrawalParameters,
    'l2OutputIndex' | 'outputRootProof' | 'withdrawalProof' | 'withdrawal'
  > & {
    account: DeriveAccount<account, accountOverride>
    targetChain: DeriveChain<chain, chainOverride>
  }
>

export type BuildProveWithdrawalErrorType =
  | GetBlockErrorType
  | GetProofErrorType
  | GetWithdrawalHashStorageSlotErrorType
  | ErrorType

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
 * import { buildProveWithdrawal } from 'viem/op-stack'
 *
 * const publicClientL2 = createPublicClient({
 *   chain: optimism,
 *   transport: http(),
 * })
 *
 * const args = await buildProveWithdrawal(publicClientL2, {
 *   output: { ... },
 *   withdrawal: { ... },
 * })
 */
export async function buildProveWithdrawal<
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined = undefined,
  accountOverride extends Account | Address | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  args: BuildProveWithdrawalParameters<
    chain,
    account,
    chainOverride,
    accountOverride
  >,
): Promise<
  BuildProveWithdrawalReturnType<chain, account, chainOverride, accountOverride>
> {
  const { account, chain = client.chain, output, withdrawal } = args
  const { withdrawalHash } = withdrawal
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
    targetChain: chain,
    withdrawalProof: maybeAddProofNode(
      keccak256(slot),
      proof.storageProof[0].proof,
    ),
    withdrawal,
  } as unknown as BuildProveWithdrawalReturnType<
    chain,
    account,
    chainOverride,
    accountOverride
  >
}

export function maybeAddProofNode(key: string, proof: readonly Hex[]) {
  const lastProofRlp = proof[proof.length - 1]
  const lastProof = fromRlp(lastProofRlp)
  if (lastProof.length !== 17) return proof

  const modifiedProof = [...proof]
  for (const item of lastProof) {
    // Find any nodes located inside of the branch node.
    if (!Array.isArray(item)) continue
    // Check if the key inside the node matches the key we're looking for. We remove the first
    // two characters (0x) and then we remove one more character (the first nibble) since this
    // is the identifier for the type of node we're looking at. In this case we don't actually
    // care what type of node it is because a branch node would only ever be the final proof
    // element if (1) it includes the leaf node we're looking for or (2) it stores the value
    // within itself. If (1) then this logic will work, if (2) then this won't find anything
    // and we won't append any proof elements, which is exactly what we would want.
    const suffix = item[0].slice(3)
    if (typeof suffix !== 'string' || !key.endsWith(suffix)) continue
    modifiedProof.push(toRlp(item))
  }
  return modifiedProof
}
