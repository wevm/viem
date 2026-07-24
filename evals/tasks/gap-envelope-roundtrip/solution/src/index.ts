import { Signature, TxEnvelopeEip1559 } from 'viem/utils'

type Transaction = Parameters<typeof TxEnvelopeEip1559.serialize>[0]

export function serializeTransaction(options: serializeTransaction.Options) {
  return TxEnvelopeEip1559.serialize(TxEnvelopeEip1559.from(options.tx))
}

export declare namespace serializeTransaction {
  type Options = {
    tx: Transaction
  }
}

export function deserializeTransaction(
  options: deserializeTransaction.Options,
) {
  return TxEnvelopeEip1559.deserialize(options.serialized)
}

export declare namespace deserializeTransaction {
  type Options = {
    serialized: TxEnvelopeEip1559.Serialized
  }
}

export function hashTransaction(options: hashTransaction.Options) {
  return TxEnvelopeEip1559.hash(TxEnvelopeEip1559.from(options.tx))
}

export declare namespace hashTransaction {
  type Options = {
    tx: Transaction & Signature.Signature
  }
}
