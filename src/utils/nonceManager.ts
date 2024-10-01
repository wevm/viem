import type { Address } from 'abitype'

import { getTransactionCount } from '../actions/public/getTransactionCount.js'
import type { Client } from '../clients/createClient.js'
import type { MaybePromise } from '../types/utils.js'
import { LruMap } from './lru.js'

export type CreateNonceManagerParameters = {
  source: NonceManagerSource
}

type FunctionParameters = {
  address: Address
  chainId: number
}

export type NonceManager = {
  /** Get and increment a nonce. */
  consume: (
    parameters: FunctionParameters & { client: Client },
  ) => Promise<number>
  /** Increment a nonce. */
  increment: (chainId: FunctionParameters) => void
  /** Get a nonce. */
  get: (chainId: FunctionParameters & { client: Client }) => Promise<number>
  /** Reset a nonce. */
  reset: (chainId: FunctionParameters) => void
}

/**
 * Creates a nonce manager for auto-incrementing transaction nonces.
 *
 * - Docs: https://viem.sh/docs/accounts/createNonceManager
 *
 * @example
 * ```ts
 * const nonceManager = createNonceManager({
 *   source: jsonRpc(),
 * })
 * ```
 */
export function createNonceManager(
  parameters: CreateNonceManagerParameters,
): NonceManager {
  const { source } = parameters

  const deltaMap = new Map()
  const nonceMap = new LruMap<number>(8192)
  const promiseMap = new Map<string, Promise<number>>()

  const getKey = ({ address, chainId }: FunctionParameters) =>
    `${address}.${chainId}`

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
    async increment({ address, chainId }) {
      const key = getKey({ address, chainId })
      const delta = deltaMap.get(key) ?? 0
      deltaMap.set(key, delta + 1)
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
            this.reset({ address, chainId })
          }
        })()
        promiseMap.set(key, promise)
      }

      const delta = deltaMap.get(key) ?? 0
      return delta + (await promise)
    },
    reset({ address, chainId }) {
      const key = getKey({ address, chainId })
      deltaMap.delete(key)
      promiseMap.delete(key)
    },
  }
}

////////////////////////////////////////////////////////////////////////////////////////////
// Sources

export type NonceManagerSource = {
  /** Get a nonce. */
  get(parameters: FunctionParameters & { client: Client }): MaybePromise<number>
  /** Set a nonce. */
  set(parameters: FunctionParameters, nonce: number): MaybePromise<void>
}

/** JSON-RPC source for a nonce manager. */
export function jsonRpc(): NonceManagerSource {
  return {
    async get(parameters) {
      const { address, client } = parameters
      return getTransactionCount(client, {
        address,
        blockTag: 'pending',
      })
    },
    set() {},
  }
}

////////////////////////////////////////////////////////////////////////////////////////////
// Default

/** Default Nonce Manager with a JSON-RPC source. */
export const nonceManager = /*#__PURE__*/ createNonceManager({
  source: jsonRpc(),
})
