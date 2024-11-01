/* c8 ignore start */
import { getTransactionReceipt } from '~viem/actions/public/getTransactionReceipt.js'
import { impersonateAccount } from '~viem/actions/test/impersonateAccount.js'
import { mine } from '~viem/actions/test/mine.js'
import { stopImpersonatingAccount } from '~viem/actions/test/stopImpersonatingAccount.js'
import {
  type DeployContractParameters,
  deployContract,
} from '~viem/actions/wallet/deployContract.js'
import { writeContract } from '~viem/actions/wallet/writeContract.js'
import { holesky, mainnet } from '~viem/chains/index.js'
import { createClient } from '~viem/clients/createClient.js'
import { http } from '~viem/clients/transports/http.js'
import { namehash } from '~viem/utils/ens/namehash.js'
import type { TestClientMode } from '../../src/clients/createTestClient.js'
import {
  type Abi,
  type Account,
  type Chain,
  type TestClient,
  type Transport,
  publicActions,
} from '../../src/index.js'

import { type RequestListener, createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import {
  ERC20InvalidTransferEvent,
  EnsAvatarTokenUri,
  ErrorsExample,
  OffchainLookupExample,
  Payable,
  SoladyAccount06,
  SoladyAccount07,
  SoladyAccountFactory06,
  SoladyAccountFactory07,
  VerifySig,
} from '../../contracts/generated.js'
import {
  baycContractConfig,
  ensRegistryConfig,
  ensReverseRegistrarConfig,
} from './abis.js'
import { anvilMainnet } from './anvil.js'
import { accounts, address } from './constants.js'

const client = anvilMainnet.getClient({ account: true })

export const mainnetClient = createClient({
  chain: mainnet,
  transport: http(anvilMainnet.forkUrl),
}).extend(publicActions)

export const holeskyClient = createClient({
  chain: holesky,
  transport: http(),
}).extend(publicActions)

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

export async function deploy<const abi extends Abi | readonly unknown[]>(
  client: TestClient<
    TestClientMode,
    Transport,
    Chain,
    Account | undefined,
    false
  >,
  args: DeployContractParameters<abi, (typeof client)['chain'], Account>,
) {
  const hash = await deployContract(client, {
    account: accounts[0].address,
    ...args,
  } as any)
  await mine(client, { blocks: 1 })
  const { contractAddress } = await getTransactionReceipt(client, {
    hash,
  })
  return { contractAddress, hash }
}

export async function deployBAYC() {
  return deploy(client, {
    ...baycContractConfig,
    args: ['Bored Ape Wagmi Club', 'BAYC', 69420n, 0n],
  })
}

export async function deployErrorExample() {
  return deploy(client, {
    abi: ErrorsExample.abi,
    bytecode: ErrorsExample.bytecode.object,
  })
}

export async function deployEnsAvatarTokenUri() {
  return deploy(client, {
    abi: EnsAvatarTokenUri.abi,
    bytecode: EnsAvatarTokenUri.bytecode.object,
  })
}

export async function deployErc20InvalidTransferEvent() {
  return deploy(client, {
    abi: ERC20InvalidTransferEvent.abi,
    bytecode: ERC20InvalidTransferEvent.bytecode.object,
  })
}

export async function deployOffchainLookupExample({
  urls,
}: { urls: string[] }) {
  return deploy(client, {
    abi: OffchainLookupExample.abi,
    bytecode: OffchainLookupExample.bytecode.object,
    args: [urls],
  })
}

export async function deployPayable() {
  return deploy(client, {
    abi: Payable.abi,
    bytecode: Payable.bytecode.object,
  })
}

export async function deploySoladyAccount_07() {
  const { contractAddress: implementationAddress } = await deploy(client, {
    abi: SoladyAccount07.abi,
    bytecode: SoladyAccount07.bytecode.object,
  })
  const { contractAddress: factoryAddress } = await deploy(client, {
    abi: SoladyAccountFactory07.abi,
    bytecode: SoladyAccountFactory07.bytecode.object,
    args: [implementationAddress!],
  })
  return {
    implementationAddress: implementationAddress!,
    factoryAddress: factoryAddress!,
  }
}

export async function deploySoladyAccount_06() {
  const { contractAddress: implementationAddress } = await deploy(client, {
    abi: SoladyAccount06.abi,
    bytecode: SoladyAccount06.bytecode.object,
  })
  const { contractAddress: factoryAddress } = await deploy(client, {
    abi: SoladyAccountFactory06.abi,
    bytecode: SoladyAccountFactory06.bytecode.object,
    args: [implementationAddress!],
  })
  return {
    implementationAddress: implementationAddress!,
    factoryAddress: factoryAddress!,
  }
}

export async function deployUniversalSignatureVerifier() {
  return deploy(client, {
    abi: VerifySig.abi,
    bytecode: VerifySig.bytecode.object,
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
