import type { Account } from '../accounts/types.js'
import type { ParseAccount } from '../types/account.js'
import type { Chain } from '../types/chain.js'
import type { TestRpcSchema } from '../types/eip1193.js'
import { type Client, type ClientConfig, createClient } from './createClient.js'
import { type TestActions, testActions } from './decorators/test.js'
import type { Transport } from './transports/createTransport.js'
import type { Address } from 'abitype'

export type TestClientMode = 'anvil' | 'hardhat' | 'ganache'

export type TestClientConfig<
  TMode extends TestClientMode = TestClientMode,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccountOrAddress extends Account | Address | undefined =
    | Account
    | Address
    | undefined,
> = Pick<
  ClientConfig<TTransport, TChain, TAccountOrAddress>,
  'account' | 'chain' | 'key' | 'name' | 'pollingInterval' | 'transport'
> & {
  /** Mode of the test client. Available: "anvil" | "hardhat" | "ganache" */
  mode: TMode
}

export type TestClient<
  TMode extends TestClientMode = TestClientMode,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
  TIncludeActions extends boolean = true,
> = Client<
  TTransport,
  TChain,
  TAccount,
  TestRpcSchema<TMode>,
  TIncludeActions extends true ? TestActions : Record<string, unknown>
> & {
  mode: TMode
}

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
  TMode extends TestClientMode,
  TTransport extends Transport,
  TChain extends Chain | undefined = undefined,
  TAccountOrAddress extends Account | Address | undefined = undefined,
>({
  account,
  chain,
  key = 'test',
  name = 'Test Client',
  mode,
  pollingInterval,
  transport,
}: TestClientConfig<TMode, TTransport, TChain, TAccountOrAddress>): TestClient<
  TMode,
  TTransport,
  TChain,
  ParseAccount<TAccountOrAddress>
> {
  return createClient({
    account,
    chain,
    key,
    name,
    pollingInterval,
    transport,
    type: 'testClient',
  })
    .extend(() => ({ mode }))
    .extend(testActions({ mode }))
}
