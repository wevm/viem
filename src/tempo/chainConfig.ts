import * as Abi from 'ox/Abi'
import type * as Address from 'ox/Address'
import * as Hash from 'ox/Hash'
import * as Hex from 'ox/Hex'
import type * as TransactionRequest from 'ox/TransactionRequest'
import * as MultisigConfig from 'ox/tempo/MultisigConfig'
import * as SignatureEnvelope from 'ox/tempo/SignatureEnvelope'
import type * as TokenId from 'ox/tempo/TokenId'
import * as TxEnvelopeTempo from 'ox/tempo/TxEnvelopeTempo'
import * as z_Transaction from 'ox/zod/tempo/Transaction'
import * as z_TransactionReceipt from 'ox/zod/tempo/TransactionReceipt'
import * as z_TransactionRequest from 'ox/zod/tempo/TransactionRequest'

import * as Chain from '../core/Chain.js'
import { getCode } from '../core/actions/address/getCode.js'
import { read } from '../core/actions/contract/read.js'
import { verifyDefault, type verifyHash } from '../core/actions/verifyHash.js'
import * as Concurrent from './internal/concurrent.js'
import type { Hardfork } from './Hardfork.js'

const maxExpirySecs = 25
const maxUint256 = 2n ** 256n - 1n

/** Tempo EOA default-delegation designator. */
const delegationCode = '0xef01007702c00000000000000000000000000000000000'

const keychainAddress: Address.Address =
  '0xaAAAaaAA00000000000000000000000000000000'

const keychainAbi = /*#__PURE__*/ Abi.from([
  'function getKey(address account, address keyId) view returns ((uint8 signatureType, address keyId, uint64 expiry, bool enforceLimits, bool isRevoked) key)',
])

type PrepareRequest = {
  account?: { address?: Address.Address | undefined } | undefined
  feePayer?: unknown
  feeToken?: unknown
  from?: Address.Address | undefined
  keyAuthorization?:
    | { signature?: { type?: string | undefined } | undefined }
    | undefined
  gas?: bigint | undefined
  multisig?: MultisigConfig.Config | undefined
  nonce?: number | bigint | undefined
  nonceKey?: 'expiring' | bigint | undefined
  validBefore?: number | undefined
}

/**
 * The Tempo chain configuration shape. Codec and hook members are typed
 * nominally (`typeof` the ox exports) so declaration emit references them
 * instead of expanding the (large) zod schema types.
 */
export type ChainConfig = {
  blockTime: number
  extendSchema: {
    feeToken?: TokenId.TokenIdOrAddress | undefined
    hardfork?: Hardfork | undefined
  }
  schema: {
    transaction: { fromRpc: typeof z_Transaction.Transaction }
    transactionReceipt: {
      fromRpc: typeof z_TransactionReceipt.TransactionReceipt
    }
    transactionRequest: {
      toRpc: typeof z_TransactionRequest.TransactionRequestToRpc
    }
  }
  transaction: {
    getSignPayload: typeof TxEnvelopeTempo.getSignPayload
    prepare: [
      fn: Chain.Chain.Transaction.PrepareFn,
      options: { runAt: readonly Chain.Chain.Transaction.PreparePhase[] },
    ]
    serialize: typeof TxEnvelopeTempo.serialize
    toEnvelope: (
      request: TransactionRequest.TransactionRequest,
    ) => TxEnvelopeTempo.TxEnvelopeTempo
  }
  verifyHash: Chain.Chain.VerifyHash
}

/**
 * Shared Tempo chain configuration: RPC codecs, transaction hooks
 * (expiring nonces, multisig senders, fee tokens), and signature-envelope
 * verification.
 */
export const chainConfig: ChainConfig = {
  blockTime: 1_000,
  extendSchema: Chain.extendSchema<{
    feeToken?: TokenId.TokenIdOrAddress | undefined
    hardfork?: Hardfork | undefined
  }>(),
  schema: {
    transaction: { fromRpc: z_Transaction.Transaction },
    transactionReceipt: { fromRpc: z_TransactionReceipt.TransactionReceipt },
    transactionRequest: { toRpc: z_TransactionRequest.TransactionRequestToRpc },
  },
  transaction: {
    getSignPayload: TxEnvelopeTempo.getSignPayload,
    prepare: [
      async (r, { client, phase }) => {
        const request = r as PrepareRequest

        if (phase === 'afterFillParameters') {
          if (request.feePayer) {
            // Fee-paid transactions are gas-estimated with a dummy secp256k1
            // signature; larger envelope signatures cost more intrinsic gas.
            if (request.keyAuthorization?.signature?.type === 'webAuthn')
              request.gas = (request.gas ?? 0n) + 20_000n
            // TODO: bump gas for access-key senders.
          }
          return request as Record<string, unknown>
        }

        // Native multisig (TIP-1061): the sender is the derived multisig
        // account; core fills nonce/gas/fees for it via `request.from`.
        // TODO: infer the config from a multisig account.
        if (request.multisig)
          request.from = MultisigConfig.getAddress(request.multisig)

        // TODO: refresh `keyAuthorization` from the account's
        // key-authorization manager.

        // Expiring nonces for concurrent transactions (TIP-1009): a `nonceKey`
        // of `uint256.max` with a `validBefore` timestamp.
        const useExpiringNonce = await (async () => {
          if (request.nonceKey === 'expiring') return true
          if (request.feePayer && typeof request.nonceKey === 'undefined')
            return true
          const address = request.from ?? request.account?.address
          if (address && typeof request.nonceKey === 'undefined')
            return await Concurrent.detect(address)
          return false
        })()

        if (useExpiringNonce) {
          request.nonceKey = maxUint256
          request.nonce = 0
          if (typeof request.validBefore === 'undefined')
            request.validBefore = Math.floor(Date.now() / 1000) + maxExpirySecs
        } else if (typeof request.nonceKey !== 'undefined') {
          // Explicit nonceKey (2D nonce mode).
          request.nonce = typeof request.nonce === 'number' ? request.nonce : 0
        }

        const chain = client.chain as
          | (Chain.Chain & { feeToken?: TokenId.TokenIdOrAddress | undefined })
          | undefined
        if (!request.feeToken && chain?.feeToken)
          request.feeToken = chain.feeToken

        return request as Record<string, unknown>
      },
      { runAt: ['beforeFillTransaction', 'afterFillParameters'] },
    ],
    serialize: TxEnvelopeTempo.serialize,
    // The prepared request carries Tempo fields beyond the base request shape.
    toEnvelope: (request) => {
      const { data, to, value, ...rest } = request as typeof request & {
        calls?: readonly unknown[] | undefined
      }
      // Lift a flat `to`/`value`/`data` request into the `calls` list.
      const calls = rest.calls ?? [
        {
          data,
          to:
            to ||
            (!data || data === '0x'
              ? '0x0000000000000000000000000000000000000000'
              : undefined),
          value,
        },
      ]
      return TxEnvelopeTempo.from({ ...rest, calls } as never)
    },
  },
  async verifyHash(client, parameters) {
    const { address, blockNumber, blockTag, hash, mode, signature } = parameters

    // `verifyHash` supports "signature envelopes" (a Tempo proposal) to
    // natively verify envelope-compatible (WebAuthn, P256, …) signatures.
    const envelope = (() => {
      try {
        return SignatureEnvelope.deserialize(signature)
      } catch {
        return undefined
      }
    })()

    if (envelope) {
      // Access-key (keychain) verification: the key must be authorized,
      // unexpired, and not revoked on the AccountKeychain.
      if (envelope.type === 'keychain' && mode === 'allowAccessKey') {
        // v2 keychain envelopes sign keccak256(0x04 || hash || userAddress).
        const innerPayload =
          envelope.version === 'v2'
            ? Hash.keccak256(Hex.concat('0x04', hash, address))
            : hash

        const accessKeyAddress = (() => {
          try {
            return SignatureEnvelope.extractAddress({
              payload: innerPayload,
              signature: envelope.inner,
            })
          } catch {
            return undefined
          }
        })()
        if (!accessKeyAddress) return false

        const key = (await read(client, {
          abi: keychainAbi,
          address: keychainAddress,
          args: [address, accessKeyAddress],
          blockNumber,
          blockTag,
          functionName: 'getKey',
        } as never)) as { expiry: bigint; isRevoked: boolean }

        if (key.isRevoked) return false
        if (key.expiry <= BigInt(Math.floor(Date.now() / 1000))) return false
        return SignatureEnvelope.verify(envelope.inner, {
          address: accessKeyAddress,
          payload: innerPayload,
        })
      }

      // Stateless envelopes (P256, WebAuthn) verify without a network request
      // for EOAs (including the Tempo default delegation); contracts fall
      // through to the ERC-1271 flow.
      if (envelope.type === 'p256' || envelope.type === 'webAuthn') {
        const code = await getCode(client, {
          address,
          blockNumber,
          blockTag,
        } as never)
        if (!code || code === delegationCode)
          return SignatureEnvelope.verify(envelope, {
            address,
            payload: hash,
          })
      }
    }

    return await verifyDefault(client, parameters as verifyHash.Options)
  },
} satisfies Pick<
  Chain.Chain,
  'blockTime' | 'extendSchema' | 'schema' | 'transaction' | 'verifyHash'
> as ChainConfig
