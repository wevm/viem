import type * as Address from 'ox/Address'

import type * as Client from './Client.js'
import { getTransactionCount } from './actions/public/address/getTransactionCount.js'
import { LruMap } from './internal/lru.js'
import type { MaybePromise } from './internal/types.js'

/** Manages and auto-increments transaction nonces for an Account. */
export type NonceManager = {
  /** Get and increment a nonce. */
  consume: (
    options: NonceManager.Parameters & { client: Client.Client },
  ) => Promise<number>
  /** Get a nonce. */
  get: (
    options: NonceManager.Parameters & { client: Client.Client },
  ) => Promise<number>
  /** Increment a nonce. */
  increment: (options: NonceManager.Parameters) => void
  /** Reset a nonce. */
  reset: (options: NonceManager.Parameters) => void
}

export declare namespace NonceManager {
  /** Identifies the `(address, chainId)` a nonce is tracked against. */
  type Parameters = {
    /** The Account address. */
    address: Address.Address
    /** The chain id. */
    chainId: number
  }

  /** Backing store a {@link NonceManager} reads seed nonces from and writes to. */
  type Source = {
    /** Get a nonce. */
    get: (
      options: Parameters & { client: Client.Client },
    ) => MaybePromise<number>
    /** Set a nonce. */
    set: (options: Parameters, nonce: number) => MaybePromise<void>
  }
}

/**
 * Creates a nonce manager for auto-incrementing transaction nonces.
 *
 * @example
 * ```ts
 * import { NonceManager } from 'viem'
 *
 * const nonceManager = NonceManager.from({
 *   source: NonceManager.jsonRpc(),
 * })
 * ```
 */
export function from(options: from.Options): NonceManager {
  const { source } = options

  const deltaMap = new Map<string, number>()
  const nonceMap = new LruMap<number>(8192)
  const promiseMap = new Map<string, Promise<number>>()

  const getKey = ({ address, chainId }: NonceManager.Parameters) =>
    `${address}.${chainId}`
  const resetCache = (key: string) => {
    deltaMap.delete(key)
    promiseMap.delete(key)
  }

  return {
    async consume({ address, chainId, client }) {
      const key = getKey({ address, chainId })
      const promise = this.get({ address, chainId, client })

      this.increment({ address, chainId })
      const nonce = await promise

      await source.set({ address, chainId }, nonce)
      nonceMap.set(key, nonce)

      return nonce
    },
    async get({ address, chainId, client }) {
      const key = getKey({ address, chainId })

      let promise = promiseMap.get(key)
      if (!promise) {
        promise = (async () => {
          try {
            const nonce = await source.get({ address, chainId, client })
            const previousNonce = nonceMap.get(key) ?? 0
            if (previousNonce > 0 && nonce <= previousNonce)
              return previousNonce + 1
            nonceMap.delete(key)
            return nonce
          } finally {
            resetCache(key)
          }
        })()
        promiseMap.set(key, promise)
      }

      const delta = deltaMap.get(key) ?? 0
      return delta + (await promise)
    },
    increment({ address, chainId }) {
      const key = getKey({ address, chainId })
      const delta = deltaMap.get(key) ?? 0
      deltaMap.set(key, delta + 1)
    },
    reset({ address, chainId }) {
      const key = getKey({ address, chainId })
      nonceMap.delete(key)
      resetCache(key)
    },
  }
}

export declare namespace from {
  type Options = {
    /** Source the nonce manager reads seed nonces from. */
    source: NonceManager.Source
  }
}

/**
 * Creates a JSON-RPC source for a {@link NonceManager} that reads the pending
 * nonce via `eth_getTransactionCount`.
 *
 * @example
 * ```ts
 * import { NonceManager } from 'viem'
 *
 * const source = NonceManager.jsonRpc()
 * ```
 */
export function jsonRpc(): NonceManager.Source {
  return {
    async get(options) {
      const { address, client } = options
      return getTransactionCount(client, {
        address,
        blockTag: 'pending',
      })
    },
    set() {},
  }
}

/** Default {@link NonceManager} backed by a JSON-RPC source. */
export const nonceManager: NonceManager = /*#__PURE__*/ from({
  source: /*#__PURE__*/ jsonRpc(),
})
