import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { ContractAddress, Hash, Hex } from 'ox'
import { Instance } from 'prool'
import { Server } from 'prool/vitest'
import { inject } from 'vitest'

import { mainnet } from './anvil.js'
import * as constants from './constants.js'

/** ERC-4337 EntryPoint deployments on the mainnet fork. */
export const entrypoints = {
  '0.6': '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
  '0.7': '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
  '0.8': '0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108',
  '0.9': '0x433709009B8330FDa32311DF1C2AFA402eD8D009',
} as const

const legacyEntryPoints = [
  entrypoints['0.6'],
  entrypoints['0.7'],
  entrypoints['0.8'],
] as const

export type Bundler = {
  instance(key: number): Instance.Instance
  port: number
  restart(): Promise<void>
  rpcUrl: { http: string }
}

/**
 * Defines a prool-managed alto bundler instance, proxied per pool id. Each
 * pool key gets its own alto process pointed at the matching anvil pool
 * instance.
 */
export function defineBundler(parameters: defineBundler.Parameters): Bundler {
  const {
    alto,
    binary,
    entrypoints = legacyEntryPoints,
    port,
    rpcUrl,
  } = parameters
  const url = `http://127.0.0.1:${port}/${constants.poolId}`
  const instance = (key: number) => {
    const options = {
      binary,
      bundleMode: 'manual',
      codeOverrideSupport: true,
      enableDebugEndpoints: true,
      entrypoints,
      executorPrivateKeys: [constants.accounts[3]!.privateKey],
      fixedGasLimitForEstimation: '30000000',
      rpcUrl: rpcUrl(key),
      safeMode: false,
      utilityPrivateKey: constants.accounts[3]!.privateKey,
      ...alto,
    } satisfies Instance.alto.Parameters & {
      codeOverrideSupport: boolean
      deploySimulationsContract?: boolean | undefined
      entrypointSimulationContractV7?: `0x${string}` | undefined
      entrypointSimulationContractV8?: `0x${string}` | undefined
      entrypointSimulationContractV9?: `0x${string}` | undefined
      pimlicoSimulationContract?: `0x${string}` | undefined
    }
    return Instance.alto(options)
  }
  return {
    instance,
    port,
    rpcUrl: { http: url },
    /** Restarts the Alto instance for this pool id. */
    async restart() {
      const context = inject('coreServers').bundlers[port]
      if (!context)
        throw new Error(`Missing bundler server context for port ${port}.`)
      await Server.get(context).restart()
    },
  }
}

export declare namespace defineBundler {
  type Parameters = {
    /** Additional Alto simulation configuration. */
    alto?:
      | {
          deploySimulationsContract?: boolean | undefined
          entrypointSimulationContractV7?: `0x${string}` | undefined
          entrypointSimulationContractV8?: `0x${string}` | undefined
          entrypointSimulationContractV9?: `0x${string}` | undefined
          pimlicoSimulationContract?: `0x${string}` | undefined
        }
      | undefined
    /** Binary path for the Alto executable. */
    binary?: string | undefined
    /** EntryPoint contract addresses served by Alto. */
    entrypoints?: readonly `0x${string}`[] | undefined
    /** Proxy port the prool server listens on. */
    port: number
    /** Node RPC URL for a given pool key. */
    rpcUrl: (key: number) => string
  }
}

/** Bundler backed by the mainnet fork anvil instance. */
export const bundler = defineBundler({
  port: Number(getEnv('VITE_BUNDLER_PORT', '4337')),
  rpcUrl: (key) => `http://127.0.0.1:${mainnet.port}/${key}`,
})

const require = createRequire(import.meta.url)
const alto09Root = resolve(dirname(require.resolve('@pimlico/alto-v09')), '..')
const alto09Binary = resolve(alto09Root, 'esm/cli/alto.js')
const deterministicDeployer =
  '0x4e59b44847b379578588920ca78fbf26c0b4956c' as const
const simulationSalt = Hash.keccak256(constants.accounts[3].address)
const simulationFixtures = {
  pimlico: getSimulationFixture(
    'PimlicoSimulations.sol/PimlicoSimulations.json',
  ),
  v7: getSimulationFixture(
    'EntryPointSimulations.sol/EntryPointSimulations07.json',
  ),
  v8: getSimulationFixture(
    'EntryPointSimulations.sol/EntryPointSimulations08.json',
  ),
  v9: getSimulationFixture(
    'EntryPointSimulations.sol/EntryPointSimulations09.json',
  ),
} as const

/** Bundler with EntryPoint 0.9 support. */
export const bundler09 = defineBundler({
  alto: {
    deploySimulationsContract: false,
    entrypointSimulationContractV7: simulationFixtures.v7.address,
    entrypointSimulationContractV8: simulationFixtures.v8.address,
    entrypointSimulationContractV9: simulationFixtures.v9.address,
    pimlicoSimulationContract: simulationFixtures.pimlico.address,
  },
  binary: alto09Binary,
  entrypoints: Object.values(entrypoints),
  port: Number(getEnv('VITE_BUNDLER_V09_PORT', '4338')),
  rpcUrl: (key) => `http://127.0.0.1:${mainnet.port}/${key}`,
})

/** Deploys Alto 0.9 simulation contracts into the active Anvil pool. */
export async function prepareEntryPoint09() {
  const entryPointCode = await request<string>('eth_getCode', [
    entrypoints['0.9'],
    'latest',
  ])
  if (entryPointCode === '0x')
    throw new Error('EntryPoint 0.9 is missing from the active fork.')

  for (const fixture of Object.values(simulationFixtures)) {
    const code = await request<string>('eth_getCode', [
      fixture.address,
      'latest',
    ])
    if (code !== '0x') continue

    const hash = await request<Hex.Hex>('eth_sendTransaction', [
      {
        data: Hex.concat(simulationSalt, fixture.bytecode),
        from: constants.accounts[3].address,
        gas: Hex.fromNumber(30_000_000n),
        to: deterministicDeployer,
      },
    ])
    await request('anvil_mine', [1])
    const receipt = await request<{ status: Hex.Hex }>(
      'eth_getTransactionReceipt',
      [hash],
    )
    if (receipt.status !== '0x1')
      throw new Error(`Alto fixture deployment failed at ${fixture.address}.`)
  }
}

function getSimulationFixture(path: string) {
  type Artifact = { bytecode: { object: Hex.Hex } }
  const artifact = JSON.parse(
    readFileSync(resolve(alto09Root, 'contracts', path), 'utf8'),
  ) as Artifact
  return {
    address: ContractAddress.from({
      bytecode: artifact.bytecode.object,
      from: deterministicDeployer,
      salt: simulationSalt,
    }),
    bytecode: artifact.bytecode.object,
  }
}

async function request<result = unknown>(
  method: string,
  params: readonly unknown[],
): Promise<result> {
  const response = await fetch(mainnet.rpcUrl.http, {
    body: JSON.stringify({ id: 1, jsonrpc: '2.0', method, params }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
    signal: AbortSignal.timeout(10_000),
  })
  if (!response.ok)
    throw new Error(`Anvil request failed with status ${response.status}.`)

  type Response = { error?: { message: string } | undefined; result?: result }
  const value = (await response.json()) as Response
  if (value.error) throw new Error(value.error.message)
  return value.result as result
}

function getEnv(key: string, fallback: string): string {
  if (typeof process.env[key] === 'string') return process.env[key] as string
  return fallback
}
