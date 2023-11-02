import type { Address } from 'abitype'

import type { Account } from '../accounts/types.js'
import type { ErrorType } from '../errors/utils.js'
import type { ParseAccount } from '../types/account.js'
import type { Chain } from '../types/chain.js'
import type { TestRpcSchema } from '../types/eip1193.js'
import type { Prettify } from '../types/utils.js'
import {
  type Client,
  type ClientConfig,
  type CreateClientErrorType,
  createClient,
} from './createClient.js'
import { type TestActions, testActions } from './decorators/test.js'
import type { Transport } from './transports/createTransport.js'

export type TestClientMode = 'anvil' | 'hardhat' | 'ganache'

export type TestClientConfig<
  mode extends TestClientMode = TestClientMode,
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  accountOrAddress extends Account | Address | undefined =
    | Account
    | Address
    | undefined,
> = Prettify<
  Pick<
    ClientConfig<transport, chain, accountOrAddress>,
    | 'account'
    | 'cacheTime'
    | 'chain'
    | 'key'
    | 'name'
    | 'pollingInterval'
    | 'transport'
  > & {
    /** Mode of the test client. */
    mode: mode | ('anvil' | 'hardhat' | 'ganache') // TODO: Type utility that expands `TestClientMode`
  }
>

export type TestClient<
  TMode extends TestClientMode = TestClientMode,
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
  TIncludeActions extends boolean = true,
> = Prettify<
  { mode: TMode } & Client<
    transport,
    chain,
    TAccount,
    TestRpcSchema<TMode>,
    TIncludeActions extends true ? TestActions : Record<string, unknown>
  >
>

export type CreateTestClientErrorType = CreateClientErrorType | ErrorType

/**
 * @description Creates a test client with a given transport.
 */
/**
 * Creates a Test Client with a given [Transport](https://viem.sh/docs/clients/intro.html) configured for a [Chain](https://viem.sh/docs/clients/chains.html).
 *
 * - Docs: https://viem.sh/docs/clients/test.html
 *
 * A Test Client is an interface to "test" JSON-RPC API methods accessible through a local Ethereum test node such as [Anvil](https://book.getfoundry.sh/anvil/) or [Hardhat](https://hardhat.org/) such as mining blocks, impersonating accounts, setting fees, etc through [Test Actions](https://viem.sh/docs/actions/test/introduction.html).
 *
 * @param config - {@link TestClientConfig}
 * @returns A Test Client. {@link TestClient}
 *
 * @example
 * import { createTestClient, custom } from 'viem'
 * import { foundry } from 'viem/chains'
 *
 * const client = createTestClient({
 *   mode: 'anvil',
 *   chain: foundry,
 *   transport: http(),
 * })
 */
export function createTestClient<
  mode extends 'anvil' | 'hardhat' | 'ganache', // TODO: Type utility that expands `TestClientMode`
  transport extends Transport,
  chain extends Chain | undefined = undefined,
  accountOrAddress extends Account | Address | undefined = undefined,
>(
  parameters: TestClientConfig<mode, transport, chain, accountOrAddress>,
): TestClient<mode, transport, chain, ParseAccount<accountOrAddress>>

export function createTestClient(parameters: TestClientConfig): TestClient {
  const { key = 'test', name = 'Test Client', mode } = parameters
  const client = createClient({
    ...parameters,
    key,
    name,
    type: 'testClient',
  })
  return client.extend((config) => ({
    mode,
    ...testActions({ mode })(config),
  }))
}
