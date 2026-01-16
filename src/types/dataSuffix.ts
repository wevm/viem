import type { Hex } from './misc.js'

/**
 * Data suffix configuration for transaction attribution.
 *
 * Can be specified in two forms:
 * - Simple hex string: `"0x1234"` - Appended to transaction data, not required
 * - Object form: `{ value: "0x1234", required: true }` - Explicit required flag
 *
 * When `required` is `true`, transactions will fail if the suffix cannot be appended.
 * When `required` is `false` (default), the suffix is best-effort.
 */
export type DataSuffix =
  | Hex
  | {
      value: Hex
      required?: boolean | undefined
    }
