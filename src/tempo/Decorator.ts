import type * as Client from '../core/Client.js'
import * as amm from './actions/amm.js'
import * as channel from './actions/channel.js'
import * as dex from './actions/dex.js'
import * as fee from './actions/fee.js'
import * as nonce from './actions/nonce.js'
import * as policy from './actions/policy.js'
import * as receivePolicy from './actions/receivePolicy.js'
import * as token from './actions/token.js'
import * as validator from './actions/validator.js'

/**
 * Decorates a Client with the Tempo action namespaces.
 *
 * Namespaces that already exist on the Client (e.g. `fee` from
 * `publicActions()`) are merged, not replaced.
 *
 * @example
 * ```ts
 * import { Client, http, publicActions } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { tempoActions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *   .extend(publicActions())
 *   .extend(tempoActions())
 *
 * const userToken = await client.fee.getUserToken()
 * ```
 */
export function tempoActions() {
  return (client: Client.Client): tempoActions.Decorator => ({
    amm: {
      burn: (options) => amm.burn(client, options as never),
      burnSync: (options) => amm.burnSync(client, options as never),
      getLiquidityBalance: (options) =>
        amm.getLiquidityBalance(client, options as never),
      getPool: (options) => amm.getPool(client, options as never),
      mint: (options) => amm.mint(client, options as never),
      mintSync: (options) => amm.mintSync(client, options as never),
      rebalanceSwap: (options) => amm.rebalanceSwap(client, options as never),
      rebalanceSwapSync: (options) =>
        amm.rebalanceSwapSync(client, options as never),
      watchBurn: (options?) => amm.watchBurn(client, options as never),
      watchMint: (options?) => amm.watchMint(client, options as never),
      watchRebalanceSwap: (options?) =>
        amm.watchRebalanceSwap(client, options as never),
    },
    channel: {
      close: (options) => channel.close(client, options as never),
      closeSync: (options) => channel.closeSync(client, options as never),
      getStates: (options) => channel.getStates(client, options as never),
      open: (options) => channel.open(client, options as never),
      openSync: (options) => channel.openSync(client, options as never),
      requestClose: (options) => channel.requestClose(client, options as never),
      requestCloseSync: (options) =>
        channel.requestCloseSync(client, options as never),
      settle: (options) => channel.settle(client, options as never),
      settleSync: (options) => channel.settleSync(client, options as never),
      signVoucher: (options) => channel.signVoucher(client, options as never),
      topUp: (options) => channel.topUp(client, options as never),
      topUpSync: (options) => channel.topUpSync(client, options as never),
      withdraw: (options) => channel.withdraw(client, options as never),
      withdrawSync: (options) => channel.withdrawSync(client, options as never),
    },
    dex: {
      buy: (options) => dex.buy(client, options as never),
      buySync: (options) => dex.buySync(client, options as never),
      cancel: (options) => dex.cancel(client, options as never),
      cancelStale: (options) => dex.cancelStale(client, options as never),
      cancelStaleSync: (options) =>
        dex.cancelStaleSync(client, options as never),
      cancelSync: (options) => dex.cancelSync(client, options as never),
      createPair: (options) => dex.createPair(client, options as never),
      createPairSync: (options) => dex.createPairSync(client, options as never),
      getBalance: (options) => dex.getBalance(client, options as never),
      getBuyQuote: (options) => dex.getBuyQuote(client, options as never),
      getOrder: (options) => dex.getOrder(client, options as never),
      getOrderbook: (options) => dex.getOrderbook(client, options as never),
      getSellQuote: (options) => dex.getSellQuote(client, options as never),
      getTickLevel: (options) => dex.getTickLevel(client, options as never),
      place: (options) => dex.place(client, options as never),
      placeFlip: (options) => dex.placeFlip(client, options as never),
      placeFlipSync: (options) => dex.placeFlipSync(client, options as never),
      placeSync: (options) => dex.placeSync(client, options as never),
      sell: (options) => dex.sell(client, options as never),
      sellSync: (options) => dex.sellSync(client, options as never),
      watchFlipOrderPlaced: (options?) =>
        dex.watchFlipOrderPlaced(client, options as never),
      watchOrderCancelled: (options?) =>
        dex.watchOrderCancelled(client, options as never),
      watchOrderFilled: (options?) =>
        dex.watchOrderFilled(client, options as never),
      watchOrderPlaced: (options?) =>
        dex.watchOrderPlaced(client, options as never),
      withdraw: (options) => dex.withdraw(client, options as never),
      withdrawSync: (options) => dex.withdrawSync(client, options as never),
    },
    fee: {
      ...(client as { fee?: object }).fee,
      getUserToken: (options) => fee.getUserToken(client, options as never),
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
      getNonce: (options) => nonce.getNonce(client, options),
      watchIncremented: (options) => nonce.watchIncremented(client, options),
    },
    policy: {
      create: (options) => policy.create(client, options as never),
      createSync: (options) => policy.createSync(client, options as never),
      getData: (options) => policy.getData(client, options as never),
      isAuthorized: (options) => policy.isAuthorized(client, options as never),
      modifyBlacklist: (options) =>
        policy.modifyBlacklist(client, options as never),
      modifyBlacklistSync: (options) =>
        policy.modifyBlacklistSync(client, options as never),
      modifyWhitelist: (options) =>
        policy.modifyWhitelist(client, options as never),
      modifyWhitelistSync: (options) =>
        policy.modifyWhitelistSync(client, options as never),
      setAdmin: (options) => policy.setAdmin(client, options as never),
      setAdminSync: (options) => policy.setAdminSync(client, options as never),
      watchAdminUpdated: (options?) =>
        policy.watchAdminUpdated(client, options as never),
      watchBlacklistUpdated: (options?) =>
        policy.watchBlacklistUpdated(client, options as never),
      watchCreate: (options?) => policy.watchCreate(client, options as never),
      watchWhitelistUpdated: (options?) =>
        policy.watchWhitelistUpdated(client, options as never),
    },
    receivePolicy: {
      burn: (options) => receivePolicy.burn(client, options as never),
      burnSync: (options) => receivePolicy.burnSync(client, options as never),
      claim: (options) => receivePolicy.claim(client, options as never),
      claimSync: (options) => receivePolicy.claimSync(client, options as never),
      get: (options?) => receivePolicy.get(client, options as never),
      getBlockedBalance: (options) =>
        receivePolicy.getBlockedBalance(client, options as never),
      set: (options?) => receivePolicy.set(client, options as never),
      setSync: (options?) => receivePolicy.setSync(client, options as never),
      validate: (options) => receivePolicy.validate(client, options as never),
      watchBlocked: (options?) =>
        receivePolicy.watchBlocked(client, options as never),
      watchBurned: (options?) =>
        receivePolicy.watchBurned(client, options as never),
      watchClaimed: (options?) =>
        receivePolicy.watchClaimed(client, options as never),
      watchUpdated: (options?) =>
        receivePolicy.watchUpdated(client, options as never),
    },
    token: {
      approve: (options) => token.approve(client, options as never),
      approveSync: (options) => token.approveSync(client, options as never),
      burn: (options) => token.burn(client, options as never),
      burnBlocked: (options) => token.burnBlocked(client, options as never),
      burnBlockedSync: (options) =>
        token.burnBlockedSync(client, options as never),
      burnSync: (options) => token.burnSync(client, options as never),
      changeTransferPolicy: (options) =>
        token.changeTransferPolicy(client, options as never),
      changeTransferPolicySync: (options) =>
        token.changeTransferPolicySync(client, options as never),
      create: (options) => token.create(client, options as never),
      createSync: (options) => token.createSync(client, options as never),
      getAllowance: (options) => token.getAllowance(client, options as never),
      getBalance: (options) => token.getBalance(client, options as never),
      getMetadata: (options) => token.getMetadata(client, options as never),
      getRoleAdmin: (options) => token.getRoleAdmin(client, options as never),
      getTotalSupply: (options) =>
        token.getTotalSupply(client, options as never),
      grantRoles: (options) => token.grantRoles(client, options as never),
      grantRolesSync: (options) =>
        token.grantRolesSync(client, options as never),
      hasRole: (options) => token.hasRole(client, options as never),
      mint: (options) => token.mint(client, options as never),
      mintSync: (options) => token.mintSync(client, options as never),
      pause: (options) => token.pause(client, options as never),
      pauseSync: (options) => token.pauseSync(client, options as never),
      prepareUpdateQuoteToken: (options) =>
        token.prepareUpdateQuoteToken(client, options as never),
      prepareUpdateQuoteTokenSync: (options) =>
        token.prepareUpdateQuoteTokenSync(client, options as never),
      renounceRoles: (options) => token.renounceRoles(client, options as never),
      renounceRolesSync: (options) =>
        token.renounceRolesSync(client, options as never),
      revokeRoles: (options) => token.revokeRoles(client, options as never),
      revokeRolesSync: (options) =>
        token.revokeRolesSync(client, options as never),
      setRoleAdmin: (options) => token.setRoleAdmin(client, options as never),
      setRoleAdminSync: (options) =>
        token.setRoleAdminSync(client, options as never),
      setSupplyCap: (options) => token.setSupplyCap(client, options as never),
      setSupplyCapSync: (options) =>
        token.setSupplyCapSync(client, options as never),
      transfer: (options) => token.transfer(client, options as never),
      transferSync: (options) => token.transferSync(client, options as never),
      unpause: (options) => token.unpause(client, options as never),
      unpauseSync: (options) => token.unpauseSync(client, options as never),
      updateQuoteToken: (options) =>
        token.updateQuoteToken(client, options as never),
      updateQuoteTokenSync: (options) =>
        token.updateQuoteTokenSync(client, options as never),
      watchAdminRole: (options) =>
        token.watchAdminRole(client, options as never),
      watchApprove: (options) => token.watchApprove(client, options as never),
      watchBurn: (options) => token.watchBurn(client, options as never),
      watchCreate: (options?) => token.watchCreate(client, options as never),
      watchMint: (options) => token.watchMint(client, options as never),
      watchRole: (options) => token.watchRole(client, options as never),
      watchTransfer: (options) => token.watchTransfer(client, options as never),
      watchUpdateQuoteToken: (options) =>
        token.watchUpdateQuoteToken(client, options as never),
    },
    validator: {
      add: (options) => validator.add(client, options as never),
      addSync: (options) => validator.addSync(client, options as never),
      changeOwner: (options) => validator.changeOwner(client, options as never),
      changeOwnerSync: (options) =>
        validator.changeOwnerSync(client, options as never),
      changeStatus: (options) =>
        validator.changeStatus(client, options as never),
      changeStatusSync: (options) =>
        validator.changeStatusSync(client, options as never),
      get: (options) => validator.get(client, options as never),
      getByIndex: (options) => validator.getByIndex(client, options as never),
      getCount: (options?) => validator.getCount(client, options as never),
      getNextFullDkgCeremony: (options?) =>
        validator.getNextFullDkgCeremony(client, options as never),
      getOwner: (options?) => validator.getOwner(client, options as never),
      list: (options?) => validator.list(client, options as never),
      setNextFullDkgCeremony: (options) =>
        validator.setNextFullDkgCeremony(client, options as never),
      setNextFullDkgCeremonySync: (options) =>
        validator.setNextFullDkgCeremonySync(client, options as never),
      update: (options) => validator.update(client, options as never),
      updateSync: (options) => validator.updateSync(client, options as never),
    },
  })
}

export declare namespace tempoActions {
  type Decorator = {
    amm: {
      /**
       * Removes liquidity from a pool.
       *
       * @example
       * ```ts
       * const hash = await client.amm.burn({
       *   liquidity: 50n,
       *   to: '0x…',
       *   userToken: '0x…',
       *   validatorToken: '0x…',
       * })
       * ```
       */
      burn: (options: amm.burn.Options) => Promise<amm.burn.ReturnType>
      /**
       * Removes liquidity from a pool, and waits for the transaction to be
       * confirmed.
       *
       * @example
       * ```ts
       * const { receipt, ...event } = await client.amm.burnSync({
       *   liquidity: 50n,
       *   to: '0x…',
       *   userToken: '0x…',
       *   validatorToken: '0x…',
       * })
       * ```
       */
      burnSync: (
        options: amm.burnSync.Options,
      ) => Promise<amm.burnSync.ReturnType>
      /**
       * Gets the LP token balance for an account in a specific pool.
       *
       * @example
       * ```ts
       * const balance = await client.amm.getLiquidityBalance({
       *   address: '0x…',
       *   userToken: '0x…',
       *   validatorToken: '0x…',
       * })
       * ```
       */
      getLiquidityBalance: (
        options: amm.getLiquidityBalance.Options,
      ) => Promise<amm.getLiquidityBalance.ReturnType>
      /**
       * Gets the reserves for a liquidity pool.
       *
       * @example
       * ```ts
       * const pool = await client.amm.getPool({
       *   userToken: '0x…',
       *   validatorToken: '0x…',
       * })
       * ```
       */
      getPool: (options: amm.getPool.Options) => Promise<amm.getPool.ReturnType>
      /**
       * Adds liquidity to a pool.
       *
       * @example
       * ```ts
       * const hash = await client.amm.mint({
       *   to: '0x…',
       *   userTokenAddress: '0x…',
       *   validatorTokenAddress: '0x…',
       *   validatorTokenAmount: 100n,
       * })
       * ```
       */
      mint: (options: amm.mint.Options) => Promise<amm.mint.ReturnType>
      /**
       * Adds liquidity to a pool, and waits for the transaction to be
       * confirmed.
       *
       * @example
       * ```ts
       * const { receipt, ...event } = await client.amm.mintSync({
       *   to: '0x…',
       *   userTokenAddress: '0x…',
       *   validatorTokenAddress: '0x…',
       *   validatorTokenAmount: 100n,
       * })
       * ```
       */
      mintSync: (
        options: amm.mintSync.Options,
      ) => Promise<amm.mintSync.ReturnType>
      /**
       * Performs a rebalance swap from validator token to user token.
       *
       * @example
       * ```ts
       * const hash = await client.amm.rebalanceSwap({
       *   amountOut: 100n,
       *   to: '0x…',
       *   userToken: '0x…',
       *   validatorToken: '0x…',
       * })
       * ```
       */
      rebalanceSwap: (
        options: amm.rebalanceSwap.Options,
      ) => Promise<amm.rebalanceSwap.ReturnType>
      /**
       * Performs a rebalance swap from validator token to user token, and
       * waits for the transaction to be confirmed.
       *
       * @example
       * ```ts
       * const { receipt, ...event } = await client.amm.rebalanceSwapSync({
       *   amountOut: 100n,
       *   to: '0x…',
       *   userToken: '0x…',
       *   validatorToken: '0x…',
       * })
       * ```
       */
      rebalanceSwapSync: (
        options: amm.rebalanceSwapSync.Options,
      ) => Promise<amm.rebalanceSwapSync.ReturnType>
      /**
       * Watches for liquidity burn events, returning a watcher handle.
       *
       * @example
       * ```ts
       * const watcher = client.amm.watchBurn()
       * watcher.onLogs((logs) => console.log(logs))
       * ```
       */
      watchBurn: (
        options?: amm.watchBurn.Options | undefined,
      ) => amm.watchBurn.ReturnType
      /**
       * Watches for liquidity mint events, returning a watcher handle.
       *
       * @example
       * ```ts
       * const watcher = client.amm.watchMint()
       * watcher.onLogs((logs) => console.log(logs))
       * ```
       */
      watchMint: (
        options?: amm.watchMint.Options | undefined,
      ) => amm.watchMint.ReturnType
      /**
       * Watches for rebalance swap events, returning a watcher handle.
       *
       * @example
       * ```ts
       * const watcher = client.amm.watchRebalanceSwap()
       * watcher.onLogs((logs) => console.log(logs))
       * ```
       */
      watchRebalanceSwap: (
        options?: amm.watchRebalanceSwap.Options | undefined,
      ) => amm.watchRebalanceSwap.ReturnType
    }
    channel: {
      /**
       * Closes a TIP-20 channel reserve channel from the payee or operator
       * side.
       *
       * @example
       * ```ts
       * const hash = await client.channel.close({
       *   captureAmount: 100n,
       *   channel,
       *   cumulativeAmount: 100n,
       *   signature: '0x…',
       * })
       * ```
       */
      close: (
        options: channel.close.Options,
      ) => Promise<channel.close.ReturnType>
      /**
       * Closes a TIP-20 channel reserve channel and waits for the transaction
       * receipt.
       *
       * @example
       * ```ts
       * const { receipt, ...event } = await client.channel.closeSync({
       *   captureAmount: 100n,
       *   channel,
       *   cumulativeAmount: 100n,
       *   signature: '0x…',
       * })
       * ```
       */
      closeSync: (
        options: channel.closeSync.Options,
      ) => Promise<channel.closeSync.ReturnType>
      /**
       * Gets TIP-20 channel reserve state for a channel ID or channel.
       *
       * @example
       * ```ts
       * const state = await client.channel.getStates({ channel: '0x…' })
       * ```
       */
      getStates: <
        const value extends
          | channel.getStates.Channel
          | readonly channel.getStates.Channel[],
      >(
        options: channel.getStates.Options<value>,
      ) => Promise<channel.getStates.ReturnType<value>>
      /**
       * Opens and funds a TIP-20 channel reserve channel.
       *
       * @example
       * ```ts
       * const hash = await client.channel.open({
       *   deposit: 100n,
       *   payee: '0x…',
       *   token: 1n,
       * })
       * ```
       */
      open: (options: channel.open.Options) => Promise<channel.open.ReturnType>
      /**
       * Opens and funds a TIP-20 channel reserve channel and waits for the
       * transaction receipt.
       *
       * @example
       * ```ts
       * const { receipt, ...event } = await client.channel.openSync({
       *   deposit: 100n,
       *   payee: '0x…',
       *   token: 1n,
       * })
       * ```
       */
      openSync: (
        options: channel.openSync.Options,
      ) => Promise<channel.openSync.ReturnType>
      /**
       * Starts the payer close timer for a TIP-20 channel reserve channel.
       *
       * @example
       * ```ts
       * const hash = await client.channel.requestClose({ channel })
       * ```
       */
      requestClose: (
        options: channel.requestClose.Options,
      ) => Promise<channel.requestClose.ReturnType>
      /**
       * Starts the payer close timer and waits for the transaction receipt.
       *
       * @example
       * ```ts
       * const { receipt, ...event } = await client.channel.requestCloseSync({
       *   channel,
       * })
       * ```
       */
      requestCloseSync: (
        options: channel.requestCloseSync.Options,
      ) => Promise<channel.requestCloseSync.ReturnType>
      /**
       * Settles a TIP-20 channel reserve voucher.
       *
       * @example
       * ```ts
       * const hash = await client.channel.settle({
       *   channel,
       *   cumulativeAmount: 100n,
       *   signature: '0x…',
       * })
       * ```
       */
      settle: (
        options: channel.settle.Options,
      ) => Promise<channel.settle.ReturnType>
      /**
       * Settles a TIP-20 channel reserve voucher and waits for the transaction
       * receipt.
       *
       * @example
       * ```ts
       * const { receipt, ...event } = await client.channel.settleSync({
       *   channel,
       *   cumulativeAmount: 100n,
       *   signature: '0x…',
       * })
       * ```
       */
      settleSync: (
        options: channel.settleSync.Options,
      ) => Promise<channel.settleSync.ReturnType>
      /**
       * Signs a TIP-20 channel reserve voucher.
       *
       * @example
       * ```ts
       * const signature = await client.channel.signVoucher({
       *   channel,
       *   cumulativeAmount: 100n,
       * })
       * ```
       */
      signVoucher: (
        options: channel.signVoucher.Options,
      ) => Promise<channel.signVoucher.ReturnType>
      /**
       * Adds deposit to a TIP-20 channel reserve channel.
       *
       * @example
       * ```ts
       * const hash = await client.channel.topUp({
       *   additionalDeposit: 100n,
       *   channel,
       * })
       * ```
       */
      topUp: (
        options: channel.topUp.Options,
      ) => Promise<channel.topUp.ReturnType>
      /**
       * Adds deposit to a TIP-20 channel reserve channel and waits for the
       * transaction receipt.
       *
       * @example
       * ```ts
       * const { receipt, ...event } = await client.channel.topUpSync({
       *   additionalDeposit: 100n,
       *   channel,
       * })
       * ```
       */
      topUpSync: (
        options: channel.topUpSync.Options,
      ) => Promise<channel.topUpSync.ReturnType>
      /**
       * Withdraws payer funds after the close grace period elapses.
       *
       * @example
       * ```ts
       * const hash = await client.channel.withdraw({ channel })
       * ```
       */
      withdraw: (
        options: channel.withdraw.Options,
      ) => Promise<channel.withdraw.ReturnType>
      /**
       * Withdraws payer funds after the close grace period elapses and waits
       * for the transaction receipt.
       *
       * @example
       * ```ts
       * const { receipt, ...event } = await client.channel.withdrawSync({
       *   channel,
       * })
       * ```
       */
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
       * const hash = await client.dex.buy({
       *   amountOut: 100n,
       *   maxAmountIn: 105n,
       *   tokenIn: '0x…',
       *   tokenOut: '0x…',
       * })
       * ```
       */
      buy: (options: dex.buy.Options) => Promise<dex.buy.ReturnType>
      /**
       * Buys a specific amount of tokens, and waits for the transaction to be
       * confirmed.
       *
       * @example
       * ```ts
       * const { receipt } = await client.dex.buySync({
       *   amountOut: 100n,
       *   maxAmountIn: 105n,
       *   tokenIn: '0x…',
       *   tokenOut: '0x…',
       * })
       * ```
       */
      buySync: (options: dex.buySync.Options) => Promise<dex.buySync.ReturnType>
      /**
       * Cancels an order from the orderbook.
       *
       * @example
       * ```ts
       * const hash = await client.dex.cancel({ orderId: 123n })
       * ```
       */
      cancel: (options: dex.cancel.Options) => Promise<dex.cancel.ReturnType>
      /**
       * Cancels a stale order from the orderbook.
       *
       * @example
       * ```ts
       * const hash = await client.dex.cancelStale({ orderId: 123n })
       * ```
       */
      cancelStale: (
        options: dex.cancelStale.Options,
      ) => Promise<dex.cancelStale.ReturnType>
      /**
       * Cancels a stale order from the orderbook, and waits for the
       * transaction to be confirmed.
       *
       * @example
       * ```ts
       * const { receipt, ...event } = await client.dex.cancelStaleSync({
       *   orderId: 123n,
       * })
       * ```
       */
      cancelStaleSync: (
        options: dex.cancelStaleSync.Options,
      ) => Promise<dex.cancelStaleSync.ReturnType>
      /**
       * Cancels an order from the orderbook, and waits for the transaction to
       * be confirmed.
       *
       * @example
       * ```ts
       * const { receipt, ...event } = await client.dex.cancelSync({
       *   orderId: 123n,
       * })
       * ```
       */
      cancelSync: (
        options: dex.cancelSync.Options,
      ) => Promise<dex.cancelSync.ReturnType>
      /**
       * Creates a new trading pair on the DEX.
       *
       * @example
       * ```ts
       * const hash = await client.dex.createPair({ base: '0x…' })
       * ```
       */
      createPair: (
        options: dex.createPair.Options,
      ) => Promise<dex.createPair.ReturnType>
      /**
       * Creates a new trading pair on the DEX, and waits for the transaction
       * to be confirmed.
       *
       * @example
       * ```ts
       * const { receipt, ...event } = await client.dex.createPairSync({
       *   base: '0x…',
       * })
       * ```
       */
      createPairSync: (
        options: dex.createPairSync.Options,
      ) => Promise<dex.createPairSync.ReturnType>
      /**
       * Gets a user's token balance on the DEX.
       *
       * @example
       * ```ts
       * const balance = await client.dex.getBalance({
       *   account: '0x…',
       *   token: '0x…',
       * })
       * ```
       */
      getBalance: (
        options: dex.getBalance.Options,
      ) => Promise<dex.getBalance.ReturnType>
      /**
       * Gets the quote for buying a specific amount of tokens.
       *
       * @example
       * ```ts
       * const amountIn = await client.dex.getBuyQuote({
       *   amountOut: 100n,
       *   tokenIn: '0x…',
       *   tokenOut: '0x…',
       * })
       * ```
       */
      getBuyQuote: (
        options: dex.getBuyQuote.Options,
      ) => Promise<dex.getBuyQuote.ReturnType>
      /**
       * Gets an order's details from the orderbook.
       *
       * @example
       * ```ts
       * const order = await client.dex.getOrder({ orderId: 123n })
       * ```
       */
      getOrder: (
        options: dex.getOrder.Options,
      ) => Promise<dex.getOrder.ReturnType>
      /**
       * Gets orderbook information for a trading pair.
       *
       * @example
       * ```ts
       * const book = await client.dex.getOrderbook({
       *   base: '0x…',
       *   quote: '0x…',
       * })
       * ```
       */
      getOrderbook: (
        options: dex.getOrderbook.Options,
      ) => Promise<dex.getOrderbook.ReturnType>
      /**
       * Gets the quote for selling a specific amount of tokens.
       *
       * @example
       * ```ts
       * const amountOut = await client.dex.getSellQuote({
       *   amountIn: 100n,
       *   tokenIn: '0x…',
       *   tokenOut: '0x…',
       * })
       * ```
       */
      getSellQuote: (
        options: dex.getSellQuote.Options,
      ) => Promise<dex.getSellQuote.ReturnType>
      /**
       * Gets the price level information at a specific tick.
       *
       * @example
       * ```ts
       * const level = await client.dex.getTickLevel({
       *   base: '0x…',
       *   isBid: true,
       *   tick: -10,
       * })
       * ```
       */
      getTickLevel: (
        options: dex.getTickLevel.Options,
      ) => Promise<dex.getTickLevel.ReturnType>
      /**
       * Places a limit order on the orderbook.
       *
       * @example
       * ```ts
       * const hash = await client.dex.place({
       *   amount: 100n,
       *   tick: -10,
       *   token: '0x…',
       *   type: 'buy',
       * })
       * ```
       */
      place: (options: dex.place.Options) => Promise<dex.place.ReturnType>
      /**
       * Places a flip order that automatically flips when filled.
       *
       * @example
       * ```ts
       * const hash = await client.dex.placeFlip({
       *   amount: 100n,
       *   flipTick: 10,
       *   tick: -10,
       *   token: '0x…',
       *   type: 'buy',
       * })
       * ```
       */
      placeFlip: (
        options: dex.placeFlip.Options,
      ) => Promise<dex.placeFlip.ReturnType>
      /**
       * Places a flip order that automatically flips when filled, and waits
       * for the transaction to be confirmed.
       *
       * @example
       * ```ts
       * const { receipt, ...event } = await client.dex.placeFlipSync({
       *   amount: 100n,
       *   flipTick: 10,
       *   tick: -10,
       *   token: '0x…',
       *   type: 'buy',
       * })
       * ```
       */
      placeFlipSync: (
        options: dex.placeFlipSync.Options,
      ) => Promise<dex.placeFlipSync.ReturnType>
      /**
       * Places a limit order on the orderbook, and waits for the transaction
       * to be confirmed.
       *
       * @example
       * ```ts
       * const { receipt, ...event } = await client.dex.placeSync({
       *   amount: 100n,
       *   tick: -10,
       *   token: '0x…',
       *   type: 'buy',
       * })
       * ```
       */
      placeSync: (
        options: dex.placeSync.Options,
      ) => Promise<dex.placeSync.ReturnType>
      /**
       * Sells a specific amount of tokens.
       *
       * @example
       * ```ts
       * const hash = await client.dex.sell({
       *   amountIn: 100n,
       *   minAmountOut: 95n,
       *   tokenIn: '0x…',
       *   tokenOut: '0x…',
       * })
       * ```
       */
      sell: (options: dex.sell.Options) => Promise<dex.sell.ReturnType>
      /**
       * Sells a specific amount of tokens, and waits for the transaction to be
       * confirmed.
       *
       * @example
       * ```ts
       * const { receipt } = await client.dex.sellSync({
       *   amountIn: 100n,
       *   minAmountOut: 95n,
       *   tokenIn: '0x…',
       *   tokenOut: '0x…',
       * })
       * ```
       */
      sellSync: (
        options: dex.sellSync.Options,
      ) => Promise<dex.sellSync.ReturnType>
      /**
       * Watches for flip order placed events, returning a watcher handle.
       *
       * @example
       * ```ts
       * const watcher = client.dex.watchFlipOrderPlaced()
       * watcher.onLogs((logs) => console.log(logs))
       * ```
       */
      watchFlipOrderPlaced: (
        options?: dex.watchFlipOrderPlaced.Options | undefined,
      ) => dex.watchFlipOrderPlaced.ReturnType
      /**
       * Watches for order cancelled events, returning a watcher handle.
       *
       * @example
       * ```ts
       * const watcher = client.dex.watchOrderCancelled()
       * watcher.onLogs((logs) => console.log(logs))
       * ```
       */
      watchOrderCancelled: (
        options?: dex.watchOrderCancelled.Options | undefined,
      ) => dex.watchOrderCancelled.ReturnType
      /**
       * Watches for order filled events, returning a watcher handle.
       *
       * @example
       * ```ts
       * const watcher = client.dex.watchOrderFilled()
       * watcher.onLogs((logs) => console.log(logs))
       * ```
       */
      watchOrderFilled: (
        options?: dex.watchOrderFilled.Options | undefined,
      ) => dex.watchOrderFilled.ReturnType
      /**
       * Watches for order placed events, returning a watcher handle.
       *
       * @example
       * ```ts
       * const watcher = client.dex.watchOrderPlaced()
       * watcher.onLogs((logs) => console.log(logs))
       * ```
       */
      watchOrderPlaced: (
        options?: dex.watchOrderPlaced.Options | undefined,
      ) => dex.watchOrderPlaced.ReturnType
      /**
       * Withdraws tokens from the DEX to the caller's wallet.
       *
       * @example
       * ```ts
       * const hash = await client.dex.withdraw({
       *   amount: 100n,
       *   token: '0x…',
       * })
       * ```
       */
      withdraw: (
        options: dex.withdraw.Options,
      ) => Promise<dex.withdraw.ReturnType>
      /**
       * Withdraws tokens from the DEX to the caller's wallet, and waits for
       * the transaction to be confirmed.
       *
       * @example
       * ```ts
       * const { receipt } = await client.dex.withdrawSync({
       *   amount: 100n,
       *   token: '0x…',
       * })
       * ```
       */
      withdrawSync: (
        options: dex.withdrawSync.Options,
      ) => Promise<dex.withdrawSync.ReturnType>
    }
    fee: {
      /**
       * Gets the user's default fee token.
       *
       * @example
       * ```ts
       * const userToken = await client.fee.getUserToken()
       * ```
       */
      getUserToken: (
        options?: fee.getUserToken.Options | undefined,
      ) => Promise<fee.getUserToken.ReturnType>
      /**
       * Gets a validator's preferred fee token.
       *
       * @example
       * ```ts
       * const validatorToken = await client.fee.getValidatorToken({
       *   validator: '0x…',
       * })
       * ```
       */
      getValidatorToken: (
        options: fee.getValidatorToken.Options,
      ) => Promise<fee.getValidatorToken.ReturnType>
      /**
       * Sets the user's default fee token.
       *
       * @example
       * ```ts
       * const hash = await client.fee.setUserToken({ token: 1n })
       * ```
       */
      setUserToken: (
        options: fee.setUserToken.Options,
      ) => Promise<fee.setUserToken.ReturnType>
      /**
       * Sets the user's default fee token and waits for the transaction to
       * be confirmed.
       *
       * @example
       * ```ts
       * const { token, receipt } = await client.fee.setUserTokenSync({
       *   token: 1n,
       * })
       * ```
       */
      setUserTokenSync: (
        options: fee.setUserTokenSync.Options,
      ) => Promise<fee.setUserTokenSync.ReturnType>
      /**
       * Sets the validator's preferred fee token.
       *
       * @example
       * ```ts
       * const hash = await client.fee.setValidatorToken({ token: 1n })
       * ```
       */
      setValidatorToken: (
        options: fee.setValidatorToken.Options,
      ) => Promise<fee.setValidatorToken.ReturnType>
      /**
       * Sets the validator's preferred fee token and waits for the
       * transaction to be confirmed.
       *
       * @example
       * ```ts
       * const { token, receipt } = await client.fee.setValidatorTokenSync({
       *   token: 1n,
       * })
       * ```
       */
      setValidatorTokenSync: (
        options: fee.setValidatorTokenSync.Options,
      ) => Promise<fee.setValidatorTokenSync.ReturnType>
      /**
       * Validates that a token can be used as a Tempo fee token.
       *
       * @example
       * ```ts
       * const { address, metadata } = await client.fee.validateToken({
       *   token: '0x20c0000000000000000000000000000000000001',
       * })
       * ```
       */
      validateToken: (
        options: fee.validateToken.Options,
      ) => Promise<fee.validateToken.ReturnType>
      /**
       * Watches for user fee-token updates, returning a watcher handle.
       *
       * @example
       * ```ts
       * const watcher = client.fee.watchSetUserToken()
       * watcher.onLogs((logs) => console.log(logs))
       * ```
       */
      watchSetUserToken: (
        options?: fee.watchSetUserToken.Options | undefined,
      ) => fee.watchSetUserToken.ReturnType
      /**
       * Watches for validator fee-token updates, returning a watcher handle.
       *
       * @example
       * ```ts
       * const watcher = client.fee.watchSetValidatorToken()
       * watcher.onLogs((logs) => console.log(logs))
       * ```
       */
      watchSetValidatorToken: (
        options?: fee.watchSetValidatorToken.Options | undefined,
      ) => fee.watchSetValidatorToken.ReturnType
    }
    nonce: {
      /**
       * Gets the nonce for an account and nonce key.
       *
       * @example
       * ```ts
       * const value = await client.nonce.getNonce({
       *   account: '0x…',
       *   nonceKey: 1n,
       * })
       * ```
       */
      getNonce: (
        options: nonce.getNonce.Options,
      ) => Promise<nonce.getNonce.ReturnType>
      /**
       * Watches for incremented nonces, returning a watcher handle.
       *
       * @example
       * ```ts
       * const watcher = client.nonce.watchIncremented()
       * watcher.onLogs((logs) => console.log(logs))
       * ```
       */
      watchIncremented: (
        options?: nonce.watchIncremented.Options | undefined,
      ) => nonce.watchIncremented.ReturnType
    }
    policy: {
      /**
       * Creates a new policy.
       *
       * @example
       * ```ts
       * const hash = await client.policy.create({ type: 'whitelist' })
       * ```
       */
      create: (
        options: policy.create.Options,
      ) => Promise<policy.create.ReturnType>
      /**
       * Creates a new policy, and waits for the transaction to be confirmed.
       *
       * @example
       * ```ts
       * const { policyId } = await client.policy.createSync({
       *   type: 'whitelist',
       * })
       * ```
       */
      createSync: (
        options: policy.createSync.Options,
      ) => Promise<policy.createSync.ReturnType>
      /**
       * Gets policy data.
       *
       * @example
       * ```ts
       * const data = await client.policy.getData({ policyId: 2n })
       * ```
       */
      getData: (
        options: policy.getData.Options,
      ) => Promise<policy.getData.ReturnType>
      /**
       * Checks if a user is authorized by a policy.
       *
       * @example
       * ```ts
       * const authorized = await client.policy.isAuthorized({
       *   policyId: 2n,
       *   user: '0x…',
       * })
       * ```
       */
      isAuthorized: (
        options: policy.isAuthorized.Options,
      ) => Promise<policy.isAuthorized.ReturnType>
      /**
       * Modifies a policy blacklist.
       *
       * @example
       * ```ts
       * const hash = await client.policy.modifyBlacklist({
       *   address: '0x…',
       *   policyId: 2n,
       *   restricted: true,
       * })
       * ```
       */
      modifyBlacklist: (
        options: policy.modifyBlacklist.Options,
      ) => Promise<policy.modifyBlacklist.ReturnType>
      /**
       * Modifies a policy blacklist, and waits for the transaction to be
       * confirmed.
       *
       * @example
       * ```ts
       * const { receipt, ...event } = await client.policy.modifyBlacklistSync({
       *   address: '0x…',
       *   policyId: 2n,
       *   restricted: true,
       * })
       * ```
       */
      modifyBlacklistSync: (
        options: policy.modifyBlacklistSync.Options,
      ) => Promise<policy.modifyBlacklistSync.ReturnType>
      /**
       * Modifies a policy whitelist.
       *
       * @example
       * ```ts
       * const hash = await client.policy.modifyWhitelist({
       *   address: '0x…',
       *   allowed: true,
       *   policyId: 2n,
       * })
       * ```
       */
      modifyWhitelist: (
        options: policy.modifyWhitelist.Options,
      ) => Promise<policy.modifyWhitelist.ReturnType>
      /**
       * Modifies a policy whitelist, and waits for the transaction to be
       * confirmed.
       *
       * @example
       * ```ts
       * const { receipt, ...event } = await client.policy.modifyWhitelistSync({
       *   address: '0x…',
       *   allowed: true,
       *   policyId: 2n,
       * })
       * ```
       */
      modifyWhitelistSync: (
        options: policy.modifyWhitelistSync.Options,
      ) => Promise<policy.modifyWhitelistSync.ReturnType>
      /**
       * Sets the admin for a policy.
       *
       * @example
       * ```ts
       * const hash = await client.policy.setAdmin({
       *   admin: '0x…',
       *   policyId: 2n,
       * })
       * ```
       */
      setAdmin: (
        options: policy.setAdmin.Options,
      ) => Promise<policy.setAdmin.ReturnType>
      /**
       * Sets the admin for a policy, and waits for the transaction to be
       * confirmed.
       *
       * @example
       * ```ts
       * const { receipt, ...event } = await client.policy.setAdminSync({
       *   admin: '0x…',
       *   policyId: 2n,
       * })
       * ```
       */
      setAdminSync: (
        options: policy.setAdminSync.Options,
      ) => Promise<policy.setAdminSync.ReturnType>
      /**
       * Watches for policy admin update events, returning a watcher handle.
       *
       * @example
       * ```ts
       * const watcher = client.policy.watchAdminUpdated()
       * watcher.onLogs((logs) => console.log(logs))
       * ```
       */
      watchAdminUpdated: (
        options?: policy.watchAdminUpdated.Options | undefined,
      ) => policy.watchAdminUpdated.ReturnType
      /**
       * Watches for blacklist update events, returning a watcher handle.
       *
       * @example
       * ```ts
       * const watcher = client.policy.watchBlacklistUpdated()
       * watcher.onLogs((logs) => console.log(logs))
       * ```
       */
      watchBlacklistUpdated: (
        options?: policy.watchBlacklistUpdated.Options | undefined,
      ) => policy.watchBlacklistUpdated.ReturnType
      /**
       * Watches for policy creation events, returning a watcher handle.
       *
       * @example
       * ```ts
       * const watcher = client.policy.watchCreate()
       * watcher.onLogs((logs) => console.log(logs))
       * ```
       */
      watchCreate: (
        options?: policy.watchCreate.Options | undefined,
      ) => policy.watchCreate.ReturnType
      /**
       * Watches for whitelist update events, returning a watcher handle.
       *
       * @example
       * ```ts
       * const watcher = client.policy.watchWhitelistUpdated()
       * watcher.onLogs((logs) => console.log(logs))
       * ```
       */
      watchWhitelistUpdated: (
        options?: policy.watchWhitelistUpdated.Options | undefined,
      ) => policy.watchWhitelistUpdated.ReturnType
    }
    receivePolicy: {
      /**
       * Burns the funds backing a blocked receipt.
       *
       * @example
       * ```ts
       * const hash = await client.receivePolicy.burn({ receipt: '0x…' })
       * ```
       */
      burn: (
        options: receivePolicy.burn.Options,
      ) => Promise<receivePolicy.burn.ReturnType>
      /**
       * Burns the funds backing a blocked receipt, and waits for the
       * transaction to be confirmed.
       *
       * @example
       * ```ts
       * const { receipt, ...event } = await client.receivePolicy.burnSync({
       *   receipt: '0x…',
       * })
       * ```
       */
      burnSync: (
        options: receivePolicy.burnSync.Options,
      ) => Promise<receivePolicy.burnSync.ReturnType>
      /**
       * Claims blocked funds for a receipt, releasing them to a destination.
       *
       * @example
       * ```ts
       * const hash = await client.receivePolicy.claim({
       *   receipt: '0x…',
       *   to: '0x…',
       * })
       * ```
       */
      claim: (
        options: receivePolicy.claim.Options,
      ) => Promise<receivePolicy.claim.ReturnType>
      /**
       * Claims blocked funds for a receipt, and waits for the transaction to
       * be confirmed.
       *
       * @example
       * ```ts
       * const { receipt, ...event } = await client.receivePolicy.claimSync({
       *   receipt: '0x…',
       *   to: '0x…',
       * })
       * ```
       */
      claimSync: (
        options: receivePolicy.claimSync.Options,
      ) => Promise<receivePolicy.claimSync.ReturnType>
      /**
       * Gets the receive policy configured for an account.
       *
       * @example
       * ```ts
       * const policy = await client.receivePolicy.get()
       * ```
       */
      get: (
        options?: receivePolicy.get.Options | undefined,
      ) => Promise<receivePolicy.get.ReturnType>
      /**
       * Gets the blocked balance for an encoded receipt.
       *
       * @example
       * ```ts
       * const amount = await client.receivePolicy.getBlockedBalance({
       *   receipt: '0x…',
       * })
       * ```
       */
      getBlockedBalance: (
        options: receivePolicy.getBlockedBalance.Options,
      ) => Promise<receivePolicy.getBlockedBalance.ReturnType>
      /**
       * Sets the receive policy for the calling account.
       *
       * @example
       * ```ts
       * const hash = await client.receivePolicy.set({
       *   claimer: 'self',
       *   senderPolicyId: 'allow-all',
       *   tokenPolicyId: 'allow-all',
       * })
       * ```
       */
      set: (
        options?: receivePolicy.set.Options | undefined,
      ) => Promise<receivePolicy.set.ReturnType>
      /**
       * Sets the receive policy for the calling account, and waits for the
       * transaction to be confirmed.
       *
       * @example
       * ```ts
       * const { receipt, ...event } = await client.receivePolicy.setSync({
       *   claimer: 'self',
       *   senderPolicyId: 'allow-all',
       *   tokenPolicyId: 'allow-all',
       * })
       * ```
       */
      setSync: (
        options?: receivePolicy.setSync.Options | undefined,
      ) => Promise<receivePolicy.setSync.ReturnType>
      /**
       * Checks whether a transfer or mint to a receiver is allowed by the
       * receiver's receive policy.
       *
       * @example
       * ```ts
       * const { authorized } = await client.receivePolicy.validate({
       *   receiver: '0x…',
       *   sender: '0x…',
       *   token: '0x…',
       * })
       * ```
       */
      validate: (
        options: receivePolicy.validate.Options,
      ) => Promise<receivePolicy.validate.ReturnType>
      /**
       * Watches for blocked transfer events, returning a watcher handle.
       *
       * @example
       * ```ts
       * const watcher = client.receivePolicy.watchBlocked()
       * watcher.onLogs((logs) => console.log(logs))
       * ```
       */
      watchBlocked: (
        options?: receivePolicy.watchBlocked.Options | undefined,
      ) => receivePolicy.watchBlocked.ReturnType
      /**
       * Watches for receipt burned events, returning a watcher handle.
       *
       * @example
       * ```ts
       * const watcher = client.receivePolicy.watchBurned()
       * watcher.onLogs((logs) => console.log(logs))
       * ```
       */
      watchBurned: (
        options?: receivePolicy.watchBurned.Options | undefined,
      ) => receivePolicy.watchBurned.ReturnType
      /**
       * Watches for receipt claimed events, returning a watcher handle.
       *
       * @example
       * ```ts
       * const watcher = client.receivePolicy.watchClaimed()
       * watcher.onLogs((logs) => console.log(logs))
       * ```
       */
      watchClaimed: (
        options?: receivePolicy.watchClaimed.Options | undefined,
      ) => receivePolicy.watchClaimed.ReturnType
      /**
       * Watches for receive policy update events, returning a watcher handle.
       *
       * @example
       * ```ts
       * const watcher = client.receivePolicy.watchUpdated()
       * watcher.onLogs((logs) => console.log(logs))
       * ```
       */
      watchUpdated: (
        options?: receivePolicy.watchUpdated.Options | undefined,
      ) => receivePolicy.watchUpdated.ReturnType
    }
    token: {
      /** Calls `token.approve`. */
      approve: (
        options: token.approve.Options,
      ) => Promise<token.approve.ReturnType>
      /** Calls `token.approveSync`. */
      approveSync: (
        options: token.approveSync.Options,
      ) => Promise<token.approveSync.ReturnType>
      /** Calls `token.burn`. */
      burn: (options: token.burn.Options) => Promise<token.burn.ReturnType>
      /** Calls `token.burnBlocked`. */
      burnBlocked: (
        options: token.burnBlocked.Options,
      ) => Promise<token.burnBlocked.ReturnType>
      /** Calls `token.burnBlockedSync`. */
      burnBlockedSync: (
        options: token.burnBlockedSync.Options,
      ) => Promise<token.burnBlockedSync.ReturnType>
      /** Calls `token.burnSync`. */
      burnSync: (
        options: token.burnSync.Options,
      ) => Promise<token.burnSync.ReturnType>
      /** Calls `token.changeTransferPolicy`. */
      changeTransferPolicy: (
        options: token.changeTransferPolicy.Options,
      ) => Promise<token.changeTransferPolicy.ReturnType>
      /** Calls `token.changeTransferPolicySync`. */
      changeTransferPolicySync: (
        options: token.changeTransferPolicySync.Options,
      ) => Promise<token.changeTransferPolicySync.ReturnType>
      /** Calls `token.create`. */
      create: (
        options: token.create.Options,
      ) => Promise<token.create.ReturnType>
      /** Calls `token.createSync`. */
      createSync: (
        options: token.createSync.Options,
      ) => Promise<token.createSync.ReturnType>
      /** Gets TIP-20 token allowance. */
      getAllowance: (
        options: token.getAllowance.Options,
      ) => Promise<token.getAllowance.ReturnType>
      /** Calls `token.getBalance`. */
      getBalance: (
        options: token.getBalance.Options,
      ) => Promise<token.getBalance.ReturnType>
      /** Gets TIP-20 token metadata including name, symbol, logo URI, currency, */
      getMetadata: (
        options: token.getMetadata.Options,
      ) => Promise<token.getMetadata.ReturnType>
      /** Gets the admin role for a specific role in a TIP-20 token. */
      getRoleAdmin: (
        options: token.getRoleAdmin.Options,
      ) => Promise<token.getRoleAdmin.ReturnType>
      /** Gets the total supply of a TIP-20 token. */
      getTotalSupply: (
        options: token.getTotalSupply.Options,
      ) => Promise<token.getTotalSupply.ReturnType>
      /** Calls `token.grantRoles`. */
      grantRoles: (
        options: token.grantRoles.Options,
      ) => Promise<token.grantRoles.ReturnType>
      /** Calls `token.grantRolesSync`. */
      grantRolesSync: (
        options: token.grantRolesSync.Options,
      ) => Promise<token.grantRolesSync.ReturnType>
      /** Calls `token.hasRole`. */
      hasRole: (
        options: token.hasRole.Options,
      ) => Promise<token.hasRole.ReturnType>
      /** Calls `token.mint`. */
      mint: (options: token.mint.Options) => Promise<token.mint.ReturnType>
      /** Calls `token.mintSync`. */
      mintSync: (
        options: token.mintSync.Options,
      ) => Promise<token.mintSync.ReturnType>
      /** Calls `token.pause`. */
      pause: (options: token.pause.Options) => Promise<token.pause.ReturnType>
      /** Calls `token.pauseSync`. */
      pauseSync: (
        options: token.pauseSync.Options,
      ) => Promise<token.pauseSync.ReturnType>
      /** Calls `token.prepareUpdateQuoteToken`. */
      prepareUpdateQuoteToken: (
        options: token.prepareUpdateQuoteToken.Options,
      ) => Promise<token.prepareUpdateQuoteToken.ReturnType>
      /** Calls `token.prepareUpdateQuoteTokenSync`. */
      prepareUpdateQuoteTokenSync: (
        options: token.prepareUpdateQuoteTokenSync.Options,
      ) => Promise<token.prepareUpdateQuoteTokenSync.ReturnType>
      /** Calls `token.renounceRoles`. */
      renounceRoles: (
        options: token.renounceRoles.Options,
      ) => Promise<token.renounceRoles.ReturnType>
      /** Calls `token.renounceRolesSync`. */
      renounceRolesSync: (
        options: token.renounceRolesSync.Options,
      ) => Promise<token.renounceRolesSync.ReturnType>
      /** Calls `token.revokeRoles`. */
      revokeRoles: (
        options: token.revokeRoles.Options,
      ) => Promise<token.revokeRoles.ReturnType>
      /** Calls `token.revokeRolesSync`. */
      revokeRolesSync: (
        options: token.revokeRolesSync.Options,
      ) => Promise<token.revokeRolesSync.ReturnType>
      /** Calls `token.setRoleAdmin`. */
      setRoleAdmin: (
        options: token.setRoleAdmin.Options,
      ) => Promise<token.setRoleAdmin.ReturnType>
      /** Calls `token.setRoleAdminSync`. */
      setRoleAdminSync: (
        options: token.setRoleAdminSync.Options,
      ) => Promise<token.setRoleAdminSync.ReturnType>
      /** Calls `token.setSupplyCap`. */
      setSupplyCap: (
        options: token.setSupplyCap.Options,
      ) => Promise<token.setSupplyCap.ReturnType>
      /** Calls `token.setSupplyCapSync`. */
      setSupplyCapSync: (
        options: token.setSupplyCapSync.Options,
      ) => Promise<token.setSupplyCapSync.ReturnType>
      /** Calls `token.transfer`. */
      transfer: (
        options: token.transfer.Options,
      ) => Promise<token.transfer.ReturnType>
      /** Calls `token.transferSync`. */
      transferSync: (
        options: token.transferSync.Options,
      ) => Promise<token.transferSync.ReturnType>
      /** Calls `token.unpause`. */
      unpause: (
        options: token.unpause.Options,
      ) => Promise<token.unpause.ReturnType>
      /** Calls `token.unpauseSync`. */
      unpauseSync: (
        options: token.unpauseSync.Options,
      ) => Promise<token.unpauseSync.ReturnType>
      /** Calls `token.updateQuoteToken`. */
      updateQuoteToken: (
        options: token.updateQuoteToken.Options,
      ) => Promise<token.updateQuoteToken.ReturnType>
      /** Calls `token.updateQuoteTokenSync`. */
      updateQuoteTokenSync: (
        options: token.updateQuoteTokenSync.Options,
      ) => Promise<token.updateQuoteTokenSync.ReturnType>
      /** Watches for TIP-20 token role admin updates, returning a watcher handle. */
      watchAdminRole: (
        options: token.watchAdminRole.Options,
      ) => token.watchAdminRole.ReturnType
      /** Watches for TIP-20 token approvals, returning a watcher handle. */
      watchApprove: (
        options: token.watchApprove.Options,
      ) => token.watchApprove.ReturnType
      /** Watches for TIP-20 token burns, returning a watcher handle. */
      watchBurn: (
        options: token.watchBurn.Options,
      ) => token.watchBurn.ReturnType
      /** Watches for new TIP-20 tokens created, returning a watcher handle. */
      watchCreate: (
        options?: token.watchCreate.Options | undefined,
      ) => token.watchCreate.ReturnType
      /** Watches for TIP-20 token mints, returning a watcher handle. */
      watchMint: (
        options: token.watchMint.Options,
      ) => token.watchMint.ReturnType
      /** Watches for TIP-20 token role membership updates, returning a watcher */
      watchRole: (
        options: token.watchRole.Options,
      ) => token.watchRole.ReturnType
      /** Watches for TIP-20 token transfers, returning a watcher handle. */
      watchTransfer: (
        options: token.watchTransfer.Options,
      ) => token.watchTransfer.ReturnType
      /** Watches for TIP-20 token quote token updates, returning a watcher handle. */
      watchUpdateQuoteToken: (
        options: token.watchUpdateQuoteToken.Options,
      ) => token.watchUpdateQuoteToken.ReturnType
    }
    validator: {
      /**
       * Adds a new validator (owner only).
       *
       * @example
       * ```ts
       * const hash = await client.validator.add({
       *   active: true,
       *   inboundAddress: '192.168.1.1:8080',
       *   newValidatorAddress: '0x…',
       *   outboundAddress: '192.168.1.1:8080',
       *   publicKey: '0x…',
       * })
       * ```
       */
      add: (options: validator.add.Options) => Promise<validator.add.ReturnType>
      /**
       * Adds a new validator (owner only), and waits for the transaction to
       * be confirmed.
       *
       * @example
       * ```ts
       * const { receipt } = await client.validator.addSync({
       *   active: true,
       *   inboundAddress: '192.168.1.1:8080',
       *   newValidatorAddress: '0x…',
       *   outboundAddress: '192.168.1.1:8080',
       *   publicKey: '0x…',
       * })
       * ```
       */
      addSync: (
        options: validator.addSync.Options,
      ) => Promise<validator.addSync.ReturnType>
      /**
       * Changes the owner of the validator config precompile.
       *
       * @example
       * ```ts
       * const hash = await client.validator.changeOwner({ newOwner: '0x…' })
       * ```
       */
      changeOwner: (
        options: validator.changeOwner.Options,
      ) => Promise<validator.changeOwner.ReturnType>
      /**
       * Changes the owner of the validator config precompile, and waits for
       * the transaction to be confirmed.
       *
       * @example
       * ```ts
       * const { receipt } = await client.validator.changeOwnerSync({
       *   newOwner: '0x…',
       * })
       * ```
       */
      changeOwnerSync: (
        options: validator.changeOwnerSync.Options,
      ) => Promise<validator.changeOwnerSync.ReturnType>
      /**
       * Changes validator active status (owner only).
       *
       * @example
       * ```ts
       * const hash = await client.validator.changeStatus({
       *   active: false,
       *   validator: '0x…',
       * })
       * ```
       */
      changeStatus: (
        options: validator.changeStatus.Options,
      ) => Promise<validator.changeStatus.ReturnType>
      /**
       * Changes validator active status, and waits for the transaction to be
       * confirmed.
       *
       * @example
       * ```ts
       * const { receipt } = await client.validator.changeStatusSync({
       *   active: false,
       *   validator: '0x…',
       * })
       * ```
       */
      changeStatusSync: (
        options: validator.changeStatusSync.Options,
      ) => Promise<validator.changeStatusSync.ReturnType>
      /**
       * Gets validator information by address.
       *
       * @example
       * ```ts
       * const validator = await client.validator.get({ validator: '0x…' })
       * ```
       */
      get: (options: validator.get.Options) => Promise<validator.get.ReturnType>
      /**
       * Gets validator address by index.
       *
       * @example
       * ```ts
       * const validatorAddress = await client.validator.getByIndex({
       *   index: 0n,
       * })
       * ```
       */
      getByIndex: (
        options: validator.getByIndex.Options,
      ) => Promise<validator.getByIndex.ReturnType>
      /**
       * Gets the total number of validators.
       *
       * @example
       * ```ts
       * const count = await client.validator.getCount()
       * ```
       */
      getCount: (
        options?: validator.getCount.Options | undefined,
      ) => Promise<validator.getCount.ReturnType>
      /**
       * Gets the next epoch for a full DKG ceremony.
       *
       * @example
       * ```ts
       * const epoch = await client.validator.getNextFullDkgCeremony()
       * ```
       */
      getNextFullDkgCeremony: (
        options?: validator.getNextFullDkgCeremony.Options | undefined,
      ) => Promise<validator.getNextFullDkgCeremony.ReturnType>
      /**
       * Gets the contract owner.
       *
       * @example
       * ```ts
       * const owner = await client.validator.getOwner()
       * ```
       */
      getOwner: (
        options?: validator.getOwner.Options | undefined,
      ) => Promise<validator.getOwner.ReturnType>
      /**
       * Gets the complete set of validators.
       *
       * @example
       * ```ts
       * const validators = await client.validator.list()
       * ```
       */
      list: (
        options?: validator.list.Options | undefined,
      ) => Promise<validator.list.ReturnType>
      /**
       * Sets the next epoch for a full DKG ceremony.
       *
       * @example
       * ```ts
       * const hash = await client.validator.setNextFullDkgCeremony({
       *   epoch: 100n,
       * })
       * ```
       */
      setNextFullDkgCeremony: (
        options: validator.setNextFullDkgCeremony.Options,
      ) => Promise<validator.setNextFullDkgCeremony.ReturnType>
      /**
       * Sets the next epoch for a full DKG ceremony, and waits for the
       * transaction to be confirmed.
       *
       * @example
       * ```ts
       * const { receipt } = await client.validator.setNextFullDkgCeremonySync({
       *   epoch: 100n,
       * })
       * ```
       */
      setNextFullDkgCeremonySync: (
        options: validator.setNextFullDkgCeremonySync.Options,
      ) => Promise<validator.setNextFullDkgCeremonySync.ReturnType>
      /**
       * Updates validator information (only callable by the validator
       * themselves).
       *
       * @example
       * ```ts
       * const hash = await client.validator.update({
       *   inboundAddress: '192.168.1.1:8080',
       *   newValidatorAddress: '0x…',
       *   outboundAddress: '192.168.1.1:8080',
       *   publicKey: '0x…',
       * })
       * ```
       */
      update: (
        options: validator.update.Options,
      ) => Promise<validator.update.ReturnType>
      /**
       * Updates validator information, and waits for the transaction to be
       * confirmed.
       *
       * @example
       * ```ts
       * const { receipt } = await client.validator.updateSync({
       *   inboundAddress: '192.168.1.1:8080',
       *   newValidatorAddress: '0x…',
       *   outboundAddress: '192.168.1.1:8080',
       *   publicKey: '0x…',
       * })
       * ```
       */
      updateSync: (
        options: validator.updateSync.Options,
      ) => Promise<validator.updateSync.ReturnType>
    }
  }
}
