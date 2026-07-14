import { Hash, Rlp } from 'ox'
import type { Address, Errors, Hex } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { BaseError } from '../../../core/Errors.js'
import { getProof } from '../../../core/actions/address/getProof.js'
import { get as getBlock } from '../../../core/actions/block/get.js'
import * as Block from '../../Block.js'
import * as Game from '../../Game.js'
import * as Withdrawal from '../../Withdrawal.js'
import { contracts } from '../../contracts.js'

const outputRootProofVersion =
  '0x0000000000000000000000000000000000000000000000000000000000000000' as const

/** Builds the parameters required to prove an L2 withdrawal on L1. */
export async function buildProveWithdrawal<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
  const chainOverride extends Chain.Chain | undefined = undefined,
  const accountOverride extends Account.Account | Address.Address | undefined =
    undefined,
>(
  client: Client.Client<chain, account>,
  options: buildProveWithdrawal.Options<chainOverride, accountOverride>,
): Promise<
  buildProveWithdrawal.ReturnType<
    chain,
    account,
    chainOverride,
    accountOverride
  >
> {
  const {
    account = client.account,
    chain = client.chain,
    game,
    output,
    withdrawal,
  } = options
  const { withdrawalHash } = withdrawal
  const { l2BlockNumber } = game ?? output
  const blockNumber = game?.usesSuperRoots
    ? await Block.getNumberAtTimestamp(client, {
        timestamp: game.l2BlockNumber,
      })
    : l2BlockNumber
  const slot = Withdrawal.getWithdrawalHashStorageSlot({ withdrawalHash })
  const [proof, block_] = await Promise.all([
    getProof(client, {
      address: contracts.l2ToL1MessagePasser.address,
      blockNumber,
      storageKeys: [slot],
    }),
    getBlock(client, { blockNumber }),
  ])
  const block = block_ as Block.Block
  if (game?.usesSuperRoots && block.timestamp !== game.l2BlockNumber)
    throw new TimestampMismatchError({
      blockTimestamp: block.timestamp,
      gameTimestamp: game.l2BlockNumber,
    })
  const storageProof = proof.storageProof[0]
  if (!storageProof) throw new StorageProofNotFoundError()
  const l2OutputIndex = game ? game.index : output.outputIndex
  type ReturnType = buildProveWithdrawal.ReturnType<
    chain,
    account,
    chainOverride,
    accountOverride
  >

  return {
    account: account as ReturnType['account'],
    l2OutputIndex,
    outputRootProof: {
      latestBlockhash: block.hash,
      messagePasserStorageRoot: proof.storageHash,
      stateRoot: block.stateRoot,
      version: outputRootProofVersion,
    },
    targetChain: chain as ReturnType['targetChain'],
    withdrawal,
    withdrawalProof: maybeAddProofNode(
      Hash.keccak256(slot),
      storageProof.proof,
    ),
  }
}

export declare namespace buildProveWithdrawal {
  /** Legacy L2 output proposal used to prove a withdrawal. */
  type Output = {
    /** L2 block number covered by the output. */
    l2BlockNumber: bigint
    /** Output index. */
    outputIndex: bigint
    /** Output root. */
    outputRoot: Hex.Hex
    /** Output timestamp. */
    timestamp: bigint
  }

  /** Dispute game used to prove a withdrawal. */
  type Game = Game.Game & {
    /** L2 block number, or timestamp for super-root games. */
    l2BlockNumber: bigint
    /** Whether the game uses super roots. */
    usesSuperRoots: boolean
  }

  /** Options for {@link buildProveWithdrawal}. */
  type Options<
    chainOverride extends Chain.Chain | undefined = Chain.Chain | undefined,
    accountOverride extends Account.Account | Address.Address | undefined =
      | Account.Account
      | Address.Address
      | undefined,
  > = {
    /** Account (or address) that proves the withdrawal. */
    account?: accountOverride | undefined
    /** L2 chain the withdrawal targets. @default client.chain */
    chain?: chainOverride | undefined
    /** Withdrawal to prove. */
    withdrawal: Withdrawal.Withdrawal
  } & (
    | {
        /** Dispute game anchoring the withdrawal. */
        game: Game
        output?: undefined
      }
    | {
        game?: undefined
        /** Legacy output proposal anchoring the withdrawal. */
        output: Output
      }
  )

  /** Return type of {@link buildProveWithdrawal}. */
  type ReturnType<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
    account extends Account.Account | undefined = Account.Account | undefined,
    chainOverride extends Chain.Chain | undefined = Chain.Chain | undefined,
    accountOverride extends Account.Account | Address.Address | undefined =
      | Account.Account
      | Address.Address
      | undefined,
  > = {
    /** Account that proves the withdrawal. */
    account: accountOverride extends Account.Account | Address.Address
      ? accountOverride
      : account
    /** L2 output or dispute game index. */
    l2OutputIndex: bigint
    /** Output root proof. */
    outputRootProof: {
      /** Hash of the latest L2 block. */
      latestBlockhash: Hex.Hex
      /** Storage root of the message passer contract. */
      messagePasserStorageRoot: Hex.Hex
      /** L2 state root. */
      stateRoot: Hex.Hex
      /** Output root proof version. */
      version: Hex.Hex
    }
    /** L2 chain the withdrawal targets. */
    targetChain: chainOverride extends undefined ? chain : chainOverride
    /** Withdrawal being proved. */
    withdrawal: Withdrawal.Withdrawal
    /** Merkle proof for the withdrawal. */
    withdrawalProof: readonly Hex.Hex[]
  }

  /** Errors thrown by {@link buildProveWithdrawal}. */
  type ErrorType =
    | Block.getNumberAtTimestamp.ErrorType
    | StorageProofNotFoundError
    | TimestampMismatchError
    | Withdrawal.getWithdrawalHashStorageSlot.ErrorType
    | getProof.ErrorType
    | getBlock.ErrorType
    | Hash.keccak256.ErrorType
    | Rlp.toHex.ErrorType
    | Rlp.fromHex.ErrorType
    | Errors.GlobalErrorType
}

/** Appends an embedded trie leaf to an OP Stack withdrawal proof. @internal */
export function maybeAddProofNode(
  key: Hex.Hex,
  proof: readonly Hex.Hex[],
): readonly Hex.Hex[] {
  const lastProofRlp = proof[proof.length - 1]
  if (!lastProofRlp) return proof
  const lastProof = Rlp.toHex(lastProofRlp)
  if (!Array.isArray(lastProof) || lastProof.length !== 17) return proof

  const modifiedProof = [...proof]
  for (const item of lastProof) {
    if (!Array.isArray(item)) continue
    const path = item[0]
    if (typeof path !== 'string') continue
    const suffix = path.slice(3)
    if (!key.endsWith(suffix)) continue
    modifiedProof.push(Rlp.fromHex(item))
  }
  return modifiedProof
}

/** Thrown when the withdrawal storage proof is unavailable. */
export class StorageProofNotFoundError extends BaseError {
  override readonly name =
    'Actions.l2.buildProveWithdrawal.StorageProofNotFoundError'

  constructor() {
    super('Withdrawal storage proof is unavailable.')
  }
}

/** Thrown when the proof block does not match the dispute game timestamp. */
export class TimestampMismatchError extends BaseError {
  override readonly name =
    'Actions.l2.buildProveWithdrawal.TimestampMismatchError'

  constructor({
    blockTimestamp,
    gameTimestamp,
  }: {
    blockTimestamp: bigint
    gameTimestamp: bigint
  }) {
    super(
      `L2 block timestamp ${blockTimestamp} does not match dispute game timestamp ${gameTimestamp}.`,
    )
  }
}
