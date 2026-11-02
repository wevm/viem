// biome-ignore lint/performance/noBarrelFile: entrypoint module

/** Standalone OP Stack actions grouped by namespace (`l1`, `l2`). */
export * as Actions from './actions/index.js'

/** Utilities & types for OP Stack blocks. */
export * as Block from './Block.js'

/** Shared OP Stack chain configuration to spread into a chain definition. */
export { chainConfig } from './chainConfig.js'

/** Utilities & types for depositing transactions from L1 to L2. */
export * as Deposit from './Deposit.js'

/** Utilities & types for OP Stack dispute games. */
export * as Game from './Game.js'

/** OP Stack L1 & L2 action decorators for a Client's `.extend`. */
export {
  type L1Decorator as OpStackL1Actions,
  type L2Decorator as OpStackL2Actions,
  opStackL1Actions,
  opStackL2Actions,
} from './Decorator.js'

/** Utilities & types for OP Stack transactions. */
export * as Transaction from './Transaction.js'

/** Utilities & types for OP Stack transaction receipts. */
export * as TransactionReceipt from './TransactionReceipt.js'

/** Utilities & types for OP Stack deposit transaction envelopes. */
export * as TxEnvelopeDeposit from './TxEnvelopeDeposit.js'

/** Utilities & types for withdrawing from L2 to L1. */
export * as Withdrawal from './Withdrawal.js'
