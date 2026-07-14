import { Server } from 'prool'
import * as TestContainers from 'prool/testcontainers'

import { Actions, Token } from 'viem'
import { tempoLocalnet } from 'viem/chains'
import { Account, Client, http } from 'viem/tempo'

import * as constants from './constants.js'

export const port = Number(process.env.VITE_TEMPO_PORT ?? 9545)

/** Pool-scoped RPC URL (one node instance per vitest pool). */
export const rpcUrl = `http://localhost:${port}/${constants.poolId}`

/** Lazily provisioned zone for the current test file. */
export const zone = defineZone()

/** Tempo localnet dev accounts (the anvil "test … junk" mnemonic). */
export const accounts = constants.accounts

export const alphaUsd = '0x20c0000000000000000000000000000000000001'
export const pathUsd = '0x20c0000000000000000000000000000000000000'

/** Genesis token declarations (drive `decimals`/`formatted` inference). */
const tokens = [
  Token.from({
    addresses: { [tempoLocalnet.id]: pathUsd },
    currency: 'USD',
    decimals: 6,
    name: 'pathUSD',
    symbol: 'pathUSD',
  }),
  Token.from({
    addresses: { [tempoLocalnet.id]: alphaUsd },
    currency: 'USD',
    decimals: 6,
    name: 'AlphaUSD',
    symbol: 'AlphaUSD',
  }),
]

const feeAmmAbi = [
  {
    name: 'mint',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { type: 'address', name: 'userToken' },
      { type: 'address', name: 'validatorToken' },
      { type: 'uint256', name: 'validatorTokenAmount' },
      { type: 'address', name: 'to' },
    ],
    outputs: [],
  },
] as const

const validatorConfigAbi = [
  {
    name: 'addValidator',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { type: 'address', name: 'newValidatorAddress' },
      { type: 'bytes32', name: 'publicKey' },
      { type: 'bool', name: 'active' },
      { type: 'string', name: 'inboundAddress' },
      { type: 'string', name: 'outboundAddress' },
    ],
    outputs: [],
  },
] as const

/** Creates a Client for the pool's Tempo node instance. */
export function getClient(options: getClient.Options = {}) {
  const { account = Account.fromSecp256k1(accounts[0].privateKey), feeToken } =
    options
  return Client.create({
    account,
    chain: tempoLocalnet,
    ...(feeToken ? { feeToken } : {}),
    pollingInterval: 100,
    tokens,
    transport: http(rpcUrl),
  })
}

export declare namespace getClient {
  type Options = {
    /** Account for the Client. @default dev account 0 */
    account?: Account.Account | undefined
    /** Default fee token for the Client. */
    feeToken?: `0x${string}` | undefined
  }
}

/** Registers `address` as a validator (dev account 0 is the config owner). */
export async function registerValidator(
  client: ReturnType<typeof getClient>,
  options: { address: `0x${string}` },
) {
  await Actions.contract.writeSync(client, {
    abi: validatorConfigAbi,
    address: '0xcccccccc00000000000000000000000000000000',
    args: [
      options.address,
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      true,
      '192.168.1.100:8080',
      '192.168.1.100:8080',
    ],
    feeToken: pathUsd,
    functionName: 'addValidator',
    nonceKey: 'expiring',
  })
}

/** Mints fee-AMM liquidity for `token` (fee-token validity). */
export async function mintLiquidity(
  client: ReturnType<typeof getClient>,
  options: { token: string },
) {
  await Actions.contract.writeSync(client, {
    abi: feeAmmAbi,
    address: '0xfeec000000000000000000000000000000000000',
    args: [options.token, pathUsd, 1_000_000_000n, client.account!.address],
    feeToken: pathUsd,
    functionName: 'mint',
    nonceKey: 'expiring',
  } as never)
}

/** Mints fee-AMM liquidity for the genesis tokens (fee-token validity). */
export async function setup() {
  const client = getClient()
  await Promise.all(
    [1n, 2n, 3n].map((id) =>
      mintLiquidity(client, {
        token: `0x20c000000000000000000000000000000000000${id}`,
      }),
    ),
  )
}

/** Restarts the pool's Tempo node instance (fresh genesis state). */
export async function restart() {
  await fetch(`${rpcUrl}/restart`)
}

/** Runtime metadata for a provisioned local zone. */
export type Zone = {
  /** Zone chain ID. */
  chainId: number
  /** Zone factory address on the parent chain. */
  factoryAddress: `0x${string}`
  /** Portal address on the parent chain. */
  portalAddress: `0x${string}`
  /** Authenticated zone RPC URL. */
  privateRpcUrl: string
  /** Public zone RPC URL. */
  rpcUrl: string
  /** Zone ID. */
  zoneId: number
}

type StartedZone = Zone & { stop(): Promise<void> }

/** Options for {@link defineZone}. */
export type DefineZoneOptions = {
  /** Existing factory reused to allocate another zone ID. */
  factoryAddress?: `0x${string}` | undefined
  /** Parent-chain provisioning key. */
  privateKey?: `0x${string}` | undefined
}

/** Lazily provisioned local zone handle. */
export type ZoneInstance = {
  /** Starts the zone once and returns its runtime metadata. */
  start(): Promise<Zone>
  /** Stops the zone if it is running. */
  stop(): Promise<void>
}

/** Defines a lazily provisioned local zone. */
export function defineZone(options: DefineZoneOptions = {}): ZoneInstance {
  const options_ = { ...options }
  let zone: Promise<StartedZone> | undefined
  let stopping: Promise<void> | undefined

  function start(): Promise<Zone> {
    if (zone) return zone
    const promise = stopping
      ? stopping.then(() => startZone(options_))
      : startZone(options_)
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

  return { start, stop }
}

async function startZone(options: DefineZoneOptions): Promise<StartedZone> {
  const tag = process.env.VITE_TEMPO_ZONE_TAG ?? 'latest'
  const l1RpcUrl = rpcUrl.replace(
    /^http:\/\/localhost/,
    'ws://host.docker.internal',
  )
  const instance = TestContainers.Instance.tempoZone({
    dev: {
      key: options.privateKey ?? accounts[1].privateKey,
    },
    image: `ghcr.io/tempoxyz/tempo-zone:${tag}`,
    l1: {
      factoryAddress: options.factoryAddress,
      rpcUrl: l1RpcUrl,
    },
    log: process.env.VITE_TEMPO_LOG,
    startupTimeout: 120_000,
  })

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

/** Creates the pooled Tempo node server (Dockerized via testcontainers). */
export function createServer() {
  return Server.create({
    instance: TestContainers.Instance.tempo({
      // Match Tempo's production cadence when Zone consumes every L1 block.
      blockTime: process.env.VITE_TEMPO_ZONES === 'true' ? '500ms' : '2ms',
      image: 'ghcr.io/tempoxyz/tempo:latest',
      port,
    }),
    port,
  })
}
