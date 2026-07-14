import type { Hex, TransactionEnvelope as ox_TransactionEnvelope } from 'ox'

import * as Block from './Block.js'
import * as Transaction from './Transaction.js'
import * as TransactionReceipt from './TransactionReceipt.js'
import * as TxEnvelopeDeposit from './TxEnvelopeDeposit.js'
import { contracts } from './contracts.js'

/** OP Stack chain configuration. */
export type ChainConfig = {
  /** Default OP Stack block time in milliseconds. */
  blockTime: number
  /** OP Stack RPC codecs. */
  codecs: {
    /** OP Stack block codec. */
    block: { fromRpc: (rpc: Block.Rpc) => Block.Block }
    /** OP Stack transaction codec. */
    transaction: { fromRpc: (rpc: Transaction.Rpc) => Transaction.Transaction }
    /** OP Stack transaction receipt codec. */
    transactionReceipt: {
      fromRpc: (
        rpc: TransactionReceipt.Rpc,
      ) => TransactionReceipt.TransactionReceipt
    }
  }
  /** OP Stack predeploy contracts. */
  contracts: typeof contracts
  /** OP Stack transaction hooks. */
  transaction: {
    serialize: (
      envelope:
        | TxEnvelopeDeposit.TxEnvelopeDeposit
        | ox_TransactionEnvelope.TxEnvelope,
      options?: ox_TransactionEnvelope.serialize.Options | undefined,
    ) => Hex.Hex | undefined
  }
}

/** OP Stack RPC codecs. */
export const codecs: ChainConfig['codecs'] = {
  block: { fromRpc: (rpc) => Block.fromRpc(rpc) },
  transaction: { fromRpc: (rpc) => Transaction.fromRpc(rpc) },
  transactionReceipt: {
    fromRpc: (rpc) => TransactionReceipt.fromRpc(rpc),
  },
}

/** Shared OP Stack chain configuration. */
export const chainConfig = {
  blockTime: 2_000,
  codecs,
  contracts,
  transaction: {
    serialize(
      envelope:
        | TxEnvelopeDeposit.TxEnvelopeDeposit
        | ox_TransactionEnvelope.TxEnvelope,
      _options?: ox_TransactionEnvelope.serialize.Options,
    ): Hex.Hex | undefined {
      if (!TxEnvelopeDeposit.is(envelope)) return undefined
      return TxEnvelopeDeposit.serialize(envelope)
    },
  },
} as const satisfies ChainConfig
