import type { ChainConfig } from '../types/chain.js'
import type { RpcTransactionReceipt } from '../types/rpc.js'
import type { TransactionReceipt } from '../types/transaction.js'
import type { ExactPartial } from '../types/utils.js'
import {
  defineTransactionReceipt,
  formatTransactionReceipt,
} from '../utils/formatters/transactionReceipt.js'
import {
  parseReceiptFields,
  type ReceiptFields,
} from './actions/getTransactionReceipt.js'

type RawReceipt8130 = ExactPartial<RpcTransactionReceipt> & {
  payer?: ReceiptFields['payer']
  phaseStatuses?: ReceiptFields['phaseStatuses']
  metadata?: ReceiptFields['metadata']
}

/**
 * Chain config that folds EIP-8130 (`AA_TX_TYPE`, `0x79`) receipt fields into
 * core viem, so `client.getTransactionReceipt` and
 * `client.waitForTransactionReceipt` natively return the EIP-8130 fields
 * (`payer`, `phaseStatuses`, `metadata`) under a `eip8130` key. Mirrors the
 * tempo `chainConfig` fold.
 *
 * Spread it into an EIP-8130-enabled chain:
 *
 * @example
 * import { defineChain } from 'viem'
 * import { eip8130ChainConfig } from 'viem/eip8130'
 *
 * export const myChain = defineChain({
 *   ...eip8130ChainConfig,
 *   id: 1234,
 *   name: 'My Chain',
 *   nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
 *   rpcUrls: { default: { http: ['https://rpc.example.com'] } },
 * })
 *
 * // then, on a client for `myChain`:
 * const receipt = await client.getTransactionReceipt({ hash })
 * receipt.eip8130.phaseStatuses // ['0x1']
 *
 * @remarks
 * Only the receipt is folded. The `AA_TX_TYPE` send path (phased `calls`,
 * required `gas`, 2D nonce, actor-auth envelopes, payer auth) does not map onto
 * core `client.sendTransaction`, and `eth_getTransactionByHash` returns a
 * non-standard nested body: use the `client.eip8130.*` decorator for those.
 */
export const eip8130ChainConfig = {
  formatters: {
    transactionReceipt: defineTransactionReceipt({
      format(
        receipt: RawReceipt8130,
      ): TransactionReceipt & { eip8130: ReceiptFields } {
        return {
          ...formatTransactionReceipt(receipt),
          eip8130: parseReceiptFields(receipt as never),
        }
      },
    }),
  },
} as const satisfies ChainConfig
