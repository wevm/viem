import type { Account } from '../../accounts/types.js'
import {
  allowance,
  approve,
  approveSync,
  getBalance,
  getTotalSupply,
  transfer,
  transferSync,
} from '../../actions/token/index.js'
import type { Chain } from '../../types/chain.js'
import type { Client } from '../createClient.js'
import type { Transport } from '../transports/createTransport.js'

export type { TokenName } from '../../actions/token/internal.js'

/**
 * The `token` namespace attached to a Client by {@link tokenActions}.
 *
 * Every action selects its token by `token`, which is either a token name
 * (resolved from the chain's `tokens` config) or a contract `address`. `amount`
 * inputs are human-readable decimal strings (e.g. `'10.5'`), parsed with the
 * token's `decimals`.
 *
 * - Docs: https://viem.sh/docs/token
 */
export type TokenActions<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
> = {
  token: {
    /**
     * Gets the amount of tokens a `spender` is allowed to spend on behalf of an
     * `owner`.
     *
     * - Docs: https://viem.sh/docs/token/allowance
     *
     * @param parameters - {@link allowance.Parameters}
     * @returns The remaining allowance, in base units and human-readable form. {@link allowance.ReturnValue}
     *
     * @example
     * import { createClient, tokenActions, http } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = createClient({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(tokenActions())
     *
     * const allowance = await client.token.allowance({
     *   owner: '0x…',
     *   spender: '0x…',
     *   token: 'usdc',
     * })
     */
    allowance: ((
      parameters: allowance.Parameters<chain>,
    ) => Promise<allowance.ReturnValue>) & {
      /**
       * Defines an `allowance` contract call, ready to pass to `multicall`,
       * `simulateContract`, or any other action that accepts a contract call.
       *
       * - Docs: https://viem.sh/docs/token/allowance#composing-calls
       *
       * @param args - {@link allowance.Args}
       * @returns The contract call.
       */
      call: (args: allowance.Args<chain>) => ReturnType<typeof allowance.call>
    }
    /**
     * Approves a `spender` to transfer up to `amount` tokens on behalf of the
     * caller.
     *
     * - Docs: https://viem.sh/docs/token/approve
     *
     * @param parameters - {@link approve.Parameters}
     * @returns The transaction hash. {@link approve.ReturnValue}
     *
     * @example
     * import { createClient, tokenActions, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { mainnet } from 'viem/chains'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x…'),
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(tokenActions())
     *
     * const hash = await client.token.approve({
     *   amount: '10.5',
     *   spender: '0x…',
     *   token: 'usdc',
     * })
     */
    approve: ((
      parameters: approve.Parameters<chain, account>,
    ) => Promise<approve.ReturnValue>) & {
      /**
       * Defines an `approve` contract call, ready to pass to `sendCalls`,
       * `sendTransaction` (`calls`), or `multicall`.
       *
       * - Docs: https://viem.sh/docs/token/approve#composing-calls
       *
       * @param args - {@link approve.Args}
       * @returns The contract call.
       */
      call: (args: approve.Args<chain>) => ReturnType<typeof approve.call>
      /**
       * Estimates the gas required to approve a `spender` to transfer up to
       * `amount` tokens on behalf of the caller.
       *
       * - Docs: https://viem.sh/docs/token/approve#estimate-gas--simulate
       *
       * @param parameters - {@link approve.Parameters}
       * @returns The gas estimate.
       */
      estimateGas: (
        parameters: approve.Parameters<chain, account>,
      ) => Promise<bigint>
      /**
       * Extracts the `Approval` event from transaction logs.
       *
       * - Docs: https://viem.sh/docs/token/approve
       *
       * @param logs - The logs.
       * @returns The decoded `Approval` event.
       */
      extractEvent: typeof approve.extractEvent
      /**
       * Simulates approving a `spender` to transfer up to `amount` tokens on
       * behalf of the caller, returning the result and write request.
       *
       * - Docs: https://viem.sh/docs/token/approve#estimate-gas--simulate
       *
       * @param parameters - {@link approve.Parameters}
       * @returns The simulation result and write request.
       */
      simulate: (
        parameters: approve.Parameters<chain, account>,
      ) => ReturnType<typeof approve.simulate>
    }
    /**
     * Approves a `spender` to transfer up to `amount` tokens on behalf of the
     * caller, and waits for the transaction to be confirmed.
     *
     * - Docs: https://viem.sh/docs/token/approveSync
     *
     * @param parameters - {@link approveSync.Parameters}
     * @returns The decoded `Approval` event and the transaction receipt. {@link approveSync.ReturnValue}
     *
     * @example
     * import { createClient, tokenActions, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { mainnet } from 'viem/chains'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x…'),
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(tokenActions())
     *
     * const { receipt, value } = await client.token.approveSync({
     *   amount: '10.5',
     *   spender: '0x…',
     *   token: 'usdc',
     * })
     */
    approveSync: (
      parameters: approveSync.Parameters<chain, account>,
    ) => Promise<approveSync.ReturnValue>
    /**
     * Gets the token balance of an `account`.
     *
     * - Docs: https://viem.sh/docs/token/getBalance
     *
     * @param parameters - {@link getBalance.Parameters}
     * @returns The token balance, in base units and human-readable form. {@link getBalance.ReturnValue}
     *
     * @example
     * import { createClient, tokenActions, http } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = createClient({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(tokenActions())
     *
     * const balance = await client.token.getBalance({
     *   account: '0x…',
     *   token: 'usdc',
     * })
     */
    getBalance: ((
      parameters: getBalance.Parameters<chain>,
    ) => Promise<getBalance.ReturnValue>) & {
      /**
       * Defines a `balanceOf` contract call, ready to pass to `multicall`,
       * `simulateContract`, or any other action that accepts a contract call.
       *
       * - Docs: https://viem.sh/docs/token/getBalance#composing-calls
       *
       * @param args - {@link getBalance.Args}
       * @returns The contract call.
       */
      call: (args: getBalance.Args<chain>) => ReturnType<typeof getBalance.call>
    }
    /**
     * Gets the total supply of the token.
     *
     * - Docs: https://viem.sh/docs/token/getTotalSupply
     *
     * @param parameters - {@link getTotalSupply.Parameters}
     * @returns The token total supply, in base units and human-readable form. {@link getTotalSupply.ReturnValue}
     *
     * @example
     * import { createClient, tokenActions, http } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = createClient({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(tokenActions())
     *
     * const totalSupply = await client.token.getTotalSupply({ token: 'usdc' })
     */
    getTotalSupply: ((
      parameters: getTotalSupply.Parameters<chain>,
    ) => Promise<getTotalSupply.ReturnValue>) & {
      /**
       * Defines a `totalSupply` contract call, ready to pass to `multicall`,
       * `simulateContract`, or any other action that accepts a contract call.
       *
       * - Docs: https://viem.sh/docs/token/getTotalSupply#composing-calls
       *
       * @param args - {@link getTotalSupply.Args}
       * @returns The contract call.
       */
      call: (
        args: getTotalSupply.Args<chain>,
      ) => ReturnType<typeof getTotalSupply.call>
    }
    /**
     * Transfers `amount` tokens to a recipient. Pass `from` to transfer on
     * behalf of another address using an allowance (calls `transferFrom`).
     *
     * - Docs: https://viem.sh/docs/token/transfer
     *
     * @param parameters - {@link transfer.Parameters}
     * @returns The transaction hash. {@link transfer.ReturnValue}
     *
     * @example
     * import { createClient, tokenActions, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { mainnet } from 'viem/chains'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x…'),
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(tokenActions())
     *
     * const hash = await client.token.transfer({
     *   amount: '10.5',
     *   to: '0x…',
     *   token: 'usdc',
     * })
     */
    transfer: ((
      parameters: transfer.Parameters<chain, account>,
    ) => Promise<transfer.ReturnValue>) & {
      /**
       * Defines a `transfer` (or `transferFrom`, when `from` is given) contract
       * call, ready to pass to `sendCalls`, `sendTransaction` (`calls`), or
       * `multicall`.
       *
       * - Docs: https://viem.sh/docs/token/transfer#composing-calls
       *
       * @param args - {@link transfer.Args}
       * @returns The contract call.
       */
      call: (args: transfer.Args<chain>) => ReturnType<typeof transfer.call>
      /**
       * Estimates the gas required to transfer `amount` tokens to a recipient.
       *
       * - Docs: https://viem.sh/docs/token/transfer#estimate-gas--simulate
       *
       * @param parameters - {@link transfer.Parameters}
       * @returns The gas estimate.
       */
      estimateGas: (
        parameters: transfer.Parameters<chain, account>,
      ) => Promise<bigint>
      /**
       * Extracts the `Transfer` event from transaction logs.
       *
       * - Docs: https://viem.sh/docs/token/transfer
       *
       * @param logs - The logs.
       * @returns The decoded `Transfer` event.
       */
      extractEvent: typeof transfer.extractEvent
      /**
       * Simulates a transfer of `amount` tokens to a recipient, returning the
       * result and write request.
       *
       * - Docs: https://viem.sh/docs/token/transfer#estimate-gas--simulate
       *
       * @param parameters - {@link transfer.Parameters}
       * @returns The simulation result and write request.
       */
      simulate: (
        parameters: transfer.Parameters<chain, account>,
      ) => ReturnType<typeof transfer.simulate>
    }
    /**
     * Transfers `amount` tokens to a recipient, and waits for the transaction to
     * be confirmed. Pass `from` to transfer on behalf of another address using
     * an allowance (calls `transferFrom`).
     *
     * - Docs: https://viem.sh/docs/token/transferSync
     *
     * @param parameters - {@link transferSync.Parameters}
     * @returns The decoded `Transfer` event and the transaction receipt. {@link transferSync.ReturnValue}
     *
     * @example
     * import { createClient, tokenActions, http } from 'viem'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { mainnet } from 'viem/chains'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x…'),
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(tokenActions())
     *
     * const { receipt, value } = await client.token.transferSync({
     *   amount: '10.5',
     *   to: '0x…',
     *   token: 'usdc',
     * })
     */
    transferSync: (
      parameters: transferSync.Parameters<chain, account>,
    ) => Promise<transferSync.ReturnValue>
  }
}

/**
 * A suite of ERC-20 Actions, attached to the Client as a single `token`
 * namespace.
 *
 * Each action selects its token by `token`, which is either a token name
 * (resolved from the connected chain's `tokens` config) or a contract
 * `address`. `amount` inputs are human-readable decimal strings (e.g. `'10.5'`),
 * parsed with the token's `decimals`.
 *
 * - Docs: https://viem.sh/docs/token
 *
 * @returns A Client decorator that adds the `token` namespace ({@link TokenActions}) to the Client.
 *
 * @example
 * import { createClient, tokenActions, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = createClient({
 *   chain: mainnet,
 *   transport: http(),
 * }).extend(tokenActions())
 *
 * const balance = await client.token.getBalance({ account: '0x…', token: 'usdc' })
 * await client.token.transfer({ amount: '10.5', to: '0x…', token: 'usdc' })
 */
export function tokenActions() {
  return <
    transport extends Transport,
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    client: Client<transport, chain, account>,
  ): TokenActions<chain, account> => {
    return { token: bindToken(client) } as never
  }
}

/**
 * Binds each ERC-20 action (and its `.call`/`.estimateGas`/`.simulate`/
 * `.extractEvent` helpers) to `client`. Token selection (`token` name or
 * contract `address`) is resolved inside each action. @internal
 */
function bindToken(client: Client<Transport, Chain | undefined, any>) {
  function bind(action: any) {
    const wrapped = (parameters: any = {}) => action(client, parameters)
    if (Object.hasOwn(action, 'call'))
      wrapped.call = (args: any = {}) => action.call(client, args)
    if (Object.hasOwn(action, 'estimateGas'))
      wrapped.estimateGas = (args: any = {}) => action.estimateGas(client, args)
    if (Object.hasOwn(action, 'simulate'))
      wrapped.simulate = (args: any = {}) => action.simulate(client, args)
    if (Object.hasOwn(action, 'extractEvent'))
      wrapped.extractEvent = action.extractEvent
    return wrapped
  }

  return {
    allowance: bind(allowance),
    approve: bind(approve),
    approveSync: bind(approveSync),
    getBalance: bind(getBalance),
    getTotalSupply: bind(getTotalSupply),
    transfer: bind(transfer),
    transferSync: bind(transferSync),
  }
}
