import type { Abi, TypedData } from 'abitype'

import type * as Account from '../../Account.js'
import type * as Chain from '../../Chain.js'
import type * as Client from '../../Client.js'
import type {
  ContractConstructorArgs,
  ContractFunctionArgs,
  ContractFunctionName,
} from '../internal/contract.js'
import * as chains from '../chains/index.js'
import * as contract from '../contract/index.js'
import { signMessage } from '../signMessage.js'
import { signTypedData } from '../signTypedData.js'
import * as transaction from '../transaction/index.js'

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
  >(
    client: Client.Client<chain, account>,
  ): walletActions.Decorator<chain, account> => ({
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
    transaction: {
      fill: (options) => transaction.fill(client, options),
      prepare: (options) => transaction.prepare(client, options),
      send: (options) => transaction.send(client, options),
      sendRaw: (options) => transaction.sendRaw(client, options),
      sendRawSync: (options) => transaction.sendRawSync(client, options),
      sendSync: (options) => transaction.sendSync(client, options),
      sign: (options) => transaction.sign(client, options),
    },
    signMessage: (options) => signMessage(client, options),
    signTypedData: (options) => signTypedData(client, options as never),
  })
}

export declare namespace walletActions {
  type Decorator<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
    account extends Account.Account | undefined = Account.Account | undefined,
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
