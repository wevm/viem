import type * as Address from 'ox/Address'
import * as Hex from 'ox/Hex'

import { LruMap } from '../core/internal/lru.js'
import type { MaybePromise } from '../core/internal/types.js'

/**
 * Nonce manager for auto-incrementing transaction nonces.
 */
export type NonceManager = {
  /** Gets and increments a nonce. */
  consume(options: GetOptions): Promise<number>
  /** Increments a nonce. */
  increment(options: Key): void
  /** Gets a nonce. */
  get(options: GetOptions): Promise<number>
  /** Resets local nonce state. */
  reset(options: Key): void
}

/**
 * Nonce lookup key.
 */
export type Key = {
  /** Account address. */
  address: Address.Address
  /** Chain ID. */
  chainId: bigint
}

/**
 * Nonce manager options with a client.
 */
export type GetOptions = Key & {
  /** Client used by nonce sources that read from JSON-RPC. */
  client: Client
}

/**
 * Client shape required by the JSON-RPC nonce source.
 */
export type Client = {
  /** Requests the pending transaction count. */
  request(options: {
    method: 'eth_getTransactionCount'
    params: readonly [Address.Address, 'pending']
  }): Promise<Hex.Hex | bigint | number>
}

/**
 * Nonce source used by a nonce manager.
 */
export type Source = {
  /** Gets a nonce. */
  get(options: GetOptions): MaybePromise<number>
  /** Persists a consumed nonce. */
  set?: ((options: Key, nonce: number) => MaybePromise<void>) | undefined
}

/**
 * Creates a nonce manager.
 */
export function create(options: create.Options): create.ReturnType {
  const { source } = options
  const deltaMap = new Map<string, number>()
  const nonceMap = new LruMap<number>(8192)
  const promiseMap = new Map<string, Promise<number>>()

  const getKey = ({ address, chainId }: Key) => `${address}.${chainId}`

  return {
    async consume(options) {
      const { address, chainId, client } = options
      const key = getKey({ address, chainId })
      const promise = this.get({ address, chainId, client })

      this.increment({ address, chainId })
      const nonce = await promise

      await source.set?.({ address, chainId }, nonce)
      nonceMap.set(key, nonce)

      return nonce
    },
    increment(options) {
      const key = getKey(options)
      const delta = deltaMap.get(key) ?? 0
      deltaMap.set(key, delta + 1)
    },
    async get(options) {
      const { address, chainId, client } = options
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
    reset(options) {
      const key = getKey(options)
      deltaMap.delete(key)
      promiseMap.delete(key)
    },
  }
}

export declare namespace create {
  /** Options for {@link create}. */
  type Options = {
    /** Source used for nonce reads and optional writes. */
    source: Source
  }

  /** Return type for {@link create}. */
  type ReturnType = NonceManager
}

/**
 * Creates a JSON-RPC nonce source.
 */
export function jsonRpc(): Source {
  return {
    async get(options) {
      const count = await options.client.request({
        method: 'eth_getTransactionCount',
        params: [options.address, 'pending'],
      })
      return toNumber(count)
    },
  }
}

export declare namespace jsonRpc {
  /** Error type for {@link jsonRpc}. */
  type ErrorType = Hex.toNumber.ErrorType
}

function toNumber(value: Hex.Hex | bigint | number) {
  if (typeof value === 'number') return value
  if (typeof value === 'bigint') return Number(value)
  return Hex.toNumber(value)
}
