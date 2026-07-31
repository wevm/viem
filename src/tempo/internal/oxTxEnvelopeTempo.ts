import type * as ox_TxEnvelopeTempo from 'ox/tempo/TxEnvelopeTempo'

// Nested inside a function namespace, so it needs an alias rather than a re-export.
// Reachable through the Tempo chain's transaction `serialize` hook. See
// `core/internal/inference/index.ts` for why these shims exist.
export type SerializeOptions = ox_TxEnvelopeTempo.serialize.Options
