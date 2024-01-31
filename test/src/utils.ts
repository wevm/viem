/* c8 ignore start */
import type { Abi } from 'abitype'

import { getTransactionReceipt } from '~viem/actions/public/getTransactionReceipt.js'
import { impersonateAccount } from '~viem/actions/test/impersonateAccount.js'
import { mine } from '~viem/actions/test/mine.js'
import { reset } from '~viem/actions/test/reset.js'
import { stopImpersonatingAccount } from '~viem/actions/test/stopImpersonatingAccount.js'
import {
  type DeployContractParameters,
  deployContract,
} from '~viem/actions/wallet/deployContract.js'
import { writeContract } from '~viem/actions/wallet/writeContract.js'
import { localhost, mainnet, sepolia } from '~viem/chains/index.js'
import { createPublicClient } from '~viem/clients/createPublicClient.js'
import { createTestClient } from '~viem/clients/createTestClient.js'
import { createWalletClient } from '~viem/clients/createWalletClient.js'
import { custom } from '~viem/clients/transports/custom.js'
import { http } from '~viem/clients/transports/http.js'
import { ipc } from '~viem/clients/transports/ipc.js'
import { webSocket } from '~viem/clients/transports/webSocket.js'
import { RpcRequestError } from '~viem/errors/request.js'
import type { Chain } from '~viem/types/chain.js'
import { type EIP1193Provider, ProviderRpcError } from '~viem/types/eip1193.js'
import { namehash } from '~viem/utils/ens/namehash.js'
import { getHttpRpcClient } from '~viem/utils/rpc/http.js'

import { type RequestListener, createServer } from 'http'
import type { AddressInfo } from 'net'
import {
  ERC20InvalidTransferEvent,
  EnsAvatarTokenUri,
  ErrorsExample,
  OffchainLookupExample,
  Payable,
} from '../contracts/generated.js'
import {
  baycContractConfig,
  ensRegistryConfig,
  ensReverseRegistrarConfig,
} from './abis.js'
import {
  accounts,
  address,
  forkUrl,
  localHttpUrl,
  localIpcPath,
  localWsUrl,
} from './constants.js'

export const anvilChain = {
  ...localhost,
  id: 1,
  contracts: mainnet.contracts,
  rpcUrls: {
    default: {
      http: [localHttpUrl],
      webSocket: [localWsUrl],
    },
  },
} as const satisfies Chain

let id = 0

const provider: EIP1193Provider = {
  on: (message, listener) => {
    if (message === 'accountsChanged') {
      listener([accounts[0].address] as any)
    }
  },
  removeListener: () => null,
  request: async ({ method, params }: any) => {
    if (method === 'eth_requestAccounts') {
      return [accounts[0].address]
    }
    if (method === 'personal_sign') {
      method = 'eth_sign'
      params = [params[1], params[0]]
    }
    if (method === 'wallet_watchAsset') {
      if (params.type === 'ERC721') {
        throw new ProviderRpcError(-32602, 'Token type ERC721 not supported.')
      }
      return true
    }
    if (method === 'wallet_addEthereumChain') return null
    if (method === 'wallet_switchEthereumChain') {
      if (params[0].chainId === '0xfa') {
        throw new ProviderRpcError(-4902, 'Unrecognized chain.')
      }
      return null
    }
    if (
      method === 'wallet_getPermissions' ||
      method === 'wallet_requestPermissions'
    )
      return [
        {
          invoker: 'https://example.com',
          parentCapability: 'eth_accounts',
          caveats: [
            {
              type: 'filterResponse',
              value: ['0x0c54fccd2e384b4bb6f2e405bf5cbc15a017aafb'],
            },
          ],
        },
      ]

    const rpcClient = getHttpRpcClient(localHttpUrl)
    const { error, result } = await rpcClient.request({
      body: {
        method,
        params,
        id: id++,
      },
    })
    if (error)
      throw new RpcRequestError({
        body: { method, params },
        error,
        url: localHttpUrl,
      })
    return result
  },
}

export const httpClient = createPublicClient({
  batch: {
    multicall: process.env.VITE_BATCH_MULTICALL === 'true',
  },
  chain: anvilChain,
  pollingInterval: 100,
  transport: http(localHttpUrl, {
    batch: process.env.VITE_BATCH_JSON_RPC === 'true',
  }),
})

export const ipcClient = createPublicClient({
  batch: {
    multicall: process.env.VITE_BATCH_MULTICALL === 'true',
  },
  chain: anvilChain,
  pollingInterval: 100,
  transport: ipc(localIpcPath),
})

export const webSocketClient = createPublicClient({
  batch: {
    multicall: process.env.VITE_BATCH_MULTICALL === 'true',
  },
  chain: anvilChain,
  pollingInterval: 100,
  transport: webSocket(localWsUrl),
})

export const publicClient = (() => {
  if (process.env.VITE_NETWORK_TRANSPORT_MODE === 'webSocket')
    return webSocketClient
  if (process.env.VITE_NETWORK_TRANSPORT_MODE === 'ipc') return ipcClient
  return httpClient
})() as typeof httpClient

export const publicClientMainnet = createPublicClient({
  chain: mainnet,
  transport: http(process.env.VITE_ANVIL_FORK_URL),
})

export const publicClientSepolia = createPublicClient({
  chain: sepolia,
  transport: http(),
})

export const walletClient = createWalletClient({
  chain: anvilChain,
  transport: custom(provider),
})

export const walletClientWithAccount = createWalletClient({
  account: accounts[0].address,
  chain: anvilChain,
  transport: custom(provider),
})

export const walletClientWithoutChain = createWalletClient({
  transport: custom(provider),
})

export const testClient = createTestClient({
  chain: anvilChain,
  mode: 'anvil',
  transport: custom(provider),
})

export function createHttpServer(
  handler: RequestListener,
): Promise<{ close: () => Promise<unknown>; url: string }> {
  const server = createServer(handler)

  const closeAsync = () =>
    new Promise((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve(undefined))),
    )

  return new Promise((resolve) => {
    server.listen(() => {
      const { port } = server.address() as AddressInfo
      resolve({ close: closeAsync, url: `http://localhost:${port}` })
    })
  })
}

export async function deploy<const TAbi extends Abi | readonly unknown[]>(
  args: DeployContractParameters<
    TAbi,
    (typeof walletClientWithAccount)['chain'],
    (typeof walletClientWithAccount)['account']
  >,
) {
  const hash = await deployContract(walletClientWithAccount, args)
  await mine(testClient, { blocks: 1 })
  const { contractAddress } = await getTransactionReceipt(publicClient, {
    hash,
  })
  return { contractAddress }
}

export async function deployBAYC() {
  return deploy({
    ...baycContractConfig,
    args: ['Bored Ape Wagmi Club', 'BAYC', 69420n, 0n],
    account: accounts[0].address,
  })
}

export async function deployErrorExample() {
  return deploy({
    abi: ErrorsExample.abi,
    bytecode: ErrorsExample.bytecode.object,
    account: accounts[0].address,
  })
}

export async function deployEnsAvatarTokenUri() {
  return deploy({
    abi: EnsAvatarTokenUri.abi,
    bytecode: EnsAvatarTokenUri.bytecode.object,
    account: accounts[0].address,
  })
}

export async function deployErc20InvalidTransferEvent() {
  return deploy({
    abi: ERC20InvalidTransferEvent.abi,
    bytecode: ERC20InvalidTransferEvent.bytecode.object,
    account: accounts[0].address,
  })
}

export async function deployOffchainLookupExample({
  urls,
}: { urls: string[] }) {
  return deploy({
    abi: OffchainLookupExample.abi,
    bytecode: OffchainLookupExample.bytecode.object,
    account: accounts[0].address,
    args: [urls],
  })
}

export async function deployPayable() {
  return deploy({
    abi: Payable.abi,
    bytecode: Payable.bytecode.object,
    account: accounts[0].address,
  })
}

export async function setBlockNumber(blockNumber: bigint) {
  await reset(testClient, {
    blockNumber,
    jsonRpcUrl: forkUrl,
  })
}

export async function setVitalikResolver() {
  await impersonateAccount(testClient, {
    address: address.vitalik,
  })
  await writeContract(walletClient, {
    ...ensRegistryConfig,
    account: address.vitalik,
    functionName: 'setResolver',
    args: [namehash('vitalik.eth'), ensRegistryConfig.address],
  })

  await writeContract(walletClient, {
    ...ensRegistryConfig,
    account: address.vitalik,
    functionName: 'setResolver',
    args: [namehash('vbuterin.eth'), address.vitalik],
  })

  await mine(testClient, { blocks: 1 })
  await stopImpersonatingAccount(testClient, {
    address: address.vitalik,
  })
}

export async function setVitalikName(name: string) {
  await impersonateAccount(testClient, {
    address: address.vitalik,
  })

  await writeContract(walletClient, {
    ...ensReverseRegistrarConfig,
    account: address.vitalik,
    functionName: 'setName',
    args: [name],
  })

  await mine(testClient, { blocks: 1 })
  await stopImpersonatingAccount(testClient, {
    address: address.vitalik,
  })
}
/* c8 ignore stop */
