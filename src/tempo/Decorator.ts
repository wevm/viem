import type * as Account from '../core/Account.js'
import type * as Chain from '../core/Chain.js'
import type * as Client from '../core/Client.js'
import type * as Transport from '../core/Transport.js'
import * as fee from './actions/fee/index.js'
import * as nonce from './actions/nonce/index.js'
import * as token from './actions/token/index.js'

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
    fee: {
      getUserToken: (options) => fee.getUserToken(client, options),
      getValidatorToken: (options) =>
        fee.getValidatorToken(client, options as never),
      setUserToken: (options) => fee.setUserToken(client, options as never),
      setUserTokenSync: (options) =>
        fee.setUserTokenSync(client, options as never),
      setValidatorToken: (options) =>
        fee.setValidatorToken(client, options as never),
      setValidatorTokenSync: (options) =>
        fee.setValidatorTokenSync(client, options as never),
      validateToken: (options) => fee.validateToken(client, options as never),
      watchSetUserToken: (options) => fee.watchSetUserToken(client, options),
      watchSetValidatorToken: (options) =>
        fee.watchSetValidatorToken(client, options),
    },
    nonce: {
      get: (options) => nonce.get(client, options as never),
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
  })
}

export type Decorator<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
  account extends Account.Account | undefined = Account.Account | undefined,
> = {
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
    create: (options: token.create.Options) => Promise<token.create.ReturnType>
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
      options: token.createSync.Options,
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
} & ([chain, account] extends [unknown, unknown] ? unknown : never)
