import type * as ox_TxEnvelope from 'ox/TxEnvelope'

// Aliases rather than re-exports, referenced by chain-config signatures so a consumer's
// declaration emit names them via `viem/_types/*`. `SerializeOptions` is nested inside a
// function namespace and has no re-exportable name; `TxEnvelope` prints by reference,
// and the emitter writes a re-export's original name against the re-exporting module,
// so only a same-named export or an alias emits a resolvable reference.
export type SerializeOptions = ox_TxEnvelope.serialize.Options
export type TxEnvelope = ox_TxEnvelope.TxEnvelope
