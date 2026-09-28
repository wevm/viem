import * as Http from 'node:http'
import type { AddressInfo } from 'node:net'
import type { RpcRequest } from 'ox'
import {
  type Account,
  type Address,
  type Client,
  createClient,
  type Transport,
} from 'viem'
import { Relay } from 'viem/tempo'
import * as Tempo from './config.js'

export const { accounts, addresses, chain, http } = Tempo

export function getClient<account extends Account | undefined = undefined>(
  options: { account?: account | undefined; url?: string | undefined } = {},
): Client<Transport, typeof chain, account> {
  return createClient({
    chain,
    pollingInterval: 100,
    transport: http(options.url),
    account: options.account,
  }) as never
}

export function readClient(url?: string, chainId: number = chain.id) {
  return (id = chainId) =>
    createClient({
      chain: { ...chain, id },
      transport: http(url),
      batch: { multicall: { deployless: true } },
    })
}

export type Server = Http.Server & {
  closeAsync: () => Promise<void>
  url: string
}
export async function createServer(
  listener: Http.RequestListener,
): Promise<Server> {
  const server = Http.createServer(listener)
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  return Object.assign(server, {
    url: `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
    closeAsync: () =>
      new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      ),
  })
}

/** Assembles the public plugins for the imported Tempo API test configurations. */
export async function relay(
  options: {
    autoSwap?: false | Relay.autoSwap.Options | undefined
    feePayer?: Relay.feePayer.Options | undefined
    features?: 'all' | undefined
    getClient?: ReturnType<typeof readClient> | undefined
    internal_allowUnsafeUrls?: boolean | undefined
    multisig?: Relay.multisig.Options | undefined
    onRequest?: ((request: RpcRequest.RpcRequest) => Promise<void>) | undefined
    tokens?:
      | readonly {
          address: Address
          decimals: number
          name: string
          symbol: string
        }[]
      | undefined
  } = {},
) {
  const handler = Relay.create({
    getClient: ({ chainId }) => (options.getClient ?? readClient())(chainId),
    plugins: [
      ...(options.onRequest
        ? [
            ((next) => async (request, requestOptions) => {
              await options.onRequest?.({
                ...request,
                jsonrpc: '2.0',
                id: 0,
              } as RpcRequest.RpcRequest)
              return next(request, requestOptions)
            }) satisfies Relay.Plugin,
          ]
        : []),
      Relay.feePayer({
        ...options.feePayer,
        internal_allowUnsafeUrls: options.internal_allowUnsafeUrls,
      }),
      ...(options.tokens || options.features === 'all'
        ? [
            Relay.feeToken({
              resolveTokens: () =>
                options.tokens?.map((token) => token.address) ?? [],
            }),
          ]
        : []),
      ...(options.autoSwap !== false &&
      (options.autoSwap || options.features === 'all')
        ? [Relay.autoSwap(options.autoSwap || {})]
        : []),
      ...(options.features === 'all' ? [Relay.simulate()] : []),
      ...(options.multisig ? [Relay.multisig(options.multisig)] : []),
    ],
  })
  const listener: Http.RequestListener = async (req, res) => {
    const chunks: Buffer[] = []
    for await (const chunk of req) chunks.push(Buffer.from(chunk))
    const url = new URL(req.url ?? '/', 'http://localhost')
    const chainId = Number(url.pathname.slice(1)) || chain.id
    const response = await handler.fetch(
      new Request(url, {
        method: req.method ?? 'POST',
        headers: { 'content-type': 'application/json' },
        body: Buffer.concat(chunks),
      }),
      { chainId },
    )
    res.writeHead(response.status, {
      'content-type':
        response.headers.get('content-type') ?? 'application/json',
    })
    res.end(await response.text())
  }
  return { ...handler, listener }
}
