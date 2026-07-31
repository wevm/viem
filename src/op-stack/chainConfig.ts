import type { Hex } from 'ox'

// Not `ox_TransactionEnvelope.serialize.Options` directly: a nested namespace member
// has no portable name for a consumer's declaration emit. See the shim.
import type * as oxTxEnvelope from '../core/internal/oxTxEnvelope.js'
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
      envelope: TxEnvelopeDeposit.TxEnvelopeDeposit | oxTxEnvelope.TxEnvelope,
      options?: oxTxEnvelope.SerializeOptions | undefined,
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
      envelope: TxEnvelopeDeposit.TxEnvelopeDeposit | oxTxEnvelope.TxEnvelope,
      _options?: oxTxEnvelope.SerializeOptions,
    ): Hex.Hex | undefined {
      if (!TxEnvelopeDeposit.is(envelope)) return undefined
      return TxEnvelopeDeposit.serialize(envelope)
    },
  },
} as const satisfies ChainConfig
