import { RpcTransport } from 'ox'
import { type Instance, Server } from 'prool'
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
import { accounts, nodeEnv } from './config.js'
import { createTempo } from './prool.tmp.js'

export const port = 9545

/** Dev key used to provision and administer local Zones. */
export const zoneAdminKey =
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'

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
  const id =
    (typeof import.meta !== 'undefined' &&
      Number(import.meta.env.VITEST_POOL_ID ?? 1) +
        Math.floor(Math.random() * 10_000)) ||
    1 + Math.floor(Math.random() * 10_000)
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
    // Match Tempo's production cadence when Zone consumes every L1 block.
    blockTime: zones ? '500ms' : process.env.CI ? '50ms' : '2ms',
    log: import.meta.env.VITE_TEMPO_LOG,
    port,
  } satisfies Instance.tempo.Parameters
  const image = tag?.startsWith('sha256:')
    ? `ghcr.io/tempoxyz/tempo@${tag}`
    : `ghcr.io/tempoxyz/tempo:${tag ?? 'latest'}`
  const artifactsTag = import.meta.env.VITE_TEMPO_ZONE_XTASK_TAG
  const instance =
    zones && artifactsTag
      ? createTempo({
          ...args,
          artifactsImage: artifactsTag.startsWith('sha256:')
            ? `ghcr.io/tempoxyz/tempo-zone-xtask@${artifactsTag}`
            : `ghcr.io/tempoxyz/tempo-zone-xtask:${artifactsTag}`,
          image,
          ownerKey: zoneAdminKey,
        })
      : TestContainers.Instance.tempo({ ...args, image })

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
  /** Portal address on the parent (L1) chain. */
  portalAddress: `0x${string}`
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
      // Anvil #1 owns the native factory and avoids test-account nonce races.
      key: zoneAdminKey,
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
  const portalAddress = logs.match(/Portal:\s+(0x[0-9a-fA-F]{40})/)?.[1] as
    | `0x${string}`
    | undefined
  if (!zoneId || !chainId || !factoryAddress || !portalAddress) {
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
    portalAddress,
    privateRpcUrl: `http://${privateRpc.host}:${privateRpc.port}`,
    rpcUrl: `http://${instance.host}:${instance.port}`,
    stop: () => instance.stop(),
    zoneId,
  }
}

export async function restart(client: Client<Transport, Chain>) {
  if (nodeEnv !== 'localnet') return
  await fetch(`${client.chain.rpcUrls.default.http[0]}/restart`)
  await setup(client)
}

async function waitForBlock(client: Client<Transport, Chain>) {
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
