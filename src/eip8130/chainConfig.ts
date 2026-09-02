import { BaseError } from '../errors/base.js'
import type { ChainConfig } from '../types/chain.js'
import type { RpcTransactionReceipt } from '../types/rpc.js'
import type { TransactionReceipt } from '../types/transaction.js'
import type { ExactPartial } from '../types/utils.js'
import {
  defineTransactionReceipt,
  formatTransactionReceipt,
} from '../utils/formatters/transactionReceipt.js'
import type { ToAccountReturnType } from './accounts/toAccount.js'
import { estimateGas } from './actions/estimateGas.js'
import {
  parseReceiptFields,
  type ReceiptFields,
} from './actions/getTransactionReceipt.js'
import { prepareTransactionRequest as fillEip8130Body } from './actions/sendTransaction.js'
import { encodeWalletCalls } from './utils/encodeWalletCalls.js'
import { toPhases } from './utils/toPhases.js'

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
 * // then, on a client for `myChain` with an EIP-8130 account, core
 * // `client.sendTransaction` submits a native `AA_TX_TYPE` transaction
 * // (gas is estimated via the EIP-8130 `eth_estimateGas` extension when omitted):
 * const hash = await client.sendTransaction({
 *   account, // toAccount(...) / newSmartAccount(...)
 *   calls: [{ to, data }],
 * })
 * const receipt = await client.getTransactionReceipt({ hash })
 * receipt.eip8130.phaseStatuses // ['0x1']
 *
 * @remarks
 * The `prepareTransactionRequest` hook resolves the AA body (2D nonce, EIP-1559
 * fees, gas estimation, scope-driven nonce mode, phased-call encoding) so core
 * skips its standard fills; the account's `signTransaction` then serializes +
 * signs the `AA_TX_TYPE` envelope. Pass `gas` to skip estimation, and
 * `senderActorId` / `senderAuthAuthenticator` to refine estimation for
 * session-key or non-K1 sends.
 *
 * This covers the self-pay path only. Sponsored sends are not routed through
 * core `sendTransaction` (the payer signer isn't part of a core request, and
 * settlement happens off the raw-submit path); use
 * `client.eip8130.sendTransaction` (local payer signer) or
 * `client.eip8168.sendTransaction` (ERC-8168 payer service). Passing `payer`
 * here throws. `eth_getTransactionByHash` returns a non-standard nested body,
 * so `client.eip8130.getTransaction` remains the reader for AA transactions.
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

      // Sponsored sends can't ride core `sendTransaction`: the sender's
      // `signTransaction` has no payer context, and payment is settled off the
      // raw-submit path (a local payer signer co-signs `payer_auth`, or an
      // ERC-8168 payer service submits via `payer_sendTransaction`). Redirect
      // to the dedicated actions instead of emitting an unsigned-payer tx.
      if (req.payer)
        throw new BaseError(
          'Sponsored EIP-8130 transactions are not supported through core `sendTransaction`. ' +
            'Use `client.eip8130.sendTransaction` (local payer signer) or ' +
            '`client.eip8168.sendTransaction` (ERC-8168 payer service).',
        )

      const account = req.account as ToAccountReturnType
      const calls = encodeWalletCalls({
        account: account.address,
        calls: toPhases(req.calls),
        encodeExecute: req.encodeExecute,
      })

      // Attribution suffix → top-level (signed, authenticated) `metadata`, since
      // EIP-8130 has no calldata to concatenate onto. Precedence mirrors core:
      // a per-tx value wins over the client-wide `client.dataSuffix`. Core
      // `sendTransaction` consumes its own `dataSuffix` param before this hook,
      // so per-tx attribution on the native path uses the 8130 `metadata` field;
      // `req.dataSuffix` is kept as a fallback for direct request builders.
      const dataSuffix =
        req.metadata ??
        req.dataSuffix ??
        (typeof client.dataSuffix === 'string'
          ? client.dataSuffix
          : client.dataSuffix?.value)

      // Price the AA transaction via the EIP-8130 `eth_estimateGas` extension
      // when the caller didn't pin `gas`. Thread the acting-actor hint so
      // policy-gated (session-key) sends resolve the right policy, and let the
      // caller override auth-gas pricing via `senderAuthAuthenticator`.
      const gas =
        req.gas ??
        (await estimateGas(client, {
          sender: account.address,
          accountChanges: req.accountChanges,
          calls,
          nonceKey: req.nonceKey,
          senderActorId: req.senderActorId ?? account.actorId,
          senderAuthAuthenticator: req.senderAuthAuthenticator,
          dataSuffix,
        }))

      const body = await fillEip8130Body(client, {
        account,
        calls,
        accountChanges: req.accountChanges,
        gas,
        nonceKey: req.nonceKey,
        nonceSequence: req.nonceSequence,
        validAfter: req.validAfter,
        validBefore: req.validBefore,
        maxFeePerGas: req.maxFeePerGas,
        maxPriorityFeePerGas: req.maxPriorityFeePerGas,
        dataSuffix,
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
