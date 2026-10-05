import type { Address, Hex, RpcSchema } from 'ox'

import type * as Client from '../../Client.js'
import * as address from '../address/test/index.js'
import * as block from '../block/test/index.js'
import type * as Mode from '../internal/test/mode.js'
import * as node from '../node/index.js'
import * as state from '../state/index.js'
import * as txpool from '../txpool/index.js'

/** Action options with `mode` injected by the decorator stripped out. */
type Without<options> = Omit<options, 'mode'>

/**
 * Bag of test actions (anvil/hardhat/ganache) bound to a {@link Client},
 * grouped by namespace, with the decorator's `mode` injected into every action.
 * Pass to `Client.create`'s `.extend`. Also widens the Client's request schema
 * with the test methods for `mode` ({@link testActions.Schema}).
 *
 * @example
 * ```ts
 * import { Client, http, testActions } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http(),
 * }).extend(testActions({ mode: 'anvil' }))
 * await client.block.mine({ blocks: 1 })
 * await client.request({ method: 'anvil_setBalance', params: ['0x…', '0x…'] })
 * ```
 */
export function testActions<mode extends Mode.Mode = 'anvil'>(
  options: testActions.Options<mode> = {},
) {
  const { mode = 'anvil' } = options
  return (client: Client.Client): testActions.Decorator<mode> => ({
    address: {
      impersonate: (options) =>
        address.impersonate(client, { ...options, mode }),
      setBalance: (options) => address.setBalance(client, { ...options, mode }),
      setCode: (options) => address.setCode(client, { ...options, mode }),
      setNonce: (options) => address.setNonce(client, { ...options, mode }),
      setStorageAt: (options) =>
        address.setStorageAt(client, { ...options, mode }),
      stopImpersonating: (options) =>
        address.stopImpersonating(client, { ...options, mode }),
    },
    block: {
      getAutomine: () => block.getAutomine(client, { mode }),
      increaseTime: (options) => block.increaseTime(client, options),
      mine: (options) => block.mine(client, { ...options, mode }),
      removeTimestampInterval: () =>
        block.removeTimestampInterval(client, { mode }),
      setAutomine: (options) => block.setAutomine(client, { ...options, mode }),
      setCoinbase: (options) => block.setCoinbase(client, { ...options, mode }),
      setGasLimit: (options) => block.setGasLimit(client, { ...options, mode }),
      setIntervalMining: (options) =>
        block.setIntervalMining(client, { ...options, mode }),
      setNextBaseFeePerGas: (options) =>
        block.setNextBaseFeePerGas(client, { ...options, mode }),
      setNextTimestamp: (options) => block.setNextTimestamp(client, options),
      setTimestampInterval: (options) =>
        block.setTimestampInterval(client, { ...options, mode }),
    },
    node: {
      setLoggingEnabled: (options) =>
        node.setLoggingEnabled(client, { ...options, mode }),
      setMinGasPrice: (options) =>
        node.setMinGasPrice(client, { ...options, mode }),
      setRpcUrl: (options) => node.setRpcUrl(client, { ...options, mode }),
    },
    state: {
      dump: () => state.dump(client, { mode }),
      load: (options) => state.load(client, { ...options, mode }),
      reset: (options) => state.reset(client, { ...options, mode }),
      revert: (options) => state.revert(client, options),
      snapshot: () => state.snapshot(client),
    },
    txpool: {
      dropTransaction: (options) =>
        txpool.dropTransaction(client, { ...options, mode }),
      getStatus: () => txpool.getStatus(client),
      inspect: () => txpool.inspect(client),
    },
  })
}

export declare namespace testActions {
  type Options<mode extends Mode.Mode = Mode.Mode> = {
    /** Test node mode. @default 'anvil' */
    mode?: mode | undefined
  }

  type Decorator<mode extends Mode.Mode = Mode.Mode> = {
    /** Type-level marker widening the Client's request schema with {@link Schema}. Never present at runtime. */
    '~schema'?: Schema<mode> | undefined
    address: {
      /**
       * Impersonate an account or contract address. This lets you send
       * transactions from that account even if you don't have access to its
       * private key.
       *
       * @example
       * ```ts
       * import { Client, http, testActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(testActions())
       * await client.address.impersonate({
       *   address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79',
       * })
       * ```
       */
      impersonate: (
        options: Without<address.impersonate.Options>,
      ) => Promise<void>
      /**
       * Modifies the balance of an account.
       *
       * @example
       * ```ts
       * import { Client, http, testActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(testActions())
       * await client.address.setBalance({
       *   address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
       *   value: 1_000_000_000_000_000_000n,
       * })
       * ```
       */
      setBalance: (
        options: Without<address.setBalance.Options>,
      ) => Promise<void>
      /**
       * Modifies the bytecode stored at an account's address.
       *
       * @example
       * ```ts
       * import { Client, http, testActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(testActions())
       * await client.address.setCode({
       *   address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79',
       *   bytecode: '0x60806040...',
       * })
       * ```
       */
      setCode: (options: Without<address.setCode.Options>) => Promise<void>
      /**
       * Modifies (overrides) the nonce of an account.
       *
       * @example
       * ```ts
       * import { Client, http, testActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(testActions())
       * await client.address.setNonce({
       *   address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79',
       *   nonce: 420,
       * })
       * ```
       */
      setNonce: (options: Without<address.setNonce.Options>) => Promise<void>
      /**
       * Writes to a slot of an account's storage.
       *
       * @example
       * ```ts
       * import { Client, http, testActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(testActions())
       * await client.address.setStorageAt({
       *   address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79',
       *   index: 2,
       *   value: '0x0000000000000000000000000000000000000000000000000000000000000069',
       * })
       * ```
       */
      setStorageAt: (
        options: Without<address.setStorageAt.Options>,
      ) => Promise<void>
      /**
       * Stop impersonating an account after having previously used
       * `impersonateAccount`.
       *
       * @example
       * ```ts
       * import { Client, http, testActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(testActions())
       * await client.address.stopImpersonating({
       *   address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79',
       * })
       * ```
       */
      stopImpersonating: (
        options: Without<address.stopImpersonating.Options>,
      ) => Promise<void>
    }
    block: {
      /**
       * Returns the automatic mining status of the node.
       *
       * @example
       * ```ts
       * import { Client, http, testActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(testActions())
       * const isAutomining = await client.block.getAutomine()
       * ```
       */
      getAutomine: () => Promise<block.getAutomine.ReturnType>
      /**
       * Jump forward in time by the given amount of time, in seconds.
       *
       * @example
       * ```ts
       * import { Client, http, testActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(testActions())
       * await client.block.increaseTime({ seconds: 420 })
       * ```
       */
      increaseTime: (
        options: block.increaseTime.Options,
      ) => Promise<block.increaseTime.ReturnType>
      /**
       * Mine a specified number of blocks.
       *
       * @example
       * ```ts
       * import { Client, http, testActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(testActions())
       * await client.block.mine({ blocks: 1 })
       * ```
       */
      mine: (options: Without<block.mine.Options>) => Promise<void>
      /**
       * Removes `setBlockTimestampInterval` if it exists.
       *
       * @example
       * ```ts
       * import { Client, http, testActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(testActions())
       * await client.block.removeTimestampInterval()
       * ```
       */
      removeTimestampInterval: () => Promise<void>
      /**
       * Enables or disables the automatic mining of new blocks with each new
       * transaction submitted to the network.
       *
       * @example
       * ```ts
       * import { Client, http, testActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(testActions())
       * await client.block.setAutomine({ enabled: true })
       * ```
       */
      setAutomine: (
        options: Without<block.setAutomine.Options>,
      ) => Promise<void>
      /**
       * Sets the coinbase address to be used in new blocks.
       *
       * @example
       * ```ts
       * import { Client, http, testActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(testActions())
       * await client.block.setCoinbase({
       *   address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79',
       * })
       * ```
       */
      setCoinbase: (
        options: Without<block.setCoinbase.Options>,
      ) => Promise<void>
      /**
       * Sets the block's gas limit.
       *
       * @example
       * ```ts
       * import { Client, http, testActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(testActions())
       * await client.block.setGasLimit({ gasLimit: 420_000n })
       * ```
       */
      setGasLimit: (
        options: Without<block.setGasLimit.Options>,
      ) => Promise<void>
      /**
       * Sets the automatic mining interval (in seconds) of blocks. Setting the
       * interval to 0 will disable automatic mining.
       *
       * @example
       * ```ts
       * import { Client, http, testActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(testActions())
       * await client.block.setIntervalMining({ interval: 5 })
       * ```
       */
      setIntervalMining: (
        options: Without<block.setIntervalMining.Options>,
      ) => Promise<void>
      /**
       * Sets the next block's base fee per gas.
       *
       * @example
       * ```ts
       * import { Client, http, testActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(testActions())
       * await client.block.setNextBaseFeePerGas({ baseFeePerGas: 1_000_000_000n })
       * ```
       */
      setNextBaseFeePerGas: (
        options: Without<block.setNextBaseFeePerGas.Options>,
      ) => Promise<void>
      /**
       * Sets the next block's timestamp.
       *
       * @example
       * ```ts
       * import { Client, http, testActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(testActions())
       * await client.block.setNextTimestamp({ timestamp: 1671744314n })
       * ```
       */
      setNextTimestamp: (
        options: block.setNextTimestamp.Options,
      ) => Promise<void>
      /**
       * Similar to `increaseTime`, but sets a block timestamp `interval`. The
       * timestamp of future blocks will be computed as `lastBlock_timestamp` +
       * `interval`.
       *
       * @example
       * ```ts
       * import { Client, http, testActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(testActions())
       * await client.block.setTimestampInterval({ interval: 5 })
       * ```
       */
      setTimestampInterval: (
        options: Without<block.setTimestampInterval.Options>,
      ) => Promise<void>
    }
    node: {
      /**
       * Enable or disable logging on the test node network.
       *
       * @example
       * ```ts
       * import { Client, http, testActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(testActions())
       * await client.node.setLoggingEnabled({ enabled: true })
       * ```
       */
      setLoggingEnabled: (
        options: Without<node.setLoggingEnabled.Options>,
      ) => Promise<void>
      /**
       * Change the minimum gas price accepted by the network (in wei).
       *
       * @example
       * ```ts
       * import { Client, http, testActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(testActions())
       * await client.node.setMinGasPrice({ gasPrice: 1_000_000_000n })
       * ```
       */
      setMinGasPrice: (
        options: Without<node.setMinGasPrice.Options>,
      ) => Promise<void>
      /**
       * Sets the backend RPC URL.
       *
       * @example
       * ```ts
       * import { Client, http, testActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(testActions())
       * await client.node.setRpcUrl({ jsonRpcUrl: 'https://eth.merkle.io' })
       * ```
       */
      setRpcUrl: (options: Without<node.setRpcUrl.Options>) => Promise<void>
    }
    state: {
      /**
       * Serializes the current state (including contracts code, contract's
       * storage, accounts properties, etc.) into a savable data blob.
       *
       * @example
       * ```ts
       * import { Client, http, testActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(testActions())
       * const state = await client.state.dump()
       * ```
       */
      dump: () => Promise<state.dump.ReturnType>
      /**
       * Adds state previously dumped with `dumpState` to the current chain.
       *
       * @example
       * ```ts
       * import { Client, http, testActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(testActions())
       * await client.state.load({ state: '0x...' })
       * ```
       */
      load: (options: Without<state.load.Options>) => Promise<void>
      /**
       * Resets fork back to its original state.
       *
       * @example
       * ```ts
       * import { Client, http, testActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(testActions())
       * await client.state.reset({ blockNumber: 69420n })
       * ```
       */
      reset: (
        options?: Without<state.reset.Options> | undefined,
      ) => Promise<void>
      /**
       * Revert the state of the blockchain at the current block.
       *
       * @example
       * ```ts
       * import { Client, http, testActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(testActions())
       * await client.state.revert({ id: '0x1' })
       * ```
       */
      revert: (options: state.revert.Options) => Promise<void>
      /**
       * Snapshot the state of the blockchain at the current block.
       *
       * @example
       * ```ts
       * import { Client, http, testActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(testActions())
       * const id = await client.state.snapshot()
       * ```
       */
      snapshot: () => Promise<state.snapshot.ReturnType>
    }
    txpool: {
      /**
       * Removes a transaction from the mempool.
       *
       * @example
       * ```ts
       * import { Client, http, testActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(testActions())
       * await client.txpool.dropTransaction({
       *   hash: '0xe58dceb6b20b03965bb678e27d141e151d7d4efc2334c2d6a49b9fac523f7364',
       * })
       * ```
       */
      dropTransaction: (
        options: Without<txpool.dropTransaction.Options>,
      ) => Promise<void>
      /**
       * Returns a summary of all the transactions currently pending for inclusion
       * in the next block(s), as well as the ones that are being scheduled for
       * future execution only.
       *
       * @example
       * ```ts
       * import { Client, http, testActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(testActions())
       * const status = await client.txpool.getStatus()
       * ```
       */
      getStatus: () => Promise<txpool.getStatus.ReturnType>
      /**
       * Returns a summary of all the transactions currently pending for inclusion
       * in the next block(s), as well as the ones that are being scheduled for
       * future execution only.
       *
       * @example
       * ```ts
       * import { Client, http, testActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(testActions())
       * const txpool = await client.txpool.inspect()
       * ```
       */
      inspect: () => Promise<txpool.inspect.ReturnType>
    }
  }

  /**
   * JSON-RPC schema for test node (anvil/hardhat/ganache) methods, keyed by
   * `mode`. Widens `client.request` when the Client is extended with
   * {@link testActions}.
   */
  type Schema<mode extends Mode.Mode = Mode.Mode> = RpcSchema.From<
    /** Removes a transaction from the mempool. */
    | {
        Request: {
          method: `${mode}_dropTransaction`
          params: [hash: Hex.Hex]
        }
        ReturnType: void
      }
    /** Serializes the current state into a savable data blob. */
    | {
        Request: {
          method: `${mode}_dumpState`
          params?: undefined
        }
        ReturnType: Hex.Hex
      }
    /** Returns whether automatic mining is enabled. */
    | {
        Request: {
          method: `${mode}_getAutomine`
          params?: undefined
        }
        ReturnType: boolean
      }
    /** Impersonates an account or contract address. */
    | {
        Request: {
          method: `${mode}_impersonateAccount`
          params: [address: Address.Address]
        }
        ReturnType: void
      }
    /** Adds state previously dumped with `dumpState` to the current chain. */
    | {
        Request: {
          method: `${mode}_loadState`
          params?: [state: Hex.Hex] | undefined
        }
        ReturnType: void
      }
    /** Advances the network by a number of blocks. */
    | {
        Request: {
          method: `${mode}_mine`
          params: [count: Hex.Hex, interval: Hex.Hex | undefined]
        }
        ReturnType: void
      }
    /** Removes `setBlockTimestampInterval` if it exists. */
    | {
        Request: {
          method: `${mode}_removeBlockTimestampInterval`
          params?: undefined
        }
        ReturnType: void
      }
    /** Resets the fork. */
    | {
        Request: {
          method: `${mode}_reset`
          params?:
            | [
                config: {
                  forking: {
                    blockNumber?: number | undefined
                    jsonRpcUrl?: string | undefined
                  }
                },
              ]
            | undefined
        }
        ReturnType: void
      }
    /** Modifies the balance of an account. */
    | {
        Request: {
          method: `${mode}_setBalance`
          params: [address: Address.Address, balance: Hex.Hex]
        }
        ReturnType: void
      }
    /** Sets the block's gas limit. */
    | {
        Request: {
          method: `${mode}_setBlockGasLimit`
          params: [gasLimit: Hex.Hex]
        }
        ReturnType: void
      }
    /** Sets a block timestamp interval applied to future blocks. */
    | {
        Request: {
          method: `${mode}_setBlockTimestampInterval`
          params: [interval: number]
        }
        ReturnType: void
      }
    /** Modifies the bytecode stored at an account's address. */
    | {
        Request: {
          method: `${mode}_setCode`
          params: [address: Address.Address, bytecode: Hex.Hex]
        }
        ReturnType: void
      }
    /** Sets the coinbase address used in new blocks. */
    | {
        Request: {
          method: `${mode}_setCoinbase`
          params: [address: Address.Address]
        }
        ReturnType: void
      }
    /** Enables or disables logging on the test node. */
    | {
        Request: {
          method: `${mode}_setLoggingEnabled`
          params: [enabled: boolean]
        }
        ReturnType: void
      }
    /** Changes the minimum gas price accepted by the network (in wei). */
    | {
        Request: {
          method: `${mode}_setMinGasPrice`
          params: [gasPrice: Hex.Hex]
        }
        ReturnType: void
      }
    /** Sets the next block's base fee per gas. */
    | {
        Request: {
          method: `${mode}_setNextBlockBaseFeePerGas`
          params: [baseFeePerGas: Hex.Hex]
        }
        ReturnType: void
      }
    /** Overwrites the nonce of an account. */
    | {
        Request: {
          method: `${mode}_setNonce`
          params: [address: Address.Address, nonce: Hex.Hex]
        }
        ReturnType: void
      }
    /** Sets the backend RPC URL. */
    | {
        Request: {
          method: `${mode}_setRpcUrl`
          params: [url: string]
        }
        ReturnType: void
      }
    /** Writes a single slot of an account's storage. */
    | {
        Request: {
          method: `${mode}_setStorageAt`
          params: [address: Address.Address, index: Hex.Hex, value: Hex.Hex]
        }
        ReturnType: void
      }
    /** Stops impersonating an account. */
    | {
        Request: {
          method: `${mode}_stopImpersonatingAccount`
          params: [address: Address.Address]
        }
        ReturnType: void
      }
    /** Returns whether the client is actively mining new blocks. */
    | {
        Request: {
          method: 'eth_mining'
          params?: undefined
        }
        ReturnType: boolean
      }
    /** Jumps forward in time by the given amount of seconds. */
    | {
        Request: {
          method: 'evm_increaseTime'
          params: [seconds: Hex.Hex]
        }
        ReturnType: Hex.Hex
      }
    /** Advances the network by a number of blocks. */
    | {
        Request: {
          method: 'evm_mine'
          params?: [options: { blocks: Hex.Hex }] | undefined
        }
        ReturnType: void
      }
    /** Reverts the state of the blockchain to a previous snapshot. */
    | {
        Request: {
          method: 'evm_revert'
          params?: [id: Hex.Hex] | undefined
        }
        ReturnType: void
      }
    /** Modifies the balance of an account. */
    | {
        Request: {
          method: 'evm_setAccountBalance'
          params: [address: Address.Address, value: Hex.Hex]
        }
        ReturnType: void
      }
    /** Modifies the bytecode stored at an account's address. */
    | {
        Request: {
          method: 'evm_setAccountCode'
          params: [address: Address.Address, bytecode: Hex.Hex]
        }
        ReturnType: void
      }
    /** Enables or disables automatic mining on each new transaction. */
    | {
        Request: {
          method: 'evm_setAutomine'
          params: [enabled: boolean]
        }
        ReturnType: void
      }
    /** Enables or disables interval mining (in seconds; `0` disables). */
    | {
        Request: {
          method: 'evm_setIntervalMining'
          params: [interval: number]
        }
        ReturnType: void
      }
    /** Sets the next block's timestamp. */
    | {
        Request: {
          method: 'evm_setNextBlockTimestamp'
          params: [timestamp: Hex.Hex]
        }
        ReturnType: void
      }
    /** Snapshots the state of the blockchain at the current block. */
    | {
        Request: {
          method: 'evm_snapshot'
          params?: undefined
        }
        ReturnType: Hex.Hex
      }
    /** Enables automatic mining on each new transaction. */
    | {
        Request: {
          method: 'miner_start'
          params?: undefined
        }
        ReturnType: void
      }
    /** Disables automatic mining on each new transaction. */
    | {
        Request: {
          method: 'miner_stop'
          params?: undefined
        }
        ReturnType: void
      }
    /** Returns a textual summary of transactions in the mempool. */
    | {
        Request: {
          method: 'txpool_inspect'
          params?: undefined
        }
        ReturnType: {
          pending: Record<Address.Address, Record<string, string>>
          queued: Record<Address.Address, Record<string, string>>
        }
      }
    /** Returns the number of transactions in the mempool. */
    | {
        Request: {
          method: 'txpool_status'
          params?: undefined
        }
        ReturnType: {
          pending: Hex.Hex
          queued: Hex.Hex
        }
      }
  >
}
