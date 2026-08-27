import { RpcTransport } from 'ox'
import { Instance, Server } from 'prool'
import * as TestContainers from 'prool/testcontainers'
import { getBlock } from '../../../src/actions/public/getBlock.js'
import {
  type Chain,
  type Client,
  parseUnits,
  type Transport,
} from '../../../src/index.js'
import { pathUsd } from '../../../src/tempo/Addresses.js'
import * as actions from '../../../src/tempo/actions/index.js'
import { withRetry } from '../../../src/utils/promise/withRetry.js'
import { accounts, getClient, nodeEnv } from './config.js'
import { createCustomTempo } from './prool.tmp.js'

export const port = 9545

const hardfork = import.meta.env.VITE_TEMPO_HARDFORK
const legacyHardfork = hardfork === 'T9'

/** Dev key used to provision and administer local Zones. */
export const zoneAdminKey = legacyHardfork
  ? '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'
  : '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'

export const rpcUrl = (() => {
  // Explicit override (e.g. a custom devnet) wins over env presets. Useful for
  // pointing the suite at a feature devnet without editing chain definitions.
  if (import.meta.env.VITE_TEMPO_RPC_URL)
    return import.meta.env.VITE_TEMPO_RPC_URL
  if (import.meta.env.VITE_TEMPO_ENV === 'mainnet')
    return 'https://rpc.tempo.xyz'
  if (import.meta.env.VITE_TEMPO_ENV === 'devnet')
    return 'https://rpc.devnet.tempoxyz.dev'
  if (import.meta.env.VITE_TEMPO_ENV === 'testnet')
    return 'https://rpc.moderato.tempo.xyz'
  const id = (() => {
    // Explicitly configured instance ID.
    if (Number(import.meta.env.VITE_TEMPO_INSTANCE_ID))
      return Number(import.meta.env.VITE_TEMPO_INSTANCE_ID)
    // Vitest pool-derived instance ID isolates parallel workers.
    if (typeof import.meta !== 'undefined')
      return (
        Number(import.meta.env.VITEST_POOL_ID ?? 1) +
        Math.floor(Math.random() * 10_000)
      )
    // Random instance ID fallback outside Vite.
    return 1 + Math.floor(Math.random() * 10_000)
  })()
  return `http://localhost:${port}/${id}`
})()

export const zone1 = defineZone()

export async function createServer() {
  const tag = await (async () => {
    if (!import.meta.env.VITE_TEMPO_TAG?.startsWith('http'))
      return import.meta.env.VITE_TEMPO_TAG

    const transport = RpcTransport.fromHttp(import.meta.env.VITE_TEMPO_TAG)
    const result = (await transport.request({
      method: 'web3_clientVersion',
    })) as string
    const sha = result.match(/tempo\/v[\d.]+-([a-f0-9]+)\//)?.[1]
    return `sha-${sha}`
  })()

  const zones = import.meta.env.VITE_TEMPO_ZONES === 'true'
  const args = {
    blockTime: (() => {
      // Explicitly configured block time.
      if (import.meta.env.VITE_TEMPO_BLOCK_TIME !== undefined)
        return import.meta.env.VITE_TEMPO_BLOCK_TIME
      if (zones) return '500ms' // Zone cadence matching Tempo production.
      if (process.env.CI) return '50ms' // Faster CI cadence.
      return '2ms' // Fastest local cadence.
    })(),
    log: import.meta.env.VITE_TEMPO_LOG,
    port,
  } satisfies Instance.tempo.Parameters
  const image = tag?.startsWith('sha256:')
    ? `ghcr.io/tempoxyz/tempo@${tag}`
    : `ghcr.io/tempoxyz/tempo:${tag ?? 'latest'}`
  const instance = (() => {
    // Explicitly configured local Tempo binary.
    if (import.meta.env.VITE_TEMPO_BINARY)
      return Instance.tempo({
        ...args,
        binary: import.meta.env.VITE_TEMPO_BINARY,
      })
    // Custom container configuration: Zones, T9 hardfork.
    if (zones || hardfork === 'T9')
      return createCustomTempo({
        ...args,
        hardfork,
        image,
      })
    // Standard Tempo test container fallback.
    return TestContainers.Instance.tempo({ ...args, image })
  })()

  return Server.create({
    instance,
    port,
  })
}

export type Zone = {
  /** Zone chain ID (e.g. `421700001`). */
  chainId: number
  /** ZoneFactory address on the parent (L1) chain. */
  factoryAddress: `0x${string}`
  /** Private (authenticated) zone RPC URL. */
  privateRpcUrl: string
  /** Public zone RPC URL. */
  rpcUrl: string
  /** Zone ID (e.g. `1`). */
  zoneId: number
}

type StartedZone = Zone & {
  stop(): Promise<void>
}

export type DefineZoneParameters = {
  /** Existing factory to reuse for unique zone IDs. */
  factoryAddress?: `0x${string}` | undefined
}

export type ZoneInstance = {
  start(): Promise<Zone>
  stop(): Promise<void>
}

/** Defines a lazily provisioned local zone instance. */
export function defineZone(
  parameters: DefineZoneParameters = {},
): ZoneInstance {
  const parameters_ = { ...parameters }
  let zone: Promise<StartedZone> | undefined
  let stopping: Promise<void> | undefined

  function start(): Promise<Zone> {
    if (zone) return zone

    const promise = stopping
      ? stopping.then(() => startZone(parameters_))
      : startZone(parameters_)
    zone = promise
    void promise.then(undefined, () => {
      if (zone === promise) zone = undefined
    })
    return promise
  }

  function stop(): Promise<void> {
    if (!zone) return stopping ?? Promise.resolve()

    const zone_ = zone
    zone = undefined
    const promise = (async () => {
      const instance = await zone_.catch(() => undefined)
      await instance?.stop()
    })()
    stopping = promise
    const clear = () => {
      if (stopping === promise) stopping = undefined
    }
    void promise.then(clear, clear)
    return promise
  }

  return {
    start,
    stop,
  }
}

async function startZone(
  parameters: DefineZoneParameters,
): Promise<StartedZone> {
  if (nodeEnv !== 'localnet')
    throw new Error('Local zones require `VITE_TEMPO_ENV=localnet`.')

  if (!legacyHardfork) await configureNativeZoneToken()

  const tag = import.meta.env.VITE_TEMPO_ZONE_TAG ?? 'latest'
  const image = tag.startsWith('sha256:')
    ? `ghcr.io/tempoxyz/tempo-zone@${tag}`
    : `ghcr.io/tempoxyz/tempo-zone:${tag}`

  // The zone container reaches this worker's L1 through the prool server
  // (`host.docker.internal` resolves to the host; the server proxies WS).
  const l1RpcUrl = rpcUrl.replace(
    /^http:\/\/localhost/,
    'ws://host.docker.internal',
  )

  const instance = TestContainers.Instance.tempoZone({
    dev: {
      // Native T10 genesis assigns the factory to Anvil #0. Pre-T10 provisioning uses Anvil #1.
      key: zoneAdminKey,
      token: pathUsd,
    },
    image,
    l1: {
      factoryAddress: parameters.factoryAddress,
      rpcUrl: l1RpcUrl,
    },
    log: import.meta.env.VITE_TEMPO_LOG,
    startupTimeout: 120_000,
  })

  // Collect startup logs to parse provisioning metadata.
  let logs = ''
  instance.on('message', (message) => {
    logs += message
  })

  await instance.start()

  const zoneId = Number(logs.match(/Zone ID:\s+(\d+)/)?.[1])
  const chainId = Number(logs.match(/Chain ID:\s+(\d+)/)?.[1])
  const factoryAddress = logs.match(
    /ZoneFactory:\s+(0x[0-9a-fA-F]{40})/,
  )?.[1] as `0x${string}` | undefined
  if (!zoneId || !chainId || !factoryAddress) {
    await instance.stop().catch(() => {})
    throw new Error(`Failed to parse zone provisioning output:\n\n${logs}`)
  }

  const { privateRpc } = instance._internal as {
    privateRpc?: { host: string; port: number } | undefined
  }
  if (!privateRpc) {
    await instance.stop().catch(() => {})
    throw new Error('Failed to resolve zone private RPC endpoint.')
  }

  return {
    chainId,
    factoryAddress,
    privateRpcUrl: `http://${privateRpc.host}:${privateRpc.port}`,
    rpcUrl: `http://${instance.host}:${instance.port}`,
    stop: () => instance.stop(),
    zoneId,
  }
}

async function configureNativeZoneToken() {
  const client = getClient({ account: accounts[0] })
  await waitForBlock(client)
  // Native dev genesis leaves pathUSD without a transfer policy.
  await actions.token.changeTransferPolicySync(client, {
    policyId: 1n,
    token: pathUsd,
  })
}

export async function restart(client: Client<Transport, Chain>) {
  if (nodeEnv !== 'localnet') return
  await fetch(`${client.chain.rpcUrls.default.http[0]}/restart`)
  await setup(client)
}

export async function waitForBlock(client: Client<Transport, Chain>) {
  await withRetry(
    async () => {
      const block = await getBlock(client)
      if (block.timestamp === 0n)
        throw new Error('Tempo has not produced a block.')
    },
    { delay: 50, retryCount: 100 },
  )
}

export async function setup(client: Client<Transport, Chain>) {
  await waitForBlock(client)

  // Mint liquidity for fee tokens.
  await Promise.all(
    [1n, 2n, 3n].map((id) =>
      actions.amm.mintSync(client, {
        account: accounts[0],
        feeToken: pathUsd,
        nonceKey: 'expiring',
        userTokenAddress: id,
        validatorTokenAddress: pathUsd,
        validatorTokenAmount: parseUnits('1000', 6),
        to: accounts[0].address,
      }),
    ),
  )

  await actions.validator.add(client, {
    account: accounts[0],
    newValidatorAddress: accounts[19].address,
    publicKey:
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    active: true,
    inboundAddress: '192.168.1.100:8080',
    outboundAddress: '192.168.1.100:8080',
  })
}
