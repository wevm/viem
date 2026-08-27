import type { ChainConfig } from '../types/chain.js'
import type { RpcTransactionReceipt } from '../types/rpc.js'
import type { TransactionReceipt } from '../types/transaction.js'
import type { ExactPartial } from '../types/utils.js'
import {
  defineTransactionReceipt,
  formatTransactionReceipt,
} from '../utils/formatters/transactionReceipt.js'
import type { ToAccountReturnType } from './accounts/toAccount.js'
import {
  parseReceiptFields,
  type ReceiptFields,
} from './actions/getTransactionReceipt.js'
import { prepareTransactionRequest as fillEip8130Body } from './actions/sendTransaction.js'
import type { AaCall, AaCalls } from './types/transaction.js'
import { encodeWalletCalls } from './utils/encodeWalletCalls.js'

type RawReceipt8130 = ExactPartial<RpcTransactionReceipt> & {
  payer?: ReceiptFields['payer']
  phaseStatuses?: ReceiptFields['phaseStatuses']
  metadata?: ReceiptFields['metadata']
}

/** Normalizes a flat call list into a single phase (nested lists pass through). */
function toPhases(calls: readonly AaCall[] | AaCalls): AaCalls {
  if (calls.length === 0) return []
  if (Array.isArray(calls[0])) return calls as AaCalls
  return [calls as readonly AaCall[]]
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
 * // then, on a client for `myChain` with an EIP-8130 account, core
 * // `client.sendTransaction` submits a native `AA_TX_TYPE` transaction:
 * const hash = await client.sendTransaction({
 *   account, // toAccount(...) / newSmartAccount(...)
 *   calls: [{ to, data }],
 *   gas: 200_000n,
 * })
 * const receipt = await client.getTransactionReceipt({ hash })
 * receipt.eip8130.phaseStatuses // ['0x1']
 *
 * @remarks
 * The `prepareTransactionRequest` hook resolves the AA body (2D nonce, fees,
 * scope-driven nonce mode, phased-call encoding) so core skips its standard
 * fills; the account's `signTransaction` then serializes + signs the
 * `AA_TX_TYPE` envelope. This covers the self-pay path; sponsored (payer) sends
 * still use `client.eip8168.*` (the payer signer is not part of a core request).
 * `eth_getTransactionByHash` returns a non-standard nested body, so
 * `client.eip8130.getTransaction` remains the reader for AA transactions.
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
  prepareTransactionRequest: [
    async (request, { client }) => {
      const req = request as Record<string, any>
      // Only handle EIP-8130 AA sends: an `eip8130` account with phased calls.
      // Everything else (plain EOA txs on this chain) passes through untouched.
      if (req.account?.source !== 'eip8130' || !req.calls) return request

      const account = req.account as ToAccountReturnType
      const body = await fillEip8130Body(client, {
        account,
        calls: encodeWalletCalls({
          account: account.address,
          calls: toPhases(req.calls),
          encodeExecute: req.encodeExecute,
        }),
        accountChanges: req.accountChanges,
        payer: req.payer,
        gas: req.gas,
        nonceKey: req.nonceKey,
        nonceSequence: req.nonceSequence,
        validAfter: req.validAfter,
        validBefore: req.validBefore,
        maxFeePerGas: req.maxFeePerGas,
        maxPriorityFeePerGas: req.maxPriorityFeePerGas,
        dataSuffix: req.metadata,
      })

      return {
        ...request,
        ...body,
        // Scalar-nonce shim: satisfies core's nonce gate so it neither calls
        // `eth_fillTransaction` nor `getTransactionCount`. The real 2D nonce is
        // carried by `nonceKey`/`nonceSequence`, which `signTransaction` reads.
        nonce: Number(body.nonceSequence),
      } as typeof request
    },
    { runAt: ['beforeFillTransaction'] },
  ],
} as const satisfies ChainConfig
