import { execFileSync } from 'node:child_process'
import { AbiParameters, Address, Hash, Hex, Secp256k1 } from 'ox'
import * as TestContainers from 'prool/testcontainers'
import { GenericContainer, PullPolicy, Wait } from 'testcontainers'

import { pathUsd } from '../../src/tempo/Addresses.js'

const zoneFactory = {
  address: '0x5aF2000000000000000000000000000000000000',
  code: '0xef',
} as const

const zoneMessenger = {
  address: '0x5A4D000000000000000000000000000000000000',
  artifact: 'ZoneMessenger',
} as const

const zonePortal = {
  address: '0x5AD1000000000000000000000000000000000000',
  artifact: 'ZonePortal',
} as const

const zoneVerifier = {
  address: '0x5A56000000000000000000000000000000000000',
  artifact: 'Verifier',
} as const

const historyStorage = {
  address: '0x0000f90827f1c53a10cb7a02335b175320002935',
  code: '0x3373fffffffffffffffffffffffffffffffffffffffe14604657602036036042575f35600143038111604257611fff81430311604257611fff9006545f5260205ff35b5f5ffd5b5f35611fff60014303065500',
} as const

const tip403Registry = {
  address: '0x403c000000000000000000000000000000000000',
  storage: {
    [Hash.keccak256(
      AbiParameters.encode(AbiParameters.from('address, uint256'), [
        pathUsd,
        4n,
      ]),
    )]: Hex.fromNumber((1n << 64n) | 1n, { size: 32 }),
  },
} as const

type Genesis = {
  alloc: Record<
    string,
    {
      balance?: string | undefined
      code?: string | undefined
      nonce?: string | undefined
      storage?: Record<string, string> | undefined
    }
  >
}

type ZoneArtifacts = {
  messenger: string
  portal: string
  verifier: string
}

type Options = {
  artifactsImage?: string | undefined
  blockTime: string
  image: string
  log?: TestContainers.Instance.tempo.Parameters['log'] | undefined
  ownerKey: Hex.Hex
}

/** Creates a Zone-ready Tempo instance. */
export function create(options: Options) {
  let genesisContent: string | undefined
  const log = options.log
  const rustLog = typeof log === 'string' ? log : ''

  return TestContainers.Instance.testcontainer({
    container: () => {
      genesisContent ??= buildGenesis(options)
      return new GenericContainer(options.image)
        .withPullPolicy(PullPolicy.alwaysPull())
        .withPlatform('linux/amd64')
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
          '8551',
          '--datadir',
          '/tmp/prool-tempo',
          '--dev',
          '--dev.block-time',
          options.blockTime,
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
          `http://localhost:${tempoPort}`,
          '--http.addr',
          '0.0.0.0',
          '--http.api',
          'all',
          '--http.corsdomain',
          '*',
          '--http.port',
          String(tempoPort),
          '--port',
          '30303',
          '--ws',
          '--ws.addr',
          '0.0.0.0',
          '--ws.api',
          'all',
          '--ws.port',
          String(tempoPort),
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
            if (log) process.stdout.write(data)
          })
          stream.on('error', (error) => {
            if (log) process.stderr.write(`${error.message}\n`)
          })
        })
        .withStartupTimeout(120_000)
    },
    endpoints: {
      default: { port: tempoPort, protocol: 'http' },
    },
    name: 'tempo',
  })
}

function buildGenesis(
  options: Pick<Options, 'artifactsImage' | 'image' | 'ownerKey'>,
) {
  const dumped = execFileSync(
    'docker',
    [
      'run',
      '--rm',
      '--platform',
      'linux/amd64',
      '--entrypoint',
      '/usr/local/bin/tempo',
      options.image,
      '-q',
      'dump-genesis',
      '--chain',
      'dev',
    ],
    { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 },
  )
  const genesis = JSON.parse(dumped) as Genesis
  genesis.alloc[historyStorage.address] = {
    balance: '0x0',
    code: historyStorage.code,
    nonce: '0x1',
  }

  if (!options.artifactsImage) return `${JSON.stringify(genesis)}\n`

  const artifacts = readArtifacts(options.artifactsImage)
  const owner = Address.fromPublicKey(
    Secp256k1.getPublicKey({ privateKey: options.ownerKey }),
  )
  genesis.alloc[zoneFactory.address] = {
    balance: '0x0',
    code: zoneFactory.code,
    storage: {
      [Hex.fromNumber(0n, { size: 32 })]: Hex.fromNumber(
        (Hex.toBigInt(owner) << 32n) | 1n,
        { size: 32 },
      ),
    },
  }
  genesis.alloc[zoneMessenger.address] = {
    balance: '0x0',
    code: artifacts.messenger,
    nonce: '0x1',
  }
  genesis.alloc[zonePortal.address] = {
    balance: '0x0',
    code: artifacts.portal,
    nonce: '0x1',
  }
  genesis.alloc[zoneVerifier.address] = {
    balance: '0x0',
    code: artifacts.verifier,
    nonce: '0x1',
  }
  const registry = genesis.alloc[tip403Registry.address]
  if (!registry) throw new Error('TIP-403 registry is unavailable.')
  registry.storage = { ...registry.storage, ...tip403Registry.storage }
  return `${JSON.stringify(genesis)}\n`
}

function readArtifacts(image: string): ZoneArtifacts {
  return JSON.parse(
    execFileSync(
      'docker',
      [
        'run',
        '--rm',
        '--platform',
        'linux/amd64',
        '--entrypoint',
        '/usr/bin/jq',
        image,
        '-n',
        '--slurpfile',
        'portal',
        `/app/specs/ref-impls/out/${zonePortal.artifact}.sol/${zonePortal.artifact}.json`,
        '--slurpfile',
        'messenger',
        `/app/specs/ref-impls/out/${zoneMessenger.artifact}.sol/${zoneMessenger.artifact}.json`,
        '--slurpfile',
        'verifier',
        `/app/specs/ref-impls/out/${zoneVerifier.artifact}.sol/${zoneVerifier.artifact}.json`,
        '{portal:$portal[0].deployedBytecode.object,messenger:$messenger[0].deployedBytecode.object,verifier:$verifier[0].deployedBytecode.object}',
      ],
      { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 },
    ),
  ) as ZoneArtifacts
}

const genesisPath = '/tmp/tempo-dev-eip2935.json'
const tempoPort = 8545
