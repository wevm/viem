import type { Block } from 'ox'
import { Address, Hash, Hex } from 'ox'
import {
  KeyAuthorization,
  SignatureEnvelope,
  SignaturePreAuthorized,
} from 'ox/tempo'

import type * as Client from '../../core/Client.js'
import { read } from '../../core/actions/contract/read.js'
import * as ContractError from '../../core/ContractError.js'
import { BaseError } from '../../core/Errors.js'
import * as Abis from '../Abis.js'
import * as Addresses from '../Addresses.js'

/** Most spending limits the transaction pool accepts in a key authorization. */
const maxLimits = 256
/** Most call scope targets, selector rules per target, and recipients per rule the transaction pool accepts. */
const maxScopes = 64
/** Transaction gas limit cap (from T1A). */
const maxTransactionGas = 30_000_000n
/** Base gas of every transaction. */
const baseTransactionGas = 21_000n
/** Gas to create the access key's storage slot. */
const keySlotGas = 20_000n
/** Largest spending limit `authorizeKey` accepts. */
const maxLimit = 2n ** 128n - 1n
/** TIP-20 selectors a recipient-constrained selector rule may name: `transfer`, `approve`, and `transferWithMemo`. */
const constrainedSelectors = ['0xa9059cbb', '0x095ea7b3', '0x95777d59']
/** TIP-20 token address prefix. */
const tip20Prefix = '0x20c000000000000000000000'
const zeroAddress = '0x0000000000000000000000000000000000000000'

/** Whether a signature ends with the TIP-1165 pre-authorized signature magic suffix. */
export function isPreAuthorized(signature: Hex.Hex): boolean {
  const size = Hex.size(SignaturePreAuthorized.magicBytes)
  return (
    Hex.size(signature) > size &&
    Hex.slice(signature, -size).toLowerCase() ===
      SignaturePreAuthorized.magicBytes
  )
}

/**
 * Verifies a TIP-1165 pre-authorized signature at a reference block: the access key is
 * registered and passes `verifyKeychain`, or the bundled key authorization would still
 * register it. Every failure, including a decode failure or a reverted read, returns `false`.
 */
export async function verify(
  client: Client.Client,
  options: verify.Options,
): Promise<boolean> {
  const { account, blockHash, blockNumber, blockTag, hash, requireCanonical } =
    options
  const signature = options.signature as SignaturePreAuthorized.Wrapped

  const unwrapped = (() => {
    try {
      return SignaturePreAuthorized.unwrap(signature)
    } catch {
      return undefined
    }
  })()
  if (!unwrapped) return false
  // Only an exact encoding verifies, so no other bytes can carry the same signature.
  if (
    SignaturePreAuthorized.wrap(unwrapped).toLowerCase() !==
    signature.toLowerCase()
  )
    return false
  const { keyAuthorization } = unwrapped
  const keychain = unwrapped.signature
  if (!Address.isEqual(keychain.userAddress, account)) return false

  const block = blockHash
    ? { blockHash, requireCanonical }
    : typeof blockNumber === 'bigint'
      ? { blockNumber }
      : { blockTag }

  // Registered path: an active registered access key verifies without the authorization.
  const registered = await read(client, {
    ...block,
    abi: Abis.signatureVerifier,
    address: Addresses.signatureVerifier,
    args: [account, hash, SignatureEnvelope.serialize(keychain)],
    functionName: 'verifyKeychain',
  }).catch(catchRevert)
  if (registered) return true

  // Access key signature: the inner signature is the authorized key's, over the keychain digest.
  const { inner } = keychain
  const keyId = keyAuthorization.address
  if (inner.type !== keyAuthorization.type) return false
  const signed = (() => {
    try {
      return SignatureEnvelope.verify(inner, {
        address: keyId,
        payload: Hash.keccak256(Hex.concat('0x04', hash, account)),
      })
    } catch {
      return false
    }
  })()
  if (!signed) return false

  if (!isRegistrable(keyAuthorization, account)) return false

  const root = keyAuthorization.signature
  const digest = KeyAuthorization.getSignPayload(keyAuthorization)
  const [chainId, timestamp, rootValid, rootActive, keyIdActive, key, burned] =
    await Promise.all([
      client.chain?.id ??
        client
          .request({ method: 'eth_chainId' }, { dedupe: true })
          .then(Hex.toNumber),
      getTimestamp(client, block),
      read(client, {
        ...block,
        abi: Abis.signatureVerifier,
        address: Addresses.signatureVerifier,
        args: [account, digest, SignatureEnvelope.serialize(root)],
        functionName:
          root.type === 'configurable' ? 'verifyConfigurableAccount' : 'verify',
      }).catch(catchRevert),
      // A configuration commitment retires the account's root key.
      root.type === 'configurable'
        ? true
        : read(client, {
            ...block,
            abi: Abis.accountKeychain,
            address: Addresses.accountKeychain,
            args: [account, account],
            functionName: 'isAdminKey',
          }).catch(catchRevert),
      // `authorizeKey` refuses a retired root key as an access key.
      read(client, {
        ...block,
        abi: Abis.accountKeychain,
        address: Addresses.accountKeychain,
        args: [keyId, keyId],
        functionName: 'isAdminKey',
      }).catch(catchRevert),
      read(client, {
        ...block,
        abi: Abis.accountKeychain,
        address: Addresses.accountKeychain,
        args: [account, keyId],
        functionName: 'getKey',
      }).catch(catchRevert),
      keyAuthorization.witness
        ? read(client, {
            ...block,
            abi: Abis.accountKeychain,
            address: Addresses.accountKeychain,
            args: [account, keyAuthorization.witness],
            functionName: 'isKeyAuthorizationWitnessBurned',
          }).catch(catchRevert)
        : false,
    ])

  if (BigInt(chainId) !== keyAuthorization.chainId) return false
  if (
    keyAuthorization.expiry != null &&
    BigInt(keyAuthorization.expiry) <= timestamp
  )
    return false
  if (rootValid !== true || rootActive !== true || keyIdActive !== true)
    return false
  // The access key was never registered and never revoked.
  if (!key || !Address.isEqual(key.keyId, zeroAddress) || key.isRevoked)
    return false
  return burned === false
}

export declare namespace verify {
  type Options = {
    /** Account the signature claims to sign for. */
    account: Address.Address
    /** Hash of the reference block. */
    blockHash?: Hex.Hex | undefined
    /** Number of the reference block. */
    blockNumber?: bigint | undefined
    /** Tag of the reference block. */
    blockTag?: Block.Tag | undefined
    /** Signed hash. */
    hash: Hex.Hex
    /** Whether the reference block hash must be canonical. */
    requireCanonical?: boolean | undefined
    /** Pre-authorized signature. */
    signature: Hex.Hex
  }
}

/**
 * Whether a key authorization passes the checks of `authorizeKey` and the transaction pool
 * that need no chain state.
 *
 * @internal
 */
export function isRegistrable(
  keyAuthorization: KeyAuthorization.Signed,
  account: Address.Address,
): boolean {
  const { address, isAdmin, limits, scopes } = keyAuthorization
  if (Address.isEqual(address, zeroAddress)) return false
  if (
    keyAuthorization.account &&
    !Address.isEqual(keyAuthorization.account, account)
  )
    return false
  if (isAdmin) return false

  if (limits) {
    if (limits.length > maxLimits) return false
    const tokens = new Set(limits.map(({ token }) => token.toLowerCase()))
    if (tokens.size !== limits.length) return false
    if (limits.some(({ limit }) => limit > maxLimit)) return false
  }

  // Strict decoding rejects a repeated target, which would not encode back to the same bytes,
  // so grouping the flat scopes by target restores the wire order.
  type Rule = { selector: Hex.Hex; recipients: readonly Address.Address[] }
  const targets = new Map<string, Rule[]>()
  for (const scope of scopes ?? []) {
    const rules = targets.get(scope.address.toLowerCase()) ?? []
    targets.set(scope.address.toLowerCase(), rules)
    if (scope.selector)
      rules.push({
        selector: scope.selector as Hex.Hex,
        recipients: scope.recipients ?? [],
      })
  }
  if (targets.size > maxScopes) return false
  let selectorCount = 0n
  let recipientCount = 0n
  for (const [target, rules] of targets) {
    if (target === zeroAddress) return false
    if (rules.length > maxScopes) return false
    const selectors = new Set(
      rules.map(({ selector }) => selector.toLowerCase()),
    )
    if (selectors.size !== rules.length) return false
    for (const { selector, recipients } of rules) {
      if (Hex.size(selector) !== 4) return false
      if (recipients.length === 0) continue
      if (recipients.length > maxScopes) return false
      if (!target.startsWith(tip20Prefix)) return false
      if (!constrainedSelectors.includes(selector.toLowerCase())) return false
      if (
        recipients.some((recipient) => Address.isEqual(recipient, zeroAddress))
      )
        return false
      const unique = new Set(
        recipients.map((recipient) => recipient.toLowerCase()),
      )
      if (unique.size !== recipients.length) return false
    }
    selectorCount += BigInt(rules.length)
    recipientCount += BigInt(
      rules.reduce((count, { recipients }) => count + recipients.length, 0),
    )
  }

  // The call scope surcharge alone can exceed the transaction gas limit cap, so no transaction
  // could carry the authorization.
  // Any carrying transaction also pays the base transaction gas and writes the key's slot, so
  // count those as a lower bound on the rest of its intrinsic gas. Account-dependent costs
  // (signature verification, nonce, configurable account) are not counted.
  const surcharge =
    5_000n +
    7_000n * BigInt(targets.size) +
    7_000n * selectorCount +
    5_000n * recipientCount
  return baseTransactionGas + keySlotGas + surcharge <= maxTransactionGas
}

/** Returns the timestamp of the reference block. */
async function getTimestamp(
  client: Client.Client,
  block: {
    blockHash?: Hex.Hex | undefined
    blockNumber?: bigint | undefined
    blockTag?: Block.Tag | undefined
  },
): Promise<bigint> {
  const { blockHash, blockNumber, blockTag } = block
  const result = await (() => {
    if (blockHash)
      return client.request(
        { method: 'eth_getBlockByHash', params: [blockHash, false] },
        { dedupe: true },
      )
    return client.request(
      {
        method: 'eth_getBlockByNumber',
        params: [
          typeof blockNumber === 'bigint'
            ? Hex.fromNumber(blockNumber)
            : (blockTag ?? client.blockTag ?? 'latest'),
          false,
        ],
      },
      { dedupe: typeof blockNumber === 'bigint' },
    )
  })()
  if (!result) throw new Error('Reference block not found.')
  return BigInt(result.timestamp)
}

/** Returns `false` for a reverted read, and rethrows other errors. */
function catchRevert(error: unknown): false {
  if (
    error instanceof BaseError &&
    error.walk(
      (cause) => cause instanceof ContractError.ContractFunctionRevertedError,
    )
  )
    return false
  throw error
}
