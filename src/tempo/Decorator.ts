import type * as Client from '../core/Client.js'
import * as fee from './actions/fee.js'
import * as nonce from './actions/nonce.js'
import * as token from './actions/token.js'

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
  })
}

export declare namespace tempoActions {
  type Decorator = {
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
  }
}
