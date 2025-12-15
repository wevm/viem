import type { Account } from '../accounts/types.js'
import type { Client } from '../clients/createClient.js'
import type { Transport } from '../clients/transports/createTransport.js'
import type { Chain } from '../types/chain.js'
import * as ammActions from './actions/amm.js'
import * as dexActions from './actions/dex.js'
import * as faucetActions from './actions/faucet.js'
import * as feeActions from './actions/fee.js'
import * as policyActions from './actions/policy.js'
import * as rewardActions from './actions/reward.js'
import * as tokenActions from './actions/token.js'

export type Decorator<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
> = {
  amm: {
    /**
     * Gets the reserves for a liquidity pool.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c...001' }),
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const pool = await client.amm.getPool({
     *   userToken: '0x...',
     *   validatorToken: '0x...',
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The pool reserves.
     */
    getPool: (
      parameters: ammActions.getPool.Parameters,
    ) => Promise<ammActions.getPool.ReturnValue>
    /**
     * Gets the LP token balance for an account in a specific pool.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const poolId = await client.amm.getPoolId({
     *   userToken: '0x...',
     *   validatorToken: '0x...',
     * })
     *
     * const balance = await client.amm.getLiquidityBalance({
     *   poolId,
     *   address: '0x...',
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The LP token balance.
     */
    getLiquidityBalance: (
      parameters: ammActions.getLiquidityBalance.Parameters,
    ) => Promise<ammActions.getLiquidityBalance.ReturnValue>
    /**
     * Removes liquidity from a pool.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const hash = await client.amm.burn({
     *   userToken: '0x...',
     *   validatorToken: '0x...',
     *   liquidity: 50n,
     *   to: '0x...',
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction hash.
     */
    burn: (
      parameters: ammActions.burn.Parameters<chain, account>,
    ) => Promise<ammActions.burn.ReturnValue>
    /**
     * Removes liquidity from a pool and waits for confirmation.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const { receipt, ...result } = await client.amm.burnSync({
     *   userToken: '0x...',
     *   validatorToken: '0x...',
     *   liquidity: 50n,
     *   to: '0x...',
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction receipt and event data.
     */
    burnSync: (
      parameters: ammActions.burnSync.Parameters<chain, account>,
    ) => Promise<ammActions.burnSync.ReturnValue>
    /**
     * Adds liquidity to a pool.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const hash = await client.amm.mint({
     *   userTokenAddress: '0x...',
     *   validatorTokenAddress: '0x...',
     *   validatorTokenAmount: 100n,
     *   to: '0x...',
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction hash.
     */
    mint: (
      parameters: ammActions.mint.Parameters<chain, account>,
    ) => Promise<ammActions.mint.ReturnValue>
    /**
     * Adds liquidity to a pool.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const result = await client.amm.mintSync({
     *   userTokenAddress: '0x...',
     *   validatorTokenAddress: '0x...',
     *   validatorTokenAmount: 100n,
     *   to: '0x...',
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction receipt and event data.
     */
    mintSync: (
      parameters: ammActions.mintSync.Parameters<chain, account>,
    ) => Promise<ammActions.mintSync.ReturnValue>
    /**
     * Swaps tokens during a rebalance operation.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const hash = await client.amm.rebalanceSwap({
     *   userToken: '0x...',
     *   validatorToken: '0x...',
     *   amountOut: 100n,
     *   to: '0x...',
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction hash.
     */
    rebalanceSwap: (
      parameters: ammActions.rebalanceSwap.Parameters<chain, account>,
    ) => Promise<ammActions.rebalanceSwap.ReturnValue>
    /**
     * Swaps tokens during a rebalance operation and waits for confirmation.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const { receipt, ...result } = await client.amm.rebalanceSwapSync({
     *   userToken: '0x...',
     *   validatorToken: '0x...',
     *   amountOut: 100n,
     *   to: '0x...',
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction receipt and event data.
     */
    rebalanceSwapSync: (
      parameters: ammActions.rebalanceSwapSync.Parameters<chain, account>,
    ) => Promise<ammActions.rebalanceSwapSync.ReturnValue>
    /**
     * Watches for burn (liquidity removal) events.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const unwatch = client.amm.watchBurn({
     *   onBurn: (args, log) => {
     *     console.log('Liquidity removed:', args)
     *   },
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns A function to unsubscribe from the event.
     */
    watchBurn: (parameters: ammActions.watchBurn.Parameters) => () => void
    /**
     * Watches for fee swap events.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const unwatch = client.amm.watchFeeSwap({
     *   onFeeSwap: (args, log) => {
     *     console.log('Fee swap:', args)
     *   },
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns A function to unsubscribe from the event.
     */
    watchFeeSwap: (parameters: ammActions.watchFeeSwap.Parameters) => () => void
    /**
     * Watches for liquidity mint events.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const unwatch = client.amm.watchMint({
     *   onMint: (args, log) => {
     *     console.log('Liquidity added:', args)
     *   },
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns A function to unsubscribe from the event.
     */
    watchMint: (parameters: ammActions.watchMint.Parameters) => () => void
    /**
     * Watches for rebalance swap events.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const unwatch = client.amm.watchRebalanceSwap({
     *   onRebalanceSwap: (args, log) => {
     *     console.log('Rebalance swap:', args)
     *   },
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns A function to unsubscribe from the event.
     */
    watchRebalanceSwap: (
      parameters: ammActions.watchRebalanceSwap.Parameters,
    ) => () => void
  }
  dex: {
    /**
     * Buys a specific amount of tokens.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const hash = await client.dex.buy({
     *   tokenIn: '0x20c...11',
     *   tokenOut: '0x20c...20',
     *   amountOut: 100n,
     *   maxAmountIn: 105n,
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction hash.
     */
    buy: (
      parameters: dexActions.buy.Parameters<chain, account>,
    ) => Promise<dexActions.buy.ReturnValue>
    /**
     * Buys a specific amount of tokens.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const result = await client.dex.buySync({
     *   tokenIn: '0x20c...11',
     *   tokenOut: '0x20c...20',
     *   amountOut: 100n,
     *   maxAmountIn: 105n,
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction receipt.
     */
    buySync: (
      parameters: dexActions.buySync.Parameters<chain, account>,
    ) => Promise<dexActions.buySync.ReturnValue>
    /**
     * Cancels an order from the orderbook.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const hash = await client.dex.cancel({
     *   orderId: 123n,
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction hash.
     */
    cancel: (
      parameters: dexActions.cancel.Parameters<chain, account>,
    ) => Promise<dexActions.cancel.ReturnValue>
    /**
     * Cancels an order from the orderbook.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const result = await client.dex.cancelSync({
     *   orderId: 123n,
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction receipt and event data.
     */
    cancelSync: (
      parameters: dexActions.cancelSync.Parameters<chain, account>,
    ) => Promise<dexActions.cancelSync.ReturnValue>
    /**
     * Creates a new trading pair on the DEX.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const hash = await client.dex.createPair({
     *   base: '0x20c...11',
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction hash.
     */
    createPair: (
      parameters: dexActions.createPair.Parameters<chain, account>,
    ) => Promise<dexActions.createPair.ReturnValue>
    /**
     * Creates a new trading pair on the DEX.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const result = await client.dex.createPairSync({
     *   base: '0x20c...11',
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction receipt and event data.
     */
    createPairSync: (
      parameters: dexActions.createPairSync.Parameters<chain, account>,
    ) => Promise<dexActions.createPairSync.ReturnValue>
    /**
     * Gets a user's token balance on the DEX.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const balance = await client.dex.getBalance({
     *   account: '0x...',
     *   token: '0x20c...11',
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The user's token balance on the DEX.
     */
    getBalance: (
      parameters: dexActions.getBalance.Parameters<account>,
    ) => Promise<dexActions.getBalance.ReturnValue>
    /**
     * Gets the quote for buying a specific amount of tokens.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const amountIn = await client.dex.getBuyQuote({
     *   tokenIn: '0x20c...11',
     *   tokenOut: '0x20c...20',
     *   amountOut: 100n,
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The amount of tokenIn needed to buy the specified amountOut.
     */
    getBuyQuote: (
      parameters: dexActions.getBuyQuote.Parameters,
    ) => Promise<dexActions.getBuyQuote.ReturnValue>
    /**
     * Gets an order's details from the orderbook.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const order = await client.dex.getOrder({
     *   orderId: 123n,
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The order details.
     */
    getOrder: (
      parameters: dexActions.getOrder.Parameters,
    ) => Promise<dexActions.getOrder.ReturnValue>
    /**
     * Gets the price level information at a specific tick.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions, Tick } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const level = await client.dex.getTickLevel({
     *   base: '0x20c...11',
     *   tick: Tick.fromPrice('1.001'),
     *   isBid: true,
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The price level information.
     */
    getTickLevel: (
      parameters: dexActions.getTickLevel.Parameters,
    ) => Promise<dexActions.getTickLevel.ReturnValue>
    /**
     * Gets the quote for selling a specific amount of tokens.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const amountOut = await client.dex.getSellQuote({
     *   tokenIn: '0x20c...11',
     *   tokenOut: '0x20c...20',
     *   amountIn: 100n,
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The amount of tokenOut received for selling the specified amountIn.
     */
    getSellQuote: (
      parameters: dexActions.getSellQuote.Parameters,
    ) => Promise<dexActions.getSellQuote.ReturnValue>
    /**
     * Places a limit order on the orderbook.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions, Tick } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const hash = await client.dex.place({
     *   token: '0x20c...11',
     *   amount: 100n,
     *   type: 'buy',
     *   tick: Tick.fromPrice('0.99'),
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction hash.
     */
    place: (
      parameters: dexActions.place.Parameters<chain, account>,
    ) => Promise<dexActions.place.ReturnValue>
    /**
     * Places a limit order on the orderbook.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions, Tick } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const result = await client.dex.placeSync({
     *   token: '0x20c...11',
     *   amount: 100n,
     *   type: 'buy',
     *   tick: Tick.fromPrice('0.99'),
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction receipt and event data.
     */
    placeSync: (
      parameters: dexActions.placeSync.Parameters<chain, account>,
    ) => Promise<dexActions.placeSync.ReturnValue>
    /**
     * Places a flip order that automatically flips when filled.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions, Tick } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const hash = await client.dex.placeFlip({
     *   token: '0x20c...11',
     *   amount: 100n,
     *   type: 'buy',
     *   tick: Tick.fromPrice('0.99'),
     *   flipTick: Tick.fromPrice('1.01'),
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction hash.
     */
    placeFlip: (
      parameters: dexActions.placeFlip.Parameters<chain, account>,
    ) => Promise<dexActions.placeFlip.ReturnValue>
    /**
     * Places a flip order that automatically flips when filled.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions, Tick } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const result = await client.dex.placeFlipSync({
     *   token: '0x20c...11',
     *   amount: 100n,
     *   type: 'buy',
     *   tick: Tick.fromPrice('0.99'),
     *   flipTick: Tick.fromPrice('1.01'),
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction receipt and event data.
     */
    placeFlipSync: (
      parameters: dexActions.placeFlipSync.Parameters<chain, account>,
    ) => Promise<dexActions.placeFlipSync.ReturnValue>
    /**
     * Sells a specific amount of tokens.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const hash = await client.dex.sell({
     *   tokenIn: '0x20c...11',
     *   tokenOut: '0x20c...20',
     *   amountIn: 100n,
     *   minAmountOut: 95n,
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction hash.
     */
    sell: (
      parameters: dexActions.sell.Parameters<chain, account>,
    ) => Promise<dexActions.sell.ReturnValue>
    /**
     * Sells a specific amount of tokens.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const result = await client.dex.sellSync({
     *   tokenIn: '0x20c...11',
     *   tokenOut: '0x20c...20',
     *   amountIn: 100n,
     *   minAmountOut: 95n,
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction receipt.
     */
    sellSync: (
      parameters: dexActions.sellSync.Parameters<chain, account>,
    ) => Promise<dexActions.sellSync.ReturnValue>
    /**
     * Withdraws tokens from the DEX to the caller's wallet.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const hash = await client.dex.withdraw({
     *   token: '0x20c...11',
     *   amount: 100n,
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction hash.
     */
    withdraw: (
      parameters: dexActions.withdraw.Parameters<chain, account>,
    ) => Promise<dexActions.withdraw.ReturnValue>
    /**
     * Withdraws tokens from the DEX to the caller's wallet.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const result = await client.dex.withdrawSync({
     *   token: '0x20c...11',
     *   amount: 100n,
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction receipt.
     */
    withdrawSync: (
      parameters: dexActions.withdrawSync.Parameters<chain, account>,
    ) => Promise<dexActions.withdrawSync.ReturnValue>
    /**
     * Watches for flip order placed events.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const unwatch = client.dex.watchFlipOrderPlaced({
     *   onFlipOrderPlaced: (args, log) => {
     *     console.log('Flip order placed:', args)
     *   },
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns A function to unsubscribe from the event.
     */
    watchFlipOrderPlaced: (
      parameters: dexActions.watchFlipOrderPlaced.Parameters,
    ) => () => void
    /**
     * Watches for order cancelled events.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const unwatch = client.dex.watchOrderCancelled({
     *   onOrderCancelled: (args, log) => {
     *     console.log('Order cancelled:', args)
     *   },
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns A function to unsubscribe from the event.
     */
    watchOrderCancelled: (
      parameters: dexActions.watchOrderCancelled.Parameters,
    ) => () => void
    /**
     * Watches for order filled events.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const unwatch = client.dex.watchOrderFilled({
     *   onOrderFilled: (args, log) => {
     *     console.log('Order filled:', args)
     *   },
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns A function to unsubscribe from the event.
     */
    watchOrderFilled: (
      parameters: dexActions.watchOrderFilled.Parameters,
    ) => () => void
    /**
     * Watches for order placed events.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const unwatch = client.dex.watchOrderPlaced({
     *   onOrderPlaced: (args, log) => {
     *     console.log('Order placed:', args)
     *   },
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns A function to unsubscribe from the event.
     */
    watchOrderPlaced: (
      parameters: dexActions.watchOrderPlaced.Parameters,
    ) => () => void
  }
  faucet: {
    /**
     * Funds an account with an initial amount of set token(s)
     * on Tempo's testnet.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const hashes = await client.faucet.fund({
     *   account: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction hashes.
     */
    fund: (
      parameters: faucetActions.fund.Parameters,
    ) => Promise<faucetActions.fund.ReturnValue>
  }
  fee: {
    /**
     * Gets the user's default fee token.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const { address, id } = await client.token.getUserToken()
     * ```
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns The transaction hash.
     */
    getUserToken: (
      ...parameters: account extends Account
        ? [feeActions.getUserToken.Parameters<account>] | []
        : [feeActions.getUserToken.Parameters<account>]
    ) => Promise<feeActions.getUserToken.ReturnValue>
    /**
     * Sets the user's default fee token.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const hash = await client.token.setUserToken({
     *   token: '0x...',
     * })
     * ```
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns The transaction hash.
     */
    setUserToken: (
      parameters: feeActions.setUserToken.Parameters<chain, account>,
    ) => Promise<feeActions.setUserToken.ReturnValue>
    /**
     * Sets the user's default fee token.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const result = await client.fee.setUserTokenSync({
     *   token: '0x...',
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction receipt and event data.
     */
    setUserTokenSync: (
      parameters: feeActions.setUserTokenSync.Parameters<chain, account>,
    ) => Promise<feeActions.setUserTokenSync.ReturnValue>
    /**
     * Watches for user token set events.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const unwatch = client.token.watchSetUserToken({
     *   onUserTokenSet: (args, log) => {
     *     console.log('User token set:', args)
     *   },
     * })
     * ```
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns A function to unsubscribe from the event.
     */
    watchSetUserToken: (
      parameters: feeActions.watchSetUserToken.Parameters,
    ) => () => void
  }
  policy: {
    /**
     * Creates a new policy.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const hash = await client.policy.create({
     *   admin: '0x...',
     *   type: 'whitelist',
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction hash.
     */
    create: (
      parameters: policyActions.create.Parameters<chain, account>,
    ) => Promise<policyActions.create.ReturnValue>
    /**
     * Creates a new policy.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const result = await client.policy.createSync({
     *   admin: '0x...',
     *   type: 'whitelist',
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction receipt and event data.
     */
    createSync: (
      parameters: policyActions.createSync.Parameters<chain, account>,
    ) => Promise<policyActions.createSync.ReturnValue>
    /**
     * Sets the admin for a policy.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const hash = await client.policy.setAdmin({
     *   policyId: 2n,
     *   admin: '0x...',
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction hash.
     */
    setAdmin: (
      parameters: policyActions.setAdmin.Parameters<chain, account>,
    ) => Promise<policyActions.setAdmin.ReturnValue>
    /**
     * Sets the admin for a policy.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const result = await client.policy.setAdminSync({
     *   policyId: 2n,
     *   admin: '0x...',
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction receipt and event data.
     */
    setAdminSync: (
      parameters: policyActions.setAdminSync.Parameters<chain, account>,
    ) => Promise<policyActions.setAdminSync.ReturnValue>
    /**
     * Modifies a policy whitelist.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const hash = await client.policy.modifyWhitelist({
     *   policyId: 2n,
     *   address: '0x...',
     *   allowed: true,
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction hash.
     */
    modifyWhitelist: (
      parameters: policyActions.modifyWhitelist.Parameters<chain, account>,
    ) => Promise<policyActions.modifyWhitelist.ReturnValue>
    /**
     * Modifies a policy whitelist.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const result = await client.policy.modifyWhitelistSync({
     *   policyId: 2n,
     *   address: '0x...',
     *   allowed: true,
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction receipt and event data.
     */
    modifyWhitelistSync: (
      parameters: policyActions.modifyWhitelistSync.Parameters<chain, account>,
    ) => Promise<policyActions.modifyWhitelistSync.ReturnValue>
    /**
     * Modifies a policy blacklist.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const hash = await client.policy.modifyBlacklist({
     *   policyId: 2n,
     *   address: '0x...',
     *   restricted: true,
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction hash.
     */
    modifyBlacklist: (
      parameters: policyActions.modifyBlacklist.Parameters<chain, account>,
    ) => Promise<policyActions.modifyBlacklist.ReturnValue>
    /**
     * Modifies a policy blacklist.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const result = await client.policy.modifyBlacklistSync({
     *   policyId: 2n,
     *   address: '0x...',
     *   restricted: true,
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction receipt and event data.
     */
    modifyBlacklistSync: (
      parameters: policyActions.modifyBlacklistSync.Parameters<chain, account>,
    ) => Promise<policyActions.modifyBlacklistSync.ReturnValue>
    /**
     * Gets policy data.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const data = await client.policy.getData({
     *   policyId: 2n,
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The policy data.
     */
    getData: (
      parameters: policyActions.getData.Parameters,
    ) => Promise<policyActions.getData.ReturnValue>
    /**
     * Checks if a user is authorized by a policy.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const authorized = await client.policy.isAuthorized({
     *   policyId: 2n,
     *   user: '0x...',
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns Whether the user is authorized.
     */
    isAuthorized: (
      parameters: policyActions.isAuthorized.Parameters,
    ) => Promise<policyActions.isAuthorized.ReturnValue>
    /**
     * Watches for policy creation events.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const unwatch = client.policy.watchCreate({
     *   onPolicyCreated: (args, log) => {
     *     console.log('Policy created:', args)
     *   },
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns A function to unsubscribe from the event.
     */
    watchCreate: (
      parameters: policyActions.watchCreate.Parameters,
    ) => () => void
    /**
     * Watches for policy admin update events.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const unwatch = client.policy.watchAdminUpdated({
     *   onAdminUpdated: (args, log) => {
     *     console.log('Policy admin updated:', args)
     *   },
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns A function to unsubscribe from the event.
     */
    watchAdminUpdated: (
      parameters: policyActions.watchAdminUpdated.Parameters,
    ) => () => void
    /**
     * Watches for whitelist update events.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const unwatch = client.policy.watchWhitelistUpdated({
     *   onWhitelistUpdated: (args, log) => {
     *     console.log('Whitelist updated:', args)
     *   },
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns A function to unsubscribe from the event.
     */
    watchWhitelistUpdated: (
      parameters: policyActions.watchWhitelistUpdated.Parameters,
    ) => () => void
    /**
     * Watches for blacklist update events.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const unwatch = client.policy.watchBlacklistUpdated({
     *   onBlacklistUpdated: (args, log) => {
     *     console.log('Blacklist updated:', args)
     *   },
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns A function to unsubscribe from the event.
     */
    watchBlacklistUpdated: (
      parameters: policyActions.watchBlacklistUpdated.Parameters,
    ) => () => void
  }
  reward: {
    /**
     * Claims accumulated rewards for a recipient.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const hash = await client.reward.claim({
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction hash.
     */
    claim: (
      parameters: rewardActions.claim.Parameters<chain, account>,
    ) => Promise<rewardActions.claim.ReturnValue>
    /**
     * Claims accumulated rewards for a recipient and waits for confirmation.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const result = await client.reward.claimSync({
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The amount claimed and transaction receipt.
     */
    claimSync: (
      parameters: rewardActions.claimSync.Parameters<chain, account>,
    ) => Promise<rewardActions.claimSync.ReturnValue>
    /**
     * Gets the total reward per second rate for all active streams.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const rate = await client.reward.getTotalPerSecond({
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The total reward per second (scaled by 1e18).
     */
    getTotalPerSecond: (
      parameters: rewardActions.getTotalPerSecond.Parameters,
    ) => Promise<rewardActions.getTotalPerSecond.ReturnValue>
    /**
     * Gets the reward information for a specific account.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const info = await client.reward.getUserRewardInfo({
     *   token: '0x20c0000000000000000000000000000000000001',
     *   account: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The user's reward information (recipient, rewardPerToken, rewardBalance).
     */
    getUserRewardInfo: (
      parameters: rewardActions.getUserRewardInfo.Parameters,
    ) => Promise<rewardActions.getUserRewardInfo.ReturnValue>
    /**
     * Sets or changes the reward recipient for a token holder.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const hash = await client.reward.setRecipient({
     *   recipient: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction hash.
     */
    setRecipient: (
      parameters: rewardActions.setRecipient.Parameters<chain, account>,
    ) => Promise<rewardActions.setRecipient.ReturnValue>
    /**
     * Sets or changes the reward recipient for a token holder and waits for confirmation.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const result = await client.reward.setRecipientSync({
     *   recipient: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction receipt and event data.
     */
    setRecipientSync: (
      parameters: rewardActions.setRecipientSync.Parameters<chain, account>,
    ) => Promise<rewardActions.setRecipientSync.ReturnValue>
    /**
     * Starts a new reward stream that distributes tokens to opted-in holders.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const hash = await client.reward.start({
     *   amount: 100000000000000000000n,
     *   seconds: 86400,
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction hash.
     */
    start: (
      parameters: rewardActions.start.Parameters<chain, account>,
    ) => Promise<rewardActions.start.ReturnValue>
    /**
     * Starts a new reward stream that distributes tokens to opted-in holders and waits for confirmation.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const result = await client.reward.startSync({
     *   amount: 100000000000000000000n,
     *   seconds: 86400,
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction receipt and event data.
     */
    startSync: (
      parameters: rewardActions.startSync.Parameters<chain, account>,
    ) => Promise<rewardActions.startSync.ReturnValue>
    /**
     * Watches for reward recipient set events.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const unwatch = client.reward.watchRewardRecipientSet({
     *   token: '0x20c0000000000000000000000000000000000001',
     *   onRewardRecipientSet: (args, log) => {
     *     console.log('Reward recipient set:', args)
     *   },
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns A function to unsubscribe from the event.
     */
    watchRewardRecipientSet: (
      parameters: rewardActions.watchRewardRecipientSet.Parameters,
    ) => () => void
    /**
     * Watches for reward scheduled events.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const unwatch = client.reward.watchRewardScheduled({
     *   token: '0x20c0000000000000000000000000000000000001',
     *   onRewardScheduled: (args, log) => {
     *     console.log('Reward scheduled:', args)
     *   },
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns A function to unsubscribe from the event.
     */
    watchRewardScheduled: (
      parameters: rewardActions.watchRewardScheduled.Parameters,
    ) => () => void
  }
  token: {
    /**
     * Approves a spender to transfer TIP20 tokens on behalf of the caller.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const hash = await client.token.approve({
     *   spender: '0x...',
     *   amount: 100n,
     * })
     * ```
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns The transaction hash.
     */
    approve: (
      parameters: tokenActions.approve.Parameters<chain, account>,
    ) => Promise<tokenActions.approve.ReturnValue>
    /**
     * Approves a spender to transfer TIP20 tokens on behalf of the caller.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const result = await client.token.approveSync({
     *   spender: '0x...',
     *   amount: 100n,
     * })
     * ```
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns The transaction receipt and event data.
     */
    approveSync: (
      parameters: tokenActions.approveSync.Parameters<chain, account>,
    ) => Promise<tokenActions.approveSync.ReturnValue>
    /**
     * Burns TIP20 tokens from a blocked address.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const hash = await client.token.burnBlocked({
     *   from: '0x...',
     *   amount: 100n,
     *   token: '0x...',
     * })
     * ```
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns The transaction hash.
     */
    burnBlocked: (
      parameters: tokenActions.burnBlocked.Parameters<chain, account>,
    ) => Promise<tokenActions.burnBlocked.ReturnValue>
    /**
     * Burns TIP20 tokens from a blocked address.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const result = await client.token.burnBlockedSync({
     *   from: '0x...',
     *   amount: 100n,
     *   token: '0x...',
     * })
     * ```
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns The transaction receipt and event data.
     */
    burnBlockedSync: (
      parameters: tokenActions.burnBlockedSync.Parameters<chain, account>,
    ) => Promise<tokenActions.burnBlockedSync.ReturnValue>
    /**
     * Burns TIP20 tokens from the caller's balance.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const hash = await client.token.burn({
     *   amount: 100n,
     *   token: '0x...',
     * })
     * ```
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns The transaction hash.
     */
    burn: (
      parameters: tokenActions.burn.Parameters<chain, account>,
    ) => Promise<tokenActions.burn.ReturnValue>
    /**
     * Burns TIP20 tokens from the caller's balance.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const result = await client.token.burnSync({
     *   amount: 100n,
     *   token: '0x...',
     * })
     * ```
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns The transaction receipt and event data.
     */
    burnSync: (
      parameters: tokenActions.burnSync.Parameters<chain, account>,
    ) => Promise<tokenActions.burnSync.ReturnValue>
    /**
     * Changes the transfer policy ID for a TIP20 token.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const hash = await client.token.changeTransferPolicy({
     *   token: '0x...',
     *   policyId: 1n,
     * })
     * ```
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns The transaction hash.
     */
    changeTransferPolicy: (
      parameters: tokenActions.changeTransferPolicy.Parameters<chain, account>,
    ) => Promise<tokenActions.changeTransferPolicy.ReturnValue>
    /**
     * Changes the transfer policy ID for a TIP20 token.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const result = await client.token.changeTransferPolicySync({
     *   token: '0x...',
     *   policyId: 1n,
     * })
     * ```
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns The transaction receipt and event data.
     */
    changeTransferPolicySync: (
      parameters: tokenActions.changeTransferPolicySync.Parameters<
        chain,
        account
      >,
    ) => Promise<tokenActions.changeTransferPolicySync.ReturnValue>
    /**
     * Creates a new TIP20 token.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const { hash, id, address } = await client.token.create({
     *   name: 'My Token',
     *   symbol: 'MTK',
     *   currency: 'USD',
     * })
     * ```
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns The transaction hash.
     */
    create: (
      parameters: tokenActions.create.Parameters<chain, account>,
    ) => Promise<tokenActions.create.ReturnValue>
    /**
     * Creates a new TIP20 token.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const result = await client.token.createSync({
     *   name: 'My Token',
     *   symbol: 'MTK',
     *   currency: 'USD',
     * })
     * ```
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns The transaction receipt and event data.
     */
    createSync: (
      parameters: tokenActions.createSync.Parameters<chain, account>,
    ) => Promise<tokenActions.createSync.ReturnValue>
    /**
     * Gets TIP20 token allowance.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const allowance = await client.token.getAllowance({
     *   spender: '0x...',
     * })
     * ```
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns The token allowance.
     */
    getAllowance: (
      parameters: tokenActions.getAllowance.Parameters,
    ) => Promise<tokenActions.getAllowance.ReturnValue>
    /**
     * Gets TIP20 token balance for an address.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const balance = await client.token.getBalance()
     * ```
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns The token balance.
     */
    getBalance: (
      parameters: tokenActions.getBalance.Parameters<account>,
    ) => Promise<tokenActions.getBalance.ReturnValue>
    /**
     * Gets TIP20 token metadata including name, symbol, currency, decimals, and total supply.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const metadata = await client.token.getMetadata({
     *   token: '0x...',
     * })
     * ```
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns The token metadata.
     */
    getMetadata: (
      parameters: tokenActions.getMetadata.Parameters,
    ) => Promise<tokenActions.getMetadata.ReturnValue>
    /**
     * Gets the admin role for a specific role in a TIP20 token.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const adminRole = await client.token.getRoleAdmin({
     *   role: 'issuer',
     *   token: '0x...',
     * })
     * ```
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns The admin role hash.
     */
    getRoleAdmin: (
      parameters: tokenActions.getRoleAdmin.Parameters,
    ) => Promise<tokenActions.getRoleAdmin.ReturnValue>
    /**
     * Checks if an account has a specific role for a TIP20 token.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const hasRole = await client.token.hasRole({
     *   token: '0x...',
     *   role: 'issuer',
     * })
     * ```
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns Whether the account has the role.
     */
    hasRole: (
      parameters: tokenActions.hasRole.Parameters<account>,
    ) => Promise<tokenActions.hasRole.ReturnValue>
    /**
     * Grants a role for a TIP20 token.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const hash = await client.token.grantRoles({
     *   token: '0x...',
     *   to: '0x...',
     *   roles: ['issuer'],
     * })
     * ```
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns The transaction hash.
     */
    grantRoles: (
      parameters: tokenActions.grantRoles.Parameters<chain, account>,
    ) => Promise<tokenActions.grantRoles.ReturnValue>
    /**
     * Grants a role for a TIP20 token.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const result = await client.token.grantRolesSync({
     *   token: '0x...',
     *   to: '0x...',
     *   roles: ['issuer'],
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction receipt and event data.
     */
    grantRolesSync: (
      parameters: tokenActions.grantRolesSync.Parameters<chain, account>,
    ) => Promise<tokenActions.grantRolesSync.ReturnValue>
    /**
     * Mints TIP20 tokens to an address.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const hash = await client.token.mint({
     *   to: '0x...',
     *   amount: 100n,
     *   token: '0x...',
     * })
     * ```
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns The transaction hash.
     */
    mint: (
      parameters: tokenActions.mint.Parameters<chain, account>,
    ) => Promise<tokenActions.mint.ReturnValue>
    /**
     * Mints TIP20 tokens to an address.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const result = await client.token.mintSync({
     *   to: '0x...',
     *   amount: 100n,
     *   token: '0x...',
     * })
     * ```
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns The transaction receipt and event data.
     */
    mintSync: (
      parameters: tokenActions.mintSync.Parameters<chain, account>,
    ) => Promise<tokenActions.mintSync.ReturnValue>
    /**
     * Pauses a TIP20 token.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const hash = await client.token.pause({
     *   token: '0x...',
     * })
     * ```
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns The transaction hash.
     */
    pause: (
      parameters: tokenActions.pause.Parameters<chain, account>,
    ) => Promise<tokenActions.pause.ReturnValue>
    /**
     * Pauses a TIP20 token.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const result = await client.token.pauseSync({
     *   token: '0x...',
     * })
     * ```
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns The transaction receipt and event data.
     */
    pauseSync: (
      parameters: tokenActions.pauseSync.Parameters<chain, account>,
    ) => Promise<tokenActions.pauseSync.ReturnValue>
    /**
     * Renounces a role for a TIP20 token.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const hash = await client.token.renounceRoles({
     *   token: '0x...',
     *   roles: ['issuer'],
     * })
     * ```
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns The transaction hash.
     */
    renounceRoles: (
      parameters: tokenActions.renounceRoles.Parameters<chain, account>,
    ) => Promise<tokenActions.renounceRoles.ReturnValue>
    /**
     * Renounces a role for a TIP20 token.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const result = await client.token.renounceRolesSync({
     *   token: '0x...',
     *   roles: ['issuer'],
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction receipt and event data.
     */
    renounceRolesSync: (
      parameters: tokenActions.renounceRolesSync.Parameters<chain, account>,
    ) => Promise<tokenActions.renounceRolesSync.ReturnValue>
    /**
     * Revokes a role for a TIP20 token.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const hash = await client.token.revokeRoles({
     *   token: '0x...',
     *   from: '0x...',
     *   roles: ['issuer'],
     * })
     * ```
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns The transaction hash.
     */
    revokeRoles: (
      parameters: tokenActions.revokeRoles.Parameters<chain, account>,
    ) => Promise<tokenActions.revokeRoles.ReturnValue>
    /**
     * Revokes a role for a TIP20 token.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const result = await client.token.revokeRolesSync({
     *   token: '0x...',
     *   from: '0x...',
     *   roles: ['issuer'],
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction receipt and event data.
     */
    revokeRolesSync: (
      parameters: tokenActions.revokeRolesSync.Parameters<chain, account>,
    ) => Promise<tokenActions.revokeRolesSync.ReturnValue>
    /**
     * Sets the supply cap for a TIP20 token.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const hash = await client.token.setSupplyCap({
     *   token: '0x...',
     *   supplyCap: 1000000n,
     * })
     * ```
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns The transaction hash.
     */
    setSupplyCap: (
      parameters: tokenActions.setSupplyCap.Parameters<chain, account>,
    ) => Promise<tokenActions.setSupplyCap.ReturnValue>
    /**
     * Sets the supply cap for a TIP20 token.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const result = await client.token.setSupplyCapSync({
     *   token: '0x...',
     *   supplyCap: 1000000n,
     * })
     * ```
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns The transaction receipt and event data.
     */
    setSupplyCapSync: (
      parameters: tokenActions.setSupplyCapSync.Parameters<chain, account>,
    ) => Promise<tokenActions.setSupplyCapSync.ReturnValue>
    /**
     * Sets the admin role for a specific role in a TIP20 token.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const hash = await client.token.setRoleAdmin({
     *   token: '0x...',
     *   role: 'issuer',
     *   adminRole: 'admin',
     * })
     * ```
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns The transaction hash.
     */
    setRoleAdmin: (
      parameters: tokenActions.setRoleAdmin.Parameters<chain, account>,
    ) => Promise<tokenActions.setRoleAdmin.ReturnValue>
    /**
     * Sets the admin role for a specific role in a TIP20 token.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const result = await client.token.setRoleAdminSync({
     *   token: '0x...',
     *   role: 'issuer',
     *   adminRole: 'admin',
     * })
     * ```
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns The transaction receipt and event data.
     */
    setRoleAdminSync: (
      parameters: tokenActions.setRoleAdminSync.Parameters<chain, account>,
    ) => Promise<tokenActions.setRoleAdminSync.ReturnValue>
    /**
     * Transfers TIP20 tokens to another address.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const hash = await client.token.transfer({
     *   to: '0x...',
     *   amount: 100n,
     * })
     * ```
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns The transaction hash.
     */
    transfer: (
      parameters: tokenActions.transfer.Parameters<chain, account>,
    ) => Promise<tokenActions.transfer.ReturnValue>
    /**
     * Transfers TIP20 tokens to another address.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const result = await client.token.transferSync({
     *   to: '0x...',
     *   amount: 100n,
     * })
     * ```
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns The transaction receipt and event data.
     */
    transferSync: (
      parameters: tokenActions.transferSync.Parameters<chain, account>,
    ) => Promise<tokenActions.transferSync.ReturnValue>
    /**
     * Unpauses a TIP20 token.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const hash = await client.token.unpause({
     *   token: '0x...',
     * })
     * ```
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns The transaction hash.
     */
    unpause: (
      parameters: tokenActions.unpause.Parameters<chain, account>,
    ) => Promise<tokenActions.unpause.ReturnValue>
    /**
     * Unpauses a TIP20 token.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const result = await client.token.unpauseSync({
     *   token: '0x...',
     * })
     * ```
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns The transaction receipt and event data.
     */
    unpauseSync: (
      parameters: tokenActions.unpauseSync.Parameters<chain, account>,
    ) => Promise<tokenActions.unpauseSync.ReturnValue>
    /**
     * Watches for TIP20 token approval events.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const unwatch = client.token.watchApprove({
     *   onApproval: (args, log) => {
     *     console.log('Approval:', args)
     *   },
     * })
     * ```
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns A function to unsubscribe from the event.
     */
    watchApprove: (
      parameters: tokenActions.watchApprove.Parameters,
    ) => () => void
    /**
     * Watches for TIP20 token burn events.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const unwatch = client.token.watchBurn({
     *   onBurn: (args, log) => {
     *     console.log('Burn:', args)
     *   },
     * })
     * ```
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns A function to unsubscribe from the event.
     */
    watchBurn: (parameters: tokenActions.watchBurn.Parameters) => () => void
    /**
     * Watches for new TIP20 tokens created.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const unwatch = client.token.watchCreate({
     *   onTokenCreated: (args, log) => {
     *     console.log('Token created:', args)
     *   },
     * })
     * ```
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns A function to unsubscribe from the event.
     */
    watchCreate: (parameters: tokenActions.watchCreate.Parameters) => () => void
    /**
     * Watches for TIP20 token mint events.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const unwatch = client.token.watchMint({
     *   onMint: (args, log) => {
     *     console.log('Mint:', args)
     *   },
     * })
     * ```
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns A function to unsubscribe from the event.
     */
    watchMint: (parameters: tokenActions.watchMint.Parameters) => () => void
    /**
     * Watches for TIP20 token role admin updates.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const unwatch = client.token.watchAdminRole({
     *   onRoleAdminUpdated: (args, log) => {
     *     console.log('Role admin updated:', args)
     *   },
     * })
     * ```
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns A function to unsubscribe from the event.
     */
    watchAdminRole: (
      parameters: tokenActions.watchAdminRole.Parameters,
    ) => () => void
    /**
     * Watches for TIP20 token role membership updates.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const unwatch = client.token.watchRole({
     *   onRoleUpdated: (args, log) => {
     *     console.log('Role updated:', args)
     *   },
     * })
     * ```
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns A function to unsubscribe from the event.
     */
    watchRole: (parameters: tokenActions.watchRole.Parameters) => () => void
    /**
     * Watches for TIP20 token transfer events.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { tempo } from 'tempo.ts/chains'
     * import { tempoActions } from 'tempo.ts/viem'
     *
     * const client = createClient({
     *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
     *   transport: http(),
     * }).extend(tempoActions())
     *
     * const unwatch = client.token.watchTransfer({
     *   onTransfer: (args, log) => {
     *     console.log('Transfer:', args)
     *   },
     * })
     * ```
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns A function to unsubscribe from the event.
     */
    watchTransfer: (
      parameters: tokenActions.watchTransfer.Parameters,
    ) => () => void
  }
}

export function decorator() {
  return <
    transport extends Transport,
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    client: Client<transport, chain, account>,
  ): Decorator<chain, account> => {
    return {
      amm: {
        getPool: (parameters) => ammActions.getPool(client, parameters),
        getLiquidityBalance: (parameters) =>
          ammActions.getLiquidityBalance(client, parameters),
        burn: (parameters) => ammActions.burn(client, parameters),
        burnSync: (parameters) => ammActions.burnSync(client, parameters),
        mint: (parameters) => ammActions.mint(client, parameters),
        mintSync: (parameters) => ammActions.mintSync(client, parameters),
        rebalanceSwap: (parameters) =>
          ammActions.rebalanceSwap(client, parameters),
        rebalanceSwapSync: (parameters) =>
          ammActions.rebalanceSwapSync(client, parameters),
        watchBurn: (parameters) => ammActions.watchBurn(client, parameters),
        watchFeeSwap: (parameters) =>
          ammActions.watchFeeSwap(client, parameters),
        watchMint: (parameters) => ammActions.watchMint(client, parameters),
        watchRebalanceSwap: (parameters) =>
          ammActions.watchRebalanceSwap(client, parameters),
      },
      dex: {
        buy: (parameters) => dexActions.buy(client, parameters),
        buySync: (parameters) => dexActions.buySync(client, parameters),
        cancel: (parameters) => dexActions.cancel(client, parameters),
        cancelSync: (parameters) => dexActions.cancelSync(client, parameters),
        createPair: (parameters) => dexActions.createPair(client, parameters),
        createPairSync: (parameters) =>
          dexActions.createPairSync(client, parameters),
        getBalance: (parameters) => dexActions.getBalance(client, parameters),
        getBuyQuote: (parameters) => dexActions.getBuyQuote(client, parameters),
        getOrder: (parameters) => dexActions.getOrder(client, parameters),
        getTickLevel: (parameters) =>
          dexActions.getTickLevel(client, parameters),
        getSellQuote: (parameters) =>
          dexActions.getSellQuote(client, parameters),
        place: (parameters) => dexActions.place(client, parameters),
        placeSync: (parameters) => dexActions.placeSync(client, parameters),
        placeFlip: (parameters) => dexActions.placeFlip(client, parameters),
        placeFlipSync: (parameters) =>
          dexActions.placeFlipSync(client, parameters),
        sell: (parameters) => dexActions.sell(client, parameters),
        sellSync: (parameters) => dexActions.sellSync(client, parameters),
        withdraw: (parameters) => dexActions.withdraw(client, parameters),
        withdrawSync: (parameters) =>
          dexActions.withdrawSync(client, parameters),
        watchFlipOrderPlaced: (parameters) =>
          dexActions.watchFlipOrderPlaced(client, parameters),
        watchOrderCancelled: (parameters) =>
          dexActions.watchOrderCancelled(client, parameters),
        watchOrderFilled: (parameters) =>
          dexActions.watchOrderFilled(client, parameters),
        watchOrderPlaced: (parameters) =>
          dexActions.watchOrderPlaced(client, parameters),
      },
      faucet: {
        fund: (parameters) => faucetActions.fund(client, parameters),
      },
      fee: {
        // @ts-expect-error
        getUserToken: (parameters) =>
          // @ts-expect-error
          feeActions.getUserToken(client, parameters),
        setUserToken: (parameters) =>
          feeActions.setUserToken(client, parameters),
        setUserTokenSync: (parameters) =>
          feeActions.setUserTokenSync(client, parameters),
        watchSetUserToken: (parameters) =>
          feeActions.watchSetUserToken(client, parameters),
      },
      policy: {
        create: (parameters) => policyActions.create(client, parameters),
        createSync: (parameters) =>
          policyActions.createSync(client, parameters),
        setAdmin: (parameters) => policyActions.setAdmin(client, parameters),
        setAdminSync: (parameters) =>
          policyActions.setAdminSync(client, parameters),
        modifyWhitelist: (parameters) =>
          policyActions.modifyWhitelist(client, parameters),
        modifyWhitelistSync: (parameters) =>
          policyActions.modifyWhitelistSync(client, parameters),
        modifyBlacklist: (parameters) =>
          policyActions.modifyBlacklist(client, parameters),
        modifyBlacklistSync: (parameters) =>
          policyActions.modifyBlacklistSync(client, parameters),
        getData: (parameters) => policyActions.getData(client, parameters),
        isAuthorized: (parameters) =>
          policyActions.isAuthorized(client, parameters),
        watchCreate: (parameters) =>
          policyActions.watchCreate(client, parameters),
        watchAdminUpdated: (parameters) =>
          policyActions.watchAdminUpdated(client, parameters),
        watchWhitelistUpdated: (parameters) =>
          policyActions.watchWhitelistUpdated(client, parameters),
        watchBlacklistUpdated: (parameters) =>
          policyActions.watchBlacklistUpdated(client, parameters),
      },
      reward: {
        claim: (parameters) => rewardActions.claim(client, parameters),
        claimSync: (parameters) => rewardActions.claimSync(client, parameters),
        getTotalPerSecond: (parameters) =>
          rewardActions.getTotalPerSecond(client, parameters),
        getUserRewardInfo: (parameters) =>
          rewardActions.getUserRewardInfo(client, parameters),
        setRecipient: (parameters) =>
          rewardActions.setRecipient(client, parameters),
        setRecipientSync: (parameters) =>
          rewardActions.setRecipientSync(client, parameters),
        start: (parameters) => rewardActions.start(client, parameters),
        startSync: (parameters) => rewardActions.startSync(client, parameters),
        watchRewardRecipientSet: (parameters) =>
          rewardActions.watchRewardRecipientSet(client, parameters),
        watchRewardScheduled: (parameters) =>
          rewardActions.watchRewardScheduled(client, parameters),
      },
      token: {
        approve: (parameters) => tokenActions.approve(client, parameters),
        approveSync: (parameters) =>
          tokenActions.approveSync(client, parameters),
        burnBlocked: (parameters) =>
          tokenActions.burnBlocked(client, parameters),
        burnBlockedSync: (parameters) =>
          tokenActions.burnBlockedSync(client, parameters),
        burn: (parameters) => tokenActions.burn(client, parameters),
        burnSync: (parameters) => tokenActions.burnSync(client, parameters),
        changeTransferPolicy: (parameters) =>
          tokenActions.changeTransferPolicy(client, parameters),
        changeTransferPolicySync: (parameters) =>
          tokenActions.changeTransferPolicySync(client, parameters),
        create: (parameters) => tokenActions.create(client, parameters),
        createSync: (parameters) => tokenActions.createSync(client, parameters),
        getAllowance: (parameters) =>
          tokenActions.getAllowance(client, parameters),
        getBalance: (parameters) => tokenActions.getBalance(client, parameters),
        getMetadata: (parameters) =>
          tokenActions.getMetadata(client, parameters),
        getRoleAdmin: (parameters) =>
          tokenActions.getRoleAdmin(client, parameters),
        hasRole: (parameters) => tokenActions.hasRole(client, parameters),
        grantRoles: (parameters) => tokenActions.grantRoles(client, parameters),
        grantRolesSync: (parameters) =>
          tokenActions.grantRolesSync(client, parameters),
        mint: (parameters) => tokenActions.mint(client, parameters),
        mintSync: (parameters) => tokenActions.mintSync(client, parameters),
        pause: (parameters) => tokenActions.pause(client, parameters),
        pauseSync: (parameters) => tokenActions.pauseSync(client, parameters),
        renounceRoles: (parameters) =>
          tokenActions.renounceRoles(client, parameters),
        renounceRolesSync: (parameters) =>
          tokenActions.renounceRolesSync(client, parameters),
        revokeRoles: (parameters) =>
          tokenActions.revokeRoles(client, parameters),
        revokeRolesSync: (parameters) =>
          tokenActions.revokeRolesSync(client, parameters),
        setSupplyCap: (parameters) =>
          tokenActions.setSupplyCap(client, parameters),
        setSupplyCapSync: (parameters) =>
          tokenActions.setSupplyCapSync(client, parameters),
        setRoleAdmin: (parameters) =>
          tokenActions.setRoleAdmin(client, parameters),
        setRoleAdminSync: (parameters) =>
          tokenActions.setRoleAdminSync(client, parameters),
        transfer: (parameters) => tokenActions.transfer(client, parameters),
        transferSync: (parameters) =>
          tokenActions.transferSync(client, parameters),
        unpause: (parameters) => tokenActions.unpause(client, parameters),
        unpauseSync: (parameters) =>
          tokenActions.unpauseSync(client, parameters),
        watchApprove: (parameters) =>
          tokenActions.watchApprove(client, parameters),
        watchBurn: (parameters) => tokenActions.watchBurn(client, parameters),
        watchCreate: (parameters) =>
          tokenActions.watchCreate(client, parameters),
        watchMint: (parameters) => tokenActions.watchMint(client, parameters),
        watchAdminRole: (parameters) =>
          tokenActions.watchAdminRole(client, parameters),
        watchRole: (parameters) => tokenActions.watchRole(client, parameters),
        watchTransfer: (parameters) =>
          tokenActions.watchTransfer(client, parameters),
      },
    }
  }
}
