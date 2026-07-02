import type { Abi, TypedData } from 'abitype'

import type * as Account from '../../Account.js'
import type * as Chain from '../../Chain.js'
import type * as Client from '../../Client.js'
import type * as Token from '../../Token.js'
import type * as Transport from '../../Transport.js'
import type {
  ContractConstructorArgs,
  ContractFunctionArgs,
  ContractFunctionName,
} from '../internal/contract.js'
import * as chains from '../chains/index.js'
import * as contract from '../contract/index.js'
import { signMessage } from '../signMessage.js'
import { signTypedData } from '../signTypedData.js'
import * as token from '../token/index.js'
import * as transaction from '../transaction/index.js'
import * as wallet from '../wallet/index.js'

/**
 * Bag of wallet actions bound to a {@link Client}. Pass to `Client.create`'s
 * `.extend`.
 *
 * @example
 * ```ts
 * import { Account, Client, http, walletActions } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   account: Account.fromPrivateKey('0x…'),
 *   chain: mainnet,
 *   transport: http(),
 * }).extend(walletActions())
 * const hash = await client.transaction.send({
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *   value: 1n,
 * })
 * ```
 */
export function walletActions() {
  return <
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
    tokens extends Token.Tokens | undefined = undefined,
  >(
    client: Client.Client<chain, account, Transport.Transport, tokens>,
  ): walletActions.Decorator<chain, account, tokens> => ({
    chains: {
      add: (options) => chains.add(client, options),
      switch: (options) => chains.switch(client, options),
    },
    contract: {
      deploy: (options) => contract.deploy(client, options as never),
      deploySync: (options) => contract.deploySync(client, options as never),
      write: (options) => contract.write(client, options as never),
      writeSync: (options) => contract.writeSync(client, options as never),
    },
    token: {
      approve: Object.assign(
        (options: never) => token.approve(client, options),
        {
          call: (args: never) => token.approve.call(client, args),
          estimateGas: (options: never) =>
            token.approve.estimateGas(client, options),
          extractEvent: token.approve.extractEvent,
          simulate: (options: never) => token.approve.simulate(client, options),
        },
      ),
      approveSync: (options: never) => token.approveSync(client, options),
      transfer: Object.assign(
        (options: never) => token.transfer(client, options),
        {
          call: (args: never) => token.transfer.call(client, args),
          estimateGas: (options: never) =>
            token.transfer.estimateGas(client, options),
          extractEvent: token.transfer.extractEvent,
          simulate: (options: never) =>
            token.transfer.simulate(client, options),
        },
      ),
      transferSync: (options: never) => token.transferSync(client, options),
    } as never,
    transaction: {
      fill: (options) => transaction.fill(client, options),
      prepare: (options) => transaction.prepare(client, options),
      send: (options) => transaction.send(client, options),
      sendRaw: (options) => transaction.sendRaw(client, options),
      sendRawSync: (options) => transaction.sendRawSync(client, options),
      sendSync: (options) => transaction.sendSync(client, options),
      sign: (options) => transaction.sign(client, options),
    },
    wallet: {
      getAddresses: () => wallet.getAddresses(client),
      getCallsStatus: (options) => wallet.getCallsStatus(client, options),
      getCapabilities: (options) => wallet.getCapabilities(client, options),
      getPermissions: () => wallet.getPermissions(client),
      prepareAuthorization: (options) =>
        wallet.prepareAuthorization(client, options),
      requestAddresses: () => wallet.requestAddresses(client),
      requestPermissions: (options) =>
        wallet.requestPermissions(client, options),
      sendCalls: (options) => wallet.sendCalls(client, options as never),
      sendCallsSync: (options) =>
        wallet.sendCallsSync(client, options as never),
      showCallsStatus: (options) => wallet.showCallsStatus(client, options),
      signAuthorization: (options) => wallet.signAuthorization(client, options),
      waitForCallsStatus: (options) =>
        wallet.waitForCallsStatus(client, options),
      watchAsset: (options) => wallet.watchAsset(client, options),
    },
    signMessage: (options) => signMessage(client, options),
    signTypedData: (options) => signTypedData(client, options as never),
  })
}

export declare namespace walletActions {
  type Decorator<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
    account extends Account.Account | undefined = Account.Account | undefined,
    tokens extends Token.Tokens | undefined = Token.Tokens | undefined,
  > = {
    chains: {
      /**
       * Adds an EVM chain to the wallet.
       *
       * @example
       * ```ts
       * import { Client, custom, walletActions } from 'viem'
       * import { optimism } from 'viem/chains'
       *
       * const client = Client.create({
       *   transport: custom(window.ethereum!),
       * }).extend(walletActions())
       * await client.chains.add({ chain: optimism })
       * ```
       */
      add: (options: chains.add.Options) => Promise<void>
      /**
       * Switches the target chain in a wallet.
       *
       * @example
       * ```ts
       * import { Client, custom, walletActions } from 'viem'
       * import { mainnet, optimism } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: custom(window.ethereum!),
       * }).extend(walletActions())
       * await client.chains.switch({ id: optimism.id })
       * ```
       */
      switch: (options: chains.switch.Options) => Promise<void>
    }
    contract: {
      /**
       * Deploys a contract to the network.
       *
       * @example
       * ```ts
       * import { Account, Client, http, walletActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       * import { Abi } from 'viem/utils'
       *
       * const client = Client.create({
       *   account: Account.fromPrivateKey('0x…'),
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(walletActions())
       * const hash = await client.contract.deploy({
       *   abi: Abi.from(['constructor(address owner)']),
       *   args: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e'],
       *   bytecode: '0x608060405260405161083e38038061083e8339810160408190...',
       * })
       * ```
       */
      deploy: <
        const abi extends Abi | readonly unknown[],
        const args extends ContractConstructorArgs<abi>,
      >(
        options: contract.deploy.Options<abi, chain, args>,
      ) => Promise<contract.deploy.ReturnType>
      /**
       * Deploys a contract to the network synchronously.
       *
       * @example
       * ```ts
       * import { Account, Client, http, walletActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       * import { Abi } from 'viem/utils'
       *
       * const client = Client.create({
       *   account: Account.fromPrivateKey('0x…'),
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(walletActions())
       * const receipt = await client.contract.deploySync({
       *   abi: Abi.from(['constructor(address owner)']),
       *   args: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e'],
       *   bytecode: '0x608060405260405161083e38038061083e8339810160408190...',
       * })
       * ```
       */
      deploySync: <
        const abi extends Abi | readonly unknown[],
        const args extends ContractConstructorArgs<abi>,
      >(
        options: contract.deploySync.Options<abi, chain, args>,
      ) => Promise<contract.deploySync.ReturnType<chain>>
      /**
       * Executes a write (`nonpayable`/`payable`) function on a contract.
       *
       * @example
       * ```ts
       * import { Account, Client, http, walletActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       * import { Abi } from 'viem/utils'
       *
       * const client = Client.create({
       *   account: Account.fromPrivateKey('0x…'),
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(walletActions())
       * const hash = await client.contract.write({
       *   abi: Abi.from(['function mint(uint32 tokenId)']),
       *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
       *   args: [69420],
       *   functionName: 'mint',
       * })
       * ```
       */
      write: <
        const abi extends Abi | readonly unknown[],
        functionName extends ContractFunctionName<
          abi,
          'nonpayable' | 'payable'
        >,
        const args extends ContractFunctionArgs<
          abi,
          'nonpayable' | 'payable',
          functionName
        >,
      >(
        options: contract.write.Options<abi, functionName, args, chain>,
      ) => Promise<contract.write.ReturnType>
      /**
       * Executes a write (`nonpayable`/`payable`) function on a contract
       * synchronously.
       *
       * @example
       * ```ts
       * import { Account, Client, http, walletActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       * import { Abi } from 'viem/utils'
       *
       * const client = Client.create({
       *   account: Account.fromPrivateKey('0x…'),
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(walletActions())
       * const receipt = await client.contract.writeSync({
       *   abi: Abi.from(['function mint(uint32 tokenId)']),
       *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
       *   args: [69420],
       *   functionName: 'mint',
       * })
       * ```
       */
      writeSync: <
        const abi extends Abi | readonly unknown[],
        functionName extends ContractFunctionName<
          abi,
          'nonpayable' | 'payable'
        >,
        const args extends ContractFunctionArgs<
          abi,
          'nonpayable' | 'payable',
          functionName
        >,
      >(
        options: contract.writeSync.Options<abi, functionName, args, chain>,
      ) => Promise<contract.writeSync.ReturnType<chain>>
    }
    token: {
      /**
       * Approves a spender to transfer ERC-20 tokens on behalf of the caller.
       *
       * @example
       * ```ts
       * import { Account, Client, http, walletActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   account: Account.fromPrivateKey('0x…'),
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(walletActions())
       * const hash = await client.token.approve({
       *   amount: 100000000n,
       *   spender: '0x…',
       *   token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
       * })
       * ```
       */
      approve: ((
        options: token.approve.Options<chain, account, tokens>,
      ) => Promise<token.approve.ReturnType>) & {
        /** Defines an `approve` contract call. */
        call: (
          args: token.approve.Args<chain, tokens>,
        ) => ReturnType<typeof token.approve.call>
        /** Estimates the gas required to approve a spender. */
        estimateGas: (
          options: token.approve.Options<chain, account, tokens>,
        ) => Promise<bigint>
        /** Extracts the `Approval` event from logs. */
        extractEvent: typeof token.approve.extractEvent
        /** Simulates an approval of a spender. */
        simulate: (
          options: token.approve.Options<chain, account, tokens>,
        ) => ReturnType<typeof token.approve.simulate>
      }
      /**
       * Approves a spender to transfer ERC-20 tokens on behalf of the caller,
       * and waits for the transaction to be confirmed.
       *
       * @example
       * ```ts
       * import { Account, Client, http, walletActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   account: Account.fromPrivateKey('0x…'),
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(walletActions())
       * const { receipt, ...event } = await client.token.approveSync({
       *   amount: 100000000n,
       *   spender: '0x…',
       *   token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
       * })
       * ```
       */
      approveSync: (
        options: token.approveSync.Options<chain, account, tokens>,
      ) => Promise<token.approveSync.ReturnType<chain>>
      /**
       * Transfers ERC-20 tokens to another address.
       *
       * @example
       * ```ts
       * import { Account, Client, http, walletActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   account: Account.fromPrivateKey('0x…'),
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(walletActions())
       * const hash = await client.token.transfer({
       *   amount: 100000000n,
       *   to: '0x…',
       *   token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
       * })
       * ```
       */
      transfer: ((
        options: token.transfer.Options<chain, account, tokens>,
      ) => Promise<token.transfer.ReturnType>) & {
        /** Defines a `transfer`/`transferFrom` contract call. */
        call: (
          args: token.transfer.Args<chain, tokens>,
        ) => ReturnType<typeof token.transfer.call>
        /** Estimates the gas required to transfer ERC-20 tokens. */
        estimateGas: (
          options: token.transfer.Options<chain, account, tokens>,
        ) => Promise<bigint>
        /** Extracts the `Transfer` event from logs. */
        extractEvent: typeof token.transfer.extractEvent
        /** Simulates a transfer of ERC-20 tokens. */
        simulate: (
          options: token.transfer.Options<chain, account, tokens>,
        ) => ReturnType<typeof token.transfer.simulate>
      }
      /**
       * Transfers ERC-20 tokens to another address, and waits for the
       * transaction to be confirmed.
       *
       * @example
       * ```ts
       * import { Account, Client, http, walletActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   account: Account.fromPrivateKey('0x…'),
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(walletActions())
       * const { receipt, ...event } = await client.token.transferSync({
       *   amount: 100000000n,
       *   to: '0x…',
       *   token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
       * })
       * ```
       */
      transferSync: (
        options: token.transferSync.Options<chain, account, tokens>,
      ) => Promise<token.transferSync.ReturnType<chain>>
    }
    transaction: {
      /**
       * Fills a transaction request with fields required to be signed over.
       *
       * @example
       * ```ts
       * import { Client, http, walletActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(walletActions())
       * const { raw, transaction } = await client.transaction.fill({
       *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
       *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
       *   value: 1n,
       * })
       * ```
       */
      fill: (
        options: transaction.fill.Options<chain>,
      ) => Promise<transaction.fill.ReturnType<chain>>
      /**
       * Prepares a transaction request for signing.
       *
       * @example
       * ```ts
       * import { Client, http, walletActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(walletActions())
       * const { request } = await client.transaction.prepare({
       *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
       *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
       *   value: 1n,
       * })
       * ```
       */
      prepare: <const options extends transaction.prepare.Options<chain>>(
        options: transaction.prepare.Options<chain> & options,
      ) => Promise<transaction.prepare.ReturnType<chain, account, options>>
      /**
       * Creates, signs, and sends a new transaction to the network.
       *
       * @example
       * ```ts
       * import { Account, Client, http, walletActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   account: Account.fromPrivateKey('0x…'),
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(walletActions())
       * const hash = await client.transaction.send({
       *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
       *   value: 1n,
       * })
       * ```
       */
      send: (
        options: transaction.send.Options<chain>,
      ) => Promise<transaction.send.ReturnType>
      /**
       * Sends a signed serialized transaction to the network.
       *
       * @example
       * ```ts
       * import { Client, http, walletActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(walletActions())
       * const hash = await client.transaction.sendRaw({
       *   transaction: '0x02f850018203118080825208808080c080a0…',
       * })
       * ```
       */
      sendRaw: (
        options: transaction.sendRaw.Options,
      ) => Promise<transaction.sendRaw.ReturnType>
      /**
       * Sends a signed serialized transaction to the network synchronously.
       *
       * @example
       * ```ts
       * import { Client, http, walletActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(walletActions())
       * const receipt = await client.transaction.sendRawSync({
       *   transaction: '0x02f850018203118080825208808080c080a0…',
       * })
       * ```
       */
      sendRawSync: (
        options: transaction.sendRawSync.Options,
      ) => Promise<transaction.sendRawSync.ReturnType<chain>>
      /**
       * Creates, signs, and sends a new transaction to the network
       * synchronously.
       *
       * @example
       * ```ts
       * import { Account, Client, http, walletActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   account: Account.fromPrivateKey('0x…'),
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(walletActions())
       * const receipt = await client.transaction.sendSync({
       *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
       *   value: 1n,
       * })
       * ```
       */
      sendSync: (
        options: transaction.sendSync.Options<chain>,
      ) => Promise<transaction.sendSync.ReturnType<chain>>
      /**
       * Signs a transaction.
       *
       * @example
       * ```ts
       * import { Account, Client, http, walletActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   account: Account.fromPrivateKey('0x…'),
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(walletActions())
       * const signed = await client.transaction.sign({
       *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
       *   value: 1n,
       * })
       * ```
       */
      sign: (
        options: transaction.sign.Options<chain>,
      ) => Promise<transaction.sign.ReturnType>
    }
    wallet: {
      /**
       * Returns a list of account addresses owned by the wallet or client.
       *
       * @example
       * ```ts
       * import { Client, custom, walletActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: custom(window.ethereum!),
       * }).extend(walletActions())
       * const addresses = await client.wallet.getAddresses()
       * ```
       */
      getAddresses: () => Promise<wallet.getAddresses.ReturnType>
      /**
       * Returns the status of a call batch that was sent via `sendCalls`.
       *
       * @example
       * ```ts
       * import { Client, custom, walletActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: custom(window.ethereum!),
       * }).extend(walletActions())
       * const { receipts, status } = await client.wallet.getCallsStatus({
       *   id: '0xdeadbeef',
       * })
       * ```
       */
      getCallsStatus: (
        options: wallet.getCallsStatus.Options,
      ) => Promise<wallet.getCallsStatus.ReturnType>
      /**
       * Extracts capabilities that a connected wallet supports.
       *
       * @example
       * ```ts
       * import { Client, custom, walletActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: custom(window.ethereum!),
       * }).extend(walletActions())
       * const capabilities = await client.wallet.getCapabilities()
       * ```
       */
      getCapabilities: <chainId extends number | undefined = undefined>(
        options?: wallet.getCapabilities.Options<chainId> | undefined,
      ) => Promise<wallet.getCapabilities.ReturnType<chainId>>
      /**
       * Gets the wallet's current permissions.
       *
       * @example
       * ```ts
       * import { Client, custom, walletActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: custom(window.ethereum!),
       * }).extend(walletActions())
       * const permissions = await client.wallet.getPermissions()
       * ```
       */
      getPermissions: () => Promise<wallet.getPermissions.ReturnType>
      /**
       * Prepares an [EIP-7702](https://eips.ethereum.org/EIPS/eip-7702)
       * Authorization object for signing.
       *
       * @example
       * ```ts
       * import { Account, Client, http, walletActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   account: Account.fromPrivateKey('0x…'),
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(walletActions())
       * const authorization = await client.wallet.prepareAuthorization({
       *   address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
       * })
       * ```
       */
      prepareAuthorization: (
        options: wallet.prepareAuthorization.Options,
      ) => Promise<wallet.prepareAuthorization.ReturnType>
      /**
       * Requests a list of accounts managed by a wallet.
       *
       * @example
       * ```ts
       * import { Client, custom, walletActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: custom(window.ethereum!),
       * }).extend(walletActions())
       * const addresses = await client.wallet.requestAddresses()
       * ```
       */
      requestAddresses: () => Promise<wallet.requestAddresses.ReturnType>
      /**
       * Requests permissions for a wallet.
       *
       * @example
       * ```ts
       * import { Client, custom, walletActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: custom(window.ethereum!),
       * }).extend(walletActions())
       * const permissions = await client.wallet.requestPermissions({
       *   eth_accounts: {},
       * })
       * ```
       */
      requestPermissions: (
        options: wallet.requestPermissions.Options,
      ) => Promise<wallet.requestPermissions.ReturnType>
      /**
       * Requests the connected wallet to send a batch of calls.
       *
       * @example
       * ```ts
       * import { Client, custom, walletActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: custom(window.ethereum!),
       * }).extend(walletActions())
       * const { id } = await client.wallet.sendCalls({
       *   calls: [
       *     { to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', value: 1n },
       *   ],
       * })
       * ```
       */
      sendCalls: <const calls extends readonly unknown[]>(
        options: wallet.sendCalls.Options<chain, account, chain, calls>,
      ) => Promise<wallet.sendCalls.ReturnType>
      /**
       * Requests the connected wallet to send a batch of calls, and waits for
       * the calls to be included in a block.
       *
       * @example
       * ```ts
       * import { Client, custom, walletActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: custom(window.ethereum!),
       * }).extend(walletActions())
       * const status = await client.wallet.sendCallsSync({
       *   calls: [
       *     { to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', value: 1n },
       *   ],
       * })
       * ```
       */
      sendCallsSync: <const calls extends readonly unknown[]>(
        options: wallet.sendCallsSync.Options<chain, account, chain, calls>,
      ) => Promise<wallet.sendCallsSync.ReturnType>
      /**
       * Requests for the wallet to show information about a call batch that was
       * sent via `sendCalls`.
       *
       * @example
       * ```ts
       * import { Client, custom, walletActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: custom(window.ethereum!),
       * }).extend(walletActions())
       * await client.wallet.showCallsStatus({ id: '0xdeadbeef' })
       * ```
       */
      showCallsStatus: (
        options: wallet.showCallsStatus.Options,
      ) => Promise<wallet.showCallsStatus.ReturnType>
      /**
       * Signs an [EIP-7702](https://eips.ethereum.org/EIPS/eip-7702)
       * Authorization object.
       *
       * @example
       * ```ts
       * import { Account, Client, http, walletActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   account: Account.fromPrivateKey('0x…'),
       *   chain: mainnet,
       *   transport: http(),
       * }).extend(walletActions())
       * const authorization = await client.wallet.signAuthorization({
       *   address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
       * })
       * ```
       */
      signAuthorization: (
        options: wallet.signAuthorization.Options,
      ) => Promise<wallet.signAuthorization.ReturnType>
      /**
       * Waits for the status & receipts of a call bundle that was sent via
       * `sendCalls`.
       *
       * @example
       * ```ts
       * import { Client, custom, walletActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: custom(window.ethereum!),
       * }).extend(walletActions())
       * const { receipts, status } = await client.wallet.waitForCallsStatus({
       *   id: '0xdeadbeef',
       * })
       * ```
       */
      waitForCallsStatus: (
        options: wallet.waitForCallsStatus.Options,
      ) => Promise<wallet.waitForCallsStatus.ReturnType>
      /**
       * Adds an EVM token to the wallet's watchlist.
       *
       * @example
       * ```ts
       * import { Client, custom, walletActions } from 'viem'
       * import { mainnet } from 'viem/chains'
       *
       * const client = Client.create({
       *   chain: mainnet,
       *   transport: custom(window.ethereum!),
       * }).extend(walletActions())
       * const success = await client.wallet.watchAsset({
       *   type: 'ERC20',
       *   options: {
       *     address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
       *     decimals: 18,
       *     symbol: 'WETH',
       *   },
       * })
       * ```
       */
      watchAsset: (
        options: wallet.watchAsset.Options,
      ) => Promise<wallet.watchAsset.ReturnType>
    }
    /**
     * Calculates an [EIP-191](https://eips.ethereum.org/EIPS/eip-191)
     * signature over a personal message.
     *
     * @example
     * ```ts
     * import { Account, Client, http, walletActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   account: Account.fromPrivateKey('0x…'),
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(walletActions())
     * const signature = await client.signMessage({
     *   message: 'hello world',
     * })
     * ```
     */
    signMessage: (
      options: signMessage.Options,
    ) => Promise<signMessage.ReturnType>
    /**
     * Signs [EIP-712](https://eips.ethereum.org/EIPS/eip-712) typed data.
     *
     * @example
     * ```ts
     * import { Account, Client, http, walletActions } from 'viem'
     * import { mainnet } from 'viem/chains'
     *
     * const client = Client.create({
     *   account: Account.fromPrivateKey('0x…'),
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(walletActions())
     * const signature = await client.signTypedData({
     *   domain: { name: 'Ether Mail', version: '1' },
     *   types: { Mail: [{ name: 'contents', type: 'string' }] },
     *   primaryType: 'Mail',
     *   message: { contents: 'hello world' },
     * })
     * ```
     */
    signTypedData: <
      const typedData extends TypedData | Record<string, unknown>,
      primaryType extends keyof typedData | 'EIP712Domain' = keyof typedData,
    >(
      options: signTypedData.Options<typedData, primaryType>,
    ) => Promise<signTypedData.ReturnType>
  }
}
