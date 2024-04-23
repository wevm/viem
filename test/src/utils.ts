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
import { holesky, mainnet, sepolia } from '~viem/chains/index.js'
import { createClient } from '~viem/clients/createClient.js'
import { createPublicClient } from '~viem/clients/createPublicClient.js'
import { http } from '~viem/clients/transports/http.js'
import { namehash } from '~viem/utils/ens/namehash.js'
import type { TestClientMode } from '../../src/clients/createTestClient.js'
import type { Account, Chain, TestClient, Transport } from '../../src/index.js'

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
import { anvilMainnet, anvilSepolia } from './anvil.js'
import { accounts, address } from './constants.js'

const client = anvilMainnet.getClient({ account: true })

export const publicClientMainnet = createPublicClient({
  chain: mainnet,
  transport: http(process.env.VITE_ANVIL_FORK_URL),
})

// TODO(fault-proofs): remove when fault proofs deployed to mainnet.
export const sepoliaClient = createClient({
  chain: sepolia,
  transport: http(anvilSepolia.rpcUrl.http),
}).extend(() => ({ mode: 'anvil' }))

export const holeskyClient = createClient({
  chain: holesky,
  transport: http(),
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
  client: TestClient<
    TestClientMode,
    Transport,
    Chain,
    Account | undefined,
    false
  >,
  args: DeployContractParameters<
    TAbi,
    (typeof client)['chain'],
    (typeof client)['account']
  >,
) {
  const hash = await deployContract(client, args)
  await mine(client, { blocks: 1 })
  const { contractAddress } = await getTransactionReceipt(client, {
    hash,
  })
  return { contractAddress }
}

export async function deployBAYC() {
  return deploy(client, {
    ...baycContractConfig,
    args: ['Bored Ape Wagmi Club', 'BAYC', 69420n, 0n],
    account: accounts[0].address,
  })
}

export async function deployErrorExample() {
  return deploy(client, {
    abi: ErrorsExample.abi,
    bytecode: ErrorsExample.bytecode.object,
    account: accounts[0].address,
  })
}

export async function deployEnsAvatarTokenUri() {
  return deploy(client, {
    abi: EnsAvatarTokenUri.abi,
    bytecode: EnsAvatarTokenUri.bytecode.object,
    account: accounts[0].address,
  })
}

export async function deployErc20InvalidTransferEvent() {
  return deploy(client, {
    abi: ERC20InvalidTransferEvent.abi,
    bytecode: ERC20InvalidTransferEvent.bytecode.object,
    account: accounts[0].address,
  })
}

export async function deployOffchainLookupExample({
  urls,
}: { urls: string[] }) {
  return deploy(client, {
    abi: OffchainLookupExample.abi,
    bytecode: OffchainLookupExample.bytecode.object,
    account: accounts[0].address,
    args: [urls],
  })
}

export async function deployPayable() {
  return deploy(client, {
    abi: Payable.abi,
    bytecode: Payable.bytecode.object,
    account: accounts[0].address,
  })
}

export async function setBlockNumber(
  client: TestClient<
    TestClientMode,
    Transport,
    Chain | undefined,
    Account | undefined,
    false
  >,
  blockNumber: bigint,
) {
  await reset(client, {
    blockNumber,
    jsonRpcUrl: anvilMainnet.forkUrl,
  })
}

export async function setVitalikResolver() {
  await impersonateAccount(client, {
    address: address.vitalik,
  })
  await writeContract(client, {
    ...ensRegistryConfig,
    account: address.vitalik,
    functionName: 'setResolver',
    args: [namehash('vitalik.eth'), ensRegistryConfig.address],
  })

  await writeContract(client, {
    ...ensRegistryConfig,
    account: address.vitalik,
    functionName: 'setResolver',
    args: [namehash('vbuterin.eth'), address.vitalik],
  })

  await mine(client, { blocks: 1 })
  await stopImpersonatingAccount(client, {
    address: address.vitalik,
  })
}

export async function setVitalikName(name: string) {
  await impersonateAccount(client, {
    address: address.vitalik,
  })

  await writeContract(client, {
    ...ensReverseRegistrarConfig,
    account: address.vitalik,
    functionName: 'setName',
    args: [name],
  })

  await mine(client, { blocks: 1 })
  await stopImpersonatingAccount(client, {
    address: address.vitalik,
  })
}
/* c8 ignore stop */
