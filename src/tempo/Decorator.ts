import type * as Account from '../core/Account.js'
import type * as Chain from '../core/Chain.js'
import type * as Client from '../core/Client.js'
import type * as Transport from '../core/Transport.js'
import * as amm from './actions/amm/index.js'
import * as channel from './actions/channel/index.js'
import * as dex from './actions/dex/index.js'
import * as fee from './actions/fee/index.js'
import * as nonce from './actions/nonce/index.js'
import * as policy from './actions/policy/index.js'
import * as receivePolicy from './actions/receivePolicy/index.js'
import * as token from './actions/token/index.js'
import * as validator from './actions/validator/index.js'

/**
 * Bag of Tempo actions bound to a {@link Client.Client}. Pass to
 * `Client.create`'s `.extend`.
 *
 * @example
 * ```ts
 * import { Client, http, tempoActions } from 'viem/tempo'
 *
 * const client = Client.create({
 *   transport: http(),
 * }).extend(tempoActions())
 * const metadata = await client.token.getMetadata({
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 */
export function tempoActions() {
  return <
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account, Transport.Transport>,
  ): Decorator<chain, account> => ({
    amm: {
      burn: (options) => amm.burn(client, options),
      burnSync: (options) => amm.burnSync(client, options),
      getLiquidityBalance: (options) =>
        amm.getLiquidityBalance(client, options),
      getPool: (options) => amm.getPool(client, options),
      mint: (options) => amm.mint(client, options),
      mintSync: (options) => amm.mintSync(client, options),
      rebalanceSwap: (options) => amm.rebalanceSwap(client, options),
      rebalanceSwapSync: (options) => amm.rebalanceSwapSync(client, options),
      watchBurn: (options) => amm.watchBurn(client, options),
      watchMint: (options) => amm.watchMint(client, options),
      watchRebalanceSwap: (options) => amm.watchRebalanceSwap(client, options),
    },
    channel: {
      close: (options) => channel.close(client, options),
      closeSync: (options) => channel.closeSync(client, options),
      getStates: (options) => channel.getStates(client, options),
      open: (options) => channel.open(client, options),
      openSync: (options) => channel.openSync(client, options),
      requestClose: (options) => channel.requestClose(client, options),
      requestCloseSync: (options) => channel.requestCloseSync(client, options),
      settle: (options) => channel.settle(client, options),
      settleSync: (options) => channel.settleSync(client, options),
      signVoucher: (options) => channel.signVoucher(client, options),
      topUp: (options) => channel.topUp(client, options),
      topUpSync: (options) => channel.topUpSync(client, options),
      withdraw: (options) => channel.withdraw(client, options),
      withdrawSync: (options) => channel.withdrawSync(client, options),
    },
    dex: {
      buy: (options) => dex.buy(client, options),
      buySync: (options) => dex.buySync(client, options),
      cancel: (options) => dex.cancel(client, options),
      cancelStale: (options) => dex.cancelStale(client, options),
      cancelStaleSync: (options) => dex.cancelStaleSync(client, options),
      cancelSync: (options) => dex.cancelSync(client, options),
      createPair: (options) => dex.createPair(client, options),
      createPairSync: (options) => dex.createPairSync(client, options),
      getBalance: (options) => dex.getBalance(client, options),
      getBuyQuote: (options) => dex.getBuyQuote(client, options),
      getOrder: (options) => dex.getOrder(client, options),
      getOrderbook: (options) => dex.getOrderbook(client, options),
      getSellQuote: (options) => dex.getSellQuote(client, options),
      getTickLevel: (options) => dex.getTickLevel(client, options),
      place: (options) => dex.place(client, options),
      placeFlip: (options) => dex.placeFlip(client, options),
      placeFlipSync: (options) => dex.placeFlipSync(client, options),
      placeSync: (options) => dex.placeSync(client, options),
      sell: (options) => dex.sell(client, options),
      sellSync: (options) => dex.sellSync(client, options),
      watchFlipOrderPlaced: (options) =>
        dex.watchFlipOrderPlaced(client, options),
      watchOrderCancelled: (options) =>
        dex.watchOrderCancelled(client, options),
      watchOrderFilled: (options) => dex.watchOrderFilled(client, options),
      watchOrderPlaced: (options) => dex.watchOrderPlaced(client, options),
      withdraw: (options) => dex.withdraw(client, options),
      withdrawSync: (options) => dex.withdrawSync(client, options),
    },
    fee: {
      getUserToken: (options) => fee.getUserToken(client, options),
      getValidatorToken: (options) => fee.getValidatorToken(client, options),
      setUserToken: (options) => fee.setUserToken(client, options),
      setUserTokenSync: (options) => fee.setUserTokenSync(client, options),
      setValidatorToken: (options) => fee.setValidatorToken(client, options),
      setValidatorTokenSync: (options) =>
        fee.setValidatorTokenSync(client, options),
      validateToken: (options) => fee.validateToken(client, options),
      watchSetUserToken: (options) => fee.watchSetUserToken(client, options),
      watchSetValidatorToken: (options) =>
        fee.watchSetValidatorToken(client, options),
    },
    nonce: {
      get: (options) => nonce.get(client, options),
      watchIncremented: (options) => nonce.watchIncremented(client, options),
    },
    policy: {
      create: (options) => policy.create(client, options),
      createSync: (options) => policy.createSync(client, options),
      getData: (options) => policy.getData(client, options),
      isAuthorized: (options) => policy.isAuthorized(client, options),
      modifyBlacklist: (options) => policy.modifyBlacklist(client, options),
      modifyBlacklistSync: (options) =>
        policy.modifyBlacklistSync(client, options),
      modifyWhitelist: (options) => policy.modifyWhitelist(client, options),
      modifyWhitelistSync: (options) =>
        policy.modifyWhitelistSync(client, options),
      setAdmin: (options) => policy.setAdmin(client, options),
      setAdminSync: (options) => policy.setAdminSync(client, options),
      watchAdminUpdated: (options) => policy.watchAdminUpdated(client, options),
      watchBlacklistUpdated: (options) =>
        policy.watchBlacklistUpdated(client, options),
      watchCreate: (options) => policy.watchCreate(client, options),
      watchWhitelistUpdated: (options) =>
        policy.watchWhitelistUpdated(client, options),
    },
    receivePolicy: {
      burn: (options) => receivePolicy.burn(client, options),
      burnSync: (options) => receivePolicy.burnSync(client, options),
      claim: (options) => receivePolicy.claim(client, options),
      claimSync: (options) => receivePolicy.claimSync(client, options),
      get: (options) => receivePolicy.get(client, options),
      getBlockedBalance: (options) =>
        receivePolicy.getBlockedBalance(client, options),
      set: (options) => receivePolicy.set(client, options),
      setSync: (options) => receivePolicy.setSync(client, options),
      validate: (options) => receivePolicy.validate(client, options),
      watchBlocked: (options) => receivePolicy.watchBlocked(client, options),
      watchBurned: (options) => receivePolicy.watchBurned(client, options),
      watchClaimed: (options) => receivePolicy.watchClaimed(client, options),
      watchUpdated: (options) => receivePolicy.watchUpdated(client, options),
    },
    token: {
      approve: (options) => token.approve(client, options),
      approveSync: (options) => token.approveSync(client, options),
      burn: (options) => token.burn(client, options),
      burnBlocked: (options) => token.burnBlocked(client, options),
      burnBlockedSync: (options) => token.burnBlockedSync(client, options),
      burnSync: (options) => token.burnSync(client, options),
      changeTransferPolicy: (options) =>
        token.changeTransferPolicy(client, options),
      changeTransferPolicySync: (options) =>
        token.changeTransferPolicySync(client, options),
      create: (options) => token.create(client, options),
      createSync: (options) => token.createSync(client, options),
      getAllowance: (options) => token.getAllowance(client, options),
      getBalance: (options) => token.getBalance(client, options),
      getMetadata: (options) => token.getMetadata(client, options),
      getRoleAdmin: (options) => token.getRoleAdmin(client, options),
      getTotalSupply: (options) => token.getTotalSupply(client, options),
      grantRoles: (options) => token.grantRoles(client, options),
      grantRolesSync: (options) => token.grantRolesSync(client, options),
      hasRole: (options) => token.hasRole(client, options),
      mint: (options) => token.mint(client, options),
      mintSync: (options) => token.mintSync(client, options),
      pause: (options) => token.pause(client, options),
      pauseSync: (options) => token.pauseSync(client, options),
      prepareUpdateQuoteToken: (options) =>
        token.prepareUpdateQuoteToken(client, options),
      prepareUpdateQuoteTokenSync: (options) =>
        token.prepareUpdateQuoteTokenSync(client, options),
      renounceRoles: (options) => token.renounceRoles(client, options),
      renounceRolesSync: (options) => token.renounceRolesSync(client, options),
      revokeRoles: (options) => token.revokeRoles(client, options),
      revokeRolesSync: (options) => token.revokeRolesSync(client, options),
      setRoleAdmin: (options) => token.setRoleAdmin(client, options),
      setRoleAdminSync: (options) => token.setRoleAdminSync(client, options),
      setSupplyCap: (options) => token.setSupplyCap(client, options),
      setSupplyCapSync: (options) => token.setSupplyCapSync(client, options),
      transfer: (options) => token.transfer(client, options),
      transferSync: (options) => token.transferSync(client, options),
      unpause: (options) => token.unpause(client, options),
      unpauseSync: (options) => token.unpauseSync(client, options),
      updateQuoteToken: (options) => token.updateQuoteToken(client, options),
      updateQuoteTokenSync: (options) =>
        token.updateQuoteTokenSync(client, options),
      watchAdminRole: (options) => token.watchAdminRole(client, options),
      watchApprove: (options) => token.watchApprove(client, options),
      watchBurn: (options) => token.watchBurn(client, options),
      watchCreate: (options) => token.watchCreate(client, options),
      watchMint: (options) => token.watchMint(client, options),
      watchRole: (options) => token.watchRole(client, options),
      watchTransfer: (options) => token.watchTransfer(client, options),
      watchUpdateQuoteToken: (options) =>
        token.watchUpdateQuoteToken(client, options),
    },
    validator: {
      add: (options) => validator.add(client, options),
      addSync: (options) => validator.addSync(client, options),
      changeOwner: (options) => validator.changeOwner(client, options),
      changeOwnerSync: (options) => validator.changeOwnerSync(client, options),
      changeStatus: (options) => validator.changeStatus(client, options),
      changeStatusSync: (options) =>
        validator.changeStatusSync(client, options),
      get: (options) => validator.get(client, options),
      getByIndex: (options) => validator.getByIndex(client, options),
      getCount: (options) => validator.getCount(client, options),
      getNextFullDkgCeremony: (options) =>
        validator.getNextFullDkgCeremony(client, options),
      getOwner: (options) => validator.getOwner(client, options),
      list: (options) => validator.list(client, options),
      setNextFullDkgCeremony: (options) =>
        validator.setNextFullDkgCeremony(client, options),
      setNextFullDkgCeremonySync: (options) =>
        validator.setNextFullDkgCeremonySync(client, options),
      update: (options) => validator.update(client, options),
      updateSync: (options) => validator.updateSync(client, options),
    },
  })
}

export type Decorator<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
  account extends Account.Account | undefined = Account.Account | undefined,
> = {
  amm: {
    /**
     * Removes liquidity from a pool.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const hash = await client.amm.burn({
     *   userToken: '0x20c0000000000000000000000000000000000001',
     *   validatorToken: '0x20c0000000000000000000000000000000000002',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction hash.
     */
    burn: (options: amm.burn.Options) => Promise<amm.burn.ReturnType>
    /**
     * Removes liquidity from a pool, and waits for the transaction to be confirmed.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const { receipt, ...event } = await client.amm.burnSync({
     *   userToken: '0x20c0000000000000000000000000000000000001',
     *   validatorToken: '0x20c0000000000000000000000000000000000002',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction receipt and event data.
     */
    burnSync: (
      options: amm.burnSync.Options,
    ) => Promise<amm.burnSync.ReturnType>
    /** Gets the LP token balance for an account in a specific pool. */
    getLiquidityBalance: (
      options: amm.getLiquidityBalance.Options,
    ) => Promise<amm.getLiquidityBalance.ReturnType>
    /**
     * Gets the reserves for a liquidity pool.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem/tempo'
     *
     * const client = Client.create({ transport: http() })
     *
     * const pool = await client.amm.getPool({
     *   userToken: '0x20c0000000000000000000000000000000000001',
     *   validatorToken: '0x20c0000000000000000000000000000000000002',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The pool reserves.
     */
    getPool: (options: amm.getPool.Options) => Promise<amm.getPool.ReturnType>
    /**
     * Adds liquidity to a pool.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const hash = await client.amm.mint({
     *   userToken: '0x20c0000000000000000000000000000000000001',
     *   validatorToken: '0x20c0000000000000000000000000000000000002',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction hash.
     */
    mint: (options: amm.mint.Options) => Promise<amm.mint.ReturnType>
    /**
     * Adds liquidity to a pool, and waits for the transaction to be confirmed.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const { receipt, ...event } = await client.amm.mintSync({
     *   userToken: '0x20c0000000000000000000000000000000000001',
     *   validatorToken: '0x20c0000000000000000000000000000000000002',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction receipt and event data.
     */
    mintSync: (
      options: amm.mintSync.Options,
    ) => Promise<amm.mintSync.ReturnType>
    /**
     * Performs a rebalance swap from validator token to user token.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const hash = await client.amm.rebalanceSwap({
     *   userToken: '0x20c0000000000000000000000000000000000001',
     *   validatorToken: '0x20c0000000000000000000000000000000000002',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction hash.
     */
    rebalanceSwap: (
      options: amm.rebalanceSwap.Options,
    ) => Promise<amm.rebalanceSwap.ReturnType>
    /**
     * Performs a rebalance swap from validator token to user token, and waits for the transaction to be confirmed.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const { receipt, ...event } = await client.amm.rebalanceSwapSync({
     *   userToken: '0x20c0000000000000000000000000000000000001',
     *   validatorToken: '0x20c0000000000000000000000000000000000002',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction receipt and event data.
     */
    rebalanceSwapSync: (
      options: amm.rebalanceSwapSync.Options,
    ) => Promise<amm.rebalanceSwapSync.ReturnType>
    /**
     * Watches `Burn` events on the fee AMM.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem/tempo'
     *
     * const client = Client.create({ transport: http() })
     *
     * const watcher = client.amm.watchBurn()
     * watcher.onLogs((logs) => console.log(logs))
     * ```
     *
     * @param options - Options.
     * @returns A watcher handle.
     */
    watchBurn: (options?: amm.watchBurn.Options) => amm.watchBurn.ReturnType
    /**
     * Watches `Mint` events on the fee AMM.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem/tempo'
     *
     * const client = Client.create({ transport: http() })
     *
     * const watcher = client.amm.watchMint()
     * watcher.onLogs((logs) => console.log(logs))
     * ```
     *
     * @param options - Options.
     * @returns A watcher handle.
     */
    watchMint: (options?: amm.watchMint.Options) => amm.watchMint.ReturnType
    /**
     * Watches `RebalanceSwap` events on the fee AMM.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem/tempo'
     *
     * const client = Client.create({ transport: http() })
     *
     * const watcher = client.amm.watchRebalanceSwap()
     * watcher.onLogs((logs) => console.log(logs))
     * ```
     *
     * @param options - Options.
     * @returns A watcher handle.
     */
    watchRebalanceSwap: (
      options?: amm.watchRebalanceSwap.Options,
    ) => amm.watchRebalanceSwap.ReturnType
  }
  channel: {
    /**
     * Closes a TIP-20 channel reserve channel from the payee or operator side.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const hash = await client.channel.close({
     *   captureAmount: 100n,
     *   cumulativeAmount: 100n,
     *   channel,
     *   signature: '0x…',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction hash.
     */
    close: (options: channel.close.Options) => Promise<channel.close.ReturnType>
    /** Closes a TIP-20 channel reserve channel and waits for the transaction receipt. */
    closeSync: (
      options: channel.closeSync.Options,
    ) => Promise<channel.closeSync.ReturnType>
    /**
     * Gets TIP-20 channel reserve state for a channel ID or channel.
     */
    getStates: <
      const channel_ extends
        | channel.getStates.Channel
        | readonly channel.getStates.Channel[],
    >(
      options: channel.getStates.Options<channel_>,
    ) => Promise<channel.getStates.ReturnType<channel_>>
    /**
     * Opens and funds a TIP-20 channel reserve channel.
     */
    open: (options: channel.open.Options) => Promise<channel.open.ReturnType>
    /** Opens and funds a TIP-20 channel reserve channel and waits for the transaction receipt. */
    openSync: (
      options: channel.openSync.Options,
    ) => Promise<channel.openSync.ReturnType>
    /**
     * Starts the payer close timer for a TIP-20 channel reserve channel.
     */
    requestClose: (
      options: channel.requestClose.Options,
    ) => Promise<channel.requestClose.ReturnType>
    /** Starts the payer close timer and waits for the transaction receipt. */
    requestCloseSync: (
      options: channel.requestCloseSync.Options,
    ) => Promise<channel.requestCloseSync.ReturnType>
    /**
     * Settles a TIP-20 channel reserve voucher.
     */
    settle: (
      options: channel.settle.Options,
    ) => Promise<channel.settle.ReturnType>
    /** Settles a TIP-20 channel reserve voucher and waits for the transaction receipt. */
    settleSync: (
      options: channel.settleSync.Options,
    ) => Promise<channel.settleSync.ReturnType>
    /**
     * Signs a TIP-20 channel reserve voucher.
     */
    signVoucher: (
      options: channel.signVoucher.Options,
    ) => Promise<channel.signVoucher.ReturnType>
    /**
     * Adds deposit to a TIP-20 channel reserve channel.
     */
    topUp: (options: channel.topUp.Options) => Promise<channel.topUp.ReturnType>
    /** Adds deposit to a TIP-20 channel reserve channel and waits for the transaction receipt. */
    topUpSync: (
      options: channel.topUpSync.Options,
    ) => Promise<channel.topUpSync.ReturnType>
    /**
     * Withdraws payer funds after the close grace period elapses.
     */
    withdraw: (
      options: channel.withdraw.Options,
    ) => Promise<channel.withdraw.ReturnType>
    /** Withdraws payer funds after the close grace period elapses and waits for the transaction receipt. */
    withdrawSync: (
      options: channel.withdrawSync.Options,
    ) => Promise<channel.withdrawSync.ReturnType>
  }
  dex: {
    /**
     * Buys a specific amount of tokens.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const hash = await client.dex.buy({
     *   tokenIn: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction hash.
     */
    buy: (options: dex.buy.Options) => Promise<dex.buy.ReturnType>
    /**
     * Buys a specific amount of tokens., and waits for the transaction to be confirmed.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const result = await client.dex.buySync({
     *   tokenIn: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction receipt.
     */
    buySync: (options: dex.buySync.Options) => Promise<dex.buySync.ReturnType>
    /**
     * Cancels an order from the orderbook.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const hash = await client.dex.cancel({
     *   orderId: 100n,
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction hash.
     */
    cancel: (options: dex.cancel.Options) => Promise<dex.cancel.ReturnType>
    /**
     * Cancels a stale order from the orderbook.
     *
     * A stale order is one where the owner's balance or allowance has dropped
     * below the order amount.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const hash = await client.dex.cancelStale({
     *   orderId: 100n,
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction hash.
     */
    cancelStale: (
      options: dex.cancelStale.Options,
    ) => Promise<dex.cancelStale.ReturnType>
    /**
     * Cancels a stale order from the orderbook., and waits for the transaction to be confirmed.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const result = await client.dex.cancelStaleSync({
     *   orderId: 100n,
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction receipt and event data.
     */
    cancelStaleSync: (
      options: dex.cancelStaleSync.Options,
    ) => Promise<dex.cancelStaleSync.ReturnType>
    /**
     * Cancels an order from the orderbook., and waits for the transaction to be confirmed.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const result = await client.dex.cancelSync({
     *   orderId: 100n,
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction receipt and event data.
     */
    cancelSync: (
      options: dex.cancelSync.Options,
    ) => Promise<dex.cancelSync.ReturnType>
    /**
     * Creates a new trading pair on the DEX.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const hash = await client.dex.createPair({
     *   base: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction hash.
     */
    createPair: (
      options: dex.createPair.Options,
    ) => Promise<dex.createPair.ReturnType>
    /**
     * Creates a new trading pair on the DEX., and waits for the transaction to be confirmed.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const result = await client.dex.createPairSync({
     *   base: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction receipt and event data.
     */
    createPairSync: (
      options: dex.createPairSync.Options,
    ) => Promise<dex.createPairSync.ReturnType>
    /**
     * Gets a user's token balance on the DEX.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const balance = await client.dex.getBalance({
     *   token: 1n,
     * })
     * ```
     *
     * @param options - Options.
     * @returns The user's token balance on the DEX.
     */
    getBalance: (
      options: dex.getBalance.Options,
    ) => Promise<dex.getBalance.ReturnType>
    /**
     * Gets the quote for buying a specific amount of tokens.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem/tempo'
     *
     * const client = Client.create({ transport: http() })
     *
     * const amountIn = await client.dex.getBuyQuote({
     *   amountOut: 100_000000n,
     *   tokenIn: 1n,
     *   tokenOut: 2n,
     * })
     * ```
     *
     * @param options - Options.
     * @returns The amount of tokenIn needed to buy the specified amountOut.
     */
    getBuyQuote: (
      options: dex.getBuyQuote.Options,
    ) => Promise<dex.getBuyQuote.ReturnType>
    /** Gets an order's details from the orderbook. */
    getOrder: (
      options: dex.getOrder.Options,
    ) => Promise<dex.getOrder.ReturnType>
    /** Gets orderbook information for a trading pair. */
    getOrderbook: (
      options: dex.getOrderbook.Options,
    ) => Promise<dex.getOrderbook.ReturnType>
    /**
     * Gets the quote for selling a specific amount of tokens.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem/tempo'
     *
     * const client = Client.create({ transport: http() })
     *
     * const amountOut = await client.dex.getSellQuote({
     *   amountIn: 100_000000n,
     *   tokenIn: 1n,
     *   tokenOut: 2n,
     * })
     * ```
     *
     * @param options - Options.
     * @returns The amount of tokenOut received for selling the specified amountIn.
     */
    getSellQuote: (
      options: dex.getSellQuote.Options,
    ) => Promise<dex.getSellQuote.ReturnType>
    /** Gets the price level information at a specific tick. */
    getTickLevel: (
      options: dex.getTickLevel.Options,
    ) => Promise<dex.getTickLevel.ReturnType>
    /**
     * Places a limit order on the orderbook.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const hash = await client.dex.place({
     *   amount: 100n,
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction hash.
     */
    place: (options: dex.place.Options) => Promise<dex.place.ReturnType>
    /**
     * Places a flip order that automatically flips when filled.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const hash = await client.dex.placeFlip({
     *   amount: 100n,
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction hash.
     */
    placeFlip: (
      options: dex.placeFlip.Options,
    ) => Promise<dex.placeFlip.ReturnType>
    /**
     * Places a flip order that automatically flips when filled., and waits for the transaction to be confirmed.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const result = await client.dex.placeFlipSync({
     *   amount: 100n,
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction receipt and event data.
     */
    placeFlipSync: (
      options: dex.placeFlipSync.Options,
    ) => Promise<dex.placeFlipSync.ReturnType>
    /**
     * Places a limit order on the orderbook., and waits for the transaction to be confirmed.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const result = await client.dex.placeSync({
     *   amount: 100n,
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction receipt and event data.
     */
    placeSync: (
      options: dex.placeSync.Options,
    ) => Promise<dex.placeSync.ReturnType>
    /**
     * Sells a specific amount of tokens.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const hash = await client.dex.sell({
     *   tokenIn: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction hash.
     */
    sell: (options: dex.sell.Options) => Promise<dex.sell.ReturnType>
    /**
     * Sells a specific amount of tokens., and waits for the transaction to be confirmed.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const result = await client.dex.sellSync({
     *   tokenIn: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction receipt.
     */
    sellSync: (
      options: dex.sellSync.Options,
    ) => Promise<dex.sellSync.ReturnType>
    /**
     * Watches for flip order placed events.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem/tempo'
     *
     * const client = Client.create({ transport: http() })
     *
     * const watcher = client.dex.watchFlipOrderPlaced()
     * watcher.onLogs((logs) => console.log(logs))
     * ```
     *
     * @param options - Options.
     * @returns A watcher handle.
     */
    watchFlipOrderPlaced: (
      options?: dex.watchFlipOrderPlaced.Options,
    ) => dex.watchFlipOrderPlaced.ReturnType
    /**
     * Watches for order cancelled events.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem/tempo'
     *
     * const client = Client.create({ transport: http() })
     *
     * const watcher = client.dex.watchOrderCancelled()
     * watcher.onLogs((logs) => console.log(logs))
     * ```
     *
     * @param options - Options.
     * @returns A watcher handle.
     */
    watchOrderCancelled: (
      options?: dex.watchOrderCancelled.Options,
    ) => dex.watchOrderCancelled.ReturnType
    /**
     * Watches for order filled events.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem/tempo'
     *
     * const client = Client.create({ transport: http() })
     *
     * const watcher = client.dex.watchOrderFilled()
     * watcher.onLogs((logs) => console.log(logs))
     * ```
     *
     * @param options - Options.
     * @returns A watcher handle.
     */
    watchOrderFilled: (
      options?: dex.watchOrderFilled.Options,
    ) => dex.watchOrderFilled.ReturnType
    /**
     * Watches for order placed events.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem/tempo'
     *
     * const client = Client.create({ transport: http() })
     *
     * const watcher = client.dex.watchOrderPlaced()
     * watcher.onLogs((logs) => console.log(logs))
     * ```
     *
     * @param options - Options.
     * @returns A watcher handle.
     */
    watchOrderPlaced: (
      options?: dex.watchOrderPlaced.Options,
    ) => dex.watchOrderPlaced.ReturnType
    /**
     * Withdraws tokens from the DEX to the caller's wallet.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const hash = await client.dex.withdraw({
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction hash.
     */
    withdraw: (
      options: dex.withdraw.Options,
    ) => Promise<dex.withdraw.ReturnType>
    /**
     * Withdraws tokens from the DEX to the caller's wallet., and waits for the transaction to be confirmed.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const result = await client.dex.withdrawSync({
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction receipt.
     */
    withdrawSync: (
      options: dex.withdrawSync.Options,
    ) => Promise<dex.withdrawSync.ReturnType>
  }
  fee: {
    /**
     * Gets an account's default fee token.
     *
     * Returns `null` when the account has no fee token preference set.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const token = await client.fee.getUserToken()
     * ```
     *
     * @param options - Options.
     * @returns The account's fee token address and id, or `null` if unset.
     */
    getUserToken: (
      options?: fee.getUserToken.Options,
    ) => Promise<fee.getUserToken.ReturnType>
    /**
     * Gets a validator's preferred fee token.
     *
     * Returns `null` when the validator has no fee token preference set.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem/tempo'
     *
     * const client = Client.create({ transport: http() })
     *
     * const token = await client.fee.getValidatorToken({
     *   validator: '0x…',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The validator's fee token address and id, or `null` if unset.
     */
    getValidatorToken: (
      options: fee.getValidatorToken.Options,
    ) => Promise<fee.getValidatorToken.ReturnType>
    /**
     * Sets the calling account's default fee token.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const hash = await client.fee.setUserToken({
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction hash.
     */
    setUserToken: (
      options: fee.setUserToken.Options,
    ) => Promise<fee.setUserToken.ReturnType>
    /**
     * Sets the calling account's default fee token, and waits for the
     * transaction to be confirmed.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const { receipt, ...event } = await client.fee.setUserTokenSync({
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction receipt and event data.
     */
    setUserTokenSync: (
      options: fee.setUserTokenSync.Options,
    ) => Promise<fee.setUserTokenSync.ReturnType>
    /**
     * Sets the calling validator's preferred fee token.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const hash = await client.fee.setValidatorToken({
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction hash.
     */
    setValidatorToken: (
      options: fee.setValidatorToken.Options,
    ) => Promise<fee.setValidatorToken.ReturnType>
    /**
     * Sets the calling validator's preferred fee token, and waits for the
     * transaction to be confirmed.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const { receipt, ...event } = await client.fee.setValidatorTokenSync({
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction receipt and event data.
     */
    setValidatorTokenSync: (
      options: fee.setValidatorTokenSync.Options,
    ) => Promise<fee.setValidatorTokenSync.ReturnType>
    /**
     * Validates that a token can be used as a Tempo fee token.
     *
     * Fee tokens must be unpaused USD-denominated TIP-20 tokens.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem/tempo'
     *
     * const client = Client.create({ transport: http() })
     *
     * const { address, id, metadata } = await client.fee.validateToken({
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The fee token address, id, and metadata.
     */
    validateToken: (
      options: fee.validateToken.Options,
    ) => Promise<fee.validateToken.ReturnType>
    /**
     * Watches `UserTokenSet` events on the fee manager.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem/tempo'
     *
     * const client = Client.create({ transport: http() })
     *
     * const watcher = client.fee.watchSetUserToken()
     * watcher.onLogs((logs) => console.log(logs))
     * ```
     *
     * @param options - Options.
     * @returns A watcher handle.
     */
    watchSetUserToken: (
      options?: fee.watchSetUserToken.Options,
    ) => fee.watchSetUserToken.ReturnType
    /**
     * Watches `ValidatorTokenSet` events on the fee manager.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem/tempo'
     *
     * const client = Client.create({ transport: http() })
     *
     * const watcher = client.fee.watchSetValidatorToken()
     * watcher.onLogs((logs) => console.log(logs))
     * ```
     *
     * @param options - Options.
     * @returns A watcher handle.
     */
    watchSetValidatorToken: (
      options?: fee.watchSetValidatorToken.Options,
    ) => fee.watchSetValidatorToken.ReturnType
  }
  nonce: {
    /**
     * Gets the nonce for an account and nonce key (2D nonces, TIP-1009).
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const nonce = await client.nonce.get({ nonceKey: 1n })
     * ```
     *
     * @param options - Options.
     * @returns The nonce value.
     */
    get: (options: nonce.get.Options) => Promise<nonce.get.ReturnType>
    /**
     * Watches `NonceIncremented` events on the nonce manager (2D nonces,
     * TIP-1009).
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem/tempo'
     *
     * const client = Client.create({ transport: http() })
     *
     * const watcher = client.nonce.watchIncremented()
     * watcher.onLogs((logs) => console.log(logs))
     * ```
     *
     * @param options - Options.
     * @returns A watcher handle.
     */
    watchIncremented: (
      options?: nonce.watchIncremented.Options,
    ) => nonce.watchIncremented.ReturnType
  }
  policy: {
    /** Creates a TIP-403 transfer policy. */
    create: (
      options: policy.create.Options<account>,
    ) => Promise<policy.create.ReturnType>
    /** Creates a TIP-403 transfer policy, and waits for the transaction to be confirmed. */
    createSync: (
      options: policy.createSync.Options<account>,
    ) => Promise<policy.createSync.ReturnType>
    /** Gets TIP-403 transfer policy data. */
    getData: (
      options: policy.getData.Options,
    ) => Promise<policy.getData.ReturnType>
    /** Checks if a user is authorized by a TIP-403 transfer policy. */
    isAuthorized: (
      options: policy.isAuthorized.Options,
    ) => Promise<policy.isAuthorized.ReturnType>
    /** Modifies a TIP-403 transfer policy blacklist. */
    modifyBlacklist: (
      options: policy.modifyBlacklist.Options,
    ) => Promise<policy.modifyBlacklist.ReturnType>
    /** Modifies a TIP-403 transfer policy blacklist, and waits for the transaction to be confirmed. */
    modifyBlacklistSync: (
      options: policy.modifyBlacklistSync.Options,
    ) => Promise<policy.modifyBlacklistSync.ReturnType>
    /** Modifies a TIP-403 transfer policy whitelist. */
    modifyWhitelist: (
      options: policy.modifyWhitelist.Options,
    ) => Promise<policy.modifyWhitelist.ReturnType>
    /** Modifies a TIP-403 transfer policy whitelist, and waits for the transaction to be confirmed. */
    modifyWhitelistSync: (
      options: policy.modifyWhitelistSync.Options,
    ) => Promise<policy.modifyWhitelistSync.ReturnType>
    /** Sets the admin for a TIP-403 transfer policy. */
    setAdmin: (
      options: policy.setAdmin.Options,
    ) => Promise<policy.setAdmin.ReturnType>
    /** Sets the admin for a TIP-403 transfer policy, and waits for the transaction to be confirmed. */
    setAdminSync: (
      options: policy.setAdminSync.Options,
    ) => Promise<policy.setAdminSync.ReturnType>
    /** Watches `PolicyAdminUpdated` events on the TIP-403 registry. */
    watchAdminUpdated: (
      options?: policy.watchAdminUpdated.Options,
    ) => policy.watchAdminUpdated.ReturnType
    /** Watches `BlacklistUpdated` events on the TIP-403 registry. */
    watchBlacklistUpdated: (
      options?: policy.watchBlacklistUpdated.Options,
    ) => policy.watchBlacklistUpdated.ReturnType
    /** Watches `PolicyCreated` events on the TIP-403 registry. */
    watchCreate: (
      options?: policy.watchCreate.Options,
    ) => policy.watchCreate.ReturnType
    /** Watches `WhitelistUpdated` events on the TIP-403 registry. */
    watchWhitelistUpdated: (
      options?: policy.watchWhitelistUpdated.Options,
    ) => policy.watchWhitelistUpdated.ReturnType
  }
  receivePolicy: {
    /** Burns the funds backing a blocked receipt. */
    burn: (
      options: receivePolicy.burn.Options,
    ) => Promise<receivePolicy.burn.ReturnType>
    /** Burns the funds backing a blocked receipt and waits for the transaction to be confirmed. */
    burnSync: (
      options: receivePolicy.burnSync.Options,
    ) => Promise<receivePolicy.burnSync.ReturnType>
    /** Claims blocked funds for a receipt. */
    claim: (
      options: receivePolicy.claim.Options,
    ) => Promise<receivePolicy.claim.ReturnType>
    /** Claims blocked funds for a receipt and waits for the transaction to be confirmed. */
    claimSync: (
      options: receivePolicy.claimSync.Options,
    ) => Promise<receivePolicy.claimSync.ReturnType>
    /** Gets the receive policy configured for an account. */
    get: (
      options: receivePolicy.get.Options,
    ) => Promise<receivePolicy.get.ReturnType>
    /** Gets the blocked balance for an encoded receipt. */
    getBlockedBalance: (
      options: receivePolicy.getBlockedBalance.Options,
    ) => Promise<receivePolicy.getBlockedBalance.ReturnType>
    /** Sets the receive policy for the calling account. */
    set: (
      options: receivePolicy.set.Options,
    ) => Promise<receivePolicy.set.ReturnType>
    /** Sets the receive policy for the calling account and waits for the transaction to be confirmed. */
    setSync: (
      options: receivePolicy.setSync.Options,
    ) => Promise<receivePolicy.setSync.ReturnType>
    /** Checks whether a transfer or mint to a receiver is allowed by the receiver's receive policy. */
    validate: (
      options: receivePolicy.validate.Options,
    ) => Promise<receivePolicy.validate.ReturnType>
    /** Watches for blocked transfer events. */
    watchBlocked: (
      options?: receivePolicy.watchBlocked.Options,
    ) => receivePolicy.watchBlocked.ReturnType
    /** Watches for receipt burned events. */
    watchBurned: (
      options?: receivePolicy.watchBurned.Options,
    ) => receivePolicy.watchBurned.ReturnType
    /** Watches for receipt claimed events. */
    watchClaimed: (
      options?: receivePolicy.watchClaimed.Options,
    ) => receivePolicy.watchClaimed.ReturnType
    /** Watches for receive policy update events. */
    watchUpdated: (
      options?: receivePolicy.watchUpdated.Options,
    ) => receivePolicy.watchUpdated.ReturnType
  }
  token: {
    /**
     * Approves a spender to transfer TIP-20 tokens on behalf of the caller.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const hash = await client.token.approve({
     *   amount: 100n,
     *   spender: '0x…',
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction hash.
     */
    approve: (
      options: token.approve.Options,
    ) => Promise<token.approve.ReturnType>
    /**
     * Approves a spender to transfer TIP-20 tokens on behalf of the caller, and
     * waits for the transaction to be confirmed.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const { receipt, ...event } = await client.token.approveSync({
     *   amount: 100n,
     *   spender: '0x…',
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction receipt and event data.
     */
    approveSync: (
      options: token.approveSync.Options,
    ) => Promise<token.approveSync.ReturnType>
    /**
     * Burns TIP-20 tokens from the caller's balance.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const hash = await client.token.burn({
     *   amount: 100n,
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction hash.
     */
    burn: (options: token.burn.Options) => Promise<token.burn.ReturnType>
    /**
     * Burns TIP-20 tokens from a blocked address.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const hash = await client.token.burnBlocked({
     *   amount: 100n,
     *   from: '0x…',
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction hash.
     */
    burnBlocked: (
      options: token.burnBlocked.Options,
    ) => Promise<token.burnBlocked.ReturnType>
    /**
     * Burns TIP-20 tokens from a blocked address, and waits for the transaction to
     * be confirmed.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const { receipt, ...event } = await client.token.burnBlockedSync({
     *   amount: 100n,
     *   from: '0x…',
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction receipt and event data.
     */
    burnBlockedSync: (
      options: token.burnBlockedSync.Options,
    ) => Promise<token.burnBlockedSync.ReturnType>
    /**
     * Burns TIP-20 tokens from the caller's balance, and waits for the transaction
     * to be confirmed.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const { receipt, ...event } = await client.token.burnSync({
     *   amount: 100n,
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction receipt and event data.
     */
    burnSync: (
      options: token.burnSync.Options,
    ) => Promise<token.burnSync.ReturnType>
    /**
     * Changes the transfer policy ID for a TIP-20 token.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const hash = await client.token.changeTransferPolicy({
     *   policyId: 1n,
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction hash.
     */
    changeTransferPolicy: (
      options: token.changeTransferPolicy.Options,
    ) => Promise<token.changeTransferPolicy.ReturnType>
    /**
     * Changes the transfer policy ID for a TIP-20 token, and waits for the
     * transaction to be confirmed.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const { receipt, ...event } = await client.token.changeTransferPolicySync({
     *   policyId: 1n,
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction receipt and event data.
     */
    changeTransferPolicySync: (
      options: token.changeTransferPolicySync.Options,
    ) => Promise<token.changeTransferPolicySync.ReturnType>
    /**
     * Creates a new TIP-20 token.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const hash = await client.token.create({
     *   currency: 'USD',
     *   logoURI: 'https://example.com/token.svg',
     *   name: 'My Token',
     *   symbol: 'MTK',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction hash.
     */
    create: (
      options: token.create.Options<account>,
    ) => Promise<token.create.ReturnType>
    /**
     * Creates a new TIP-20 token, and waits for the transaction to be confirmed.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const { receipt, ...event } = await client.token.createSync({
     *   currency: 'USD',
     *   logoURI: 'https://example.com/token.svg',
     *   name: 'My Token',
     *   symbol: 'MTK',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction receipt and event data.
     */
    createSync: (
      options: token.createSync.Options<account>,
    ) => Promise<token.createSync.ReturnType>
    /**
     * Gets the TIP-20 allowance a spender has over an account's tokens.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   transport: http(),
     * })
     *
     * const allowance = await client.token.getAllowance({
     *   account: '0x…',
     *   spender: '0x…',
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The allowance, in base units and human-readable form.
     */
    getAllowance: (
      options: token.getAllowance.Options,
    ) => Promise<token.getAllowance.ReturnType>
    /**
     * Gets the TIP-20 token balance of an account.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const balance = await client.token.getBalance({
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The token balance, in base units and human-readable form.
     */
    getBalance: (
      options: token.getBalance.Options,
    ) => Promise<token.getBalance.ReturnType>
    /**
     * Gets TIP-20 token metadata including name, symbol, logo URI, currency,
     * decimals, and total supply.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   transport: http(),
     * })
     *
     * const metadata = await client.token.getMetadata({
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The token metadata.
     */
    getMetadata: (
      options: token.getMetadata.Options,
    ) => Promise<token.getMetadata.ReturnType>
    /**
     * Gets the admin role for a specific role in a TIP-20 token.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   transport: http(),
     * })
     *
     * const adminRole = await client.token.getRoleAdmin({
     *   role: 'issuer',
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The admin role hash.
     */
    getRoleAdmin: (
      options: token.getRoleAdmin.Options,
    ) => Promise<token.getRoleAdmin.ReturnType>
    /**
     * Gets the total supply of a TIP-20 token.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   transport: http(),
     * })
     *
     * const totalSupply = await client.token.getTotalSupply({
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The token total supply, in base units and human-readable form.
     */
    getTotalSupply: (
      options: token.getTotalSupply.Options,
    ) => Promise<token.getTotalSupply.ReturnType>
    /**
     * Grants roles for a TIP-20 token.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const hash = await client.token.grantRoles({
     *   roles: ['issuer'],
     *   to: '0x…',
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction hash.
     */
    grantRoles: (
      options: token.grantRoles.Options,
    ) => Promise<token.grantRoles.ReturnType>
    /**
     * Grants roles for a TIP-20 token, and waits for the transaction to be confirmed.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const { receipt, value } = await client.token.grantRolesSync({
     *   roles: ['issuer'],
     *   to: '0x…',
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction receipt and event data.
     */
    grantRolesSync: (
      options: token.grantRolesSync.Options,
    ) => Promise<token.grantRolesSync.ReturnType>
    /**
     * Checks if an account has a specific role for a TIP-20 token.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const hasRole = await client.token.hasRole({
     *   role: 'issuer',
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns Whether the account has the role.
     */
    hasRole: (
      options: token.hasRole.Options,
    ) => Promise<token.hasRole.ReturnType>
    /**
     * Mints TIP-20 tokens to an address.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const hash = await client.token.mint({
     *   amount: 100n,
     *   to: '0x…',
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction hash.
     */
    mint: (options: token.mint.Options) => Promise<token.mint.ReturnType>
    /**
     * Mints TIP-20 tokens to an address, and waits for the transaction to be confirmed.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const { receipt, ...event } = await client.token.mintSync({
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction receipt and event data.
     */
    mintSync: (
      options: token.mintSync.Options,
    ) => Promise<token.mintSync.ReturnType>
    /**
     * Pauses a TIP-20 token.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const hash = await client.token.pause({
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction hash.
     */
    pause: (options: token.pause.Options) => Promise<token.pause.ReturnType>
    /**
     * Pauses a TIP-20 token, and waits for the transaction to be confirmed.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const { receipt, ...event } = await client.token.pauseSync({
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction receipt and event data.
     */
    pauseSync: (
      options: token.pauseSync.Options,
    ) => Promise<token.pauseSync.ReturnType>
    /**
     * Prepares a quote token update for a TIP-20 token.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const hash = await client.token.prepareUpdateQuoteToken({
     *   quoteToken: '0x20c0000000000000000000000000000000000002',
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction hash.
     */
    prepareUpdateQuoteToken: (
      options: token.prepareUpdateQuoteToken.Options,
    ) => Promise<token.prepareUpdateQuoteToken.ReturnType>
    /**
     * Prepares a quote token update for a TIP-20 token, and waits for the
     * transaction to be confirmed.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const { receipt, ...event } = await client.token.prepareUpdateQuoteTokenSync({
     *   quoteToken: '0x20c0000000000000000000000000000000000002',
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction receipt and event data.
     */
    prepareUpdateQuoteTokenSync: (
      options: token.prepareUpdateQuoteTokenSync.Options,
    ) => Promise<token.prepareUpdateQuoteTokenSync.ReturnType>
    /**
     * Renounces roles for a TIP-20 token.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const hash = await client.token.renounceRoles({
     *   roles: ['issuer'],
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction hash.
     */
    renounceRoles: (
      options: token.renounceRoles.Options,
    ) => Promise<token.renounceRoles.ReturnType>
    /**
     * Renounces roles for a TIP-20 token, and waits for the transaction to be confirmed.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const { receipt, value } = await client.token.renounceRolesSync({
     *   roles: ['issuer'],
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction receipt and event data.
     */
    renounceRolesSync: (
      options: token.renounceRolesSync.Options,
    ) => Promise<token.renounceRolesSync.ReturnType>
    /**
     * Revokes roles for a TIP-20 token.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const hash = await client.token.revokeRoles({
     *   roles: ['issuer'],
     *   from: '0x…',
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction hash.
     */
    revokeRoles: (
      options: token.revokeRoles.Options,
    ) => Promise<token.revokeRoles.ReturnType>
    /**
     * Revokes roles for a TIP-20 token, and waits for the transaction to be confirmed.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const { receipt, value } = await client.token.revokeRolesSync({
     *   roles: ['issuer'],
     *   from: '0x…',
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction receipt and event data.
     */
    revokeRolesSync: (
      options: token.revokeRolesSync.Options,
    ) => Promise<token.revokeRolesSync.ReturnType>
    /**
     * Sets the admin role for a specific role in a TIP-20 token.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const hash = await client.token.setRoleAdmin({
     *   adminRole: 'admin',
     *   role: 'issuer',
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction hash.
     */
    setRoleAdmin: (
      options: token.setRoleAdmin.Options,
    ) => Promise<token.setRoleAdmin.ReturnType>
    /**
     * Sets the admin role for a specific role in a TIP-20 token, and waits for the transaction to be confirmed.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const { receipt, ...event } = await client.token.setRoleAdminSync({
     *   adminRole: 'admin',
     *   role: 'issuer',
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction receipt and event data.
     */
    setRoleAdminSync: (
      options: token.setRoleAdminSync.Options,
    ) => Promise<token.setRoleAdminSync.ReturnType>
    /**
     * Sets the supply cap for a TIP-20 token.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const hash = await client.token.setSupplyCap({
     *   supplyCap: 1_000_000n,
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction hash.
     */
    setSupplyCap: (
      options: token.setSupplyCap.Options,
    ) => Promise<token.setSupplyCap.ReturnType>
    /**
     * Sets the supply cap for a TIP-20 token, and waits for the transaction to be confirmed.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const { receipt, ...event } = await client.token.setSupplyCapSync({
     *   supplyCap: 1_000_000n,
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction receipt and event data.
     */
    setSupplyCapSync: (
      options: token.setSupplyCapSync.Options,
    ) => Promise<token.setSupplyCapSync.ReturnType>
    /**
     * Transfers TIP-20 tokens to another address.
     *
     * Pass `from` to transfer on behalf of another address using an allowance
     * (calls `transferFrom`); otherwise transfers from the caller (calls
     * `transfer`). Pass `memo` to use the memo-carrying transfer function.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const hash = await client.token.transfer({
     *   amount: 100n,
     *   to: '0x…',
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction hash.
     */
    transfer: (
      options: token.transfer.Options,
    ) => Promise<token.transfer.ReturnType>
    /**
     * Transfers TIP-20 tokens to another address, and waits for the transaction to be confirmed.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const { receipt, ...event } = await client.token.transferSync({
     *   amount: 100n,
     *   to: '0x…',
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction receipt and event data.
     */
    transferSync: (
      options: token.transferSync.Options,
    ) => Promise<token.transferSync.ReturnType>
    /**
     * Unpauses a TIP-20 token.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const hash = await client.token.unpause({
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction hash.
     */
    unpause: (
      options: token.unpause.Options,
    ) => Promise<token.unpause.ReturnType>
    /**
     * Unpauses a TIP-20 token, and waits for the transaction to be confirmed.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const { receipt, ...event } = await client.token.unpauseSync({
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction receipt and event data.
     */
    unpauseSync: (
      options: token.unpauseSync.Options,
    ) => Promise<token.unpauseSync.ReturnType>
    /**
     * Completes a prepared quote token update for a TIP-20 token.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const hash = await client.token.updateQuoteToken({
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction hash.
     */
    updateQuoteToken: (
      options: token.updateQuoteToken.Options,
    ) => Promise<token.updateQuoteToken.ReturnType>
    /**
     * Completes a prepared quote token update for a TIP-20 token, and waits for
     * the transaction to be confirmed.
     *
     * @example
     * ```ts
     * import { Account, Client, http } from 'viem/tempo'
     *
     * const client = Client.create({
     *   account: Account.fromSecp256k1('0x…'),
     *   transport: http(),
     * })
     *
     * const { receipt, ...event } = await client.token.updateQuoteTokenSync({
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * ```
     *
     * @param options - Options.
     * @returns The transaction receipt and event data.
     */
    updateQuoteTokenSync: (
      options: token.updateQuoteTokenSync.Options,
    ) => Promise<token.updateQuoteTokenSync.ReturnType>
    /**
     * Watches TIP-20 `RoleAdminUpdated` events for a token.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem/tempo'
     *
     * const client = Client.create({ transport: http() })
     *
     * const watcher = client.token.watchAdminRole({
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * watcher.onLogs((logs) => console.log(logs))
     * ```
     *
     * @param options - Options.
     * @returns A watcher handle.
     */
    watchAdminRole: (
      options: token.watchAdminRole.Options,
    ) => token.watchAdminRole.ReturnType
    /**
     * Watches TIP-20 `Approval` events for a token.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem/tempo'
     *
     * const client = Client.create({ transport: http() })
     *
     * const watcher = client.token.watchApprove({
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * watcher.onLogs((logs) => console.log(logs))
     * ```
     *
     * @param options - Options.
     * @returns A watcher handle.
     */
    watchApprove: (
      options: token.watchApprove.Options,
    ) => token.watchApprove.ReturnType
    /**
     * Watches TIP-20 `Burn` events for a token.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem/tempo'
     *
     * const client = Client.create({ transport: http() })
     *
     * const watcher = client.token.watchBurn({
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * watcher.onLogs((logs) => console.log(logs))
     * ```
     *
     * @param options - Options.
     * @returns A watcher handle.
     */
    watchBurn: (options: token.watchBurn.Options) => token.watchBurn.ReturnType
    /**
     * Watches TIP-20 `TokenCreated` events from the token factory.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem/tempo'
     *
     * const client = Client.create({ transport: http() })
     *
     * const watcher = client.token.watchCreate({})
     * watcher.onLogs((logs) => console.log(logs))
     * ```
     *
     * @param options - Options.
     * @returns A watcher handle.
     */
    watchCreate: (
      options: token.watchCreate.Options,
    ) => token.watchCreate.ReturnType
    /**
     * Watches TIP-20 `Mint` events for a token.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem/tempo'
     *
     * const client = Client.create({ transport: http() })
     *
     * const watcher = client.token.watchMint({
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * watcher.onLogs((logs) => console.log(logs))
     * ```
     *
     * @param options - Options.
     * @returns A watcher handle.
     */
    watchMint: (options: token.watchMint.Options) => token.watchMint.ReturnType
    /**
     * Watches TIP-20 `RoleMembershipUpdated` events for a token.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem/tempo'
     *
     * const client = Client.create({ transport: http() })
     *
     * const watcher = client.token.watchRole({
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * watcher.onLogs((logs) => console.log(logs))
     * ```
     *
     * @param options - Options.
     * @returns A watcher handle.
     */
    watchRole: (options: token.watchRole.Options) => token.watchRole.ReturnType
    /**
     * Watches TIP-20 `Transfer` events for a token.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem/tempo'
     *
     * const client = Client.create({ transport: http() })
     *
     * const watcher = client.token.watchTransfer({
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * watcher.onLogs((logs) => console.log(logs))
     * ```
     *
     * @param options - Options.
     * @returns A watcher handle.
     */
    watchTransfer: (
      options: token.watchTransfer.Options,
    ) => token.watchTransfer.ReturnType
    /**
     * Watches TIP-20 quote token update events for a token.
     *
     * @example
     * ```ts
     * import { Client, http } from 'viem/tempo'
     *
     * const client = Client.create({ transport: http() })
     *
     * const watcher = client.token.watchUpdateQuoteToken({
     *   token: '0x20c0000000000000000000000000000000000001',
     * })
     * watcher.onLogs((logs) => console.log(logs))
     * ```
     *
     * @param options - Options.
     * @returns A watcher handle.
     */
    watchUpdateQuoteToken: (
      options: token.watchUpdateQuoteToken.Options,
    ) => token.watchUpdateQuoteToken.ReturnType
  }
  validator: {
    /** Adds a new validator. */
    add: (options: validator.add.Options) => Promise<validator.add.ReturnType>
    /** Adds a new validator, and waits for the transaction to be confirmed. */
    addSync: (
      options: validator.addSync.Options,
    ) => Promise<validator.addSync.ReturnType>
    /** Changes the owner of the validator config precompile. */
    changeOwner: (
      options: validator.changeOwner.Options,
    ) => Promise<validator.changeOwner.ReturnType>
    /** Changes the owner of the validator config precompile, and waits for the transaction to be confirmed. */
    changeOwnerSync: (
      options: validator.changeOwnerSync.Options,
    ) => Promise<validator.changeOwnerSync.ReturnType>
    /** Changes validator active status. */
    changeStatus: (
      options: validator.changeStatus.Options,
    ) => Promise<validator.changeStatus.ReturnType>
    /** Changes validator active status, and waits for the transaction to be confirmed. */
    changeStatusSync: (
      options: validator.changeStatusSync.Options,
    ) => Promise<validator.changeStatusSync.ReturnType>
    /** Gets validator information by address. */
    get: (options: validator.get.Options) => Promise<validator.get.ReturnType>
    /** Gets a validator address by index. */
    getByIndex: (
      options: validator.getByIndex.Options,
    ) => Promise<validator.getByIndex.ReturnType>
    /** Gets the total number of validators. */
    getCount: (
      options?: validator.getCount.Options,
    ) => Promise<validator.getCount.ReturnType>
    /** Gets the next epoch for a full DKG ceremony. */
    getNextFullDkgCeremony: (
      options?: validator.getNextFullDkgCeremony.Options,
    ) => Promise<validator.getNextFullDkgCeremony.ReturnType>
    /** Gets the validator config owner. */
    getOwner: (
      options?: validator.getOwner.Options,
    ) => Promise<validator.getOwner.ReturnType>
    /** Gets the complete set of validators. */
    list: (
      options?: validator.list.Options,
    ) => Promise<validator.list.ReturnType>
    /** Sets the next epoch for a full DKG ceremony. */
    setNextFullDkgCeremony: (
      options: validator.setNextFullDkgCeremony.Options,
    ) => Promise<validator.setNextFullDkgCeremony.ReturnType>
    /** Sets the next epoch for a full DKG ceremony, and waits for the transaction to be confirmed. */
    setNextFullDkgCeremonySync: (
      options: validator.setNextFullDkgCeremonySync.Options,
    ) => Promise<validator.setNextFullDkgCeremonySync.ReturnType>
    /** Updates validator information. */
    update: (
      options: validator.update.Options,
    ) => Promise<validator.update.ReturnType>
    /** Updates validator information, and waits for the transaction to be confirmed. */
    updateSync: (
      options: validator.updateSync.Options,
    ) => Promise<validator.updateSync.ReturnType>
  }
} & ([chain, account] extends [unknown, unknown] ? unknown : never)
