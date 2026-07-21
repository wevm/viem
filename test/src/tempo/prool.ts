import { execFileSync } from 'node:child_process'
import { RpcTransport } from 'ox'
import { Instance, Server } from 'prool'
import * as TestContainers from 'prool/testcontainers'
import {
  GenericContainer,
  PullPolicy,
  type StartedTestContainer,
  Wait,
} from 'testcontainers'
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

export const port = 9545

/** Dev key used to provision and administer local Zones. */
export const zoneAdminKey =
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'

// Zone settlement reads Tempo block hashes from the canonical EIP-2935 account.
const historyStorage = {
  address: '0x0000f90827f1c53a10cb7a02335b175320002935',
  code: '0x3373fffffffffffffffffffffffffffffffffffffffe14604657602036036042575f35600143038111604257611fff81430311604257611fff9006545f5260205ff35b5f5ffd5b5f35611fff60014303065500',
} as const

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

  const args = {
    // Match Tempo's production cadence when Zone consumes every L1 block.
    blockTime:
      import.meta.env.VITE_TEMPO_ZONES === 'true'
        ? '500ms'
        : process.env.CI
          ? '50ms'
          : '2ms',
    log: import.meta.env.VITE_TEMPO_LOG,
    port,
  } satisfies Instance.tempo.Parameters
  const image = tag?.startsWith('sha256:')
    ? `ghcr.io/tempoxyz/tempo@${tag}`
    : `ghcr.io/tempoxyz/tempo:${tag ?? 'latest'}`

  return Server.create({
    instance:
      import.meta.env.VITE_TEMPO_ZONES === 'true'
        ? tempoWithHistoryStorage({ ...args, image })
        : TestContainers.Instance.tempo({ ...args, image }),
    port,
  })
}

const tempoWithHistoryStorage = Instance.define(
  (parameters: {
    blockTime: string
    image: string
    log?: Instance.tempo.Parameters['log'] | undefined
    port: number
  }) => {
    const dumped = execFileSync(
      'docker',
      [
        'run',
        '--rm',
        '--platform',
        'linux/amd64',
        '--entrypoint',
        '/usr/local/bin/tempo',
        parameters.image,
        '-q',
        'dump-genesis',
        '--chain',
        'dev',
      ],
      { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 },
    )
    const genesis = JSON.parse(dumped) as {
      alloc: Record<string, { balance?: string; code?: string; nonce?: string }>
    }
    genesis.alloc[historyStorage.address] = {
      balance: '0x0',
      code: historyStorage.code,
      nonce: '0x1',
    }
    const genesisContent = `${JSON.stringify(genesis)}\n`
    const log = parameters.log
    const rustLog = log && typeof log !== 'boolean' ? log : ''
    let container: StartedTestContainer | undefined

    return {
      _internal: {},
      host: 'localhost',
      name: 'tempo',
      port: parameters.port,
      async start({ port = parameters.port }, { emitter, setEndpoint }) {
        const genesisPath = '/tmp/tempo-dev-eip2935.json'
        container = await new GenericContainer(parameters.image)
          .withPullPolicy(PullPolicy.alwaysPull())
          .withPlatform('linux/amd64')
          .withExposedPorts(port)
          .withExtraHosts([
            { host: 'host.docker.internal', ipAddress: 'host-gateway' },
          ])
          .withName(`tempo.${crypto.randomUUID()}`)
          .withEnvironment({ RUST_LOG: rustLog })
          .withCopyContentToContainer([
            { content: genesisContent, target: genesisPath },
          ])
          .withCommand([
            'node',
            '--authrpc.port',
            String(port + 30),
            '--datadir',
            '/tmp/prool-tempo',
            '--dev',
            '--dev.block-time',
            parameters.blockTime,
            '--engine.disable-precompile-cache',
            '--engine.legacy-state-root',
            '--faucet.address',
            '0x20c0000000000000000000000000000000000000',
            '0x20c0000000000000000000000000000000000001',
            '0x20c0000000000000000000000000000000000002',
            '0x20c0000000000000000000000000000000000003',
            '--faucet.amount',
            '1000000000000',
            '--faucet.enabled',
            '--faucet.private-key',
            '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
            '--faucet.node-address',
            `http://localhost:${port}`,
            '--http.addr',
            '0.0.0.0',
            '--http.api',
            'all',
            '--http.corsdomain',
            '*',
            '--http.port',
            String(port),
            '--port',
            String(port + 10),
            '--ws',
            '--ws.addr',
            '0.0.0.0',
            '--ws.api',
            'all',
            '--ws.port',
            String(port),
            '--chain',
            genesisPath,
          ])
          .withWaitStrategy(
            Wait.forLogMessage(
              /Received (block|new payload) from consensus engine/,
            ),
          )
          .withLogConsumer((stream) => {
            stream.on('data', (data) => {
              const message = data.toString()
              emitter.emit('message', message)
              emitter.emit('stdout', message)
              if (log) process.stdout.write(message)
            })
            stream.on('error', (error) => {
              emitter.emit('message', error.message)
              emitter.emit('stderr', error.message)
              if (log) process.stderr.write(`${error.message}\n`)
            })
          })
          .withStartupTimeout(120_000)
          .start()
        setEndpoint?.({
          host: container.getHost(),
          port: container.getMappedPort(port),
        })
      },
      async stop() {
        await container?.stop()
        container = undefined
      },
    }
  },
)

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
  /** L1 provisioning key. Use distinct keys for concurrent instances. */
  key?: `0x${string}` | undefined
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
      // anvil #1; the default dev key is anvil #0 (= `accounts[0]`), which
      // would race nonces with test transactions.
      key: parameters.key ?? zoneAdminKey,
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
  await withRetry(
    async () => {
      const block = await getBlock(client)
      if (block.timestamp === 0n)
        throw new Error('Tempo has not produced a block after restart.')
    },
    { delay: 50, retryCount: 100 },
  )
  await setup(client)
}

export async function setup(client: Client<Transport, Chain>) {
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
