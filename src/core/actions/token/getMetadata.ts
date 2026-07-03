import type * as Account from '../../Account.js'
import type * as Chain from '../../Chain.js'
import type * as Client from '../../Client.js'
import type * as Token from '../../Token.js'
import type * as Transport from '../../Transport.js'
import { read } from '../contract/read.js'
import { erc20Abi } from './internal/abi.js'
import {
  findDeclaredToken,
  type ReadParameters,
  resolveToken,
  type TokenParameter,
} from './internal.js'

/**
 * Gets the metadata (`decimals`, `name`, `symbol`) of an ERC-20 token.
 *
 * Fields declared on the Client's `tokens` array are used as-is; any missing
 * field is fetched from the token contract.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({ chain: mainnet, transport: http() })
 *
 * const metadata = await Actions.token.getMetadata(client, {
 *   token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The token metadata (`decimals`, `name`, `symbol`).
 */
export async function getMetadata<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
  tokens extends Token.Tokens | undefined = undefined,
>(
  client: Client.Client<chain, account, Transport.Transport, tokens>,
  options: getMetadata.Options<chain, tokens>,
): Promise<getMetadata.ReturnType> {
  const { token, ...rest } = options
  const { address } = resolveToken(client, { token })
  const declared = findDeclaredToken(client, token)

  const [decimals, name, symbol] = await Promise.all([
    declared?.decimals ??
      read(client, {
        ...rest,
        abi: erc20Abi,
        address,
        functionName: 'decimals',
      }),
    declared?.name ??
      read(client, { ...rest, abi: erc20Abi, address, functionName: 'name' }),
    declared?.symbol ??
      read(client, { ...rest, abi: erc20Abi, address, functionName: 'symbol' }),
  ])

  return {
    decimals: decimals as number,
    name: name as string,
    symbol: symbol as string,
  }
}

export declare namespace getMetadata {
  type Args<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
    tokens extends Token.Tokens | undefined = Token.Tokens | undefined,
  > = TokenParameter<chain, tokens>
  type Options<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
    tokens extends Token.Tokens | undefined = Token.Tokens | undefined,
  > = Omit<ReadParameters, 'account'> & Args<chain, tokens>
  type ReturnType = {
    /** Number of decimals the token uses. */
    decimals: number
    /** Human-readable name of the token. */
    name: string
    /** Ticker symbol of the token. */
    symbol: string
  }
}
